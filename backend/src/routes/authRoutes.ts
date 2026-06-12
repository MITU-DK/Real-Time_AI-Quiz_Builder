import { Router } from "express";
import { register, login, getMe } from "../controllers/auth";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// POST /api/auth/register — Create a new host account
router.post("/register", register);

// POST /api/auth/login — Login and receive a JWT
router.post("/login", login);

// GET /api/auth/me — Get current host profile (fresh from DB, token only in localStorage)
router.get("/me", authenticateToken, getMe);

export default router;

