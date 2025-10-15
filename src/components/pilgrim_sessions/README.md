# Pilgrim Sessions Components Documentation

## Overview
This folder contains components for displaying and managing session programs (both live and recorded) on the Urban Pilgrim platform.

## Components

### SessionCard.jsx
**Purpose**: Display session program in card format

**Features**:
- **Program Image**: Thumbnail with hover effect
- **Title & Description**: Program details
- **Instructor Info**: Instructor name and photo
- **Price Display**: Pricing with subscription options
- **Rating**: Star rating and review count
- **Category Badge**: Program category tag
- **Duration**: Session duration display
- **CTA Button**: "Book Now" or "View Details"
- **Listing Type Badge**: "Own" or "Listing" indicator

**Card Structure**:
```javascript
<div className="session-card">
  <div className="card-image">
    <img src={session.image} alt={session.title} />
    <span className="category-badge">{session.category}</span>
    <span className="listing-badge">{session.listingType}</span>
  </div>
  
  <div className="card-content">
    <h3>{session.title}</h3>
    <p className="description">{session.description}</p>
    
    <div className="instructor">
      <img src={session.instructor.photo} />
      <span>{session.instructor.name}</span>
    </div>
    
    <div className="rating">
      <StarRating value={session.rating} />
      <span>({session.reviewCount} reviews)</span>
    </div>
    
    <div className="details">
      <span className="duration">⏱ {session.duration} min</span>
      <span className="mode">{session.mode}</span>
    </div>
    
    <div className="card-footer">
      <div className="price">₹{session.price}</div>
      <button onClick={handleBookNow}>Book Now</button>
    </div>
  </div>
</div>
```

### LiveSessionCard.jsx
**Purpose**: Specialized card for live sessions

**Additional Features**:
- **Next Session Date**: Upcoming session date/time
- **Available Slots**: Remaining capacity
- **Live Badge**: Indicates live session
- **Subscription Options**: Monthly, quarterly, one-time
- **Mode Toggle**: Online/Offline indicator

**Live-Specific Data**:
```javascript
{
  nextSession: {
    date: '2025-01-20',
    time: '10:00 AM',
    duration: 60
  },
  availableSlots: 15,
  totalCapacity: 30,
  subscriptionTypes: ['monthly', 'quarterly', 'oneTime'],
  mode: 'online' | 'offline'
}
```

### RecordedSessionCard.jsx
**Purpose**: Specialized card for recorded sessions

**Additional Features**:
- **Video Duration**: Total video length
- **Access Type**: Lifetime or subscription
- **Preview Button**: Watch trailer
- **Download Option**: Offline viewing availability
- **Completion Status**: Progress bar for enrolled users

**Recorded-Specific Data**:
```javascript
{
  videoDuration: 3600, // seconds
  accessType: 'lifetime' | 'subscription',
  hasPreview: true,
  previewUrl: string,
  downloadable: boolean,
  completionPercentage: 45 // for enrolled users
}
```

### SessionDetails.jsx
**Purpose**: Detailed view of session program

**Sections**:
1. **Hero Section**: Large image, title, instructor
2. **Overview**: Description, learning outcomes
3. **Schedule**: Available dates and times (live) or access info (recorded)
4. **Instructor Bio**: Detailed instructor information
5. **Curriculum**: Session outline and topics
6. **Reviews**: User reviews and ratings
7. **FAQ**: Common questions
8. **Related Sessions**: Similar programs
9. **Booking Section**: Price and booking options

**Details Structure**:
```javascript
<div className="session-details">
  <HeroSection session={session} />
  
  <div className="details-grid">
    <div className="main-content">
      <Overview />
      <Curriculum />
      <InstructorBio />
      <Reviews />
      <FAQ />
    </div>
    
    <div className="sidebar">
      <BookingCard />
      <SessionInfo />
      <RelatedSessions />
    </div>
  </div>
</div>
```

### SessionFilter.jsx
**Purpose**: Filter and sort sessions

**Filter Options**:
- **Category**: Meditation, Yoga, Wellness, etc.
- **Type**: Live, Recorded, or Both
- **Price Range**: Min-Max slider
- **Duration**: Session length
- **Mode**: Online, Offline, or Both
- **Instructor**: Filter by instructor
- **Rating**: Minimum rating
- **Subscription Type**: Monthly, quarterly, one-time
- **Date**: Available dates (for live sessions)

**Filter State**:
```javascript
const [filters, setFilters] = useState({
  category: 'all',
  type: 'all', // live, recorded, all
  priceRange: [0, 10000],
  duration: 'all',
  mode: 'all',
  instructor: 'all',
  minRating: 0,
  subscriptionType: 'all',
  dateRange: null
});
```

### SessionBooking.jsx
**Purpose**: Booking interface for sessions

**Live Session Booking**:
- **Date Selection**: Calendar view
- **Time Slot Selection**: Available time slots
- **Subscription Choice**: Monthly, quarterly, one-time
- **Mode Selection**: Online or offline
- **Participant Count**: Number of seats
- **Total Calculation**: Real-time price calculation

**Recorded Session Booking**:
- **Access Type**: Lifetime or subscription
- **Subscription Duration**: Monthly, quarterly
- **Instant Access**: Immediate video access
- **Download Rights**: Optional download permission

**Booking Flow**:
```javascript
const handleBooking = async () => {
  try {
    // Validate selection
    if (!selectedSlot && sessionType === 'live') {
      toast.error('Please select a time slot');
      return;
    }
    
    // Add to cart
    dispatch(addToCart({
      programId: session.id,
      title: session.title,
      image: session.image,
      price: calculatePrice(),
      type: sessionType,
      slotInfo: selectedSlot,
      subscriptionType: selectedSubscription,
      mode: selectedMode
    }));
    
    toast.success('Added to cart!');
    navigate('/cart');
  } catch (error) {
    toast.error('Booking failed');
  }
};
```

### SessionCalendar.jsx
**Purpose**: Calendar view for live session schedules

**Features**:
- **Month View**: Calendar grid
- **Date Highlighting**: Dates with available sessions
- **Slot Count**: Number of slots per date
- **Quick Booking**: Click date to view slots
- **Navigation**: Previous/Next month
- **Today Highlight**: Current date indicator

**Calendar Implementation**:
```javascript
<Calendar
  value={selectedDate}
  onChange={setSelectedDate}
  tileContent={({ date }) => {
    const slots = getSlotsByDate(date);
    return slots.length > 0 ? (
      <div className="slot-indicator">
        {slots.length} slots
      </div>
    ) : null;
  }}
  tileClassName={({ date }) => {
    const slots = getSlotsByDate(date);
    return slots.length > 0 ? 'has-slots' : 'no-slots';
  }}
/>
```

### SessionReviews.jsx
**Purpose**: Display and submit session reviews

**Features**:
- **Review List**: All user reviews
- **Star Rating**: 1-5 star display
- **Verified Badge**: Verified purchase indicator
- **Helpful Votes**: Upvote/downvote reviews
- **Sort Options**: Most recent, highest rated, most helpful
- **Filter**: Filter by rating
- **Submit Review**: Add new review (enrolled users only)
- **Edit/Delete**: Manage own reviews

**Review Structure**:
```javascript
{
  id: string,
  userId: string,
  userName: string,
  userPhoto: string,
  rating: number,
  title: string,
  comment: string,
  images: string[],
  verifiedPurchase: boolean,
  helpful: number,
  notHelpful: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### SessionInstructor.jsx
**Purpose**: Display instructor information

**Features**:
- **Profile Photo**: Instructor image
- **Bio**: Detailed background
- **Credentials**: Certifications and qualifications
- **Experience**: Years of experience
- **Specializations**: Areas of expertise
- **Other Sessions**: Instructor's other programs
- **Social Links**: Social media profiles
- **Contact**: Message instructor option

### SessionCurriculum.jsx
**Purpose**: Display session curriculum/outline

**Features**:
- **Module List**: Expandable modules
- **Topics**: Topics covered in each module
- **Duration**: Time per module
- **Resources**: Downloadable materials
- **Prerequisites**: Required knowledge
- **Learning Outcomes**: What students will learn

**Curriculum Structure**:
```javascript
{
  modules: [
    {
      id: string,
      title: string,
      duration: number,
      topics: [
        {
          title: string,
          description: string,
          resources: string[]
        }
      ]
    }
  ],
  totalDuration: number,
  prerequisites: string[],
  learningOutcomes: string[]
}
```

### SessionSubscription.jsx
**Purpose**: Subscription management for sessions

**Features**:
- **Subscription Plans**: Monthly, quarterly comparison
- **Benefits List**: What's included
- **Price Comparison**: Save percentage display
- **Auto-renewal**: Toggle auto-renewal
- **Cancel Subscription**: Cancellation interface
- **Upgrade/Downgrade**: Change plan options

**Subscription Plans**:
```javascript
const plans = [
  {
    type: 'monthly',
    price: 999,
    duration: '1 month',
    benefits: [
      'Unlimited live sessions',
      'Access to recorded sessions',
      'Community forum access',
      'Monthly newsletter'
    ],
    savings: 0
  },
  {
    type: 'quarterly',
    price: 2499,
    duration: '3 months',
    benefits: [
      'All monthly benefits',
      '1 free workshop',
      'Priority support',
      'Exclusive content'
    ],
    savings: 15
  }
];
```

### SessionProgress.jsx
**Purpose**: Track user progress in sessions

**Features**:
- **Progress Bar**: Completion percentage
- **Completed Sessions**: List of attended sessions
- **Upcoming Sessions**: Next scheduled sessions
- **Certificates**: Completion certificates
- **Stats**: Total hours, sessions attended
- **Achievements**: Milestones and badges

### SessionSearch.jsx
**Purpose**: Search sessions with autocomplete

**Features**:
- **Instant Search**: Real-time results
- **Autocomplete**: Suggestions as you type
- **Recent Searches**: Show recent queries
- **Popular Searches**: Trending searches
- **Category Suggestions**: Suggest categories
- **Clear History**: Clear search history

## Styling Patterns

### Card Hover Effects
```css
.session-card {
  @apply transition-all duration-300;
  @apply hover:shadow-xl hover:-translate-y-1;
}

.session-card:hover .card-image img {
  @apply scale-110;
}
```

### Responsive Grid
```css
.sessions-grid {
  @apply grid gap-6;
  @apply grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4;
}
```

### Price Display
```css
.price {
  @apply text-2xl font-bold text-blue-600;
}

.price-original {
  @apply text-lg text-gray-400 line-through;
}

.price-discount {
  @apply text-sm text-green-600 font-semibold;
}
```

## Best Practices

1. **Performance**: Lazy load images and components
2. **Caching**: Cache session data in Redux
3. **Filtering**: Debounce filter changes
4. **Pagination**: Implement infinite scroll or pagination
5. **SEO**: Use semantic HTML and meta tags
6. **Accessibility**: ARIA labels and keyboard navigation
7. **Mobile**: Touch-friendly interfaces
8. **Error Handling**: Graceful error states
9. **Loading States**: Skeleton screens
10. **Analytics**: Track user interactions

## Future Enhancements

- Live session reminders
- Session recommendations
- Wishlist functionality
- Compare sessions
- Session bundles
- Group bookings
- Waitlist for full sessions
- Session recordings download
