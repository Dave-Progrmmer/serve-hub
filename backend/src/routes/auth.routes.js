import express from "express";
import { registerUser, loginUser, getMe } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";
import { validate, registerSchema, loginSchema } from "../validators/index.js";

const router = express.Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.get("/me", protect, getMe);

export default router;