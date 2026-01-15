import multer from "multer";
import path from "path";
import fs from "fs";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

// Ensure local upload folder exists
const uploadFolder = process.env.UPLOAD_FOLDER || "uploads";
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// Multer storage
const storage = multer.memoryStorage(); // always use memory first
const upload = multer({ storage });

// Upload to Cloudinary helper
const uploadToCloudinary = (file, folder = "uploads") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    const readable = new Readable();
    readable.push(file.buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};

// Save locally helper
const saveLocally = (file, folder = uploadFolder) => {
  const filename = `${Date.now()}-${file.originalname}`;
  const filepath = path.join(folder, filename);
  fs.writeFileSync(filepath, file.buffer);
  return {
    path: filepath,
    filename,
  };
};

// Conditional single file middleware
export const uploadSingle = (fieldName, folder = "uploads") => [
  upload.single(fieldName),
  async (req, res, next) => {
    if (!req.file) return next();
    try {
      if (process.env.USE_CLOUDINARY === "true") {
        const result = await uploadToCloudinary(req.file, folder);
        req.file.uploaded = result;
      } else {
        const result = saveLocally(req.file, folder);
        req.file.uploaded = result;
      }
      next();
    } catch (error) {
      next(error);
    }
  },
];

// Conditional multiple files middleware
export const uploadMultiple = (fieldName, folder = "uploads") => [
  upload.array(fieldName),
  async (req, res, next) => {
    if (!req.files || req.files.length === 0) return next();
    try {
      if (process.env.USE_CLOUDINARY === "true") {
        const results = await Promise.all(
          req.files.map((file) => uploadToCloudinary(file, folder))
        );
        req.files = results;
      } else {
        const results = req.files.map((file) => saveLocally(file, folder));
        req.files = results;
      }
      next();
    } catch (error) {
      next(error);
    }
  },
];
