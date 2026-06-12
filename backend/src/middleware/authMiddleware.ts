import { Request, Response, NextFunction } from "express"; //Express Request,response object & Express next functions
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types";

// JWT Authentication Middleware
// Protects routes that require a logged-in host.
// Reads the Bearer token from the Authorization header, & verifies the signature,
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];        // "Bearer abc.xyz.123"
  const token = authHeader && authHeader.split(" ")[1];     // "abc.xyz.123"

  if (!token) {
    res.status(401).json({ error: "Access denied. No token provided." });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not configured.");
    }
    const decoded = jwt.verify(token, secret) as JwtPayload;

    req.user = decoded;

    next(); //attaches the DECODED payload to req.user so controllers can access the logged-in userId.

  }
  catch (error) {
    res.status(403).json({ error: "Invalid or expired token." });
  }
};
