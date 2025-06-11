import express from "express";
import * as authController from "../controller/auth.mjs";

const router = express.Router();


router.post("/regist", authController.register);
router.post("/login", authController.login);

export default router;