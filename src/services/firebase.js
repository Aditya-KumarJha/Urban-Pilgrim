import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAf1hl2QhUpcBGExjXv0S_5ban58kmcBKo",
    authDomain: "urban-pilgrim.firebaseapp.com",
    projectId: "urban-pilgrim",
    storageBucket: "urban-pilgrim.firebasestorage.app",
    messagingSenderId: "747989822476",
    appId: "1:747989822476:web:876d9c56022bad0c761229",
    measurementId: "G-2LVM11WFZ3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Connect to emulator in development
if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
    try {
        connectFunctionsEmulator(functions, "127.0.0.1", 5002);
        console.log("🔧 Connected to Functions Emulator");
    } catch (error) {
        console.log("Functions emulator already connected or not available");
    }
}

export const storage = getStorage(app);
