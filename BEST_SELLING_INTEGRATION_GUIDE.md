# Best Selling Feature Integration Guide

## Overview
The best selling feature has been implemented across all filter bars (pilgrim guides, retreats, and sessions) with complete tracking and badge systems.

## Files Created/Modified

### 1. Core Utilities
- `src/utils/bestSellingUtils.js` - Core best selling logic and calculations
- `src/hooks/useBestSellingFilter.js` - React hook for filtering and processing
- `src/components/ui/BestSellingBadge.jsx` - Reusable badge component

### 2. Updated Filter Bars
- `src/components/pilgrim_guides/FilterBar.jsx` - Added best selling toggle
- `src/components/pilgrim_retreats/FilterBar.jsx` - Added best selling toggle  
- `src/components/pilgrim_sessions/FilterBar.jsx` - Added best selling toggle

## How to Use

### 1. In Your Program Pages
```jsx
import { useBestSellingFilter } from '../hooks/useBestSellingFilter';
import BestSellingBadge from '../components/ui/BestSellingBadge';

function ProgramsPage() {
  const [filters, setFilters] = useState({});
  const { programs, stats } = useBestSellingFilter(rawPrograms, filters);
  
  return (
    <div>
      <FilterBar onFiltersChange={setFilters} />
      {programs.map(program => (
        <div key={program.id}>
          <BestSellingBadge program={program} />
          {/* Your program card content */}
        </div>
      ))}
    </div>
  );
}
```

### 2. Badge Usage
```jsx
// Default badge
<BestSellingBadge program={program} />

// Small badge
<BestSellingBadge program={program} size="small" />

// Custom styling
<BestSellingBadge program={program} className="absolute top-2 right-2" />
```

## Badge Types
- **Top Seller** (50+ purchases): 🏆 Gold gradient
- **Best Seller** (20+ purchases): ⭐ Green-blue gradient  
- **Popular** (5+ purchases): 🔥 Blue-purple gradient

## Filter Integration
The filter bars now include a "🏆 Best Selling" toggle button that:
- Shows yellow styling when active
- Filters to show only best selling programs
- Displays in active filters with special styling
- Can be cleared individually or with "Clear All"

## Backend Integration
The system automatically tracks purchase counts from:
- `purchasedUsers` arrays in program objects
- Nested slide structures for sessions
- Various card structures (liveSessionCard, recordedProgramCard, etc.)

## Customization
- Adjust threshold in `useBestSellingFilter(programs, filters, threshold)`
- Modify badge styles in `bestSellingUtils.js` `getBestSellingBadge()`
- Change filter button styling in FilterBar components

The system is fully integrated and ready to use across all program types!
