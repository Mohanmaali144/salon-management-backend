import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const AdminSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    mobile: {
      type: String,
      minlength: 10,
      default: null,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // ⛔ never return password by default
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "admin",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    otp: {
      type: String,
      select: false,
    },

    otpExpires: {
      type: Date,
    },

    provider: {
      type: String,
      default: "manual",
    },

    picture: {
      type: String,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// 🔐 Hash password before save
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔑 Password match method
AdminSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.model("Admin", AdminSchema);
export default Admin;
