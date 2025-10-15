# Sessions Components Documentation

## Overview
This folder contains components specific to the sessions page, including filtering, sorting, and display logic for both live and recorded sessions.

## Components

### SessionsPage.jsx
**Purpose**: Main sessions page container

**Features**:
- **Combined View**: Live and recorded sessions
- **Filter Sidebar**: Advanced filtering options
- **Sort Options**: Multiple sorting criteria
- **Grid/List Toggle**: View mode switching
- **Pagination**: Page navigation
- **Search**: Session search
- **Best Selling**: Dynamic best selling display

**Page Structure**:
```javascript
<div className="sessions-page">
  <PageHeader />
  
  <div className="page-content">
    <FilterSidebar
      filters={filters}
      onFilterChange={handleFilterChange}
    />
    
    <div className="main-content">
      <div className="toolbar">
        <SearchBar onSearch={handleSearch} />
        <SortDropdown value={sortBy} onChange={setSortBy} />
        <ViewToggle view={view} onChange={setView} />
        <BestSellingButton />
      </div>
      
      <SessionsGrid
        sessions={filteredSessions}
        view={view}
      />
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  </div>
</div>
```

### FilterSidebar.jsx
**Purpose**: Comprehensive filtering interface

**Filter Categories**:
- **Type**: Live, Recorded, Both
- **Category**: Yoga, Meditation, Wellness, etc.
- **Price Range**: Min-Max slider
- **Duration**: Session length
- **Mode**: Online, Offline
- **Instructor**: Filter by instructor
- **Rating**: Minimum rating
- **Subscription**: Monthly, Quarterly, One-time
- **Date**: Available dates (live sessions)
- **Language**: Session language

**Filter State**:
```javascript
const [filters, setFilters] = useState({
  type: 'all', // live, recorded, all
  category: [],
  priceRange: [0, 10000],
  duration: 'all',
  mode: 'all',
  instructor: 'all',
  minRating: 0,
  subscriptionType: 'all',
  dateRange: null,
  language: 'all'
});
```

### BestSellingButton.jsx
**Purpose**: Dynamic best selling programs dropdown

**Features**:
- **Count Display**: Shows number of best sellers
- **Dropdown**: Top 5 programs
- **Ranking**: Numbered ranking
- **Purchase Count**: Shows purchase numbers
- **Type Badge**: Live/Recorded indicator
- **Click Outside**: Close on outside click

**Component Implementation**:
```javascript
const BestSellingButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const liveSessions = useSelector(state => state.liveSessions.data);
  const recordedSessions = useSelector(state => state.recordedSessions.data);
  
  const bestSelling = getTopBestSellingPrograms(
    [...liveSessions, ...recordedSessions],
    5
  );
  
  return (
    <div className="best-selling-dropdown">
      <button onClick={() => setIsOpen(!isOpen)}>
        Sort By: Best Selling ({bestSelling.length})
        <FaChevronDown className={isOpen ? 'rotate-180' : ''} />
      </button>
      
      {isOpen && (
        <div className="dropdown-menu">
          {bestSelling.map((program, index) => (
            <div key={program.id} className="dropdown-item">
              <span className="rank">#{index + 1}</span>
              <div className="program-info">
                <span className="title">{program.title}</span>
                <span className="purchases">
                  {program.purchaseCount} purchases
                </span>
              </div>
              <span className="type-badge">{program.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### SessionsGrid.jsx
**Purpose**: Display sessions in grid or list view

**View Modes**:
- **Grid**: Card-based grid layout
- **List**: Detailed list view

**Grid Component**:
```javascript
<div className={`sessions-container ${view}`}>
  {sessions.map(session => (
    view === 'grid' ? (
      <SessionCard key={session.id} session={session} />
    ) : (
      <SessionListItem key={session.id} session={session} />
    )
  ))}
</div>
```

### SessionListItem.jsx
**Purpose**: List view item for sessions

**Features**:
- **Horizontal Layout**: Image left, details right
- **More Details**: Additional information visible
- **Quick Actions**: Book, favorite, share buttons
- **Expandable**: Show/hide full description

### SortDropdown.jsx
**Purpose**: Sort sessions by various criteria

**Sort Options**:
```javascript
const sortOptions = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'bestSelling', label: 'Best Selling' }
];
```

### ViewToggle.jsx
**Purpose**: Switch between grid and list views

**Component**:
```javascript
<div className="view-toggle">
  <button
    className={view === 'grid' ? 'active' : ''}
    onClick={() => onChange('grid')}
  >
    <FaThLarge /> Grid
  </button>
  <button
    className={view === 'list' ? 'active' : ''}
    onClick={() => onChange('list')}
  >
    <FaList /> List
  </button>
</div>
```

## Redux Integration

### Sessions State
```javascript
// liveSessions slice
{
  data: [],
  loading: false,
  error: null,
  filters: {},
  sortBy: 'relevance'
}

// recordedSessions slice
{
  data: [],
  loading: false,
  error: null,
  filters: {},
  sortBy: 'relevance'
}
```

### Actions
```javascript
// Fetch sessions
dispatch(fetchLiveSessions());
dispatch(fetchRecordedSessions());

// Apply filters
dispatch(setFilters(filters));

// Sort sessions
dispatch(setSortBy('price-low'));
```

## Utility Functions

### getTopBestSellingPrograms
```javascript
export const getTopBestSellingPrograms = (programs, limit = 5) => {
  return programs
    .filter(p => p.purchaseCount > 0)
    .sort((a, b) => b.purchaseCount - a.purchaseCount)
    .slice(0, limit)
    .map((p, index) => ({
      ...p,
      rank: index + 1
    }));
};
```

### filterSessions
```javascript
export const filterSessions = (sessions, filters) => {
  return sessions.filter(session => {
    // Type filter
    if (filters.type !== 'all' && session.type !== filters.type) {
      return false;
    }
    
    // Category filter
    if (filters.category.length > 0 && 
        !filters.category.includes(session.category)) {
      return false;
    }
    
    // Price range filter
    if (session.price < filters.priceRange[0] || 
        session.price > filters.priceRange[1]) {
      return false;
    }
    
    // Rating filter
    if (session.rating < filters.minRating) {
      return false;
    }
    
    return true;
  });
};
```

### sortSessions
```javascript
export const sortSessions = (sessions, sortBy) => {
  const sorted = [...sessions];
  
  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'newest':
      return sorted.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
    case 'popular':
      return sorted.sort((a, b) => b.viewCount - a.viewCount);
    case 'bestSelling':
      return sorted.sort((a, b) => b.purchaseCount - a.purchaseCount);
    default:
      return sorted;
  }
};
```

## Styling Patterns

### Grid View
```css
.sessions-container.grid {
  @apply grid gap-6;
  @apply grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4;
}
```

### List View
```css
.sessions-container.list {
  @apply flex flex-col gap-4;
}

.session-list-item {
  @apply flex gap-4 bg-white rounded-lg shadow-md p-4;
  @apply hover:shadow-lg transition-shadow;
}
```

## Best Practices

1. **Performance**: Virtualize long lists
2. **Caching**: Cache filter results
3. **Debouncing**: Debounce search and filters
4. **Loading States**: Show skeletons
5. **Error Handling**: Graceful error states
6. **Accessibility**: Keyboard navigation
7. **Mobile**: Touch-friendly filters
8. **SEO**: Server-side rendering
9. **Analytics**: Track filter usage
10. **Persistence**: Save filter preferences

## Future Enhancements

- Saved searches
- Filter presets
- Advanced search
- Comparison tool
- Wishlist integration
- Recently viewed
- Personalized recommendations
- AI-powered suggestions
