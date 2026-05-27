import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB2BE81M86TC4Kgpy9wweapbrw5CMSYb7c",
  authDomain: "greenreport-d8583.firebaseapp.com",
  projectId: "greenreport-d8583",
  storageBucket: "greenreport-d8583.firebasestorage.app",
  messagingSenderId: "459455344334",
  appId: "1:459455344334:web:17ed4d264a0bd960dcaa9f",
  measurementId: "G-LH6RZDXPR3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);