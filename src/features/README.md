# Redux Features (Slices) Documentation

## Overview
This folder contains Redux Toolkit slices that define state structure, reducers, and actions for different features of the Urban Pilgrim platform. Each slice manages a specific domain of the application state.

>## Structure
```
features/
├── authSlice.js                 # User authentication
├── adminAuthSlice.js            # Admin authentication
├── organizerAuthSlice.js        # Organizer authentication
├── cartSlice.js                 # Shopping cart
├── bundleSlice.js               # Program bundles
├── eventsSlice.js               # Events management
├── workshopsSlice.js            # Workshops
├── userProgramsSlice.js         # User's purchased programs
├── weather.js                   # Weather data
├── home_slices/                 # Homepage content slices
├── pilgrim_session/             # Session program slices
├── pilgrim_retreat/             # Retreat program slices
├── pilgrim_guide/               # Guide service slices
└── upcoming_events/             # Upcoming events slice
```

>## Authentication Slices

### authSlice.js
**Purpose**: User authentication state management

**State**:
```javascript
{
  user: {
    uid: string,
    email: string,
    phoneNumber: string,
    displayName: string,
    photoURL: string
  } | null,
  isAuthenticated: boolean,
  loading: boolean,
  error: string | null
}
```

**Actions**:
- `setUser(user)`: Set authenticated user
- `clearUser()`: Clear user on logout
- `updateProfile(data)`: Update user profile
- `setLoading(boolean)`: Set loading state
- `setError(message)`: Set error message

**Usage**:
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { setUser, clearUser } from '../features/authSlice';

const { user, isAuthenticated } = useSelector(state => state.auth);
dispatch(setUser(userData));
```

### adminAuthSlice.js
**Purpose**: Admin authentication and session management

**State**:
```javascript
{
  admin: {
    uid: string,
    email: string,
    role: string,
    permissions: string[]
  } | null,
  isAuthenticated: boolean,
  loading: boolean
}
```

**Actions**:
- `setAdmin(admin)`: Set authenticated admin
- `clearAdmin()`: Clear admin session
- `updateAdminPermissions(permissions)`: Update permissions

**Features**:
- OTP-based authentication
- Custom Firebase claims
- Persistent session (localStorage)
- Role-based access control

### organizerAuthSlice.js
**Purpose**: Organizer authentication and management

**State**:
```javascript
{
  organizer: {
    uid: string,
    email: string,
    name: string,
    programs: string[],
    approvalStatus: string
  } | null,
  isAuthenticated: boolean,
  loading: boolean
}
```

**Actions**:
- `setOrganizer(organizer)`: Set authenticated organizer
- `clearOrganizer()`: Clear organizer session
- `updateOrganizerPrograms(programs)`: Update assigned programs

>## Shopping & Purchases

### cartSlice.js
**Purpose**: Shopping cart state management

**State**:
```javascript
{
  items: [
    {
      id: string,
      programId: string,
      title: string,
      image: string,
      price: number,
      quantity: number,
      type: 'session' | 'retreat' | 'guide' | 'workshop',
      slotInfo: {
        date: string,
        time: string,
        duration: number
      } | null,
      subscriptionType: 'monthly' | 'quarterly' | 'oneTime' | null,
      mode: 'online' | 'offline' | null
    }
  ],
  totalItems: number,
  subtotal: number,
  discount: number,
  total: number,
  appliedCoupon: {
    code: string,
    discountValue: number,
    discountType: 'percentage' | 'fixed'
  } | null
}
```

**Actions**:
- `addToCart(item)`: Add item to cart
- `removeFromCart(itemId)`: Remove item
- `updateQuantity({ itemId, quantity })`: Update quantity
- `clearCart()`: Clear all items
- `applyCoupon(coupon)`: Apply discount coupon
- `removeCoupon()`: Remove coupon
- `calculateTotals()`: Recalculate totals

**Features**:
- Persistent cart (localStorage)
- Auto-calculation of totals
- Coupon integration
- Duplicate item prevention
- Slot-specific cart items

### bundleSlice.js
**Purpose**: Program bundle management

**State**:
```javascript
{
  bundles: {
    data: [],
    loading: boolean,
    error: string | null
  },
  selectedBundle: object | null
}
```

**Async Thunks**:
- `fetchBundles()`: Fetch all bundles
- `createBundle(data)`: Create new bundle (admin)
- `updateBundle({ id, data })`: Update bundle (admin)
- `deleteBundle(id)`: Delete bundle (admin)

**Actions**:
- `setSelectedBundle(bundle)`: Select bundle for viewing
- `clearSelectedBundle()`: Clear selection

### userProgramsSlice.js
**Purpose**: User's purchased programs and access

**State**:
```javascript
{
  purchased: [],
  upcoming: [],
  completed: [],
  subscriptions: [],
  loading: boolean,
  error: string | null
}
```

**Async Thunks**:
- `fetchUserPrograms(userId)`: Fetch user's programs
- `markProgramComplete({ userId, programId })`: Mark as completed
- `cancelBooking({ bookingId })`: Cancel booking

**Actions**:
- `addPurchasedProgram(program)`: Add to purchased
- `updateProgramStatus({ programId, status })`: Update status
- `removeProgram(programId)`: Remove program

>## Program Management

### workshopsSlice.js
**Purpose**: Workshop programs management

**State**:
```javascript
{
  workshops: {
    data: [],
    loading: boolean,
    error: string | null
  },
  requests: {
    data: [],
    loading: boolean
  },
  selectedWorkshop: object | null
}
```

**Async Thunks**:
- `fetchWorkshops(filters)`: Fetch all workshops
- `fetchWorkshopById(id)`: Fetch single workshop
- `submitWorkshopRequest(data)`: Submit inquiry
- `fetchWorkshopRequests()`: Fetch requests (admin)
- `updateRequestStatus({ requestId, status })`: Update request

**Actions**:
- `setSelectedWorkshop(workshop)`: Select workshop
- `clearSelectedWorkshop()`: Clear selection
- `addWorkshopRequest(request)`: Add new request

### eventsSlice.js
**Purpose**: Events management

**State**:
```javascript
{
  events: {
    data: [],
    loading: boolean,
    error: string | null
  },
  adminOrder: [],
  filters: {
    category: string,
    dateRange: [Date, Date],
    location: string
  }
}
```

**Async Thunks**:
- `fetchEvents()`: Fetch all events
- `fetchAdminEventOrder()`: Fetch admin-curated order
- `updateEventOrder(order)`: Update display order (admin)

**Actions**:
- `setFilters(filters)`: Update filters
- `clearFilters()`: Reset filters
- `setAdminOrder(order)`: Set event display order

>## Subdirectories

### /home_slices
**Purpose**: Homepage content management

**Slices**:
- **heroSlice.js**: Hero carousel images and captions
- **highlightsSlice.js**: Highlights section content
- **testimonialsSlice.js**: Customer testimonials
- **sectionsSlice.js**: Homepage sections (1-8)
- **navbarSlice.js**: Navbar content
- **footerSlice.js**: Footer content

**Common Pattern**:
```javascript
{
  data: {
    title: string,
    description: string,
    images: string[],
    content: object
  },
  loading: boolean,
  error: string | null
}
```

**Common Thunks**:
- `fetchSectionData()`: Fetch section content
- `updateSectionData(data)`: Update content (admin)

### /pilgrim_session
**Purpose**: Session program state management

**Slices**:
- **liveSessionSlice.js**: Live session programs
- **recordedSessionSlice.js**: Recorded session programs

#### liveSessionSlice.js

**State**:
```javascript
{
  liveSessions: {
    data: [],
    loading: boolean,
    error: string | null
  },
  filters: {
    category: string,
    priceRange: [number, number],
    instructor: string,
    date: string,
    mode: 'online' | 'offline' | 'all'
  },
  sortBy: 'bestSelling' | 'price' | 'newest' | 'rating',
  selectedSession: object | null
}
```

**Async Thunks**:
- `fetchLiveSessions(filters)`: Fetch live sessions
- `fetchLiveSessionById(id)`: Fetch single session
- `fetchAvailableSlots({ sessionId, date })`: Fetch slots
- `bookLiveSession(bookingData)`: Book session

**Actions**:
- `setFilters(filters)`: Update filters
- `setSortBy(sortBy)`: Update sort order
- `clearFilters()`: Reset filters
- `setSelectedSession(session)`: Select session

**Features**:
- Multi-date slot management
- Subscription type support
- Online/Offline modes
- Capacity tracking
- Best-selling calculation

#### recordedSessionSlice.js

**State**:
```javascript
{
  recordedSessions: {
    data: [],
    loading: boolean,
    error: string | null
  },
  filters: {
    category: string,
    priceRange: [number, number],
    duration: number
  },
  selectedSession: object | null
}
```

**Async Thunks**:
- `fetchRecordedSessions(filters)`: Fetch recorded sessions
- `fetchRecordedSessionById(id)`: Fetch single session
- `purchaseRecordedSession(data)`: Purchase access

### /pilgrim_retreat
**Purpose**: Retreat program state management

**Slice**: **retreatSlice.js**

**State**:
```javascript
{
  retreats: {
    data: [],
    loading: boolean,
    error: string | null
  },
  filters: {
    location: string,
    duration: number,
    priceRange: [number, number],
    type: string
  },
  selectedRetreat: object | null
}
```

**Async Thunks**:
- `fetchRetreats(filters)`: Fetch all retreats
- `fetchRetreatById(id)`: Fetch single retreat
- `bookRetreat(bookingData)`: Book retreat
- `cancelRetreatBooking(bookingId)`: Cancel booking

**Actions**:
- `setFilters(filters)`: Update filters
- `clearFilters()`: Reset filters
- `setSelectedRetreat(retreat)`: Select retreat

**Features**:
- Meet Guide integration
- Itinerary management
- Location filtering
- Duration-based filtering
- Automatic guide notifications

### /pilgrim_guide
**Purpose**: Guide service state management

**Slice**: **guideSlice.js**

**State**:
```javascript
{
  guides: {
    data: [],
    loading: boolean,
    error: string | null
  },
  filters: {
    language: string,
    specialization: string,
    availability: string,
    priceRange: [number, number]
  },
  selectedGuide: object | null,
  availability: {
    [guideId]: {
      [date]: slots[]
    }
  }
}
```

**Async Thunks**:
- `fetchGuides(filters)`: Fetch all guides
- `fetchGuideById(id)`: Fetch single guide
- `fetchGuideAvailability({ guideId, date })`: Fetch slots
- `bookGuide(bookingData)`: Book guide service

**Actions**:
- `setFilters(filters)`: Update filters
- `clearFilters()`: Reset filters
- `setSelectedGuide(guide)`: Select guide
- `updateAvailability({ guideId, date, slots })`: Update slots

**Features**:
- Nested slot structure (online/offline → subscription → slots)
- Language filtering
- Specialization filtering
- Availability calendar
- Rating system

### /upcoming_events
**Purpose**: Upcoming events state management

**Slice**: **upcomingEventsSlice.js**

**State**:
```javascript
{
  events: {
    data: [],
    loading: boolean,
    error: string | null
  },
  adminOrder: {
    selectedPrograms: [],
    lastUpdated: Date
  },
  filters: {
    category: string,
    dateRange: [Date, Date]
  }
}
```

**Async Thunks**:
- `fetchUpcomingEvents()`: Fetch all events
- `fetchAdminEventOrder()`: Fetch admin-curated order
- `updateEventOrder(order)`: Update order (admin)
- `toggleEventVisibility({ eventId, visible })`: Toggle visibility

**Features**:
- Multi-source events (sessions, retreats, workshops, guides)
- Admin-curated ordering
- Drag-and-drop order persistence
- Visibility control

>## Slice Patterns

### Basic Slice Structure
```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchData = createAsyncThunk(
  'feature/fetchData',
  async (params, { rejectWithValue }) => {
    try {
      const data = await fetchFromAPI(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const featureSlice = createSlice({
  name: 'feature',
  initialState: {
    data: [],
    loading: false,
    error: null
  },
  reducers: {
    setData: (state, action) => {
      state.data = action.payload;
    },
    clearData: (state) => {
      state.data = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setData, clearData } = featureSlice.actions;
export default featureSlice.reducer;
```

### Async Thunk Pattern
```javascript
export const updateItem = createAsyncThunk(
  'feature/updateItem',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const updated = await updateAPI(id, data);
      dispatch(showSuccess('Updated successfully!'));
      return updated;
    } catch (error) {
      dispatch(showError(error.message));
      return rejectWithValue(error.message);
    }
  }
);
```

### Selector Pattern
```javascript
// In slice file
export const selectFilteredData = (state) => {
  const { data, filters } = state.feature;
  return data.filter(item => matchesFilters(item, filters));
};

// In component
import { useSelector } from 'react-redux';
import { selectFilteredData } from '../features/featureSlice';

const filteredData = useSelector(selectFilteredData);
```

>## Best Practices

1. **Slice Organization**: One slice per feature domain
2. **Naming**: Use descriptive action names (`feature/action`)
3. **Immutability**: Redux Toolkit uses Immer (write "mutating" code)
4. **Async Operations**: Use createAsyncThunk for API calls
5. **Error Handling**: Always handle rejected states
6. **Loading States**: Track loading for better UX
7. **Selectors**: Create memoized selectors for derived data
8. **Normalization**: Normalize nested data structures
9. **Type Safety**: Use TypeScript for type checking
10. **Testing**: Write tests for reducers and thunks

>## Testing Slices

```javascript
import reducer, { addToCart, removeFromCart } from './cartSlice';

describe('cartSlice', () => {
  it('should add item to cart', () => {
    const initialState = { items: [], total: 0 };
    const item = { id: '1', price: 100 };
    
    const state = reducer(initialState, addToCart(item));
    
    expect(state.items).toHaveLength(1);
    expect(state.total).toBe(100);
  });
  
  it('should remove item from cart', () => {
    const initialState = {
      items: [{ id: '1', price: 100 }],
      total: 100
    };
    
    const state = reducer(initialState, removeFromCart('1'));
    
    expect(state.items).toHaveLength(0);
    expect(state.total).toBe(0);
  });
});
```
