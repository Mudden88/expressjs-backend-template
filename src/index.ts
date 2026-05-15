import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import cors from "cors";
import path from "node:path";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

import { pool, initDb } from "./db/db";
import { auth } from "./middleware/auth/auth";

dotenv.config();

const app = express();
const frontendPath = path.resolve(
  __dirname,
  "../../Frontend/dist/frontend/browser",
);

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(frontendPath));

const PORT = Number(process.env.PORT ?? 3000);

const route = "/api/v1";

bootstrap();

app.get("/", (_req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.post(`${route}/register_account`, async (req, res) => {
  try {
    const salt_rounds = 10;
    const { username, email, password } = req.body;

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
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: error.message,
      detail: error.message.detail,
    });
  }
});

app.post(`${route}/login`, async (req, res) => {
  try {
    const { username, password } = req.body;
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
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
      detail: error.message.detail,
    });
  }
});

app.get(`${route}/logout`, auth, async (req, res) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(404).json({ success: false, error: "Not found" });
    }

    await pool.query(
      "UPDATE user_accounts SET is_active = false WHERE id = $1",
      [user.id],
    );

    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.get(`${route}/profile`, auth, async (req, res) => {
  return res.status(200).json({
    success: true,
    user: (req as any).user,
  });
});

async function bootstrap() {
  console.log("------------------");
  await initDb();

  app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
    console.log("------------------");
  });
}
