
import express from "express";
import {
  addUser,
  updateUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  getUsersByRole,
  getTrashedUsers,
  trashUser,
  restoreUser,
  permanentDeleteUser,
} from "./user.controller.js";

const router = express.Router();

router.post("/", addUser);


// Active users
router.get("/", getAllUsers); // paginated
router.get("/id/:id", getUserById);
router.get("/email/:email", getUserByEmail);
router.get("/role", getUsersByRole); // role passed as query param ?role=staff&page=1&limit=10

// Trashed users
router.get("/trashed/all", getTrashedUsers); // paginated


router.put("/:id", updateUser);

router.delete("/trash/:id", trashUser);


router.patch("/restore/:id", restoreUser);


router.delete("/permanent/:id", permanentDeleteUser);

export default router;
