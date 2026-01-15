import express from "express";
import {
  googleCallback,
  login,
  loginWithGoogle,
  register,
  verifyOtp,
} from "./auth.controller.js";

const router = express.Router();


router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp)
router.post("/google", loginWithGoogle);
router.get("/google/callback", googleCallback);

export default router;

