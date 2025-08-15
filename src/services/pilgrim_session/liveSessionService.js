import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export const saveOrUpdateLiveSessionData = async (uid, arrayName, newArray) => {
    if (!uid) throw new Error("User ID is required");
    console.log("Saving live session array:", JSON.stringify(newArray, null, 2));

    // Correct Firestore path
    const docRef = doc(db, "pilgrim_sessions", uid, "sessions", "liveSession");

    try {
        await updateDoc(docRef, { [arrayName]: newArray });
        return "updated";
    } catch (error) {
        if (error.code === "not-found" || error.message.includes("No document to update")) {
            await setDoc(docRef, { [arrayName]: newArray });
            return "created";
        } else {
            console.error("Error saving/updating live sessions data:", error);
            throw error;
        }
    }
};

export const fetchLiveSessionData = async (uid) => {
    if (!uid) throw new Error("User ID is required");

    const liveSessionRef = doc(db, `pilgrim_sessions/${uid}/sessions/liveSession`);
    const docSnap = await getDoc(liveSessionRef);

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        return null; // no data yet
    }
};

export const deleteLiveSessionByIndex = async (uid, index) => {
    try {
        const guideRef = doc(db, `pilgrim_sessions/${uid}/sessions/liveSession`);
        const docSnap = await getDoc(guideRef);

        if (!docSnap.exists()) {
            throw new Error("Live session document not found");
        }

        const data = docSnap.data();
        if (!data.slides || !Array.isArray(data.slides)) {
            throw new Error("live session slides array not found in document");
        }

        // Filter out the slide at the given index
        const updatedSession = data.slides.filter((_, i) => i !== index);

        // Update Firestore
        await updateDoc(guideRef, { LiveSession: updatedSession });

        console.log(`live session at index ${index} deleted successfully`);
        return "deleted";
    } catch (error) {
        console.error("Error deleting live session by index:", error);
        throw error;
    }
};

