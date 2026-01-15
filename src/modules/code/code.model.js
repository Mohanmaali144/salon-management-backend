// code.model.js
import mongoose from "mongoose";

const codeSchema = new mongoose.Schema(
  {
    // ---------- Snippets Tab ----------
    snippets: {
      title: {
        type: String,
        trim: true,
      },
      tags: {
        type: [String], // Array of tag strings
        default: [],
      },
      code: {
        type: String,
      },
      description: {
        type: String,
        trim: true,
      },
    },

    // ---------- Repository Tab ----------
    repository: {
      ownerName: {
        type: String,
        trim: true,
      },
      repositoryName: {
        type: String,
        trim: true,
      },
      url: {
        type: String,
        trim: true,
      },
    },

    // ---------- Resources Tab ----------

    resources: {
      title: {
        type: String,
        trim: true,
      },
      resourceType: {
        type: String,
        enum: ["book", "tools", "video", "article", "course"],
        trim: true,
      },
      url: {
        type: String,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
    },

    type: {
      type: String,
      trim: true,
    },

  },
  { timestamps: true }
);

const Code = mongoose.model("Code", codeSchema);

export default Code;
