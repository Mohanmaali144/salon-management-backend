import rateLimit from "express-rate-limit";

// Example: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later",
  },
  standardHeaders: true, // return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // disable `X-RateLimit-*` headers
});

export default limiter;


// USE CASE
// apply to specific route
// app.use("/api/auth", limiter);