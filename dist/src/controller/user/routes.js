import { Hono } from "hono";
import { createUser, deleteUser, updateUser, loginUser, user, logoutUser, } from "./index";
import { auth } from "@/middlewares/auth";
const router = new Hono()
    //Outside of auth
    // User Creation and Login
    .post("/user/signup", createUser) // Create user
    .post("/user/login", loginUser)
    .post("/user/logout", logoutUser)
    //Inside auth
    .delete("/user/:id", auth, deleteUser) // delete user
    .put("/user/:id", auth, updateUser) // update user
    .get("/user/:id", auth, user); // get user name //Logout user
//Logout user
export default router;
