import { Context } from "hono";
import Note from "../../db/models/note.model";

export const getNotes = async (c: Context) => {
  const user = c.get("user") as { _id: string };
  if (!user || !user._id) {
    return c.json({ message: "Unauthorized: No user attached" }, 401);
  }
  const notes = await Note.find({ user: user._id });
  return c.json(notes);
};

export const createNote = async (c: Context) => {
  try {
    const { title, content, isPinned, bgColor } = await c.req.json(); // ✅ Extract isPinned
    console.log("User from context:", c.get("user"));

    // ✅ Retrieve user from context
    const user = c.get("user") as { _id: string };
    if (!user || !user._id) {
      return c.json({ message: "Unauthorized: No user attached" }, 401);
    }

    // ✅ Validate input
/*     if (!title.trim()) {
      return c.json({ message: "Note title cannot be empty" }, 400);
    } */

    // ✅ Create the note with user ID and isPinned field
    const newNote = new Note({ title, content, isPinned, user: user._id, bgColor });

    await newNote.save();
    return c.json({ message: "Note created!", note: newNote }, 201);
  } catch (error) {
    console.error("Error creating note:", error);
    return c.json({ message: "Server error" }, 500);
  }
};


export const deleteNote = async (c: Context) => {
  const user = c.get("user") as { _id: string };
  if (!user || !user._id) {
    return c.json({ message: "Unauthorized: No user attached" }, 401);
  }
  const { id } = await c.req.param();
  console.log("Received delete request for note ID:", id);

  const note = await Note.findOneAndDelete({ _id: id, user: user._id });
  if (!note) {
    return c.json({ message: "Note not found" }, 404);
  }
  await note.deleteOne();
  return c.json({ message: "Note deleted" }, 200);
};
export const updateNote = async (c: Context) => {
  // Get the user from the context
  const user = c.get("user") as { _id: string };
  if (!user || !user._id) {
    return c.json({ message: "Unauthorized: No user attached" }, 401);
  }

  // Get the note ID from the request params
  const { id } = await c.req.param();

  // Get the updated data from the request body
  const { title, content, isPinned } = await c.req.json();
  try {
    if (!title.trim() && !content.trim()) {
      await Note.findOneAndDelete({ _id: id, user: user._id });
      return c.json({ message: "Note deleted" }, 200);
    }
    // Find and update the note, ensuring it belongs to the current user
    const note = await Note.findOneAndUpdate(
      { _id: id, user: user._id }, // Search filter: find note by ID and user
      { $set: { title, content, isPinned } }, // The update operation: set title and content
      { new: true }, // Option to return the updated document
    );

    // If the note doesn't exist or the user doesn't have access to it, return a 404 response
    if (!note) {
      return c.json({ message: "Note not found" }, 404);
    }

    // Return a response indicating the note was successfully updated
    return c.json({ message: "Note updated", note }, 200);
  } catch (error) {}
};

export const getNote = async (c: Context) => {
  console.log(c.req.param());
  const user = c.get("user") as { _id: string };
  try {
    const { id } = await c.req.param();
    const note = await Note.findById({ _id: id, user: user._id });
    if (!note) {
      return c.json({ message: "Note not found" }, 404);
    }
    return c.json(note);
  } catch (error) {
    return c.json({ message: "Internal Server Error" }, 500);
  }
};

export const togglePin = async (c: Context) => {
  const user = c.get("user") as { _id: string };
  if (!user || !user._id) {
    return c.json({ message: "Unauthorized: No user attached" }, 401);
  }

  const { id } = await c.req.param();
  try {
    // Find the note and toggle the isPinned status
    const note = await Note.findOne({ _id: id, user: user._id });

    if (!note) {
      return c.json({ message: "Note not found" }, 404);
    }

    note.isPinned = !note.isPinned; // ✅ Toggle pin stat
    await note.save();

    return c.json(
      { message: `Note ${note.isPinned ? "pinned" : "unpinned"}`, note },
      200
    );
  } catch (error) {
    return c.json({ message: "Server error", error }, 500);
  }
};
