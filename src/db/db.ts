import dotenv from "dotenv";
import pg from "pg";
import fs from "fs/promises";
import path from "path";

const { Pool, Client } = pg;

dotenv.config();

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

export async function initDb() {
  const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
})

await client.connect()

console.log("Connected to database")

const sql = await fs.readFile(
  path.join(__dirname, "init.sql"), "utf8"
)

await client.query(sql)
console.log("Schema initialized")

} 
