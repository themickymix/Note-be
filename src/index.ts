import { Hono } from "hono";
import { connectDB } from "./db/database";
import { routes } from "./controller/routes";
import { cors } from "hono/cors";
import dotenv from "dotenv";

dotenv.config();

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: [
      "X-Custom-Header",
      "Upgrade-Insecure-Requests",
      "Content-Type",
      "Authorization",
      "accepts",
      "Access-Control-Allow-Origin",
      "Credentials",
    ],
    allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 600,
    credentials: true,
  })
);

/* Routes */
routes.forEach((route) => {
  app.route("/api", route);
});

// ✅ Connect MongoDB (but ensure it doesn't run multiple times in serverless)
connectDB();

// ✅ Vercel requires a **default export**
export default app;
