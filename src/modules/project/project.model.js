import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    shortDescription: {
      type: String,
      required: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
    },

    featured_image: {
      type: Object, // image URL
      required: true,
    },

    images: [
      {
        type: String, // additional image URLs
      },
    ],

    techStack: [
      {
        type: String, // e.g. "Next.js", "NestJS", "MongoDB"
        required: true,
      },
    ],

    projectType: {
      type: String,
      enum: ["personal", "client", "startup"],
      default: "personal",
    },

    liveUrl: {
      type: String,
    },

    githubUrl: {
      type: String,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Project", projectSchema);
