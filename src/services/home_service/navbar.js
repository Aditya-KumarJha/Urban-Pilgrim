import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export const navbarService = async (uid) => {
    const ref = doc(db, `homepage/${uid}/navbar/links`);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : { title: "", linkUrl: "" };
};

export const saveNavbarLinks = async (uid, data) => {
    const docRef = doc(db, `homepage/${uid}/navbar/links`);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
        await updateDoc(docRef, { links: data });
    } else {
        await setDoc(docRef, { links: data });
    }
};

export const deleteNavbarLink = async (uid, index) => {
    const docRef = doc(db, `homepage/${uid}/navbar/links`);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
        const updatedLinks = snap.data().links.filter((_, i) => i !== index);
        await updateDoc(docRef, { links: updatedLinks });
    }
};
