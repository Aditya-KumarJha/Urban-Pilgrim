// src/services/sectionOneService.js
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export const fetchSectionSix = async (uid) => {
    const ref = doc(db, `homepage/${uid}/title_description/sectionSix`);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : { title: "", description: "", image: null };
};

export const saveSectionSix = async (uid, data) => {
    const docRef = doc(db, `homepage/${uid}/title_description/sectionSix`);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
        await updateDoc(docRef, { sectionSix: data });
    } else {
        await setDoc(docRef, { sectionSix: data });
    }
};
