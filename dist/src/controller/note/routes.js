import { Hono } from "hono";
import { getNotes, createNote, deleteNote, updateNote } from "./index";
import { auth } from "@/middlewares/auth";
const router = new Hono()
    .post("/notes", auth, createNote)
    .get("/notes", auth, getNotes)
    .delete("/notes/:id", auth, deleteNote)
    .put("/notes/:id", auth, updateNote);
export default router;
