import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export const fetchSectionOne = async (uid) => {
    const ref = doc(db, `homepage/${uid}/title_description/sectionOne`);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : { title: "", description: "", image: null };
};

export const saveSectionOne = async (uid, data) => {
    const docRef = doc(db, `homepage/${uid}/title_description/sectionOne`);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
        await updateDoc(docRef, { sectionOne: data });
    } else {
        await setDoc(docRef, { sectionOne: data });
    }
};
