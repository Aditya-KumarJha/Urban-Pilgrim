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

    // Handle arrays vs objects differently
    let dataToSave;
    if (Array.isArray(newArray)) {
        // For arrays, save as-is without adding createdAt to the array itself
        dataToSave = newArray;
    } else {
        // For objects, add createdAt timestamp if not present
        dataToSave = {
            ...newArray,
            createdAt: newArray.createdAt || new Date().toISOString()
        };
    }

    // Correct Firestore path
    const docRef = doc(db, "pilgrim_guides", uid, "guides", "data");

    try {
        await updateDoc(docRef, { [arrayName]: dataToSave });
        return "updated";
    } catch (error) {
        if (error.code === "not-found" || error.message.includes("No document to update")) {
            await setDoc(docRef, { [arrayName]: dataToSave });
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
    console.log("Deleting slide at index:", index, uid);
    try {
        const guideRef = doc(db, `pilgrim_guides/${uid}/guides/data`);
        const docSnap = await getDoc(guideRef);

        if (!docSnap.exists()) {
            throw new Error("Guide document not found");
        }

        const data = docSnap.data();

        // Ensure slides exist
        const slides = data?.slides;
        if (!slides || (Array.isArray(slides) && slides.length === 0) || (!Array.isArray(slides) && Object.keys(slides).length === 0)) {
            throw new Error("No slides found to delete");
        }

        // Normalize deletion by handling both array and object structures
        let newSlides;

        if (Array.isArray(slides)) {
            // Filter out the index, ensuring a dense array with no undefined holes
            if (index < 0 || index >= slides.length) {
                throw new Error(`Index out of bounds: ${index}`);
            }
            newSlides = slides.filter((_, i) => i !== index);
        } else if (typeof slides === 'object') {
            // Convert to ordered array, delete by index, then reindex into an object with 1-based keys
            const orderedKeys = Object.keys(slides).sort((a, b) => Number(a) - Number(b));
            if (index < 0 || index >= orderedKeys.length) {
                throw new Error(`Index out of bounds: ${index}`);
            }
            const remaining = orderedKeys
                .filter((_, i) => i !== index)
                .map(key => slides[key])
                .filter(item => item !== undefined);
            const reindexed = {};
            remaining.forEach((item, i) => {
                reindexed[i + 1] = item;
            });
            newSlides = reindexed;
        } else {
            throw new Error("Unsupported slides data type");
        }

        // Update only the 'slides' field to avoid rewriting the whole document
        await updateDoc(guideRef, { slides: newSlides });

        console.log(`Item at index ${index} deleted successfully`);
        return "deleted";
    } catch (error) {
        console.error("Error deleting slide by index:", error);
        throw error;
    }
};

