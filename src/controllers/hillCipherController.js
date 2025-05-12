import { encryptText, decryptText } from "../utils/hillCipher.js";
import { keyStringToMatrix, generateInvertibleMatrix } from "../utils/matrixUtils.js";
import { addUserHistory } from "../utils/createDatabase.js";

export async function encrypt(req, res) {
    try {
        const { text, keyMatrix, userId } = req.body;

        console.log("Received Data encrypt:", { text, keyMatrix, userId });

        if (!text || !keyMatrix || !Array.isArray(keyMatrix)) {
            return res.status(400).json({ error: "Thiếu dữ liệu hoặc keyMatrix không hợp lệ!" });
        }

        const n = keyMatrix.length;
        if (!keyMatrix.every(row => row.length === n)) {
            return res.status(400).json({ error: "Ma trận khóa phải là ma trận vuông." });
        }

        const processedkeyMatrix = keyStringToMatrix(keyMatrix);
        const { encryptedText, steps, originalText } = encryptText(text, processedkeyMatrix);

        // 🧠 Lưu lịch sử nếu có userId
        if (
            userId &&
            typeof text === 'string' && text.trim() !== '' &&
            Array.isArray(keyMatrix) && keyMatrix.length > 0 &&
            encryptedText
        ) {
            await addUserHistory(userId, {
                userId,
                tool: "Hill Cipher",
                action: "encrypt",
                input: text,
                output: encryptedText,
                steps: steps.map(step => JSON.stringify(step)),
                key: keyMatrix.toString(),
            });
        }   

        res.json({ encryptedText, steps, originalText });
    } catch (error) {
        console.error("Lỗi mã hóa:", error);
        res.status(500).json({ error: "Lỗi máy chủ1!" });
    }
}

export async function decrypt(req, res) {
    try {
        const { text, keyMatrix, userId, originalText  } = req.body;
        
        console.log("Received Data decrypt:", { text, keyMatrix, userId, originalText });

        if (!text || !keyMatrix || !Array.isArray(keyMatrix)) {
            return res.status(400).json({ error: "Thiếu dữ liệu hoặc keyMatrix không hợp lệ!" });
        }

        const n = keyMatrix.length;
        if (!keyMatrix.every(row => row.length === n)) {
            return res.status(400).json({ error: "Ma trận khóa phải là ma trận vuông." });
        }

        const processedkeyMatrix = keyStringToMatrix(keyMatrix);
        // trả về các bước và khóa nghịch đảo
        const { decryptedText,inverseMatrix, steps } = decryptText(text, processedkeyMatrix, originalText);
        
        if (error) {
            return res.status(400).json({ error });
        }
        
        if (!decryptedText) {
            return res.status(400).json({error: error.message || "Lỗi giải mã!" });
        }

        // 🧠 Lưu lịch sử nếu có userId
        if (userId && text.trim() && decryptedText.trim()) {
            await addUserHistory(userId, {
                userId,
                tool: "Hill Cipher",
                action: "decrypt",
                input: text,
                output: decryptedText,
                steps: steps.map(step => JSON.stringify(step)),
                key: keyMatrix.toString(),
            });
        }

        res.json({ decryptedText,inverseMatrix, steps });
    } catch (error) {
        console.error("Lỗi giải mã:", error);
        res.status(500).json({ error: error.message || "Lỗi máy chủ!" });
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
        res.status(400).json({ error: error.message });
    }
}

