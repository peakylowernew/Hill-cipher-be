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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
