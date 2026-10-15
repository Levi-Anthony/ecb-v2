import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import type { AuthInfo } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { workspacePage } from './personal-workspace-view.js';

const cookieName = '__Host-ecos_workspace';
const lifetime = 3600;
const uuid = z.string().uuid();
const captureSchema = z.strictObject({ operation_id: uuid, content: z.string().min(1).max(20000) });
const referenceSchema = z.strictObject({ operation_id: uuid, thought_id: uuid, source_sha256: z.string().regex(/^[a-f0-9]{64}$/), confirmed: z.literal(true) });
type Note = { id: string; content: string; source: string; captured_at: string };
type Artifact = { id: string; content: string };
export type WorkspacePorts = {
  authenticate(request: Request): Promise<AuthInfo | null>;
  sessionSecret(): string;
  commission(): Promise<unknown>;
  work(cycleId?: string): Promise<unknown>;
  capture(input: { operationId: string; content: string; source: string }): Promise<Note>;
  fetchThought(id: string): Promise<Note | null>;
  createArtifact(input: { operationId: string; content: string }): Promise<Artifact>;
  fetchArtifact(id: string): Promise<Artifact | null>;
};
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const headers = { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY' };
const json = (data: unknown, status = 200) => Response.json(data, { status, headers });
class WorkspaceError extends Error { constructor(public status: number, public code: string) { super(code); } }
function sessionKey(ports: WorkspacePorts) { return createHash('sha256').update('ecos:workspace-session:1\0' + ports.sessionSecret()).digest(); }
function seal(credential: string, ports: WorkspacePorts) {
  const nonce = randomBytes(12), cipher = createCipheriv('aes-256-gcm', sessionKey(ports), nonce);
  const body = Buffer.concat([cipher.update(JSON.stringify({ credential, expires: Date.now() + lifetime * 1000 })), cipher.final()]);
  return Buffer.concat([nonce, cipher.getAuthTag(), body]).toString('base64url');
}
function unseal(request: Request, ports: WorkspacePorts): string | null {
  try {
    const matches = request.headers.get('cookie')?.split(';').map(x => x.trim()).filter(x => x.startsWith(cookieName + '=')) ?? [];
    if (matches.length !== 1) return null;
    const data = Buffer.from(matches[0].slice(cookieName.length + 1), 'base64url');
    if (data.length > 22000 || data.length < 29) return null;
    const cipher = createDecipheriv('aes-256-gcm', sessionKey(ports), data.subarray(0, 12));
    cipher.setAuthTag(data.subarray(12, 28));
    const payload = JSON.parse(Buffer.concat([cipher.update(data.subarray(28)), cipher.final()]).toString());
    return typeof payload.credential === 'string' && payload.expires > Date.now() ? payload.credential : null;
  } catch { return null; }
}
function setCookie(response: Response, value: string) {
  response.headers.set('Set-Cookie', `${cookieName}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${value ? lifetime : 0}`);
  return response;
}
async function readBody(request: Request) {
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/json') throw new WorkspaceError(415, 'json_required');
  const reader = request.body?.getReader(); let size = 0, text = ''; const decoder = new TextDecoder();
  if (reader) while (true) {
    const { done, value } = await reader.read(); if (done) break;
    size += value.length; if (size > 96000) { void reader.cancel(); throw new WorkspaceError(413, 'request_too_large'); }
    text += decoder.decode(value, { stream: true });
  }
  return JSON.parse(text + decoder.decode());
}
function sourceFor(auth: AuthInfo) { return `ecos:personal-workspace:${auth.clientId}`; }
async function noteFor(id: string, auth: AuthInfo, ports: WorkspacePorts) {
  const note = await ports.fetchThought(id);
  if (!note || note.id !== id || note.source !== sourceFor(auth)) throw new WorkspaceError(404, 'note_not_found');
  return note;
}
export function createWorkspaceHandler(ports: WorkspacePorts) {
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url), action = url.searchParams.get('action') ?? 'context';
    if (url.pathname === '/app' && request.method === 'GET') {
      const nonce = randomBytes(18).toString('base64');
      return new Response(workspacePage(nonce), { headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'` } });
    }
    if (!['GET', 'POST'].includes(request.method)) return json({ error: 'method_not_allowed' }, 405);
    if (request.method === 'POST' && (request.headers.get('origin') !== url.origin || request.headers.get('x-ecos-request') !== 'workspace')) return json({ error: 'origin_rejected' }, 403);
    try {
      if (action === 'login' && request.method === 'POST') {
        const { credential } = z.strictObject({ credential: z.string().min(1).max(2000) }).parse(await readBody(request));
        const auth = await ports.authenticate(new Request(request.url, { headers: { authorization: `Bearer ${credential}` } }));
        if (!auth || !auth.scopes.includes('ecb:recover')) return json({ error: 'access_not_accepted' }, 401);
        return setCookie(json({ signed_in: true }), seal(credential, ports));
      }
      if (action === 'logout' && request.method === 'POST') return setCookie(json({ signed_in: false }), '');
      const credential = unseal(request, ports);
      const auth = credential ? await ports.authenticate(new Request(request.url, { headers: { authorization: `Bearer ${credential}` } })) : null;
      if (!auth) return json({ error: 'session_required' }, 401);
      if (!auth.scopes.includes('ecb:recover') || (request.method === 'POST' && !auth.scopes.includes('ecb:preserve'))) return json({ error: 'capability_required' }, 403);
      if (action === 'context' && request.method === 'GET') {
        const [commission, work] = await Promise.all([ports.commission(), ports.work()]);
        return json({ commission, work, can_preserve: auth.scopes.includes('ecb:preserve') });
      }
      if (action === 'work' && request.method === 'GET') return json(await ports.work(uuid.parse(url.searchParams.get('id'))));
      if (action === 'note' && request.method === 'GET') {
        const id = uuid.parse(url.searchParams.get('id')), note = await noteFor(id, auth, ports);
        return json({ note, sha256: digest(note.content) });
      }
      if (action === 'capture' && request.method === 'POST') {
        const input = captureSchema.parse(await readBody(request));
        if (!input.content.trim()) throw new WorkspaceError(400, 'empty_note');
        const note = await ports.capture({ operationId: input.operation_id, content: input.content, source: sourceFor(auth) });
        const readback = await noteFor(note.id, auth, ports);
        if (readback.content !== input.content) throw new WorkspaceError(409, 'capture_verification_failed');
        return json({ note: readback, sha256: digest(readback.content), verified: true });
      }
      if (action === 'reference' && request.method === 'POST') {
        const input = referenceSchema.parse(await readBody(request)), note = await noteFor(input.thought_id, auth, ports);
        if (digest(note.content) !== input.source_sha256) throw new WorkspaceError(409, 'source_changed');
        const content = JSON.stringify({ contract: 'ecos:personal-reference:1', action: 'preserve_reference', reviewed: true, subject: auth.clientId, thought_id: note.id, source_sha256: input.source_sha256, note_content: note.content });
        const artifact = await ports.createArtifact({ operationId: input.operation_id, content });
        const readback = await ports.fetchArtifact(artifact.id);
        if (!readback || readback.id !== artifact.id || readback.content !== content) throw new WorkspaceError(409, 'reference_verification_failed');
        return json({ artifact_id: artifact.id, thought_id: note.id, source_sha256: input.source_sha256, verified: true });
      }
      if (action === 'reference' && request.method === 'GET') {
        const id = uuid.parse(url.searchParams.get('id')), artifact = await ports.fetchArtifact(id);
        if (!artifact || artifact.id !== id) throw new WorkspaceError(404, 'reference_not_found');
        let reference; try { reference = JSON.parse(artifact.content); } catch { throw new WorkspaceError(409, 'reference_invalid'); }
        if (reference.contract !== 'ecos:personal-reference:1' || reference.subject !== auth.clientId) throw new WorkspaceError(404, 'reference_not_found');
        const note = await noteFor(uuid.parse(reference.thought_id), auth, ports);
        if (reference.source_sha256 !== digest(note.content) || reference.note_content !== note.content) throw new WorkspaceError(409, 'reference_verification_failed');
        return json({ artifact_id: id, note, sha256: reference.source_sha256, verified: true });
      }
      return json({ error: 'not_found' }, 404);
    } catch (error) {
      if (error instanceof WorkspaceError) return json({ error: error.code }, error.status as 400);
      if (error instanceof z.ZodError || error instanceof SyntaxError) return json({ error: 'invalid_request' }, 400);
      return json({ error: 'service_unavailable', outcome: request.method === 'POST' ? 'unknown_retry_same_request' : 'unavailable' }, 503);
    }
  };
}
