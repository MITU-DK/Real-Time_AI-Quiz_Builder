import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import pool from "../../db/pool";
import { RegisterRequestBody, UserRow } from "../../types";
import { signToken } from "./utils";

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, display_name } = req.body as RegisterRequestBody;

  if (!email || !password || !display_name) {
    res.status(400).json({ error: "email, password, and display_name are required." });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters." });
    return;
  }

  try {
    const existing = await pool.query<UserRow>(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase()]
    );
    if (existing.rowCount && existing.rowCount > 0) {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }

    const password_hash = await bcrypt.hash(password, 12);  //salt = 12

    const result = await pool.query<UserRow>(
      `INSERT INTO users (email, password_hash, display_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, display_name, created_at`, [email.toLowerCase(), password_hash, display_name]
    );

    const newUser = result.rows[0];
    const token = signToken(newUser.id, newUser.email);

    res.status(201).json({
      message: "Account created successfully.",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        display_name: newUser.display_name,
      },
    });
  } catch (error) {
    console.error("[Auth] Register error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
