import express from "express";
import cors from "cors";
import hillCipherRoutes from "./routes/hillCipherRoutes.js"; // Đảm bảo import đúng

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/hill", hillCipherRoutes); // Đảm bảo route đúng

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
