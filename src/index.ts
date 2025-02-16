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
    origin: [process.env.FRONTEND_URL as string],
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
/* app.use(
  "*",
  cors({      
    origin: "http://localhost:3001/",
    allowHeaders: ["X-Custom-Header", "Upgrade-Insecure-Requests"],
    allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 600,
    credentials: true,
  })
);
 */
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
