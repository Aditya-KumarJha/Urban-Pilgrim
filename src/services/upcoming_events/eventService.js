import { db } from '../firebase';
import { 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    collection, 
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
    addDoc,
    updateDoc
} from 'firebase/firestore';

const COLLECTION_NAME = 'upcomingEvents';

// Save or update event data
export const saveOrUpdateEventData = async (uid, eventId, eventData) => {
    try {
        let eventRef;
        
        if (eventId && eventId !== 'new') {
            // Update existing event
            eventRef = doc(db, COLLECTION_NAME, uid, 'events', eventId.toString());
            const eventDataWithTimestamp = {
                ...eventData,
                updatedAt: serverTimestamp()
            };
            await updateDoc(eventRef, eventDataWithTimestamp);
        } else {
            // Create new event
            const eventsRef = collection(db, COLLECTION_NAME, uid, 'events');
            const eventDataWithTimestamp = {
                ...eventData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            const newDocRef = await addDoc(eventsRef, eventDataWithTimestamp);
            eventId = newDocRef.id;
        }
        
        return { success: true, id: eventId };
    } catch (error) {
        console.error('Error saving event data:', error);
        throw new Error(`Failed to save event: ${error.message}`);
    }
};

// Fetch all events for a user
export const fetchEventData = async (uid) => {
    try {
        const eventsRef = collection(db, COLLECTION_NAME, uid, 'events');
        const q = query(eventsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return null;
        }

        // Return as an object with event IDs as keys for Redux state
        const events = {};
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            events[doc.id] = {
                ...data,
                id: doc.id
            };
        });

        return events;
    } catch (error) {
        console.error('Error fetching event data:', error);
        throw new Error(`Failed to fetch events: ${error.message}`);
    }
};

// Delete an event
export const deleteEventItem = async (uid, eventId) => {
    try {
        if (!eventId) {
            throw new Error('Event ID is required for deletion');
        }
        
        const eventRef = doc(db, COLLECTION_NAME, uid, 'events', eventId.toString());
        await deleteDoc(eventRef);
        return { success: true };
    } catch (error) {
        console.error('Error deleting event:', error);
        throw new Error(`Failed to delete event: ${error.message}`);
    }
};

// Fetch a single event
export const fetchSingleEvent = async (uid, eventId) => {
    try {
        if (!eventId) {
            throw new Error('Event ID is required');
        }
        
        const eventRef = doc(db, COLLECTION_NAME, uid, 'events', eventId.toString());
        const eventSnap = await getDoc(eventRef);
        
        if (eventSnap.exists()) {
            return { id: eventSnap.id, ...eventSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching single event:', error);
        throw new Error(`Failed to fetch event: ${error.message}`);
    }
};

// Get events as array (for components that need array format)
export const fetchEventsAsArray = async (uid) => {
    try {
        const eventsRef = collection(db, COLLECTION_NAME, uid, 'events');
        const q = query(eventsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return [];
        }

        // Return as an array for components that need array format
        const events = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            events.push({
                ...data,
                id: doc.id
            });
        });

        return events;
    } catch (error) {
        console.error('Error fetching events as array:', error);
        throw new Error(`Failed to fetch events: ${error.message}`);
    }
};
