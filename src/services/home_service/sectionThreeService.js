// src/services/sectionOneService.js
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export const fetchSectionThree = async (uid) => {
    const ref = doc(db, `homepage/${uid}/title_description/sectionThree`);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : { title: "", description: "", image: null };
};

export const saveSectionThree = async (uid, data) => {
    const docRef = doc(db, `homepage/${uid}/title_description/sectionThree`);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
        await updateDoc(docRef, { sectionThree: data });
    } else {
        await setDoc(docRef, { sectionThree: data });
    }
};
