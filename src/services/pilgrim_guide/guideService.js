import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Save or update guide data for a specific user
 * @param {string} uid - User ID
 * @param {string|number} arrayName - Field/array name in Firestore
 * @param {any} newArray - Data to save/update
 */
export const saveOrUpdateGuideData = async (uid, arrayName, newArray) => {
    if (!uid) throw new Error("User ID is required");
    console.log("Saving guide array:", JSON.stringify(newArray, null, 2));

    // Correct Firestore path
    const docRef = doc(db, "pilgrim_guides", uid, "guides", "data");

    try {
        await updateDoc(docRef, { [arrayName]: newArray });
        return "updated";
    } catch (error) {
        if (error.code === "not-found" || error.message.includes("No document to update")) {
            await setDoc(docRef, { [arrayName]: newArray });
            return "created";
        } else {
            console.error("Error saving/updating guide data:", error);
            throw error;
        }
    }
};

/**
 * Fetch guide data for a specific user
 * @param {string} uid - User ID
 */
export const fetchGuideData = async (uid) => {
    if (!uid) throw new Error("User ID is required");

    const guideRef = doc(db, `pilgrim_guides/${uid}/guides/data`);
    const docSnap = await getDoc(guideRef);

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        return null; // no data yet
    }
};

/**
 * Delete a guide item and reindex
 * @param {string} uid - User ID
 * @param {string|number} arrayName - Field key to delete
 */
// export const deleteGuideItem = async (uid, arrayName) => {
//     if (!uid) throw new Error("User ID is required");
//     if (arrayName === undefined || arrayName === null) throw new Error("Array name is required");

//     try {
//         const guideRef = doc(db, `pilgrim_guides/${uid}/guides/data`);
//         const docSnap = await getDoc(guideRef);

//         if (!docSnap.exists()) {
//             throw new Error("No guide data found for this user.");
//         }

//         const data = docSnap.data();

//         // Get numeric keys
//         const keys = Object.keys(data)
//             .filter(k => !isNaN(Number(k)))
//             .map(Number)
//             .sort((a, b) => a - b);

//         // Remove the target key
//         delete data[arrayName];

//         // Reindex remaining keys
//         const updatedData = {};
//         let newIndex = 1;
//         keys.forEach(k => {
//             if (k !== Number(arrayName)) {
//                 updatedData[newIndex] = data[k];
//                 newIndex++;
//             }
//         });

//         // Save updated object
//         await setDoc(guideRef, updatedData);

//         console.log(`Deleted guide ${arrayName} and reindexed successfully.`);
//         return "deleted and reindexed";
//     } catch (error) {
//         console.error("Error deleting guide array:", error);
//         throw error;
//     }
// };

export const deleteSlideByIndex = async (uid, index) => {
    try {
        const guideRef = doc(db, `pilgrim_guides/${uid}/guides/data`);
        const docSnap = await getDoc(guideRef);

        if (!docSnap.exists()) {
            throw new Error("Guide document not found");
        }

        const data = docSnap.data();
        if (!data.slides || !Array.isArray(data.slides)) {
            throw new Error("Slides array not found in document");
        }

        // Filter out the slide at the given index
        const updatedSlides = data.slides.filter((_, i) => i !== index);

        // Update Firestore
        await updateDoc(guideRef, { slides: updatedSlides });

        console.log(`Slide at index ${index} deleted successfully`);
        return "deleted";
    } catch (error) {
        console.error("Error deleting slide by index:", error);
        throw error;
    }
};

