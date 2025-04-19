import express from "express";
import { getHistoryByUser } from "../controllers/historyController.js";

const router = express.Router();
router.get("/:uid", getHistoryByUser);
export default router;
