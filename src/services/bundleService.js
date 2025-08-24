import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const BUNDLE_COLLECTION = "bundles";

// Create or update a bundle
export const saveOrUpdateBundle = async (bundleData, bundleId = null) => {
    try {
        const bundleRef = bundleId 
            ? doc(db, BUNDLE_COLLECTION, bundleId)
            : doc(collection(db, BUNDLE_COLLECTION));
        
        const bundleToSave = {
            ...bundleData,
            id: bundleRef.id,
            createdAt: bundleId ? bundleData.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await setDoc(bundleRef, bundleToSave);
        return { success: true, id: bundleRef.id, data: bundleToSave };
    } catch (error) {
        console.error("Error saving bundle:", error);
        throw error;
    }
};

// Get all bundles
export const fetchAllBundles = async () => {
    try {
        const bundlesRef = collection(db, BUNDLE_COLLECTION);
        const snapshot = await getDocs(bundlesRef);
        
        const bundles = [];
        snapshot.forEach((doc) => {
            bundles.push({ id: doc.id, ...doc.data() });
        });
        
        return bundles;
    } catch (error) {
        console.error("Error fetching bundles:", error);
        throw error;
    }
};

// Get a single bundle by ID
export const fetchBundleById = async (bundleId) => {
    try {
        const bundleRef = doc(db, BUNDLE_COLLECTION, bundleId);
        const snapshot = await getDoc(bundleRef);
        
        if (snapshot.exists()) {
            return { id: snapshot.id, ...snapshot.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching bundle:", error);
        throw error;
    }
};

// Update a bundle
export const updateBundle = async (bundleId, bundleData) => {
    try {
        const bundleRef = doc(db, BUNDLE_COLLECTION, bundleId);
        const updateData = {
            ...bundleData,
            updatedAt: new Date().toISOString(),
        };
        
        await updateDoc(bundleRef, updateData);
        return { success: true, id: bundleId };
    } catch (error) {
        console.error("Error updating bundle:", error);
        throw error;
    }
};

// Delete a bundle
export const deleteBundle = async (bundleId) => {
    try {
        const bundleRef = doc(db, BUNDLE_COLLECTION, bundleId);
        await deleteDoc(bundleRef);
        return { success: true, id: bundleId };
    } catch (error) {
        console.error("Error deleting bundle:", error);
        throw error;
    }
};

// Get bundles by status (active/inactive)
export const fetchBundlesByStatus = async (isActive = true) => {
    try {
        const bundlesRef = collection(db, BUNDLE_COLLECTION);
        const snapshot = await getDocs(bundlesRef);
        
        const bundles = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.isActive === isActive) {
                bundles.push({ id: doc.id, ...data });
            }
        });
        
        return bundles;
    } catch (error) {
        console.error("Error fetching bundles by status:", error);
        throw error;
    }
};
