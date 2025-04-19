import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { encrypt, decrypt, generateMatrix } from "../controllers/hillCipherController.js"; // Đảm bảo đường dẫn đúng
const router = express.Router();

router.post("/encrypt",encrypt);
router.post("/decrypt", decrypt);
router.get('/generate-matrix/:size', generateMatrix);

export default router;
