import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import store from "../../redux/store";
import {setHighlight} from "../../features/home_slices/highlightSlice"; // Your redux action

export const fetchHighlights = async (uid) => {
    const ref = doc(db, `homepage/${uid}/highlights/highlight`);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : { title: "", description: "", image: null };
};

export const add_Or_Update_Highlight = async (uid, updatedHighlights) => {
    const docRef = doc(db, `homepage/${uid}/highlights/highlight`);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
        await updateDoc(docRef, { highlight: updatedHighlights });
    } else {
        await setDoc(docRef, { highlight: updatedHighlights });
    }

    store.dispatch(setHighlight(updatedHighlights));
};

export const deleteHighlightFromFirestore = async (uid, index) => {
    const highlightsRef = doc(db, `homepage/${uid}/highlights/highlight`);
    const snapshot = await getDoc(highlightsRef);

    if (snapshot.exists()) {
        const updatedHighlights = [...(snapshot.data().highlight || [])];
        updatedHighlights.splice(index, 1);

        // Update in Firestore
        await setDoc(highlightsRef, { highlight: updatedHighlights });

        // Update Redux state
        store.dispatch(setHighlight(updatedHighlights));
    }
};
