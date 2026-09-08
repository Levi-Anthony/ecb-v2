import {
  createHash,
  generateKeyPairSync,
  randomBytes,
  sign,
} from "node:crypto";
const hash = (b) => createHash("sha256").update(b).digest();
const b64 = (b) => Buffer.from(b).toString("base64url");
function head(major, n) {
  if (n < 24) return Buffer.from([major * 32 + n]);
  if (n < 256) return Buffer.from([major * 32 + 24, n]);
  const b = Buffer.alloc(3);
  b[0] = major * 32 + 25;
  b.writeUInt16BE(n, 1);
  return b;
}
function cbor(x) {
  if (Buffer.isBuffer(x)) return Buffer.concat([head(2, x.length), x]);
  if (typeof x === "string") {
    const b = Buffer.from(x);
    return Buffer.concat([head(3, b.length), b]);
  }
  if (typeof x === "number") return x >= 0 ? head(0, x) : head(1, -1 - x);
  if (x instanceof Map) {
    return Buffer.concat([
      head(5, x.size),
      ...[...x].flatMap(([k, v]) => [cbor(k), cbor(v)]),
    ]);
  }
  throw new Error("unsupported fixture CBOR");
}
export class SyntheticAuthenticator {
  constructor() {
    const pair = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
    this.privateKey = pair.privateKey;
    this.publicKey = pair.publicKey;
    this.id = b64(randomBytes(32));
    this.counter = 0;
    const jwk = this.publicKey.export({ format: "jwk" });
    this.cose = cbor(
      new Map([
        [1, 2],
        [3, -7],
        [-1, 1],
        [-2, Buffer.from(jwk.x, "base64url")],
        [-3, Buffer.from(jwk.y, "base64url")],
      ]),
    );
  }
  client(challenge, type, change = {}) {
    return Buffer.from(
      JSON.stringify({
        type,
        challenge,
        origin: "https://ecos.effortlessconnection.com",
        crossOrigin: false,
        ...change,
      }),
    );
  }
  register(options, change = {}) {
    this.handle = options.user.id;
    const client = this.client(options.challenge, "webauthn.create", change);
    const len = Buffer.alloc(2);
    len.writeUInt16BE(Buffer.from(this.id, "base64url").length);
    const auth = Buffer.concat([
      hash(Buffer.from(options.rp.id)),
      Buffer.from([0x45]),
      Buffer.alloc(4),
      Buffer.alloc(16),
      len,
      Buffer.from(this.id, "base64url"),
      this.cose,
    ]);
    return {
      id: this.id,
      rawId: this.id,
      type: "public-key",
      clientExtensionResults: {},
      response: {
        clientDataJSON: b64(client),
        attestationObject: b64(
          cbor(
            new Map([["fmt", "none"], ["attStmt", new Map()], [
              "authData",
              auth,
            ]]),
          ),
        ),
        transports: ["internal"],
      },
    };
  }
  authenticate(
    options,
    { client = {}, flags = 5, counter, signer, userHandle = this.handle } = {},
  ) {
    const clientData = this.client(options.challenge, "webauthn.get", client);
    const count = Buffer.alloc(4);
    count.writeUInt32BE(counter ?? ++this.counter);
    const auth = Buffer.concat([
      hash(Buffer.from(options.rpId)),
      Buffer.from([flags]),
      count,
    ]);
    return {
      id: this.id,
      rawId: this.id,
      type: "public-key",
      clientExtensionResults: {},
      response: {
        clientDataJSON: b64(clientData),
        authenticatorData: b64(auth),
        signature: b64(
          sign(
            "sha256",
            Buffer.concat([auth, hash(clientData)]),
            signer ?? this.privateKey,
          ),
        ),
        userHandle,
      },
    };
  }
}
