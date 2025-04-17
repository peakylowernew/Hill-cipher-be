import { encryptText, decryptText } from "../utils/hillCipher.js";
import { keyStringToMatrix, generateInvertibleMatrix } from "../utils/matrixUtils.js";

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


        const processedkeyMatrix = keyStringToMatrix(keyMatrix); // Convert chuỗi key thành ma trận

        const { encryptedText, steps } = encryptText(text, processedkeyMatrix);

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

        const processedkeyMatrix = keyStringToMatrix(keyMatrix);
        // Bắt đầu giải mã và lưu lại các bước
        const { decryptedText, steps } = decryptText(text, processedkeyMatrix);
        
        // Nếu có lỗi trong quá trình giải mã
        if (!decryptedText) {
            return res.status(500).json({ error: "Lỗi giải mã!" });
        }

        res.json({ 
            decryptedText,
            steps // Trả về các bước tính toán chi tiết
        });
    } catch (error) {
        console.error("Lỗi giải mã:", error);
        res.status(500).json({ error: "Lỗi máy chủ!" });
    }
}

export function generateMatrix(req, res) {
    const n = parseInt(req.params.size);
    if (isNaN(n) || n <= 0) {
        return res.status(400).json({ error: "Kích thước ma trận phải là số nguyên dương!" });
    }

    try {
        const result = generateInvertibleMatrix(n);
        res.json(result);
    } catch (error) {
        console.error("Lỗi tạo ma trận:", error);
        res.status(500).json({ error: error.message });
    }
}