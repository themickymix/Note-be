import { Context } from "hono";
import User from "../../db/models/user.model";
import argon2 from "argon2";
import { sign } from "hono/jwt";
import { env } from "hono/adapter";
import { setCookie, deleteCookie } from "hono/cookie";

// Create user
export const createUser = async (c: Context) => {
  const { name, email, password } = await c.req.json();

  try {
    const hashedPassword = await argon2.hash(password);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    return c.json({ message: "User created!", user: newUser }, 201);
  } catch (error) {
    return c.json({ messsage: "User already exists" }, 400);
  }
};

// Delete user
export const deleteUser = async (c: Context) => {
  const { id } = await c.req.param();
  const user = await User.findById(id);
  if (!user) {
    return c.json({ message: "User not found" }, 404);
  }
  await user.deleteOne();
  return c.json({ message: "User deleted" }, 200);
};

// Update user
export const updateUser = async (c: Context) => {
  const { id } = await c.req.param();
  const user = await User.findById(id);
  if (!user) {
    return c.json({ message: "User not found" }, 404);
  }
  const { name, email, password } = await c.req.json();
  await user.updateOne({ name, email, password });
  return c.json({ message: "User updated" }, 200);
};

// get user name
export const user = async (c: Context) => {
  const { id } = c.req.param();
  const user = await User.findById(id);

  if (!user) {
    return c.json({ message: "User not found" }, 404);
  }

  return c.json({ name: user.name });
};

// Login user
export const loginUser = async (c: Context) => {
  const { email, password } = await c.req.json();

  const user = await User.findOne({ email });
  if (!user) {
    return c.json({ message: "User not found" }, 404);
  }

  try {
    if (await argon2.verify(user.password, password)) {
      const runtimeEnv = env<{ JWT_SECRET: string }>(c);
      const SECRET_KEY = runtimeEnv.JWT_SECRET || process.env.JWT_SECRET;
      if (!SECRET_KEY) {
        console.error("JWT_SECRET is missing in env variables");
        return c.json({ message: "Server error" }, 500);
      }

      // ✅ Sign JWT with `_id` and `email`
      const token = await sign(
        {
          _id: user._id.toString(),
          email: user.email,
          exp: Math.floor(Date.now() / 1000) + 3600, //expired in 1 hour
        },
        SECRET_KEY
      );

      // ✅ Set cookie
      setCookie(c, "token", token, {
        path: "/",
        httpOnly: true,
        secure: true, // Change to `true` in production with HTTPS
        maxAge: 3600,
        sameSite: "Strict",
      });

      return c.json(
        { message: "Login successful", token, user: user._id.toString() },
        200
      );
    } else {
      return c.json({ message: "Incorrect password" }, 401);
    }
  } catch (error) {
    console.error("Error during login:", error);
    return c.json({ message: "Internal server error" }, 500);
  }
};

//Logout user'
export const logoutUser = async (c: Context) => {
  deleteCookie(c, "token", {
    path: "/",
    secure: true,
    httpOnly: true,
    sameSite: "Strict",
  });
  return c.json({ message: "Logout successful" }, 200);
};
