import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import pool from "../../db/pool";
import { LoginRequestBody, UserRow } from "../../types";
import { signToken } from "./utils";

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginRequestBody;

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required." });
    return;
  }

  try {
    const result = await pool.query<UserRow>(
      "SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);

    const user = result.rows[0]; //Every row returned = UserRow object.

    const isValid = user
      ? await bcrypt.compare(password, user.password_hash)
      : await bcrypt.compare(password, "$2b$12$invalidhashinvalidhashinvalidhashXXXXXXXXX");

    if (!user || !isValid) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const token = signToken(user.id, user.email);

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
      },
    });
  }
  catch (error) {
    console.error("[Auth] Login error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
