import express from 'express';

import { authMiddleware, authorize } from '../../middleware/authMiddleware.js';
import { getAllAdmin, addAdmin, getAdminById, updateAdmin, getUserProfile } from './admin.controller.js';
import multer from "multer";
const upload = multer();

const router = express.Router();

router.post("/add", authMiddleware, authorize(...["admin"]), upload.none(), addAdmin)
router.put("/:id/update", authMiddleware, authorize(...["admin"]), upload.none(), updateAdmin);

router.get("/me", authMiddleware, authorize(...["admin"]), getUserProfile);


router.get("/:id/get", authMiddleware, authorize(...["admin"]), getAdminById);

router.get('/', authMiddleware, authorize(...["admin"]), getAllAdmin);

export default router