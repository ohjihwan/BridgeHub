import express from "express";
import { verifyToken } from "../middleware/auth.mjs";
import { updateProfile } from "../controller/profile.mjs";

const router = express.Router();

router.post("/update", verifyToken, updateProfile);

export default router;
