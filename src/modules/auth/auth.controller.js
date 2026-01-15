import jwt from "jsonwebtoken";
import Admin from "../admin/admin.model.js";
import bcrypt from "bcryptjs";
import { googleClient } from "../../config/googleOAuth.js";
import sendEmail from "../../utils/mailHelper.js";
import { failure, success } from "../../utils/responseHandler.js";
import { sanitizeInput } from "../../utils/sanitize.js";
import { generateUniqueSlug } from "../../utils/slugGenerator.js";
import User from "../user/user.model.js";

// Generate Access Token
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "7d", // short-lived
  });
};

// Generate Refresh Token
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "15d", // longer-lived
  });
};

const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
};
/* ================= MANUAL SIGNUP ================= */
export const register = async (req, res) => {
  try {
    req.body = sanitizeInput(req.body);
    const { firstName, lastName, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({
        message:
          exists.provider === "google"
            ? "Use Google login"
            : "Email already registered",
      });
    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const hashedOTP = await bcrypt.hash(otp, 10);
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 min
    const user = await User.create({
      slug: await generateUniqueSlug(User, firstName),
      firstName,
      lastName,
      email,
      password: hashed,
      provider: "manual",
      otp: hashedOTP,
      otpExpires,
      isVerified: false,
    });
    // await sendEmail({
    //   to: user.email,
    //   subject: `Verify your account on ${APP_NAME}`,
    //   html: `<p>Hello ${user.firstName},</p>
    //            <p>Your OTP for account verification is: <b>${otp}</b></p>
    //            <p>This OTP expires in 10 minutes.</p>`,
    // });

    return res.status(201).json(
      success({
        data: user,
        message: "Registration Success",
        code: "USER_REGISTERD",
      })
    );
  } catch (err) {
    return res.status(500).json(
      failure({
        message: err.message,
        code: "SERVER_ERROR",
        details: err,
      })
    );
  }
};

/* ================= MANUAL LOGIN ================= */
export const login = async (req, res) => {
  try {
    req.body = sanitizeInput(req.body);
    const { email, password } = req.body;
    const user = await Admin.findOne({ email }).select("+password");

    if (!user) {
      // return res.status(400).json({ message: "User not found" });
      return res.status(400).json(
        failure({
          message: "user not found",
          code: "FAILD_TO_LOGIN",
          details: "this email is not registerd",
        })
      );
    }

    if (user.provider === "google") {
      return res.status(400).json(
        failure({
          message: "Login via Google",
          code: "FAILD_TO_LOGIN",
          details: "You can Login by google",
        })
      );
      // return res.status(400).json({ message: "Login via Google" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      // return res.status(400).json({ message: "Invalid credentials" });
      return res.status(400).json(
        failure({
          message: "Invalid credentials",
          code: "FAILD_TO_LOGIN",
          details: "Password not mached",
        })
      );
    }

    if (!process.env.LOGIN_WITHOUT_VERIFY_EMAIL === "true" && !user.isVerified) {
      const otp = generateOTP();
      const hashedOTP = await bcrypt.hash(otp, 10);
      user.otp = hashedOTP;
      user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 min
      await user.save();

      // SEND OTP BY EMAIL
      await sendEmail({
        to: user.email,
        subject: `Verify your account on ${APP_NAME}`,
        html: `<p>Hello ${user.firstName},</p>
               <p>Your OTP for account verification is: <b>${otp}</b></p>
               <p>This OTP expires in 10 minutes.</p>`,
      });
      return res.status(400).json(
        failure({
          message: "Invalid credentials",
          code: "ACCOUNT_NOT_VERIFIED",
          details:
            "You have to verify your account by otp on your email, check your email",
        })
      );
    }
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json(
      success({
        data: { user: userObj, accessToken, refreshToken },
        message: "Login Success",
        code: "USER_LOGIN",
      })
    );
  } catch (err) {
    // res.status(500).json({ error: err.message });
    return res.status(500).json(
      failure({
        message: err.message,
        code: "SERVER_ERROR",
        details: "Some internal server error occured",
      })
    );
  }
};


/* ================= GOOGLE CALLBACK ================= */
export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    // Exchange code for tokens
    const { tokens } = await googleClient.getToken(code);

    // Verify ID Token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Check if user already exists
    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = await User.create({
        slug: await generateUniqueSlug(User, payload.given_name),
        firstName: payload.given_name,
        lastName: payload.family_name,
        email: payload.email,
        googleId: payload.sub,
        picture: payload.picture,
        provider: "google",
        isVerified: true,
      });
    }

    // Create Token
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Redirect back to frontend with token
    return res.redirect(
      `${process.env.FRONTEND_URL}/auth/success?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  } catch (err) {
    return res.status(500).json(
      failure({
        message: err.message,
        code: "FAILD_TO_LOGIN",
        details: "Some internal server error occured",
      })
    );
  }
};

// POST /api/auth/google
export const loginWithGoogle = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      const slug = await generateUniqueSlug(User, payload.given_name);
      user = await User.create({
        slug: slug,
        firstName: payload.given_name,
        lastName: payload.family_name,
        email: payload.email,
        googleId: payload.sub,
        picture: payload.picture,
        provider: "google",
        isVerified: true,
      });
    }
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    //  return res.redirect(
    //   `${process.env.FRONTEND_URL}/?accessToken=${accessToken}&refreshToken=${refreshToken}`
    // );

    return res.status(201).json(
      success({
        data: { ...user.toObject(), accessToken, refreshToken },
        message: "Login Success",
        code: "USER_LOGIN",
      })
    );
  } catch (err) {
    return res.status(500).json(
      failure({
        message: err.message,
        code: "GOOGLE_LOGIN_FAILD",
        details: "Some internal server error occured",
      })
    );

  }
};

export const verifyOtp = async (req, res) => {
  req.body = sanitizeInput(req.body);
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json(
        failure({
          message: "User not found",
          code: "FAILD_TO_VERIFY",
          details: "User is not available with this email ",
        })
      );
    }

    const match = await bcrypt.compare(otp, user.otp);
    if (!match || user.otpExpires < Date.now()) {
      return res.status(400).json(
        failure({
          message: "Invalid or expired OTP",
          code: "FAILD_TO_VERIFY",
          details: "Otp is invalid you can resend",
        })
      );
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    return res.status(201).json(
      success({
        data: { ...user, accessToken, refreshToken },
        message: "Verified successfully!",
        code: "EMAIL_VERIFY_SUCCESS",
      })
    );
  } catch (err) {
    return res.status(500).json(
      failure({
        message: err.message,
        code: "SERVER_ERROR",
        details: "Some internal server error occured",
      })
    );
  }
};
