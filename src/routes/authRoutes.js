import express from "express";
import { login, signup, getUserById, googleLogin } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/user/:uid", getUserById); //đẻ tạm
router.post("/google", googleLogin);

export default router;