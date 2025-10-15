# Utils Documentation

## Overview
This folder contains utility functions and helper modules used throughout the Urban Pilgrim platform. These are pure functions that provide reusable logic for common operations.

>## Utility Files

### toast.js
**Purpose**: Toast notification wrapper

**Functions**:
```javascript
export const showSuccess = (message) => toast.success(message);
export const showError = (message) => toast.error(message);
export const showInfo = (message) => toast.info(message);
export const showWarning = (message) => toast.warning(message);
```

**Usage**:
```javascript
import { showSuccess, showError } from '../utils/toast';

showSuccess('Program added to cart!');
showError('Failed to process payment');
```

**Features**:
- Consistent notification styling
- Auto-dismiss after 3 seconds
- Position: top-right
- Mobile responsive

### couponUtils.js
**Purpose**: Coupon validation and discount calculation

**Functions**:

#### `validateCoupon(coupon, cartItems, cartSubtotal)`
Validates if a coupon can be applied to the cart

**Validation Checks**:
- Coupon is active (`isActive === true`)
- Not expired (`expirationDate > now`)
- Usage limit not exceeded (`usedCount < usageLimit`)
- Minimum order amount met (`cartSubtotal >= minOrderAmount`)
- Program type compatibility (coupon.programType matches cart items)

**Returns**:
```javascript
{
  isValid: boolean,
  error: string | null,
  discount: number
}
```

**Example**:
```javascript
import { validateCoupon } from '../utils/couponUtils';

const result = validateCoupon(coupon, cartItems, 5000);
if (result.isValid) {
  applyDiscount(result.discount);
} else {
  showError(result.error);
}
```

#### `calculateDiscount(coupon, subtotal)`
Calculates discount amount based on coupon type

**Discount Types**:
- **Percentage**: `(subtotal * discountValue) / 100`
- **Fixed**: `discountValue`

**Max Discount Cap**:
- Applies `maxDiscount` limit for percentage coupons
- Returns minimum of calculated discount and max discount

**Example**:
```javascript
// 20% off coupon with max discount of ₹1000
const discount = calculateDiscount({
  discountType: 'percentage',
  discountValue: 20,
  maxDiscount: 1000
}, 8000);
// Returns: 1000 (20% of 8000 = 1600, capped at 1000)
```

#### `checkProgramTypeCompatibility(coupon, cartItems)`
Checks if coupon applies to items in cart

**Program Type Mapping**:
- `'live'`: Live sessions only
- `'recorded'`: Recorded sessions only
- `'retreat'`: Retreat programs only
- `'guide'`: Guide services only
- `'all'`: All program types

**Returns**: `boolean`

### cartUtils.js
**Purpose**: Shopping cart helper functions

**Functions**:

#### `calculateCartTotals(items, appliedCoupon = null)`
Calculates cart subtotal, discount, and total

**Returns**:
```javascript
{
  subtotal: number,
  discount: number,
  total: number,
  itemCount: number
}
```

#### `isItemInCart(cartItems, programId, slotInfo = null)`
Checks if item already exists in cart

**Comparison**:
- Matches by `programId`
- For sessions: also matches `slotInfo.date` and `slotInfo.time`

**Returns**: `boolean`

#### `generateCartItemId(programId, slotInfo = null)`
Generates unique ID for cart item

**Format**: `${programId}_${date}_${time}` or just `${programId}`

#### `formatCartItemForCheckout(item)`
Formats cart item for payment processing

**Output**:
```javascript
{
  programId: string,
  title: string,
  price: number,
  quantity: number,
  type: string,
  slotInfo: object | null,
  subscriptionType: string | null,
  mode: string | null
}
```

#### `validateCartItem(item)`
Validates cart item structure

**Checks**:
- Required fields present
- Price is positive number
- Quantity is positive integer
- Valid program type

**Returns**: `{ isValid: boolean, errors: string[] }`

### bestSellingUtils.js
**Purpose**: Best selling program calculations

**Functions**:

#### `getTopBestSellingPrograms(liveSessions, recordedSessions, limit = 5)`
Calculates top best-selling programs across all types

**Algorithm**:
1. Combines live and recorded sessions
2. Sorts by `purchaseCount` (descending)
3. Returns top N programs

**Returns**:
```javascript
[
  {
    id: string,
    title: string,
    purchaseCount: number,
    type: 'Live' | 'Recorded',
    image: string,
    price: number
  }
]
```

**Usage**:
```javascript
import { getTopBestSellingPrograms } from '../utils/bestSellingUtils';

const topPrograms = getTopBestSellingPrograms(liveSessions, recordedSessions, 5);
// Returns top 5 best-selling programs
```

#### `calculateBestSellingRank(program, allPrograms)`
Calculates rank of a program among all programs

**Returns**: Rank number (1-based)

#### `getBestSellingByCategory(programs, category)`
Filters best-selling programs by category

**Categories**: meditation, yoga, wellness, spiritual, etc.

**Returns**: Sorted array of programs in category

#### `formatBestSellingDisplay(programs)`
Formats programs for display in UI

**Adds**:
- Rank badges
- Purchase count formatting
- Type labels
- Trending indicators

### bookingLifecycle.js
**Purpose**: Booking state management and lifecycle

**Functions**:

#### `getBookingStatus(booking)`
Determines current status of booking

**Statuses**:
- `'upcoming'`: Future booking
- `'ongoing'`: Currently happening
- `'completed'`: Past booking
- `'cancelled'`: Cancelled by user/admin

#### `canCancelBooking(booking)`
Checks if booking can be cancelled

**Rules**:
- Must be at least 24 hours before start time
- Status must be 'upcoming'
- Not already cancelled

**Returns**: `{ canCancel: boolean, reason: string | null }`

#### `calculateRefundAmount(booking, cancellationDate)`
Calculates refund based on cancellation policy

**Refund Policy**:
- 7+ days before: 100% refund
- 3-7 days before: 50% refund
- 1-3 days before: 25% refund
- < 24 hours: No refund

**Returns**: `{ refundAmount: number, refundPercentage: number }`

#### `isBookingExpired(booking)`
Checks if booking has expired

**Considers**:
- End date/time
- Grace period (2 hours after end)

**Returns**: `boolean`

#### `getUpcomingBookings(bookings)`
Filters and sorts upcoming bookings

**Sorting**: By start date (ascending)

#### `getPastBookings(bookings)`
Filters and sorts past bookings

**Sorting**: By start date (descending)

#### `groupBookingsByMonth(bookings)`
Groups bookings by month for display

**Returns**:
```javascript
{
  'January 2025': [booking1, booking2],
  'February 2025': [booking3]
}
```

### liveBookingUtils.js
**Purpose**: Live session booking utilities

**Functions**:

#### `checkSlotAvailability(slot)`
Checks if slot has available capacity

**Returns**: `{ available: boolean, remainingCapacity: number }`

#### `isSlotInPast(slotDate, slotTime)`
Checks if slot date/time has passed

**Returns**: `boolean`

#### `formatSlotDateTime(date, time)`
Formats slot date and time for display

**Output**: `"Monday, Jan 15, 2025 at 10:00 AM"`

#### `getSlotDuration(startTime, endTime)`
Calculates duration in minutes

**Returns**: `number` (minutes)

#### `canJoinLiveSession(booking, currentTime)`
Checks if user can join live session

**Rules**:
- Can join 10 minutes before start
- Can join up to 30 minutes after start
- Cannot join if session ended

**Returns**: `{ canJoin: boolean, reason: string | null }`

#### `generateMeetingLink(sessionId, userId)`
Generates unique meeting link for live session

**Returns**: Meeting URL string

#### `getSessionReminderTime(sessionStartTime)`
Calculates when to send reminder

**Default**: 1 hour before session

**Returns**: Timestamp

### subscriptionUtils.js
**Purpose**: Subscription management utilities

**Functions**:

#### `calculateSubscriptionEndDate(startDate, subscriptionType)`
Calculates subscription end date

**Subscription Types**:
- `'monthly'`: +30 days
- `'quarterly'`: +90 days
- `'yearly'`: +365 days

**Returns**: Date object

#### `isSubscriptionActive(subscription)`
Checks if subscription is currently active

**Checks**:
- Status is 'active'
- End date is in future
- Not cancelled

**Returns**: `boolean`

#### `canRenewSubscription(subscription)`
Checks if subscription can be renewed

**Rules**:
- Within 7 days of expiration
- Not already renewed
- Previous subscription completed

**Returns**: `{ canRenew: boolean, reason: string | null }`

#### `calculateProRatedRefund(subscription, cancellationDate)`
Calculates pro-rated refund for subscription

**Formula**: `(remainingDays / totalDays) * subscriptionPrice`

**Returns**: `{ refundAmount: number, remainingDays: number }`

#### `getSubscriptionBenefits(subscriptionType, mode)`
Returns list of benefits for subscription

**Example**:
```javascript
{
  monthly: {
    online: [
      'Unlimited sessions',
      'Recorded access',
      'Community forum',
      'Monthly newsletter'
    ]
  }
}
```

#### `formatSubscriptionStatus(subscription)`
Formats subscription for UI display

**Returns**:
```javascript
{
  statusText: string,
  statusColor: string,
  daysRemaining: number,
  renewalDate: Date
}
```

### userProgramUtils.js
**Purpose**: User program access and management

**Functions**:

#### `hasAccessToProgram(userId, programId, userPrograms)`
Checks if user has access to program

**Access Granted If**:
- One-time purchase
- Active subscription
- Bundle includes program
- Admin override

**Returns**: `boolean`

#### `getProgramAccessType(userId, programId, userPrograms)`
Determines type of access user has

**Types**: `'purchased'`, `'subscribed'`, `'bundle'`, `'trial'`, `'none'`

**Returns**: `string`

#### `getAccessExpiryDate(userId, programId, userPrograms)`
Gets expiry date for program access

**Returns**: `Date | null` (null for lifetime access)

#### `filterAccessiblePrograms(programs, userPrograms)`
Filters programs user has access to

**Returns**: Array of accessible programs

#### `getUserProgramProgress(userId, programId)`
Gets user's progress in program

**Returns**:
```javascript
{
  completedSessions: number,
  totalSessions: number,
  percentage: number,
  lastAccessedAt: Date
}
```

#### `markProgramComplete(userId, programId)`
Marks program as completed

**Updates**:
- Completion status
- Completion date
- Issues certificate (if applicable)

#### `getProgramCertificate(userId, programId)`
Generates completion certificate

**Returns**: Certificate URL or data

### fetchEvents.js
**Purpose**: Event fetching and aggregation utilities

**Functions**:

#### `fetchAllEvents()`
Fetches events from all sources

**Sources**:
- Live sessions
- Recorded sessions
- Retreats
- Workshops
- Guide sessions

**Returns**: Combined array of events

#### `filterEventsByDate(events, startDate, endDate)`
Filters events within date range

**Returns**: Filtered events array

#### `groupEventsByDate(events)`
Groups events by date for calendar view

**Returns**:
```javascript
{
  '2025-01-15': [event1, event2],
  '2025-01-16': [event3]
}
```

#### `getEventsForMonth(events, year, month)`
Gets all events for specific month

**Returns**: Array of events in month

#### `sortEventsByDate(events, order = 'asc')`
Sorts events by date

**Order**: `'asc'` or `'desc'`

**Returns**: Sorted array

#### `getUpcomingEvents(events, limit = 10)`
Gets next N upcoming events

**Returns**: Array of upcoming events

#### `formatEventForCalendar(event)`
Formats event for calendar display

**Returns**:
```javascript
{
  id: string,
  title: string,
  start: Date,
  end: Date,
  color: string,
  type: string
}
```

>## Utility Patterns

### Pure Functions
All utilities are pure functions:
- No side effects
- Same input → same output
- No external dependencies
- Easily testable

### Error Handling
```javascript
export const utilityFunction = (input) => {
  try {
    // Validate input
    if (!input) {
      throw new Error('Input required');
    }
    
    // Process
    const result = processInput(input);
    
    return result;
  } catch (error) {
    console.error('Utility error:', error);
    return null; // or throw
  }
};
```

### Type Checking
```javascript
export const validateType = (value, expectedType) => {
  return typeof value === expectedType;
};

export const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date);
};
```

>## Testing Utilities

### Unit Tests
```javascript
import { calculateDiscount } from './couponUtils';

test('calculates percentage discount correctly', () => {
  const coupon = {
    discountType: 'percentage',
    discountValue: 20,
    maxDiscount: null
  };
  
  const discount = calculateDiscount(coupon, 1000);
  expect(discount).toBe(200);
});
```

### Test Data Generators
```javascript
export const generateMockCoupon = (overrides = {}) => {
  return {
    code: 'TEST20',
    discountType: 'percentage',
    discountValue: 20,
    isActive: true,
    expirationDate: new Date(Date.now() + 86400000),
    usageLimit: 100,
    usedCount: 0,
    minOrderAmount: 0,
    maxDiscount: null,
    programType: 'all',
    ...overrides
  };
};
```

>## Best Practices

1. **Pure Functions**: Keep utilities pure and side-effect free
2. **Single Responsibility**: Each function does one thing well
3. **Descriptive Names**: Function names clearly describe what they do
4. **Input Validation**: Always validate inputs
5. **Error Handling**: Handle errors gracefully
6. **Documentation**: Document complex logic
7. **Type Safety**: Use TypeScript or JSDoc for type hints
8. **Testing**: Write unit tests for all utilities
9. **Performance**: Optimize for common use cases
10. **Reusability**: Design for reuse across components

>## Performance Considerations

### Memoization
```javascript
const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

export const expensiveCalculation = memoize((input) => {
  // Complex calculation
  return result;
});
```

### Debouncing
```javascript
export const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};
```

### Throttling
```javascript
export const throttle = (fn, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
```
