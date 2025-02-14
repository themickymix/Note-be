import { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { getCookie } from "hono/cookie";

export async function auth(c: Context, next: Next) {
  try {
    // ✅ Extract token from cookies
    const token = getCookie(c, "token");
    if (!token) {
      return c.json({ message: "Unauthorized: No token provided" }, 401);
    }

    // ✅ Verify JWT
    const SECRET_KEY = process.env.JWT_SECRET as string;
    if (!SECRET_KEY) {
      console.error("Missing JWT_SECRET environment variable");
      return c.json({ message: "Server error" }, 500);
    }

    const payload = await verify(token, SECRET_KEY);
    if (!payload) {
      return c.json({ message: "Invalid token" }, 401);
    }

    // ✅ Attach user to context
    c.set("user", payload);

    await next();
  } catch (error) {
    console.error("JWT Verification Failed:", error);
    return c.json({ message: "Unauthorized" }, 401);
  }
}
