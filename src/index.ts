import { initDb } from "./db/db";
import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT ?? 3000);

const initServer = async () => {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
  });
};
initServer();