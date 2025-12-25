import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  initializeAuth,
  getReactNativePersistence,
  signInAnonymously,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ---- COPY from Firebase Console → Project settings → Your apps (Web) ----
const firebaseConfig = {
  apiKey: "AIzaSyCzbAOoUufzB_jXvnWYl2lwu78c3B5p79E",
  authDomain: "chat-app-exercise-5-3.firebaseapp.com",
  projectId: "chat-app-exercise-5-3",
  storageBucket: "chat-app-exercise-5-3.firebasestorage.app",
  messagingSenderId: "154585459528",
  appId: "1:154585459528:web:0d74507c4568e3a34e217d",
  measurementId: "G-KLW6N43H2P",
};
// ------------------------------------------------------------------------

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Use the bucket defined in firebaseConfig; don't hard-code gs://
export const storage = getStorage(app);

// React Native auth (required for RN)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Helper so existing code like getAuthInstance() keeps working
export const getAuthInstance = () => auth;

// Optional helper to ensure anonymous sign-in is available
export const ensureAnonSignIn = async () => {
  try {
    await signInAnonymously(auth);
  } catch (e) {
    // ignore if already signed in
  }
};
