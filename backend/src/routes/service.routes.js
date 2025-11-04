import express from "express";
import { createService, getServices, getService, updateService, deleteService } from "../controllers/service.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import { validate, serviceSchema } from "../validators/index.js";

const router = express.Router();

router.post("/", 
  protect, 
  authorize("provider"),
  upload.array("photos", 5),
  validate(serviceSchema),
  createService
);

router.get("/", getServices);
router.get("/:id", getService);

router.put("/:id", 
  protect, 
  authorize("provider"), 
  updateService
);

router.delete("/:id", 
  protect, 
  authorize("provider"), 
  deleteService
);

export default router;