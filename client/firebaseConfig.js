// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// ⚠️ Replace these with your Firebase project settings:
const firebaseConfig = {
    apiKey: "AIzaSyCPMXP-d-hMPd5DdVIKR286QoLSvAInr5M",
    authDomain: "studio-6095485354-41c30.firebaseapp.com",
    projectId: "studio-6095485354-41c30",
    storageBucket: "studio-6095485354-41c30.firebasestorage.app",
    messagingSenderId: "982736092858",
    appId: "1:982736092858:web:0fd406b974b486ff90cc83"
  };
  

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
