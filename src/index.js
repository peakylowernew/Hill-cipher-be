import express from "express";
import cors from "cors";
import hillCipherRoutes from "./routes/hillCipherRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

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
// Lấy __dirname trong ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files từ build của React
app.use(express.static(path.join(__dirname, "client", "build")));

// Bắt mọi route không phải API và trả về index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
