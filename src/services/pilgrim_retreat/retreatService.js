import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export const saveOrUpdateRetreatData = async (uid, arrayName, newArray) => {
    if (!uid) throw new Error("User ID is required");
    console.log("Saving array:", JSON.stringify(newArray, null, 2));

    const docRef = doc(db, `pilgrim_retreat/${uid}/retreats/data`);

    try {
        // Try updating the document first
        await updateDoc(docRef, { [arrayName]: newArray });
        return "updated";
    } catch (error) {
        if (error.code === "not-found" || error.message.includes("No document to update")) {
            // If doc doesn't exist, create it
            await setDoc(docRef, { [arrayName]: newArray });
            return "created";
        } else {
            console.error("Error saving/updating retreat data:", error);
            throw error;
        }
    }
};

export const fetchRetreatData = async (uid) => {
    if (!uid) throw new Error("User ID is required");

    const retreatRef = doc(db, `pilgrim_retreat/${uid}/retreats/data`);
    const docSnap = await getDoc(retreatRef);

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        return null; // no data yet
    }
};

// export const deleteRetreatItem = async (uid, arrayName, itemId) => {
//     if (!uid) throw new Error("User ID is required");

//     try {
//         const retreatRef = doc(db, `pilgrim_retreat/${uid}/retreats/data`);
//         const docSnap = await getDoc(retreatRef);

//         if (!docSnap.exists()) {
//             throw new Error("No retreat data found for this user.");
//         }

//         await setDoc(
//             retreatRef,
//             { [arrayName]: deleteField() },
//             { merge: true }
//         );
        
//         return "deleted";
//     } catch (error) {
//         console.error("Error deleting retreat item:", error);
//         throw error;
//     }
// };

export const deleteRetreatItem = async (uid, arrayName) => {
    if (!uid) throw new Error("User ID is required");
    if (arrayName === undefined || arrayName === null) throw new Error("Array name is required");

    try {
        const retreatRef = doc(db, `pilgrim_retreat/${uid}/retreats/data`);
        const docSnap = await getDoc(retreatRef);

        if (!docSnap.exists()) {
            throw new Error("No retreat data found for this user.");
        }

        const data = docSnap.data();

        // Convert numeric keys to sorted array
        const keys = Object.keys(data)
            .filter(k => !isNaN(Number(k))) // keep only numeric keys
            .map(Number)
            .sort((a, b) => a - b);

        // Remove the selected key
        delete data[arrayName];

        // Reindex: shift all higher keys down
        const updatedData = {};
        let newIndex = 1;
        keys.forEach(k => {
            if (k !== Number(arrayName)) {
                updatedData[newIndex] = data[k];
                newIndex++;
            }
        });

        // Save updated object
        await setDoc(retreatRef, updatedData);

        console.log(`Deleted array ${arrayName} and reindexed successfully.`);
        return "deleted and reindexed";
    } catch (error) {
        console.error("Error deleting retreat array:", error);
        throw error;
    }
};


