import express from "express";
import {
  addService,
  getAllServices,
  getServiceById,
  getServiceByName,
  updateService,
  trashService,
  getTrashedServices,
  restoreService,
  permanentDeleteService,
} from "./service.controller.js";

const router = express.Router();


router.post("/",addService );


router.get("/", getAllServices); // pagination applied
router.get("/id/:id", getServiceById);
router.get("/name/:name", getServiceByName);


router.put("/:id", updateService);

router.delete("/trash/:id", trashService);

router.get("/trashed/all", getTrashedServices); // pagination applied
router.patch("/restore/:id", restoreService);


router.delete("/permanent/:id", permanentDeleteService);

export default router;
