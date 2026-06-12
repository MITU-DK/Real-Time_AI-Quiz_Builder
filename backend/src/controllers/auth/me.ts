import { Request, Response } from "express";
import pool from "../../db/pool";
import { UserRow } from "../../types";

// GET /api/auth/me
// Returns the profile of the currently authenticated host from the DB.
// The userId comes from the JWT payload attached by authenticateToken middleware.
export const getMe = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ error: "Not authenticated." });
    return;
  }

  try {
    const result = await pool.query<UserRow>(
      "SELECT id, email, display_name FROM users WHERE id = $1", [userId]);

    const user = result.rows[0];

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      display_name: user.display_name,
    });
  } catch (error) {
    console.error("[Auth] getMe error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
