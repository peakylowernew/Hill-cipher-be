import { auth, db } from "../config/firebase.js";  // Firebase Admin SDK
import { createUser, addUserHistory } from "../utils/createDatabase.js";
import bcrypt from 'bcryptjs';
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken"; //Tạo token bằng jsonwebtoken để tự encode thông tin (ví dụ: uid, email, name…).

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  const { idToken } = req.body;  // idToken gửi từ frontend qua POST request

  if (!idToken) {
    return res.status(400).json({ message: "Token không hợp lệ" });
  }

  try {
    // Xác thực token với Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,  // Sử dụng Client ID của bạn từ Google Cloud Console
    });

    const payload = ticket.getPayload();  // Lấy thông tin người dùng từ payload của token
    const { sub, email, name, picture } = payload;  // sub là ID người dùng Google (uid)

    // Kiểm tra xem người dùng đã tồn tại trong cơ sở dữ liệu hay chưa
    let userDoc = await db.collection("users").doc(sub).get();

    if (!userDoc.exists) {
      // Nếu chưa có người dùng, tạo mới người dùng trong cơ sở dữ liệu
      const newUser = {
        id: sub,
        email,
        name,
        avatar: picture || "",  // Nếu có ảnh đại diện, sử dụng ảnh của Google
        password: null,  // Google login không sử dụng mật khẩu
      };

      await createUser(newUser); // Lưu thông tin người dùng vào Firebase Firestore
      userDoc = { data: () => newUser };  // Tạo đối tượng giả để mô phỏng kết quả từ Firestore
    }

    // Tạo JWT cho người dùng đã đăng nhập
    const token = jwt.sign({
      uid: sub,
      email,
      name,
    }, process.env.JWT_SECRET, { expiresIn: "2h" });

    res.status(200).json({ message: "Đăng nhập Google thành công", token, uid: sub });
  } catch (err) {
    console.error("Lỗi khi đăng nhập Google:", err);
    res.status(500).json({ message: "Lỗi khi xác thực Google", error: err.message });
  }
};

// lấy uid từ firestore
export const getUserById = async (req, res) => {
  const { uid } = req.params;
  try {
    const doc = await db.collection("users").doc(uid).get();
    if (!doc.exists) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Đăng ký người dùng
export const signup = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email và mật khẩu là bắt buộc" });
  }

  try {
    const existingUser = await auth.getUserByEmail(email).catch(() => null);

    if (existingUser) {
      return res.status(400).json({ message: "Người dùng đã tồn tại với email này" });
    }

    // Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
    const hashedPassword = await bcrypt.hash(password, 10);

    const userRecord = await auth.createUser({
      email,
      password: hashedPassword, // Lưu mật khẩu đã mã hóa
    });

    const userData = {
      id: userRecord.uid,
      email,
      avatar: "", // Mặc định avatar là rỗng
      password: hashedPassword, // Lưu mật khẩu mã hóa
    };

    await createUser(userData);
    await addUserHistory(userRecord.uid, "User Registered");

    res.status(201).json({ message: "Đăng ký thành công", uid: userRecord.uid });
  } catch (error) {
    console.error("Lỗi khi tạo người dùng:", error);
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
    // Kiểm tra thông tin người dùng qua Firebase Auth
    const user = await auth.getUserByEmail(email);

    // Kiểm tra mật khẩu người dùng
    const userDoc = await db.collection("users").doc(user.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const storedPassword = userDoc.data().password;
    const isPasswordValid = await bcrypt.compare(password, storedPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Mật khẩu không chính xác" });
    }
    // uid	ID người dùng duy nhất (Firebase cấp)	Từ auth.getUserByEmail()
    // token	Chuỗi JWT chứa uid và email, xác thực người dùng trên client	Sinh từ jwt.sign()
    const payload = {
      uid: user.uid,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });

    res.status(200).json({ message: "Đăng nhập thành công", token });
  } catch (error) {
    res.status(401).json({ message: "Đăng nhập thất bại", error: error.message });
  }
};
