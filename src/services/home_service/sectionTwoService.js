// src/services/sectionOneService.js
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export const fetchSectionTwo = async (uid) => {
    const ref = doc(db, `homepage/${uid}/title_description/sectionTwo`);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : { title: "", description: "", image: null };
};

export const saveSectionTwo = async (uid, data) => {
    const docRef = doc(db, `homepage/${uid}/title_description/sectionTwo`);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
        await updateDoc(docRef, { sectionTwo: data });
    } else {
        await setDoc(docRef, { sectionTwo: data });
    }
};
