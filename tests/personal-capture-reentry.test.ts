import test from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { PERSONAL_HTML } from '../server/personal-app-ui.js';

const operation = 'c13a21da-b423-44bc-9e08-9981ec66682a';
const thought = '89fcb55f-4822-49d3-854d-a4d46eb87d9e';
const key = 'ecos.personal.capture.pending.v1';
const content = '  Exact Unicode ☃\r\n"words"\ntrailing space ';
const script = PERSONAL_HTML.match(/<script nonce="%%NONCE%%">([\s\S]*?)<\/script>/)![1];
type StoragePort = { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void };
function storage() {
  const values = new Map<string, string>();
  return { values, getItem: (k: string) => values.get(k) ?? null,
    setItem: (k: string, v: string) => { values.set(k, v); }, removeItem: (k: string) => { values.delete(k); } };
}
function boot(saved: StoragePort, answer?: (body: string) => Promise<any>, recoverSession = false) {
  const nodes = new Map<string, any>();
  const element = () => ({ value: '', textContent: '', hidden: false, disabled: false, readOnly: false, checked: false,
    listeners: new Map<string, Function>(), addEventListener(event: string, fn: Function) { this.listeners.set(event, fn); },
    classList: { add() {}, remove() {}, toggle() {} }, setAttribute() {}, append() {}, replaceChildren() {} });
  const get = (id: string) => { if (!nodes.has(id)) nodes.set(id, element()); return nodes.get(id); };
  get('capture-review').hidden = true;
  const posts: string[] = [];
  let uuids = 0;
  let refreshes = 0;
  let sessionRecovered = false;
  const context = { document: { getElementById: get, querySelectorAll: () => [], createElement: element },
    sessionStorage: saved, URL, Map, Set, Date, crypto: { randomUUID: () => { uuids++; return operation; } },
    navigator: { locks: { request: async (_name: string, fn: Function) => fn() } }, location: { pathname: '/api/personal', origin: 'https://example.test', href: 'https://example.test/api/personal' },
    history: { replaceState() {} }, fetch: async (_url: string, init?: { method?: string; body?: string }) => {
      if (_url === '/oauth/context') return { status: 401, ok: false, json: async () => ({ code: 'session_refresh_required' }) };
      if (_url === '/oauth/refresh') { refreshes++;sessionRecovered=true;return { status: 200, ok: true, json: async () => ({}) }; }
      if (init?.method === 'POST') {
        posts.push(init.body!);
        if(recoverSession&&!sessionRecovered) return {status:401,ok:false,clone:()=>({json:async()=>({code:'session_refresh_required'})})};
        return answer ? answer(init.body!) : Promise.reject(Error('lost acknowledgement'));
      }
      return { status: 503, ok: false, json: async () => ({ error: 'Fixture native read unavailable' }) };
    } };
  runInNewContext(script, context);
  return { get, posts, uuids: () => uuids, refreshes: () => refreshes,
    review() { get('review-capture').onclick(); },
    async confirm() { get('capture-consent').checked = true; await get('confirm-capture').onclick(); },
    input(value: string) { get('thought-content').value = value; get('thought-content').listeners.get('input')(); } };
}
const verified = async () => ({ status: 200, ok: true, json: async () => ({ state: 'RAW_CUSTODY_VERIFIED', operation_id: operation, thought_id: thought }) });

test('lost response survives full script reload with exact request bytes, explicit consent and no automatic replay', async () => {
  const saved = storage();
  const first = boot(saved);
  first.input(content);first.review();await first.confirm();
  assert.equal(first.posts.length, 1);
  assert.equal(JSON.parse(first.posts[0]).content, content);
  assert.match(first.get('capture-reentry').textContent, new RegExp(operation));
  const second = boot(saved, verified);
  assert.equal(second.posts.length, 0);
  assert.equal(second.get('thought-content').value, content);
  assert.equal(second.get('thought-content').readOnly, true);
  await second.confirm(); // Review must happen again, even with a checked consent box.
  assert.equal(second.posts.length, 0);
  second.review();await second.get('confirm-capture').onclick();
  assert.equal(second.posts.length, 0); // Review resets consent.
  await second.confirm();
  assert.equal(second.posts[0], first.posts[0]);
  assert.equal(second.uuids(), 0);
  assert.equal(saved.getItem(key), null);
  assert.match(second.get('capture-reentry').textContent, new RegExp(thought));
  assert.equal(second.get('new-capture').hidden, false);
  second.get('new-capture').onclick();
  assert.equal(second.get('thought-content').value, '');
  assert.equal(second.get('thought-content').readOnly, false);
});

test('unresolved occurrence cannot be silently edited or replaced with another identity', async () => {
  const saved=storage(), ui=boot(saved);
  ui.input(content);ui.review();await ui.confirm();const raw=saved.getItem(key);
  ui.input('replacement');
  assert.equal(ui.get('thought-content').value, content);
  assert.equal(ui.get('capture-review').hidden, true);
  ui.get('new-capture').onclick();
  ui.review();await ui.confirm();
  assert.equal(ui.posts[1], ui.posts[0]);assert.equal(ui.uuids(), 1);assert.equal(saved.getItem(key), raw);
});

test('denied writes or denied reads of retry storage fail before any capture POST', async () => {
  for (const denyRead of [false, true]) {
    const saved={ getItem: () => { if(denyRead)throw Error('denied');return null; },
      setItem() { throw Error('quota'); }, removeItem() {} };
    const ui=boot(saved);ui.input(content);ui.review();await ui.confirm();
    assert.equal(ui.posts.length,0);assert.equal(ui.get('confirm-capture').disabled,true);
    assert.match(ui.get('capture-reentry').textContent,/No capture will be sent/);
  }
});

test('corrupt or incompatible pending record remains intact and blocks writes', async () => {
  for (const raw of ['{broken','null',JSON.stringify({version:1,endpoint:'/app',body:'{}'}),
    JSON.stringify({version:1,endpoint:'/api/personal',body:JSON.stringify({authorized:true,operation_id:operation,content:''})})]) {
    const saved=storage();saved.setItem(key,raw);const ui=boot(saved);
    ui.input(content);ui.review();await ui.confirm();
    assert.equal(ui.posts.length,0);assert.equal(saved.getItem(key),raw);
    assert.match(ui.get('capture-reentry').textContent,/unavailable or corrupt/);
  }
});

test('storage divergence after restoration blocks replay and preserves the changed entry', async () => {
  const saved=storage(), first=boot(saved);first.input(content);first.review();await first.confirm();
  const ui=boot(saved);saved.setItem(key,'different');ui.review();await ui.confirm();
  assert.equal(ui.posts.length,0);assert.equal(saved.getItem(key),'different');
});

test('mismatched successful receipt stays unresolved and clearing failure prevents replacement', async () => {
  const saved=storage();
  const ui=boot(saved,async()=>({status:200,ok:true,json:async()=>({state:'RAW_CUSTODY_VERIFIED',operation_id:thought,thought_id:thought})}));
  ui.input(content);ui.review();await ui.confirm();assert.notEqual(saved.getItem(key),null);
  const retry=boot({...saved,removeItem(){throw Error('denied');}},verified);
  retry.review();await retry.confirm();
  assert.equal(retry.get('confirm-capture').disabled,true);assert.notEqual(saved.getItem(key),null);
  retry.get('new-capture').onclick();assert.equal(retry.get('thought-content').value,content);
});

test('browser session recovery reuses the persisted identical POST body', async () => {
  const saved=storage(), ui=boot(saved,verified,true);ui.input(content);ui.review();await ui.confirm();
  assert.equal(ui.refreshes(),1);assert.equal(ui.posts.length,2);
  assert.equal(ui.posts[0],ui.posts[1]);
  assert.equal(JSON.parse(ui.posts[0]).operation_id,operation);
  assert.equal(saved.getItem(key),null);
  assert.match(PERSONAL_HTML,/No credentials are stored here/);
});


test('silent storage write failure and duplicate confirm cannot create unsafe requests', async () => {
  const silent=boot({getItem:()=>null,setItem(){},removeItem(){}});
  silent.input(content);silent.review();await silent.confirm();assert.equal(silent.posts.length,0);
  let finish: (value: any) => void = () => {};
  const saved=storage(), ui=boot(saved,()=>new Promise(resolve=>{finish=resolve;}));
  ui.input(content);ui.review();const first=ui.confirm();await ui.confirm();
  assert.equal(ui.posts.length,1);assert.equal(ui.uuids(),1);
  finish(await verified());await first;assert.equal(saved.getItem(key),null);
});
