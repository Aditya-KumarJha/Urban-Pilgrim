// src/services/sectionOneService.js
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export const fetchSectionFive = async (uid) => {
    const ref = doc(db, `homepage/${uid}/title_description/sectionFive`);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : { title: "", description: "", image: null };
};

export const saveSectionFive = async (uid, data) => {
    const docRef = doc(db, `homepage/${uid}/title_description/sectionFive`);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
        await updateDoc(docRef, { sectionFive: data });
    } else {
        await setDoc(docRef, { sectionFive: data });
    }
};
