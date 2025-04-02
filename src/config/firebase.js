import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

// Kiểm tra nếu chưa khởi tạo Firebase, thì khởi tạo
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  console.log("Firebase đã được khởi tạo.");
}

// Kiểm tra kết nối Firebase
export async function checkFirebaseConnection() {
    try {
      const appInfo = await admin.app().name;
      console.log(`Firebase đã kết nối: ${appInfo}`);
    } catch (error) {
      console.error("Không thể kết nối đến Firebase:", error);
      throw new Error("Kết nối Firebase không thành công.");
    }
}  

checkFirebaseConnection();

export default admin;
