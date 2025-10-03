import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    getDocs, 
    getDoc,
    query,
    orderBy 
} from "firebase/firestore";
import { 
    ref, 
    uploadBytesResumable, 
    getDownloadURL, 
    deleteObject 
} from "firebase/storage";
import { db, storage } from "./firebase";

// Workshop CRUD operations
export const createWorkshop = async (workshopData) => {
    try {
        const docRef = await addDoc(collection(db, "workshops"), {
            ...workshopData,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return { id: docRef.id, ...workshopData };
    } catch (error) {
        console.error("Error creating workshop:", error);
        throw error;
    }
};

export const updateWorkshop = async (workshopId, workshopData) => {
    try {
        const workshopRef = doc(db, "workshops", workshopId);
        await updateDoc(workshopRef, {
            ...workshopData,
            updatedAt: new Date()
        });
        return { id: workshopId, ...workshopData };
    } catch (error) {
        console.error("Error updating workshop:", error);
        throw error;
    }
};

export const deleteWorkshop = async (workshopId) => {
    try {
        await deleteDoc(doc(db, "workshops", workshopId));
        return workshopId;
    } catch (error) {
        console.error("Error deleting workshop:", error);
        throw error;
    }
};

export const getWorkshops = async () => {
    try {
        const q = query(collection(db, "workshops"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const workshops = [];
        querySnapshot.forEach((doc) => {
            workshops.push({ id: doc.id, ...doc.data() });
        });
        return workshops;
    } catch (error) {
        console.error("Error fetching workshops:", error);
        throw error;
    }
};

export const getWorkshopById = async (workshopId) => {
    try {
        const docRef = doc(db, "workshops", workshopId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            throw new Error("Workshop not found");
        }
    } catch (error) {
        console.error("Error fetching workshop:", error);
        throw error;
    }
};

// File upload operations
export const uploadFile = (file, path, onProgress) => {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(Math.round(progress));
            },
            (error) => {
                console.error('Upload error:', error);
                reject(error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                });
            }
        );
    });
};

export const deleteFile = async (fileUrl) => {
    try {
        const fileRef = ref(storage, fileUrl);
        await deleteObject(fileRef);
    } catch (error) {
        console.error("Error deleting file:", error);
        throw error;
    }
};

// Batch upload operations
export const uploadMultipleFiles = async (files, basePath, onProgress) => {
    const uploadPromises = files.map(async (file, index) => {
        const timestamp = Date.now();
        const path = `${basePath}/${timestamp}_${index}_${file.name}`;
        
        return uploadFile(file, path, (progress) => {
            onProgress(index, progress);
        });
    });

    return Promise.all(uploadPromises);
};
