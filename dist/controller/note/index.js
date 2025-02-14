import Note from "../../db/models/note.model";
export const getNotes = async (c) => {
    const user = c.get("user");
    if (!user || !user._id) {
        return c.json({ message: "Unauthorized: No user attached" }, 401);
    }
    const notes = await Note.find({ user: user._id });
    return c.json(notes);
};
export const createNote = async (c) => {
    try {
        const { title, content } = await c.req.json();
        console.log("User from context:", c.get("user"));
        // ✅ Retrieve user from context
        const user = c.get("user");
        if (!user || !user._id) {
            return c.json({ message: "Unauthorized: No user attached" }, 401);
        }
        // ✅ Create the note with user ID
        const newNote = new Note({ title, content, user: user._id });
        if (title === "") {
            return c.json({ message: "Note title cannot be empty" }, 400);
        }
        await newNote.save();
        return c.json({ message: "Note created!", note: newNote }, 201);
    }
    catch (error) {
        console.error("Error creating note:", error);
        return c.json({ message: "Server error" }, 500);
    }
};
export const deleteNote = async (c) => {
    const user = c.get("user");
    if (!user || !user._id) {
        return c.json({ message: "Unauthorized: No user attached" }, 401);
    }
    const { id } = await c.req.param();
    const note = await Note.findById({ _id: id, user: user._id });
    if (!note) {
        return c.json({ message: "Note not found" }, 404);
    }
    await note.deleteOne();
    return c.json({ message: "Note deleted" }, 200);
};
export const updateNote = async (c) => {
    const { id } = await c.req.param();
    const note = await Note.findById(id);
    if (!note) {
        return c.json({ message: "Note not found" }, 404);
    }
    const { title, content } = await c.req.json();
    await note.updateOne({ title, content });
    return c.json({ message: "Note updated" }, 200);
};
