import { handle } from "hono/vercel";

//eslint-disable-next-line antfu/no-import-dist
export const runtime = "nodejs";
import app from "../src/index.js";

export default handle(app);
