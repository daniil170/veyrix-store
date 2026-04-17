import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB6lB-dn3IOue73wRH1mWWSVBkyigwoVCE",
  authDomain: "veyrix-store-809c1.firebaseapp.com",
  projectId: "veyrix-store-809c1",
  storageBucket: "veyrix-store-809c1.firebasestorage.app",
  messagingSenderId: "119267150265",
  appId: "1:119267150265:web:618039121054919d5ece68"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app); 
export const auth = getAuth(app);