import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminReplySchema = new mongoose.Schema(
  {
    replied: {
      type: Boolean,
      default: false,
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    repliedAt: {
      type: Date,
      default: null,
    },
    replyMessage: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);
const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    mobile: {
      type: String,
      minlength: 10,
      default: null,
    },
    subject: {
      type: String,
    },
    email: { type: String, index: true },
    message: { type: String },
    adminReply: adminReplySchema,
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;
