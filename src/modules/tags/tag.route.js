import express from "express";
import { addTag, deleteTag, getAllTags, } from "./tag.controller.js";


export const router = express.Router();

router.get("/", getAllTags);
router.post("/create", addTag);
router.post("/delete", deleteTag);

export default router