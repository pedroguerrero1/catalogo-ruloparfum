import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDBxkSDdPDlE_7mekIvl_GKzgC_GXzCcuw",
  authDomain: "ruloparfum.firebaseapp.com",
  projectId: "ruloparfum",
  storageBucket: "ruloparfum.firebasestorage.app",
  messagingSenderId: "167849199505",
  appId: "1:167849199505:web:d5822af67e5f2024aa3c30"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);