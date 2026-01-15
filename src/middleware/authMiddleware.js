import jwt from "jsonwebtoken";
import Admin from "../modules/admin/admin.model.js";


const authMiddleware = async (req, res, next) => {
  let token;


  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.user = await Admin.findById(decoded.id);

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};


// authorize("admin", "manager"),  
const authorize = (...allowedRoles) => (req, res, next) => {
  try {
    const user = req.user; // Comes from JWT middleware

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token missing or invalid",
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Access denied",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};


export { authMiddleware, authorize };
