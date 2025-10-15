# Redux State Management Documentation

## Overview
This folder contains the Redux store configuration and all state management logic for the Urban Pilgrim platform. Redux Toolkit is used for simplified state management with slices.

>## Store Configuration

### store.js
**Purpose**: Central Redux store configuration

**Structure**:
```javascript
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';

const store = configureStore({
  reducer: {
    auth: authReducer,
    adminAuth: adminAuthReducer,
    organizerAuth: organizerAuthReducer,
    cart: cartReducer,
    // ... other reducers
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
```

**Features**:
- **Redux Persist**: Persists cart and auth state to localStorage
- **DevTools**: Redux DevTools integration for debugging
- **Middleware**: Thunk middleware for async actions
- **Type Safety**: TypeScript support (if enabled)

>## State Slices

### Authentication Slices

#### authSlice.js
**Purpose**: User authentication state

**State Structure**:
```javascript
{
  user: {
    uid: string,
    email: string,
    phoneNumber: string,
    displayName: string,
    photoURL: string,
  },
  isAuthenticated: boolean,
  loading: boolean,
  error: string | null,
}
```

**Actions**:
- `setUser(user)`: Set authenticated user
- `clearUser()`: Clear user on logout
- `updateProfile(data)`: Update user profile

**Usage**:
```javascript
import { useSelector, useDispatch } from 'react-redux';
import { setUser, clearUser } from '../features/authSlice';

const { user, isAuthenticated } = useSelector(state => state.auth);
dispatch(setUser(userData));
```

#### adminAuthSlice.js
**Purpose**: Admin authentication state

**State Structure**:
```javascript
{
  admin: {
    uid: string,
    email: string,
    role: string,
    permissions: string[],
  },
  isAuthenticated: boolean,
  loading: boolean,
}
```

**Actions**:
- `setAdmin(admin)`: Set authenticated admin
- `clearAdmin()`: Clear admin on logout

**Features**:
- **OTP Authentication**: Email-based OTP verification
- **Custom Claims**: Firebase custom token with admin role
- **Persistent Session**: Stored in localStorage
- **Route Protection**: Used by AdminProtectedRoute

#### organizerAuthSlice.js
**Purpose**: Organizer authentication state

**State Structure**:
```javascript
{
  organizer: {
    uid: string,
    email: string,
    name: string,
    programs: string[],
  },
  isAuthenticated: boolean,
  loading: boolean,
}
```

**Actions**:
- `setOrganizer(organizer)`: Set authenticated organizer
- `clearOrganizer()`: Clear organizer on logout

### Cart Management

#### cartSlice.js
**Purpose**: Shopping cart state management

**State Structure**:
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
        duration: number,
      },
      subscriptionType: 'monthly' | 'quarterly' | 'oneTime',
      mode: 'online' | 'offline',
    }
  ],
  totalItems: number,
  subtotal: number,
  discount: number,
  total: number,
  appliedCoupon: {
    code: string,
    discountValue: number,
    discountType: 'percentage' | 'fixed',
  } | null,
}
```

**Actions**:
- `addToCart(item)`: Add item to cart
- `removeFromCart(itemId)`: Remove item from cart
- `updateQuantity({ itemId, quantity })`: Update item quantity
- `clearCart()`: Clear all items
- `applyCoupon(coupon)`: Apply discount coupon
- `removeCoupon()`: Remove applied coupon
- `calculateTotals()`: Recalculate cart totals

**Selectors**:
```javascript
const selectCartItems = (state) => state.cart.items;
const selectCartTotal = (state) => state.cart.total;
const selectCartItemCount = (state) => state.cart.totalItems;
```

**Features**:
- **Persistence**: Cart saved to localStorage
- **Auto-calculation**: Totals updated automatically
- **Coupon Integration**: Discount application and validation
- **Duplicate Prevention**: Checks for existing items

### Program Data Slices

#### pilgrim_session (folder)
**Location**: `src/features/pilgrim_session/`

**Slices**:
- **liveSessionSlice.js**: Live session programs
- **recordedSessionSlice.js**: Recorded session programs

**State Structure**:
```javascript
{
  liveSessions: {
    data: [],
    loading: boolean,
    error: string | null,
    filters: {
      category: string,
      priceRange: [number, number],
      instructor: string,
      date: string,
    },
    sortBy: 'bestSelling' | 'price' | 'newest' | 'rating',
  },
  recordedSessions: {
    data: [],
    loading: boolean,
    error: string | null,
  },
}
```

**Async Thunks**:
```javascript
// Fetch live sessions from Firebase
export const fetchLiveSessions = createAsyncThunk(
  'liveSessions/fetch',
  async () => {
    const sessions = await getLiveSessionsFromFirebase();
    return sessions;
  }
);

// Fetch recorded sessions
export const fetchRecordedSessions = createAsyncThunk(
  'recordedSessions/fetch',
  async () => {
    const sessions = await getRecordedSessionsFromFirebase();
    return sessions;
  }
);
```

**Actions**:
- `setFilters(filters)`: Update filter criteria
- `setSortBy(sortBy)`: Update sort order
- `clearFilters()`: Reset all filters

#### pilgrim_retreat (folder)
**Location**: `src/features/pilgrim_retreat/`

**Slice**: `retreatSlice.js`

**State Structure**:
```javascript
{
  retreats: {
    data: [],
    loading: boolean,
    error: string | null,
    filters: {
      location: string,
      duration: number,
      priceRange: [number, number],
      type: string,
    },
  },
}
```

**Async Thunks**:
- `fetchRetreats()`: Fetch all retreats
- `fetchRetreatById(id)`: Fetch single retreat details

#### pilgrim_guide (folder)
**Location**: `src/features/pilgrim_guide/`

**Slice**: `guideSlice.js`

**State Structure**:
```javascript
{
  guides: {
    data: [],
    loading: boolean,
    error: string | null,
    filters: {
      language: string,
      specialization: string,
      availability: string,
      priceRange: [number, number],
    },
  },
}
```

**Async Thunks**:
- `fetchGuides()`: Fetch all guides
- `fetchGuideById(id)`: Fetch single guide details
- `fetchGuideAvailability(guideId, date)`: Fetch available slots

#### workshopsSlice.js
**Purpose**: Workshop programs state

**State Structure**:
```javascript
{
  workshops: {
    data: [],
    loading: boolean,
    error: string | null,
    requests: [],
  },
}
```

**Async Thunks**:
- `fetchWorkshops()`: Fetch all workshops
- `submitWorkshopRequest(data)`: Submit workshop inquiry
- `fetchWorkshopRequests()`: Fetch workshop requests (admin)

#### bundleSlice.js
**Purpose**: Program bundles state

**State Structure**:
```javascript
{
  bundles: {
    data: [],
    loading: boolean,
    error: string | null,
  },
}
```

**Features**:
- Bundle creation and management
- Multi-program selection
- Discount calculation
- Bundle visibility control

### Event Management

#### eventsSlice.js
**Purpose**: Upcoming events state

**State Structure**:
```javascript
{
  events: {
    data: [],
    adminOrder: [],
    loading: boolean,
    error: string | null,
  },
}
```

**Async Thunks**:
- `fetchEvents()`: Fetch all events
- `fetchAdminEventOrder()`: Fetch admin-curated event order
- `updateEventOrder(order)`: Update event display order (admin)

**Features**:
- Admin-curated event ordering
- Visibility toggle
- Multi-source events (sessions, retreats, workshops, guides)

### User Programs

#### userProgramsSlice.js
**Purpose**: User's purchased programs

**State Structure**:
```javascript
{
  userPrograms: {
    purchased: [],
    upcoming: [],
    completed: [],
    loading: boolean,
    error: string | null,
  },
}
```

**Async Thunks**:
- `fetchUserPrograms(userId)`: Fetch user's programs
- `markProgramComplete(programId)`: Mark program as completed

**Features**:
- Purchase history
- Upcoming sessions
- Completed programs
- Access control for purchased content

### Home Page Slices

#### home_slices (folder)
**Location**: `src/features/home_slices/`

**Slices**:
- **heroSlice.js**: Hero carousel data
- **highlightsSlice.js**: Highlights section
- **testimonialsSlice.js**: Testimonials
- **sectionsSlice.js**: Homepage sections (1-8)
- **navbarSlice.js**: Navbar content
- **footerSlice.js**: Footer content

**Purpose**: Manage homepage content editable by admin

**Common Pattern**:
```javascript
{
  data: {},
  loading: boolean,
  error: string | null,
}
```

**Async Thunks**:
- `fetchSectionData()`: Fetch section content
- `updateSectionData(data)`: Update section content (admin)

### Utility Slices

#### weather.js
**Purpose**: Weather information for retreats/events

**State Structure**:
```javascript
{
  weather: {
    location: string,
    temperature: number,
    condition: string,
    forecast: [],
  },
}
```

**Async Thunks**:
- `fetchWeather(location)`: Fetch weather data for location

>## State Flow Patterns

### Data Fetching Pattern
```javascript
// In component
useEffect(() => {
  dispatch(fetchLiveSessions());
}, [dispatch]);

// In slice
export const fetchLiveSessions = createAsyncThunk(
  'liveSessions/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const sessions = await getLiveSessionsFromFirebase();
      return sessions;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Reducer
extraReducers: (builder) => {
  builder
    .addCase(fetchLiveSessions.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchLiveSessions.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
    })
    .addCase(fetchLiveSessions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
}
```

### Cart Update Pattern
```javascript
// Add to cart
dispatch(addToCart({
  id: generateId(),
  programId: program.id,
  title: program.title,
  price: program.price,
  quantity: 1,
  type: 'session',
}));

// Update quantity
dispatch(updateQuantity({ itemId, quantity: 2 }));

// Apply coupon
dispatch(applyCoupon({
  code: 'SAVE20',
  discountValue: 20,
  discountType: 'percentage',
}));

// Calculate totals (auto-triggered)
dispatch(calculateTotals());
```

### Filter Update Pattern
```javascript
// Update filters
dispatch(setFilters({
  category: 'meditation',
  priceRange: [0, 5000],
}));

// Clear filters
dispatch(clearFilters());

// Update sort
dispatch(setSortBy('bestSelling'));
```

>## Redux Persist Configuration

### Persisted Slices
- **auth**: User authentication state
- **adminAuth**: Admin authentication state
- **cart**: Shopping cart items and totals

### Non-Persisted Slices
- Program data (fetched fresh on load)
- Filters and sort (reset on page load)
- Loading and error states

### Configuration
```javascript
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'adminAuth', 'cart'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
```

>## Selectors

### Memoized Selectors (Reselect)
```javascript
import { createSelector } from '@reduxjs/toolkit';

// Select filtered and sorted sessions
export const selectFilteredSessions = createSelector(
  [
    (state) => state.liveSessions.data,
    (state) => state.liveSessions.filters,
    (state) => state.liveSessions.sortBy,
  ],
  (sessions, filters, sortBy) => {
    let filtered = sessions.filter(session => {
      // Apply filters
      if (filters.category && session.category !== filters.category) {
        return false;
      }
      // ... more filters
      return true;
    });
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'bestSelling') return b.purchaseCount - a.purchaseCount;
      // ... more sorting
    });
    
    return filtered;
  }
);
```

>## Best Practices

### 1. Slice Organization
- One slice per feature/domain
- Keep slices focused and cohesive
- Use folders for related slices

### 2. Async Operations
- Use createAsyncThunk for API calls
- Handle loading, success, and error states
- Use rejectWithValue for error handling

### 3. State Normalization
- Normalize nested data
- Use IDs for relationships
- Avoid deep nesting

### 4. Immutability
- Redux Toolkit uses Immer (write "mutating" code)
- Don't mutate state outside reducers
- Use spread operators for updates

### 5. Selectors
- Use memoized selectors for derived data
- Keep selectors close to slices
- Export selectors for reuse

### 6. Action Naming
- Use descriptive action names
- Follow pattern: `domain/action`
- Example: `cart/addItem`, `auth/login`

>## Debugging

### Redux DevTools
- Time-travel debugging
- Action history
- State diff viewer
- Action replay

### Logging
```javascript
// Add logger middleware (development only)
import logger from 'redux-logger';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(logger),
});
```

>## Performance Optimization

### 1. Selector Memoization
- Use createSelector for expensive computations
- Prevents unnecessary re-renders

### 2. Component Optimization
- Use React.memo for components
- Use useSelector with specific selectors
- Avoid selecting entire state

### 3. Batch Updates
- Redux batches updates automatically
- Use batch() for manual batching if needed

### 4. Lazy Loading
- Load slices only when needed
- Code split large slices

>## Testing

### Unit Tests
```javascript
import { configureStore } from '@reduxjs/toolkit';
import cartReducer, { addToCart } from './cartSlice';

test('should add item to cart', () => {
  const store = configureStore({ reducer: { cart: cartReducer } });
  
  store.dispatch(addToCart({ id: '1', title: 'Test', price: 100 }));
  
  const state = store.getState();
  expect(state.cart.items).toHaveLength(1);
  expect(state.cart.total).toBe(100);
});
```

### Integration Tests
- Test slice interactions
- Test async thunks with mock API
- Test selectors with mock state

>## Migration Notes

### From Redux to Redux Toolkit
- Replace createStore with configureStore
- Replace reducers with slices
- Replace action creators with createSlice
- Replace redux-thunk with createAsyncThunk

### Adding New Slices
1. Create slice file in appropriate folder
2. Define initial state
3. Create reducers and actions
4. Add async thunks if needed
5. Export actions and reducer
6. Add to store configuration
7. Create selectors
8. Write tests
