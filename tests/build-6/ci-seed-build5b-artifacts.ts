import { stages } from "../build-5b/move.ts";

const url = "postgres://postgres@127.0.0.1:55439/build6";
await stages(url, "ci-build5b-predecessor");
