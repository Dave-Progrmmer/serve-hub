import express from "express";
import { createService, getServices, getService, updateService, deleteService } from "../controllers/service.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createService);
router.get("/", getServices);
router.get("/:id", getService);
router.put("/:id", protect, updateService);
router.delete("/:id", protect, deleteService);

export default router;
