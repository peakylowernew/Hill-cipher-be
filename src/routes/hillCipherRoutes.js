import express from "express";
import { encrypt, decrypt } from "../controllers/hillCipherController.js"; // Đảm bảo đường dẫn đúng

const router = express.Router();

router.post("/encrypt", encrypt);
router.post("/decrypt", decrypt);

export default router;
// import { authenticateUser } from "../middleware/authMiddleware.js";


// router.post("/encrypt", authenticateUser, encryptText);
// router.post("/decrypt", authenticateUser, decryptText);
