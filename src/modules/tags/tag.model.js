// tag.model.js
import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
  {
    tag: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Tags = mongoose.model("Tags", tagSchema);

export default Tags;
