import { Router } from "express";
import { register, login } from "../controllers/auth";

const router = Router();

// POST /api/auth/register — Create a new host account
router.post("/register", register);

// POST /api/auth/login — Login and receive a JWT
router.post("/login", login);

export default router;
