import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export const add_Or_Update_Slide = async (uid, updatedSlides) => {
    const slidesRef = doc(db, `homepage/${uid}/image_slider/slides`);
    await setDoc(slidesRef, { slides: updatedSlides }, { merge: true }); 
};

export const deleteSlideFromFirestore = async (uid, index) => {
    const slidesRef = doc(db, `homepage/${uid}/image_slider/slides`);
    const snapshot = await getDoc(slidesRef);

    if (snapshot.exists()) {
        const updatedSlides = [...(snapshot.data().slides || [])];
        updatedSlides.splice(index, 1);

        await setDoc(slidesRef, { slides: updatedSlides }, { merge: true });
        return updatedSlides; // return for dispatching in component
    }
};
