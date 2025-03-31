import { encryptText, decryptText } from "../utils/hillCipher.js";

export function encrypt(req, res) {
    try {
        const { text, keyMatrix } = req.body;

        if (!text || !keyMatrix || !Array.isArray(keyMatrix)) {
            return res.status(400).json({ error: "Thiếu dữ liệu hoặc keyMatrix không hợp lệ!" });
        }

        const n = keyMatrix.length;
        if (!keyMatrix.every(row => row.length === n)) {
            return res.status(400).json({ error: "Ma trận khóa phải là ma trận vuông." });
        }

        const encryptedText = encryptText(text, keyMatrix);
        res.json({ encryptedText });
    } catch (error) {
        console.error("Lỗi mã hóa:", error);
        res.status(500).json({ error: "Lỗi máy chủ!" });
    }
}

export function decrypt(req, res) {
    try {
        const { text, keyMatrix } = req.body;

        if (!text || !keyMatrix || !Array.isArray(keyMatrix)) {
            return res.status(400).json({ error: "Thiếu dữ liệu hoặc keyMatrix không hợp lệ!" });
        }

        const n = keyMatrix.length;
        if (!keyMatrix.every(row => row.length === n)) {
            return res.status(400).json({ error: "Ma trận khóa phải là ma trận vuông." });
        }

        const decryptedText = decryptText(text, keyMatrix);
        res.json({ decryptedText });
    } catch (error) {
        console.error("Lỗi giải mã:", error);
        res.status(500).json({ error: "Lỗi máy chủ!" });
    }
}
