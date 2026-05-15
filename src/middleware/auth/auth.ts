import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Response, NextFunction } from "express";
import { AuthRequest, DecodedToken } from "../../interface/interface";

dotenv.config();

export function auth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const token: string | undefined = req.cookies?.access_token;
  const secret: string | undefined = process.env.JWT_SECRET;

  if (!token) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  if (!secret) {
    res.status(500).json({ success: false, error: "JWT Secret is missing" });
    return;
  }

  try {
    const decoded: DecodedToken = jwt.verify(token, secret) as DecodedToken;

    req.user = decoded;

    next();
  } catch (err) {
    res.sendStatus(403);
    return;
  }
}
