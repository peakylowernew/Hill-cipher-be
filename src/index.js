import express from "express";
import cors from "cors";
import hillCipherRoutes from "./routes/hillCipherRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";

const app = express();
const corsOptions = {
    origin: "*",  // Cho phép tất cả các domain (có thể thay bằng domain cụ thể của frontend)
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
app.use(cors(corsOptions));
app.use(express.json());
// Thêm Cross-Origin-Opener-Policy (COOP) và Cross-Origin-Embedder-Policy (COEP) header
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');  // Thêm để hỗ trợ COEP
    next();
  });
  
app.use("/api/hill", hillCipherRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/history", historyRoutes);
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


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
