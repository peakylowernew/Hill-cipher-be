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

        // Gọi hàm mã hóa và lấy các bước
        const { encryptedText, steps } = encryptText(text, keyMatrix);

        // Trả về cả kết quả mã hóa và các bước mã hóa
        res.json({ encryptedText, steps });
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

        // Gọi hàm giải mã
        const result = decryptText(text, keyMatrix);

        // Nếu trả về lỗi từ utils/hillcipher.js
        if (result.error) {
            return res.status(400).json({ error: result.error });
        }

        const { decryptedText, steps } = result;

        res.json({
            decryptedText,
            steps
        });
    } catch (error) {
        console.error("Lỗi giải mã:", error);
        res.status(500).json({ error: error.message || "Lỗi máy chủ!" });
    }
}

