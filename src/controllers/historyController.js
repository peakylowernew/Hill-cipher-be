import { db } from "../config/firebase.js";

export const getHistoryByUser = async (req, res) => {
  const { uid } = req.params;

  try {
    if (!uid) {
      return res.status(400).json({ error: "Thiếu userId" });
    }

    // Đọc từ collection con: users/{uid}/history
    const snapshot = await db
      .collection("users")
      .doc(uid)
      .collection("history")
      .orderBy("timestamp", "desc")
      .get();

    const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // console.log("📜 History fetched:", history);
    res.status(200).json({ history });
  } catch (error) {
    console.error("❌ Lỗi khi lấy lịch sử:", error);
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu lịch sử" });
  }
};
