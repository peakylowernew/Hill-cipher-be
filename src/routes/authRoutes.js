import express from "express";
import { login, signup, getUserById, googleLogin, updateUserById } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/user/:uid", getUserById);
router.put("/user/:uid", updateUserById);
router.post("/google", googleLogin);

export default router;