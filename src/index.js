import express from "express";
import cors from "cors";
import hillCipherRoutes from "./routes/hillCipherRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/hill", hillCipherRoutes);
app.use("/api/auth", authRoutes);
app.post("/api/hill/decrypt", (req, res) => {
    console.log("Nhận request từ frontend:", req.body);

    const { text, keyMatrix } = req.body;
    if (!text || !keyMatrix) {
        console.error("LỖI: Thiếu dữ liệu đầu vào!");
        return res.status(400).json({ error: "Thiếu dữ liệu!" });
    }

    try {
        const decryptedText = hillCipherDecrypt(text, keyMatrix);
        console.log("Giải mã thành công:", decryptedText);

        res.json({ decryptedText, steps: ["Bước 1", "Bước 2"] });
    } catch (error) {
        console.error("LỖI GIẢI MÃ:", error);
        res.status(500).json({ error: "Lỗi server" });
    }
});


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
