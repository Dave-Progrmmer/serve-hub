import express from "express";
import { sendMessage, getMessages } from "../controllers/message.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/:userId", protect, getMessages);

export default router;
