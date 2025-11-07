// backend/src/routes/service.routes.js
import express from "express";
import { createService, getServices, getService, updateService, deleteService } from "../controllers/service.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Remove validate(serviceSchema) since multipart/form-data doesn't work well with Joi
router.post("/", 
  protect, 
  authorize("provider"),
  upload.array("photos", 5),
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