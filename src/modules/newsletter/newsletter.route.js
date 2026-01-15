import express from "express";
import {  getAllSubscribers, getTrashSubscribers, moveToTrash, permanentDelete, restoreFromTrash, sendNewsLetterMail, subscribeNewsletter } from "./newsletter.controller.js";


export const router = express.Router();

router.post("/subscribe", subscribeNewsletter);
router.get("/", getAllSubscribers);
router.get("/trash", getTrashSubscribers);
router.patch("/trash/:id", moveToTrash);
router.patch("/restore/:id", restoreFromTrash);
router.delete("/permanent/:id", permanentDelete);
router.post("/sendmail", sendNewsLetterMail)

export default router