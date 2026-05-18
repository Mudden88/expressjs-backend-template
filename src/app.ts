import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRouter from "./routes/user/user";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(userRouter);

export default app;