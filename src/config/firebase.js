import admin from "firebase-admin";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

// Hàm kiểm tra mạng internet
function checkInternet(cb) {
  dns.lookup('google.com', (err) => {
    cb(!err);
  });
}

// Khởi tạo Firebase theo trạng thái mạng
async function initializeFirebase() {
  return new Promise((resolve) => {
    checkInternet((isConnected) => {
      if (admin.apps.length) {
        console.log("Firebase đã được khởi tạo.");
        return resolve(admin);
      }

      if (isConnected) {
        console.log("Có internet, khởi tạo Firebase Cloud");
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          ignoreUndefinedProperties: true,
        });
      } else {
        console.log("Không có internet, kết nối Firebase Emulator");
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: `http://localhost:9000?ns=${process.env.FIREBASE_PROJECT_ID}`,
          ignoreUndefinedProperties: true,
        });

        // Kết nối Firestore emulator
        const firestore = admin.firestore();
        firestore.settings({
          host: "localhost:7078",
          ssl: false,
        });

        // Kết nối Auth emulator
        process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
      }

      resolve(admin);
    });
  });
}

let db, auth;

const firebaseAppPromise = initializeFirebase().then(() => {
  db = admin.firestore();
  auth = admin.auth();
});

export { admin, db, auth, firebaseAppPromise };
