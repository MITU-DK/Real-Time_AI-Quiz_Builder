import jwt from "jsonwebtoken";
import { JwtPayload } from "../../types";

export const signToken = (userId: number, email: string): string => {
  const secret = process.env.JWT_SECRET!;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  const payload: JwtPayload = { userId, email };
  return jwt.sign(payload as object, secret, { expiresIn } as jwt.SignOptions);
};
