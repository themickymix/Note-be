import { Hono } from "hono";
import { getNotes, createNote, deleteNote, updateNote, getNote } from "./index";
import { auth } from "@/middlewares/auth";
const router = new Hono()
  .post("/notes", auth, createNote)
  .get("/notes", auth, getNotes)
  .delete("/notes/:id", auth, deleteNote)
  .patch("/note/:id", auth, updateNote)
  .get("/note/:id", auth, getNote)
  .patch("/note/:id/pin", auth, getNote);

export default router;
