import { Schema, model } from "mongoose";

const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: false,
    },
    content: {
      type: String,
      required: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bgColor: {
      type: String,
      default: "#fff",
    }
  },
  {
    timestamps: true,
  }
);
const Note = model("Note", noteSchema);

export default Note;
