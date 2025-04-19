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
    ignoreUndefinedProperties: true
  });
} else {
  console.log("Firebase đã được khởi tạo.");
}

// Khởi tạo Firestore
const db = admin.firestore();
const auth = admin.auth();

export { admin, db, auth };
