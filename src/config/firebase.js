// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAWkLjJXUjRRvMY6Kt4UpUpP1BKL50U8Qc",
  authDomain: "bookflix-85667.firebaseapp.com",
  projectId: "bookflix-85667",
  storageBucket: "bookflix-85667.firebasestorage.app",
  messagingSenderId: "234313445391",
  appId: "1:234313445391:web:4ffe1098972bfa64b5f37a",
  measurementId: "G-15765ZFDDH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;