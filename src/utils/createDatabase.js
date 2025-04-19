import { db } from "../config/firebase.js";
import { Timestamp } from "firebase-admin/firestore";

// Tạo người dùng vào Firestore
export const createUser = async (user) => {
  try {
    const userRef = db.collection("users").doc(user.id);
    await userRef.set({
      email: user.email,
      avatar: user.avatar || "", // Nếu không có avatar, mặc định là chuỗi rỗng
      password: user.password, // Lưu mật khẩu, hãy mã hóa mật khẩu trước khi lưu vào DB nếu có thể
    });
    console.log("✅ User created in Firestore.");
  } catch (err) {
    console.error("❌ Error creating user:", err);
    throw err; // Ném lại lỗi để có thể xử lý ở controller nếu cần
  }
};

// Thêm lịch sử người dùng vào Firestore
export const addUserHistory = async (userId, data) => {
  try {
    console.log("Adding history for user:", userId); // Kiểm tra userId
    const historyRef = db.collection("users").doc(userId).collection("history");
    await historyRef.add({
      userId: data.userId,
      tool: data.tool,          // VD: Hill Cipher
      action: data.action,           // encrypt hoặc decrypt
      input: data.input,                    // văn bản gốc
      output: data.output,                  // kết quả sau mã hóa/giải mã
      key: data.key,                        // key được dùng
      steps: data.steps,                    // các bước thực hiện
      timestamp: Timestamp.now(),                 // thời gian sử dụng
    });
    console.log("✅ Detailed history entry added.");
  } catch (err) {
    console.error("❌ Error adding history:", err);
  }
};

