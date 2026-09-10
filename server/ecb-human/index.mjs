import { createServer } from "node:http";
import { createApp } from "./app.mjs";
import { connectVerifier } from "./db.mjs";
const db = await connectVerifier();
createServer(createApp(db)).listen(
  Number(process.env.PORT ?? 3000),
  "127.0.0.1",
);
