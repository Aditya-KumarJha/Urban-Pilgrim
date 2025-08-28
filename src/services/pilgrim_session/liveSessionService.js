import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export const saveOrUpdateLiveSessionData = async (uid, arrayName, newArray) => {
    if (!uid) throw new Error("User ID is required");
    console.log("Saving live session array:", JSON.stringify(newArray, null, 2));

    // Add createdAt timestamp to each item in the array if not present
    const dataWithTimestamp = newArray.map(item => ({
        ...item,
        createdAt: item.createdAt || new Date().toISOString()
    }));

    // Correct Firestore path
    const docRef = doc(db, "pilgrim_sessions", uid, "sessions", "liveSession");

    try {
        await updateDoc(docRef, { [arrayName]: dataWithTimestamp });
        return "updated";
    } catch (error) {
        if (error.code === "not-found" || error.message.includes("No document to update")) {
            await setDoc(docRef, { [arrayName]: dataWithTimestamp });
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
    
        // 🔹 Convert slides into an array, regardless of whether it's stored as object or array
        const slidesArray = Array.isArray(data.slides)
            ? data.slides
            : Object.values(data.slides || {});
    
        if (!slidesArray.length) {
            throw new Error("No slides found in live session document");
        }
    
        // 🔹 Remove the slide at given index
        const updatedSession = slidesArray.filter((_, i) => i !== index);
    
        // 🔹 Update Firestore as an array (cleaner going forward)
        await updateDoc(guideRef, { slides: updatedSession });
    
        console.log(`live session at index ${index} deleted successfully`);
        return "deleted";
    } catch (error) {
        console.error("Error deleting live session by index:", error);
        throw error;
    }
};
    

