import admin from "../config/firebase.js"; // Firebase Admin SDK

// Kiểm tra kết nối Firebase
import { checkFirebaseConnection } from "../config/firebase.js";

// Đăng ký người dùng
export const signup = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email và mật khẩu là bắt buộc" });
  }

  try {
    // Kiểm tra kết nối Firebase
    await checkFirebaseConnection();

    // Tạo người dùng mới
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });
    res.status(201).json({ message: "Đăng ký thành công", uid: userRecord.uid });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi đăng ký người dùng", error: error.message });
  }
};

// Đăng nhập người dùng
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email và mật khẩu là bắt buộc" });
  }

  try {
    // Kiểm tra kết nối Firebase
    await checkFirebaseConnection();

    // Xác thực người dùng
    const user = await admin.auth().getUserByEmail(email);
    const token = await admin.auth().createCustomToken(user.uid); // Tạo token tùy chỉnh

    res.status(200).json({ message: "Đăng nhập thành công", token });
  } catch (error) {
    res.status(401).json({ message: "Đăng nhập thất bại", error: error.message });
  }
};
