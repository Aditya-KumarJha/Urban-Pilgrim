# Custom Hooks Documentation

## Overview
This folder contains custom React hooks that encapsulate reusable logic and stateful behavior across the Urban Pilgrim platform.

>## Hooks

### useBestSellingFilter.js
**Purpose**: Hook for managing best-selling program filtering and sorting

**Usage**:
```javascript
import useBestSellingFilter from '../hooks/useBestSellingFilter';

function SessionsPage() {
  const {
    bestSellingPrograms,
    isLoading,
    applyBestSellingFilter,
    clearBestSellingFilter
  } = useBestSellingFilter(liveSessions, recordedSessions);
  
  return (
    <div>
      {bestSellingPrograms.map(program => (
        <ProgramCard key={program.id} program={program} />
      ))}
    </div>
  );
}
```

**Returns**:
```javascript
{
  bestSellingPrograms: array,    // Top best-selling programs
  isLoading: boolean,            // Loading state
  applyBestSellingFilter: fn,    // Apply filter function
  clearBestSellingFilter: fn     // Clear filter function
}
```

**Features**:
- Combines live and recorded sessions
- Sorts by purchase count
- Configurable limit (default: 5)
- Memoized for performance
- Auto-updates when data changes

**Internal Logic**:
1. Fetches live and recorded sessions from Redux
2. Combines and sorts by `purchaseCount`
3. Returns top N programs
4. Memoizes result to prevent unnecessary recalculations

**Dependencies**:
- Redux store (live and recorded sessions)
- `bestSellingUtils.js` for calculation logic

### useSubscriptionStatus.js
**Purpose**: Hook for managing user subscription status and access

**Usage**:
```javascript
import useSubscriptionStatus from '../hooks/useSubscriptionStatus';

function ProgramAccess({ programId }) {
  const {
    hasAccess,
    subscriptionType,
    expiryDate,
    daysRemaining,
    canRenew,
    isLoading,
    checkAccess,
    renewSubscription
  } = useSubscriptionStatus(programId);
  
  if (!hasAccess) {
    return <PurchasePrompt />;
  }
  
  return (
    <div>
      <ProgramContent />
      {canRenew && (
        <button onClick={renewSubscription}>
          Renew Subscription
        </button>
      )}
    </div>
  );
}
```

**Returns**:
```javascript
{
  hasAccess: boolean,              // User has access to program
  subscriptionType: string | null, // 'monthly' | 'quarterly' | 'oneTime'
  expiryDate: Date | null,         // Subscription expiry date
  daysRemaining: number,           // Days until expiry
  canRenew: boolean,               // Can renew subscription
  isLoading: boolean,              // Loading state
  checkAccess: fn,                 // Manually check access
  renewSubscription: fn            // Renew subscription function
}
```

**Features**:
- Real-time subscription status
- Access validation
- Expiry tracking
- Renewal eligibility
- Auto-refresh on data changes

**Access Types Checked**:
1. **One-time Purchase**: Lifetime access
2. **Active Subscription**: Access until expiry
3. **Bundle Access**: Access through bundle purchase
4. **Trial Access**: Limited-time trial

**Internal Logic**:
1. Fetches user programs from Redux
2. Checks if program exists in user's purchases
3. Validates subscription status and expiry
4. Calculates days remaining
5. Determines renewal eligibility

**Renewal Rules**:
- Can renew within 7 days of expiration
- Cannot renew if already renewed
- Must complete previous subscription period

**Dependencies**:
- Redux store (user programs)
- `subscriptionUtils.js` for calculations
- Firebase for subscription data

>## Custom Hook Patterns

### Basic Hook Structure
```javascript
import { useState, useEffect } from 'react';

export default function useCustomHook(dependencies) {
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Effect logic
    fetchData();
  }, [dependencies]);
  
  const customFunction = () => {
    // Custom logic
  };
  
  return {
    state,
    loading,
    error,
    customFunction
  };
}
```

### Hook with Cleanup
```javascript
export default function useSubscription(topic) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const unsubscribe = subscribeToTopic(topic, setData);
    
    // Cleanup function
    return () => {
      unsubscribe();
    };
  }, [topic]);
  
  return data;
}
```

### Hook with Memoization
```javascript
import { useMemo } from 'react';

export default function useFilteredData(data, filters) {
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Apply filters
      return matchesFilters(item, filters);
    });
  }, [data, filters]);
  
  return filteredData;
}
```

>## Potential Additional Hooks

### useAuth
**Purpose**: Authentication state management
```javascript
const { user, isAuthenticated, login, logout } = useAuth();
```

### useCart
**Purpose**: Shopping cart operations
```javascript
const { items, total, addItem, removeItem, clearCart } = useCart();
```

### useDebounce
**Purpose**: Debounce value changes
```javascript
const debouncedValue = useDebounce(value, 500);
```

### useLocalStorage
**Purpose**: Sync state with localStorage
```javascript
const [value, setValue] = useLocalStorage('key', defaultValue);
```

### useWindowSize
**Purpose**: Track window dimensions
```javascript
const { width, height } = useWindowSize();
```

### useIntersectionObserver
**Purpose**: Detect element visibility
```javascript
const [ref, isVisible] = useIntersectionObserver();
```

### usePagination
**Purpose**: Pagination logic
```javascript
const {
  currentPage,
  totalPages,
  nextPage,
  prevPage,
  goToPage
} = usePagination(data, itemsPerPage);
```

### useForm
**Purpose**: Form state management
```javascript
const {
  values,
  errors,
  handleChange,
  handleSubmit,
  reset
} = useForm(initialValues, validationSchema);
```

>## Best Practices

### 1. Naming Convention
- Prefix with `use` (React convention)
- Descriptive names: `useSubscriptionStatus` not `useStatus`
- Verb-based for actions: `useFetchData` not `useData`

### 2. Dependencies
- Include all dependencies in useEffect
- Use ESLint exhaustive-deps rule
- Memoize callbacks with useCallback

### 3. Return Values
- Return object for multiple values
- Consistent return structure
- Include loading and error states

### 4. Performance
- Use useMemo for expensive calculations
- Use useCallback for function memoization
- Avoid unnecessary re-renders

### 5. Error Handling
```javascript
export default function useData(id) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchData(id)
      .then(setData)
      .catch(setError);
  }, [id]);
  
  return { data, error };
}
```

### 6. Cleanup
```javascript
useEffect(() => {
  const subscription = subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### 7. TypeScript Support
```typescript
interface UseSubscriptionReturn {
  hasAccess: boolean;
  subscriptionType: string | null;
  expiryDate: Date | null;
  daysRemaining: number;
}

export default function useSubscriptionStatus(
  programId: string
): UseSubscriptionReturn {
  // Hook implementation
}
```

>## Testing Custom Hooks

### Using @testing-library/react-hooks
```javascript
import { renderHook, act } from '@testing-library/react-hooks';
import useBestSellingFilter from './useBestSellingFilter';

test('returns best selling programs', () => {
  const { result } = renderHook(() => 
    useBestSellingFilter(mockLiveSessions, mockRecordedSessions)
  );
  
  expect(result.current.bestSellingPrograms).toHaveLength(5);
});

test('applies filter correctly', () => {
  const { result } = renderHook(() => 
    useBestSellingFilter(mockLiveSessions, mockRecordedSessions)
  );
  
  act(() => {
    result.current.applyBestSellingFilter();
  });
  
  expect(result.current.bestSellingPrograms[0].purchaseCount).toBeGreaterThan(0);
});
```

>## Hook Composition

### Combining Multiple Hooks
```javascript
function useProgramAccess(programId) {
  const { user } = useAuth();
  const { hasAccess } = useSubscriptionStatus(programId);
  const { addToCart } = useCart();
  
  const purchaseProgram = () => {
    if (!user) {
      // Show login
      return;
    }
    
    if (hasAccess) {
      // Already has access
      return;
    }
    
    addToCart(programId);
  };
  
  return { hasAccess, purchaseProgram };
}
```

>## Performance Optimization

### Memoization
```javascript
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
```

### Callback Memoization
```javascript
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

### Avoiding Unnecessary Effects
```javascript
// Bad: Runs on every render
useEffect(() => {
  fetchData();
});

// Good: Runs only when id changes
useEffect(() => {
  fetchData(id);
}, [id]);
```

>## Common Pitfalls

### 1. Missing Dependencies
```javascript
// Bad
useEffect(() => {
  fetchData(id);
}, []); // Missing 'id' dependency

// Good
useEffect(() => {
  fetchData(id);
}, [id]);
```

### 2. Stale Closures
```javascript
// Bad
const handleClick = () => {
  console.log(count); // May log stale value
};

// Good
const handleClick = useCallback(() => {
  console.log(count);
}, [count]);
```

### 3. Infinite Loops
```javascript
// Bad: Causes infinite loop
useEffect(() => {
  setData(fetchData());
}, [data]); // data changes trigger effect

// Good
useEffect(() => {
  fetchData().then(setData);
}, []); // Run once
```

>## Documentation Template

```javascript
/**
 * Custom hook for [purpose]
 * 
 * @param {type} param1 - Description
 * @param {type} param2 - Description
 * @returns {Object} Hook return values
 * @returns {type} returns.value1 - Description
 * @returns {type} returns.value2 - Description
 * 
 * @example
 * const { value1, value2 } = useCustomHook(param1, param2);
 */
export default function useCustomHook(param1, param2) {
  // Implementation
}
```
