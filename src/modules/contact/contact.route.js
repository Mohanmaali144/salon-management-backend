import express from "express";
import {
  createContact,
  deleteById,
  getAllContacts,
  getContactById,
  replyToContact,
} from "./contact.controller.js";
import { authorize } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createContact);
router.get("/", getAllContacts);
router.get("/:id", getContactById);
router.put("/:id/reply",  replyToContact);
router.delete("/:id",  deleteById);

export default router;
