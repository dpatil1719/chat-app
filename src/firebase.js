import { getApps, getApp, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔐 Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCzbAOoUufzB_jXvnWYl2lwu78c3B5p79E",
  authDomain: "chat-app-exercise-5-3.firebaseapp.com",
  projectId: "chat-app-exercise-5-3",
  storageBucket: "chat-app-exercise-5-3.appspot.com", // <-- appspot.com
  messagingSenderId: "154585459528",
  appId: "1:154585459528:web:0d74507c4568e3a34e217d",
};

// Singleton app (survives Fast Refresh)
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Lazy Auth initializer to avoid “Component auth has not been registered yet”
let _auth = null;
export function getAuthInstance() {
  if (_auth) return _auth;
  try {
    _auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // If HMR already created it, just fetch it
    _auth = getAuth(app);
  }
  return _auth;
}

// Firestore
export const db = getFirestore(app);
