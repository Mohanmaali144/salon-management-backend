import express from "express";
import {
  addAvailability,
  updateAvailability,

    getAvailabilityById,
  getAvailabilityByStaff,
  getAvailabilityByStaffAndDate,
  getTrashedAvailability,

  trashAvailability,
  restoreAvailability,
  permanentDeleteAvailability,
  getAvailableStaff,
} from "./availability.controller.js";

const router = express.Router();


router.post("/", addAvailability);

// router.get("/", getAllAvailability); // paginated

router.get("/", getAvailableStaff);


router.get("/id/:id", getAvailabilityById);
router.get("/staff/:staffId", getAvailabilityByStaff); // paginated
router.get("/staff-date", getAvailabilityByStaffAndDate); // ?staffId=&date=
router.get("/trashed/all", getTrashedAvailability); // paginated
router.put("/:id", updateAvailability);

router.delete("/trash/:id", trashAvailability);

router.patch("/restore/:id", restoreAvailability);

router.delete("/permanent/:id", permanentDeleteAvailability);


export default router;
