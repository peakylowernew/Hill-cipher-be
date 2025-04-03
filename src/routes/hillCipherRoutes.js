import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { encrypt, decrypt } from "../controllers/hillCipherController.js"; // Đảm bảo đường dẫn đúng

const router = express.Router();

router.post("/encrypt", encrypt);
router.post("/decrypt", decrypt);

export default router;
