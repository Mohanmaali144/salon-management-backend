import express from "express";
import { addProject, getAllProjects, getProjectById, updateProject, deleteProject } from "./project.controller.js";
import { uploadSingle } from "../../middleware/upload.js";


export const router = express.Router();

router.post("/add", uploadSingle("featured_image"), addProject);
router.get("/", getAllProjects);
router.get("/:id/get", getProjectById);
router.put("/:id/update", uploadSingle("featured_image"), updateProject);

router.post("/delete", deleteProject);


export default router