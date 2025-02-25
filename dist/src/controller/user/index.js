import User from "../../db/models/user.model";
import argon2 from "argon2";
import { sign } from "hono/jwt";
import { env } from "hono/adapter";
import { setCookie, deleteCookie } from "hono/cookie";
// Create user
export const createUser = async (c) => {
    const { name, email, password } = await c.req.json();
    try {
        const hashedPassword = await argon2.hash(password);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        // Generate JWT Token
        const runtimeEnv = env(c);
        const SECRET_KEY = runtimeEnv.JWT_SECRET || process.env.JWT_SECRET;
        if (!SECRET_KEY) {
            console.error("JWT_SECRET is missing in env variables");
            return c.json({ message: "Server error" }, 500);
        }
        const token = await sign({
            _id: newUser._id.toString(),
            email: newUser.email,
            exp: Math.floor(Date.now() / 1000) + 3600, // Expire in 1 hour
        }, SECRET_KEY);
        // Set cookie
        setCookie(c, "token", token, {
            path: "/",
            httpOnly: false,
            secure: true, // Set `true` in production
            maxAge: 3600,
            sameSite: "none",
        });
        return c.json({ message: "User created!", user: newUser, token }, 201);
    }
    catch (error) {
        return c.json({ message: "User already exists" }, 400);
    }
};
// Delete user
export const deleteUser = async (c) => {
    const { id } = await c.req.param();
    const user = await User.findById(id);
    if (!user) {
        return c.json({ message: "User not found" }, 404);
    }
    await user.deleteOne();
    return c.json({ message: "User deleted" }, 200);
};
// Update user
export const updateUser = async (c) => {
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
export const user = async (c) => {
    const id = c.req.param("id"); // ✅ Get the parameter correctly
    try {
        const user = await User.findById(id);
        if (!user) {
            return c.json({ message: "User not found" }, 404);
        }
        return c.json({ name: user.name });
    }
    catch (error) {
        console.error("Error fetching user:", error);
        return c.json({ message: "Internal Server Error" }, 500);
    }
};
// Login user
export const loginUser = async (c) => {
    const { email, password } = await c.req.json();
    const user = await User.findOne({ email });
    if (!user) {
        return c.json({ message: "User not found" }, 404);
    }
    try {
        if (await argon2.verify(user.password, password)) {
            const runtimeEnv = env(c);
            const SECRET_KEY = runtimeEnv.JWT_SECRET || process.env.JWT_SECRET;
            if (!SECRET_KEY) {
                console.error("JWT_SECRET is missing in env variables");
                return c.json({ message: "Server error" }, 500);
            }
            // ✅ Sign JWT with `_id` and `email`
            const token = await sign({
                _id: user._id.toString(),
                email: user.email,
                exp: Math.floor(Date.now() / 1000) + 3600, //expired in 1 hour
            }, SECRET_KEY);
            // ✅ Set cookie
            setCookie(c, "token", token, {
                path: "/",
                httpOnly: false,
                secure: true,
                maxAge: 3600,
                sameSite: "none",
            });
            return c.json({ message: "Login successful", token, user: user._id.toString() }, 200);
        }
        else {
            return c.json({ message: "Incorrect password" }, 401);
        }
    }
    catch (error) {
        console.error("Error during login:", error);
        return c.json({ message: "Internal server error" }, 500);
    }
};
//Logout user'
export const logoutUser = async (c) => {
    deleteCookie(c, "token", {
        path: "/",
        secure: true,
        httpOnly: true,
        sameSite: "None",
    });
    return c.json({ message: "Logout successful" }, 200);
};
