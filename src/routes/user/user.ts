import { Request, Response, Router } from "express";
import { pool } from "../../db/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { auth } from "../../middleware/auth/auth";

const router = Router();

const route = "/api/v1";

const registerAccount = async (req: Request, res: Response) => {
  const salt_rounds: number = 10;
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          error: "Bad Request",
        });
      }
    
      const hash_password = await bcrypt.hash(password, salt_rounds);
    
      const result = await pool.query(
        "INSERT INTO user_accounts (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username, role, created_at",
        [email, username, hash_password],
      );
    
      return res.status(201).json({ success: true, user: result.rows[0] });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

const userLogin = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {

    if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: "Bad Request",
        });
      }
    
      const result = await pool.query(
        "SELECT id, email, username, role, password_hash FROM user_accounts WHERE username = $1",
        [username],
      );
    
      if (!result.rows[0]) {
        return res.status(401).json({
          success: false,
          error: "User not found",
        });
      }
    
      const user = result.rows[0];
    
      const compare = await bcrypt.compare(password, user.password_hash);
    
      if (!compare) {
        return res.status(401).json({
          success: false,
          error: "Invalid Credentials",
        });
      }
    
      const secret = process.env.JWT_SECRET;
    
      if (!secret) {
        return res
          .status(500)
          .json({ success: false, error: "JWT secret missing" });
      }
    
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        secret,
        { expiresIn: "1h" },
      );
    
      await pool.query(
        "UPDATE user_accounts SET last_login_at = NOW(), is_active = true WHERE id = $1",
        [user.id],
      );
    
      res.cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60, //1h
        path: "/",
      });
    
      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }

  
};

const userLogout = async (req: Request, res: Response) => {
  const user = (req as any).user;
try {
  if (!user) {
    return res.status(404).json({ success: false, error: "Not found" });
  }

  await pool.query("UPDATE user_accounts SET is_active = false WHERE id = $1", [
    user.id,
  ]);

  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return res.status(200).json({ success: true });
} catch (error) {
  console.error(error);
  return res.status(500).json({
    success: false,
    error: "Internal Server Error",
  });
}

};

const userProfile = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({
        success: true,
        user: (req as any).user,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }

};

router.post(`${route}/user/register-account`, registerAccount);
router.post(`${route}/user/login`, userLogin);
router.post(`${route}/user/logout`, auth, userLogout);
router.get(`${route}/user/profile`, auth, userProfile);

export default router;