import express from "express";
import { getUsers, getUser, updateUser, deleteUser } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUser);

// Allow profile picture upload
router.put("/:id", protect, upload.single("profilePic"), updateUser);

router.delete("/:id", protect, deleteUser);

export default router;