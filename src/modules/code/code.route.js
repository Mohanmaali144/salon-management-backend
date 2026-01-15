import express from "express";
import { addCode, deleteCode, getAllCode, getCodeById, updateCode, } from "./code.controller.js";
import multer from "multer";
const upload = multer();


export const router = express.Router();

router.get("/", getAllCode);
router.get("/:id/get", getCodeById);

router.post("/create", upload.none(), addCode);
router.put("/:id/update", upload.none(), updateCode);

router.post("/delete", deleteCode);

export default router