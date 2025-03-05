import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { connectDB } from "./db/database";
import { routes } from "./controller/routes";
import { cors } from "hono/cors";
import dotenv from "dotenv";
dotenv.config();
const app = new Hono();
app.use(
  cors({
    origin: "https://noteapp-fe-three.vercel.app", // ✅ Ensure it's your exact frontend URL
    credentials: true, // ✅ Required to allow cookies
    allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE", "PATCH"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "accepts",
      "X-Custom-Header",
    ],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision", "Set-Cookie"],
    maxAge: 600,
  })
);

/* Routes */
routes.forEach((route) => {
  app.route("/api", route);
});

// Connect MongoDB
connectDB();

serve({
  fetch: app.fetch,
  port: 3000,
});
//ty
console.log("🚀 Server running at http://localhost:3000");
export default app;
