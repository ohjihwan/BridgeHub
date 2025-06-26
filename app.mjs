import express from "express";
import cors from "cors";
import authRouter from "./router/auth.mjs";
import profileRouter from "./router/profile.mjs";
import { verifyToken } from "./middleware/auth.mjs";
import { config } from "./config.mjs";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/profile", verifyToken,profileRouter);

app.listen(config.server.port, () => {
  console.log(`서버 실행중: http://localhost:${config.server.port}`);
});