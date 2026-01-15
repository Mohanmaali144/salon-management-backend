import express from "express";
import cors from "cors";
import connectDB from "../src/config/db.js";
import authRoutes from "../src/modules/auth/auth.route.js"
import userRoutes from "../src/modules/user/user.route.js"
import contactRoutes from "../src/modules/contact/contact.route.js"
import projectRoutes from "../src/modules/project/project.route.js"
import settingRoutes from "../src/modules/setting/setting.route.js"
import newsletterRoutes from "../src/modules/newsletter/newsletter.route.js";
import tagsRoutes from "../src/modules/tags/tag.route.js";
import codeRoutes from "../src/modules/code/code.route.js";
import adminRoutes from "../src/modules/admin/admin.route.js";
import dotenv from "dotenv";
import { initSocket } from "../src/utils/socket.js";
import http from "http";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config();

const app = express();

const server = http.createServer(app);

// Core middleware
app.use(cors());
app.use(express.json());
// app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

connectDB()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes)
app.use("/api/contact", contactRoutes)
app.use("/api/project", projectRoutes)
app.use("/api/settings", settingRoutes)
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/tag", tagsRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("API Working")
})

// Initialize socket
initSocket(server);

const PORT = process.env.PORT || 5000;

// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

export default app;
