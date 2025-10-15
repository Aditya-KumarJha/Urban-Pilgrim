# Services Documentation

## Overview
This folder contains all service layer functions that interact with Firebase and external APIs. Services handle data fetching, CRUD operations, and business logic separate from components.

## Root Level Services

### firebase.js
**Purpose**: Firebase initialization and configuration

**Exports**:
```javascript
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
```

**Configuration**:
- Firebase project credentials
- Authentication setup
- Firestore database instance
- Cloud Storage instance
- Cloud Functions instance

### firestoreService.js
**Purpose**: Generic Firestore CRUD operations

**Functions**:
- `getDocument(collection, docId)`: Fetch single document
- `getCollection(collection)`: Fetch entire collection
- `addDocument(collection, data)`: Add new document
- `updateDocument(collection, docId, data)`: Update document
- `deleteDocument(collection, docId)`: Delete document
- `queryDocuments(collection, queries)`: Complex queries

**Usage**:
```javascript
import { getCollection, updateDocument } from './firestoreService';

const retreats = await getCollection('retreats');
await updateDocument('retreats', id, { title: 'New Title' });
```

### bundleService.js
**Purpose**: Program bundle operations

**Functions**:
- `fetchBundles()`: Get all bundles
- `createBundle(data)`: Create new bundle
- `updateBundle(id, data)`: Update bundle
- `deleteBundle(id)`: Delete bundle
- `getBundleById(id)`: Get single bundle

### workshopService.js
**Purpose**: Workshop-specific operations

**Functions**:
- `fetchWorkshops()`: Get all workshops
- `getWorkshopById(id)`: Get single workshop
- `submitWorkshopRequest(data)`: Submit inquiry
- `fetchWorkshopRequests()`: Get all requests (admin)
- `updateWorkshopRequest(id, status)`: Update request status

## Subdirectories

### /home_service
**Purpose**: Homepage content management services

**Files**:
- **heroService.js**: Hero carousel data
- **highlightsService.js**: Highlights section
- **testimonialsService.js**: Customer testimonials
- **sectionService.js**: Homepage sections (1-8)
- **navbarService.js**: Navbar content
- **footerService.js**: Footer content

**Common Functions**:
- `fetchSectionData(sectionName)`: Get section content
- `updateSectionData(sectionName, data)`: Update section (admin)

**Features**:
- Real-time Firebase updates
- Image URL management
- Admin-only write access
- Content versioning

### /pilgrim_session
**Purpose**: Session program services

**Files**:
- **liveSessionService.js**: Live session operations
- **recordedSessionService.js**: Recorded session operations

#### liveSessionService.js Functions:
- `fetchLiveSessions(filters)`: Get all live sessions
- `getLiveSessionById(id)`: Get session details
- `getAvailableSlots(sessionId, date)`: Get available time slots
- `bookLiveSession(bookingData)`: Book a session
- `cancelLiveBooking(bookingId)`: Cancel booking

**Features**:
- Slot availability checking
- Capacity management
- Multi-date slot handling
- Subscription type support (monthly, quarterly, one-time)
- Online/Offline mode support

#### recordedSessionService.js Functions:
- `fetchRecordedSessions(filters)`: Get all recorded sessions
- `getRecordedSessionById(id)`: Get session details
- `purchaseRecordedSession(data)`: Purchase access
- `getVideoUrl(sessionId)`: Get streaming URL

**Features**:
- Video URL generation
- Access control
- One-time purchase or subscription
- Download permissions

### /pilgrim_retreat
**Purpose**: Retreat program services

**File**: **retreatService.js**

**Functions**:
- `fetchRetreats(filters)`: Get all retreats
- `getRetreatById(id)`: Get retreat details
- `bookRetreat(bookingData)`: Book a retreat
- `cancelRetreatBooking(bookingId)`: Cancel booking
- `getRetreatAvailability(retreatId)`: Check availability

**Features**:
- Meet Guide integration (email, phone)
- Itinerary management
- Accommodation details
- Location and map data
- Automatic guide notifications on booking

**Retreat Booking Flow**:
1. User selects retreat
2. Service checks availability
3. Creates booking record
4. Sends email to guide (meetGuide.email)
5. Sends WhatsApp to guide (meetGuide.number)
6. Confirms booking to user

### /pilgrim_guide
**Purpose**: Guide service operations

**File**: **guideService.js**

**Functions**:
- `fetchGuides(filters)`: Get all guides
- `getGuideById(id)`: Get guide details
- `getGuideAvailability(guideId, date)`: Get available slots
- `bookGuide(bookingData)`: Book guide service
- `cancelGuideBooking(bookingId)`: Cancel booking

**Features**:
- Nested slot structure (online/offline → subscription type → slots)
- Availability calendar
- Subscription management
- Language and specialization filtering
- Rating and review system

**Guide Slot Structure**:
```javascript
{
  online: {
    monthly: { slots: [{ date, time, duration, capacity }] },
    quarterly: { slots: [] },
    oneTime: { slots: [] }
  },
  offline: {
    monthly: { slots: [] },
    quarterly: { slots: [] },
    oneTime: { slots: [] }
  }
}
```

### /upcoming_events
**Purpose**: Upcoming events services

**File**: **upcomingEventsService.js**

**Functions**:
- `fetchUpcomingEvents()`: Get all upcoming events
- `fetchAdminEventOrder()`: Get admin-curated order
- `updateEventOrder(order)`: Update display order (admin)
- `toggleEventVisibility(eventId, visible)`: Show/hide event

**Features**:
- Multi-source events (sessions, retreats, workshops, guides)
- Admin-curated ordering
- Visibility control
- Drag-and-drop order persistence

**Event Order Structure**:
```javascript
{
  selectedPrograms: [
    {
      id: string,
      title: string,
      image: string,
      category: string,
      type: string,
      isVisible: boolean,
      order: number
    }
  ]
}
```

>## Service Patterns

### Standard CRUD Pattern
```javascript
// Fetch all
export const fetchItems = async (filters = {}) => {
  try {
    const snapshot = await getDocs(collection(db, 'items'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching items:', error);
    throw error;
  }
};

// Fetch by ID
export const getItemById = async (id) => {
  try {
    const docRef = doc(db, 'items', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error('Error fetching item:', error);
    throw error;
  }
};

// Create
export const createItem = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'items'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
};

// Update
export const updateItem = async (id, data) => {
  try {
    const docRef = doc(db, 'items', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
};

// Delete
export const deleteItem = async (id) => {
  try {
    await deleteDoc(doc(db, 'items', id));
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};
```

### Image Upload Pattern
```javascript
export const uploadImage = async (file, path) => {
  try {
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
```

### Query with Filters Pattern
```javascript
export const queryItems = async (filters) => {
  try {
    let q = collection(db, 'items');
    
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }
    
    if (filters.priceRange) {
      q = query(q, 
        where('price', '>=', filters.priceRange[0]),
        where('price', '<=', filters.priceRange[1])
      );
    }
    
    if (filters.sortBy) {
      q = query(q, orderBy(filters.sortBy));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error querying items:', error);
    throw error;
  }
};
```

>## Error Handling

### Standard Error Pattern
```javascript
try {
  const result = await serviceFunction();
  return result;
} catch (error) {
  console.error('Service error:', error);
  
  // Log to monitoring service
  logError(error);
  
  // Return user-friendly error
  throw new Error('Failed to complete operation. Please try again.');
}
```

### Firebase Error Codes
- `permission-denied`: User lacks permissions
- `not-found`: Document doesn't exist
- `already-exists`: Duplicate document
- `unavailable`: Network issues
- `deadline-exceeded`: Timeout

>## Performance Optimization

### Caching Strategy
```javascript
let cache = {};
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const fetchWithCache = async (key, fetchFunction) => {
  const now = Date.now();
  
  if (cache[key] && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
    return cache[key];
  }
  
  const data = await fetchFunction();
  cache[key] = data;
  cacheTimestamp = now;
  
  return data;
};
```

### Batch Operations
```javascript
export const batchUpdate = async (updates) => {
  const batch = writeBatch(db);
  
  updates.forEach(({ collection, id, data }) => {
    const docRef = doc(db, collection, id);
    batch.update(docRef, data);
  });
  
  await batch.commit();
};
```

### Pagination
```javascript
export const fetchPaginated = async (collectionName, pageSize, lastDoc = null) => {
  let q = query(
    collection(db, collectionName),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }
  
  const snapshot = await getDocs(q);
  const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const lastVisible = snapshot.docs[snapshot.docs.length - 1];
  
  return { items, lastVisible, hasMore: items.length === pageSize };
};
```

>## Real-time Listeners

### Subscribe to Changes
```javascript
export const subscribeToCollection = (collectionName, callback) => {
  const unsubscribe = onSnapshot(
    collection(db, collectionName),
    (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(items);
    },
    (error) => {
      console.error('Listener error:', error);
    }
  );
  
  return unsubscribe; // Call to stop listening
};
```

### Subscribe to Document
```javascript
export const subscribeToDocument = (collectionName, docId, callback) => {
  const unsubscribe = onSnapshot(
    doc(db, collectionName, docId),
    (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      }
    }
  );
  
  return unsubscribe;
};
```

>## Security Considerations

### Client-Side Validation
- Validate all inputs before sending to Firebase
- Check user authentication status
- Verify user permissions

### Server-Side Validation
- Firebase Security Rules enforce access control
- Cloud Functions validate data integrity
- Rate limiting on sensitive operations

### Data Sanitization
```javascript
export const sanitizeInput = (input) => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .slice(0, 1000); // Limit length
};
```

>## Testing Services

### Unit Tests
```javascript
import { fetchItems } from './itemService';

jest.mock('./firebase', () => ({
  db: mockFirestore,
}));

test('fetchItems returns array', async () => {
  const items = await fetchItems();
  expect(Array.isArray(items)).toBe(true);
});
```

### Integration Tests
- Test with Firebase emulator
- Mock external API calls
- Test error scenarios

>## Best Practices

1. **Separation of Concerns**: Keep services focused on data operations
2. **Error Handling**: Always wrap Firebase calls in try-catch
3. **Timestamps**: Use serverTimestamp() for consistency
4. **Validation**: Validate data before Firebase operations
5. **Logging**: Log errors for debugging
6. **Caching**: Cache frequently accessed data
7. **Batch Operations**: Use batches for multiple updates
8. **Real-time**: Use listeners sparingly (performance impact)
9. **Security**: Never trust client-side validation alone
10. **Documentation**: Document complex queries and business logic
