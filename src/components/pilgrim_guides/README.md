# Pilgrim Guides Components Documentation

## Overview
This folder contains components for displaying and managing pilgrim guide services, including guide profiles, availability, and booking interfaces with nested slot structure.

## Components

### GuideCard.jsx
**Purpose**: Display guide service in card format

**Features**:
- **Guide Photo**: Professional profile image
- **Name & Title**: Guide name and specialization
- **Rating**: Star rating and review count
- **Languages**: Languages spoken
- **Experience**: Years of experience
- **Specializations**: Areas of expertise
- **Availability**: Next available slot
- **Pricing**: Starting price
- **Listing Type**: "Listing" badge (disabled, cannot be modified)
- **Mode Options**: Online/Offline indicators

**Card Structure**:
```javascript
<div className="guide-card">
  <div className="card-header">
    <img src={guide.image} alt={guide.name} className="guide-photo" />
    <span className="listing-badge">Listing</span>
  </div>
  
  <div className="card-content">
    <h3>{guide.name}</h3>
    <p className="specialization">{guide.specialization}</p>
    
    <div className="rating">
      <StarRating value={guide.rating} />
      <span>({guide.reviewCount} reviews)</span>
    </div>
    
    <div className="guide-info">
      <div className="info-item">
        <FaLanguage />
        <span>{guide.languages.join(', ')}</span>
      </div>
      <div className="info-item">
        <FaBriefcase />
        <span>{guide.experience} years experience</span>
      </div>
    </div>
    
    <div className="specializations">
      {guide.specializations.map(spec => (
        <span key={spec} className="spec-badge">{spec}</span>
      ))}
    </div>
    
    <div className="availability">
      <FaClock />
      <span>Next available: {guide.nextAvailable}</span>
    </div>
    
    <div className="card-footer">
      <div className="price">
        <span>From ₹{guide.startingPrice}</span>
        <span className="per-session">/session</span>
      </div>
      <button onClick={handleViewProfile}>View Profile</button>
    </div>
  </div>
</div>
```

### GuideProfile.jsx
**Purpose**: Comprehensive guide profile page

**Sections**:
1. **Hero Section**: Large photo, name, title
2. **About**: Detailed bio and background
3. **Credentials**: Certifications and qualifications
4. **Specializations**: Areas of expertise
5. **Languages**: Languages spoken
6. **Experience**: Professional experience
7. **Availability Calendar**: Booking calendar
8. **Subscription Options**: Monthly, quarterly, one-time
9. **Reviews**: Client reviews and ratings
10. **Gallery**: Photos and videos
11. **FAQ**: Common questions
12. **Booking Section**: Book session interface

**Profile Structure**:
```javascript
<div className="guide-profile">
  <GuideHero guide={guide} />
  
  <div className="profile-container">
    <div className="main-content">
      <AboutSection />
      <CredentialsSection />
      <SpecializationsSection />
      <ReviewsSection />
      <GallerySection />
      <FAQSection />
    </div>
    
    <div className="booking-sidebar">
      <AvailabilityCalendar />
      <SubscriptionOptions />
      <BookingCard />
    </div>
  </div>
</div>
```

### GuideAvailability.jsx
**Purpose**: Display and manage guide availability with nested slot structure

**Nested Slot Structure**:
```javascript
{
  online: {
    monthly: {
      slots: [
        {
          date: '2025-01-20',
          time: '10:00 AM',
          duration: 60,
          capacity: 5,
          booked: 2,
          price: 999
        }
      ]
    },
    quarterly: {
      slots: []
    },
    oneTime: {
      slots: []
    }
  },
  offline: {
    monthly: {
      slots: []
    },
    quarterly: {
      slots: []
    },
    oneTime: {
      slots: []
    }
  }
}
```

**Features**:
- **Mode Selection**: Toggle between online/offline
- **Subscription Type**: Monthly, quarterly, one-time tabs
- **Calendar View**: Month view with available dates
- **Slot Display**: Time slots for selected date
- **Capacity Indicator**: Available spots
- **Price Display**: Per-slot pricing
- **Multi-slot Booking**: Book multiple slots

**Availability Component**:
```javascript
const GuideAvailability = ({ guide }) => {
  const [selectedMode, setSelectedMode] = useState('online');
  const [selectedSubscription, setSelectedSubscription] = useState('monthly');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  
  const availableSlots = guide[selectedMode][selectedSubscription].slots;
  const slotsForDate = availableSlots.filter(
    slot => slot.date === selectedDate
  );
  
  return (
    <div className="guide-availability">
      {/* Mode Toggle */}
      <div className="mode-toggle">
        <button
          className={selectedMode === 'online' ? 'active' : ''}
          onClick={() => setSelectedMode('online')}
        >
          Online
        </button>
        <button
          className={selectedMode === 'offline' ? 'active' : ''}
          onClick={() => setSelectedMode('offline')}
        >
          Offline
        </button>
      </div>
      
      {/* Subscription Type Tabs */}
      <div className="subscription-tabs">
        <button
          className={selectedSubscription === 'monthly' ? 'active' : ''}
          onClick={() => setSelectedSubscription('monthly')}
        >
          Monthly
        </button>
        <button
          className={selectedSubscription === 'quarterly' ? 'active' : ''}
          onClick={() => setSelectedSubscription('quarterly')}
        >
          Quarterly
        </button>
        <button
          className={selectedSubscription === 'oneTime' ? 'active' : ''}
          onClick={() => setSelectedSubscription('oneTime')}
        >
          One-Time
        </button>
      </div>
      
      {/* Calendar */}
      <Calendar
        value={selectedDate}
        onChange={setSelectedDate}
        tileClassName={({ date }) => {
          const hasSlots = availableSlots.some(
            slot => slot.date === formatDate(date)
          );
          return hasSlots ? 'has-slots' : '';
        }}
      />
      
      {/* Time Slots */}
      {selectedDate && (
        <div className="time-slots">
          <h3>Available Slots for {selectedDate}</h3>
          <div className="slots-grid">
            {slotsForDate.map(slot => (
              <div
                key={slot.time}
                className={`slot ${selectedSlots.includes(slot) ? 'selected' : ''}`}
                onClick={() => handleSlotSelect(slot)}
              >
                <div className="slot-time">{slot.time}</div>
                <div className="slot-duration">{slot.duration} min</div>
                <div className="slot-capacity">
                  {slot.capacity - slot.booked} spots left
                </div>
                <div className="slot-price">₹{slot.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Booking Summary */}
      {selectedSlots.length > 0 && (
        <div className="booking-summary">
          <h3>Selected Slots: {selectedSlots.length}</h3>
          <div className="total">
            Total: ₹{calculateTotal(selectedSlots)}
          </div>
          <button onClick={handleBooking}>
            Book Now
          </button>
        </div>
      )}
    </div>
  );
};
```

### GuideBooking.jsx
**Purpose**: Guide service booking interface

**Features**:
- **Mode Selection**: Online or offline
- **Subscription Choice**: Monthly, quarterly, one-time
- **Date Selection**: Calendar view
- **Time Slot Selection**: Available slots
- **Session Count**: Number of sessions (for subscriptions)
- **Special Requests**: Additional notes
- **Price Calculation**: Real-time total
- **Terms Acceptance**: T&C checkbox

**Booking Flow**:
```javascript
const handleGuideBooking = async () => {
  try {
    // Validate selections
    if (selectedSlots.length === 0) {
      toast.error('Please select at least one slot');
      return;
    }
    
    // Add to cart
    dispatch(addToCart({
      programId: guide.id,
      title: `Guide Session with ${guide.name}`,
      image: guide.image,
      price: calculateTotal(selectedSlots),
      type: 'guide',
      mode: selectedMode,
      subscriptionType: selectedSubscription,
      slotInfo: selectedSlots,
      specialRequests: specialRequests
    }));
    
    toast.success('Added to cart!');
    navigate('/cart');
  } catch (error) {
    toast.error('Booking failed');
  }
};
```

### GuideSubscription.jsx
**Purpose**: Subscription plan comparison and selection

**Subscription Plans**:
```javascript
const subscriptionPlans = {
  online: {
    monthly: {
      price: 2999,
      sessions: 4,
      duration: '1 month',
      benefits: [
        '4 one-on-one sessions',
        'Personalized guidance',
        'Email support',
        'Progress tracking'
      ],
      savings: 0
    },
    quarterly: {
      price: 7999,
      sessions: 12,
      duration: '3 months',
      benefits: [
        '12 one-on-one sessions',
        'Personalized guidance',
        'Priority email support',
        'Progress tracking',
        'Monthly review calls'
      ],
      savings: 15
    },
    oneTime: {
      price: 999,
      sessions: 1,
      duration: 'Single session',
      benefits: [
        '1 one-on-one session',
        'Basic guidance',
        'Session notes'
      ],
      savings: 0
    }
  },
  offline: {
    monthly: {
      price: 4999,
      sessions: 4,
      duration: '1 month',
      benefits: [
        '4 in-person sessions',
        'Personalized guidance',
        'Phone support',
        'Progress tracking',
        'Location flexibility'
      ],
      savings: 0
    },
    quarterly: {
      price: 12999,
      sessions: 12,
      duration: '3 months',
      benefits: [
        '12 in-person sessions',
        'Personalized guidance',
        'Priority phone support',
        'Progress tracking',
        'Monthly review meetings',
        'Flexible locations'
      ],
      savings: 15
    },
    oneTime: {
      price: 1499,
      sessions: 1,
      duration: 'Single session',
      benefits: [
        '1 in-person session',
        'Basic guidance',
        'Session notes'
      ],
      savings: 0
    }
  }
};
```

**Plan Comparison UI**:
```javascript
<div className="subscription-plans">
  <div className="mode-selector">
    <button onClick={() => setMode('online')}>Online</button>
    <button onClick={() => setMode('offline')}>Offline</button>
  </div>
  
  <div className="plans-grid">
    {Object.entries(subscriptionPlans[mode]).map(([type, plan]) => (
      <div key={type} className="plan-card">
        <h3>{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
        <div className="plan-price">
          <span className="amount">₹{plan.price}</span>
          <span className="duration">/{plan.duration}</span>
        </div>
        
        {plan.savings > 0 && (
          <div className="savings-badge">
            Save {plan.savings}%
          </div>
        )}
        
        <div className="sessions-count">
          {plan.sessions} {plan.sessions === 1 ? 'Session' : 'Sessions'}
        </div>
        
        <ul className="benefits-list">
          {plan.benefits.map(benefit => (
            <li key={benefit}>
              <FaCheck />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
        
        <button onClick={() => handleSelectPlan(type)}>
          Select Plan
        </button>
      </div>
    ))}
  </div>
</div>
```

### GuideReviews.jsx
**Purpose**: Client reviews and ratings

**Features**:
- **Overall Rating**: Average rating with breakdown
- **Review List**: All client reviews
- **Verified Clients**: Verified booking badge
- **Helpful Votes**: Upvote reviews
- **Filter**: Filter by rating
- **Sort**: Sort by date, rating, helpful
- **Submit Review**: Add review (past clients only)
- **Response**: Guide can respond to reviews

### GuideGallery.jsx
**Purpose**: Guide's photo and video gallery

**Features**:
- **Photo Gallery**: Professional photos
- **Video Introductions**: Introduction videos
- **Session Highlights**: Session photos
- **Certifications**: Certificate images
- **Lightbox View**: Full-screen image viewer

### GuideSpecializations.jsx
**Purpose**: Display guide's areas of expertise

**Specialization Categories**:
```javascript
const specializations = [
  {
    category: 'Spiritual Guidance',
    skills: [
      'Meditation techniques',
      'Mindfulness practices',
      'Spiritual counseling',
      'Energy healing'
    ]
  },
  {
    category: 'Wellness Coaching',
    skills: [
      'Stress management',
      'Work-life balance',
      'Habit formation',
      'Goal setting'
    ]
  },
  {
    category: 'Yoga Instruction',
    skills: [
      'Hatha yoga',
      'Vinyasa flow',
      'Pranayama',
      'Yoga therapy'
    ]
  }
];
```

### GuideFilter.jsx
**Purpose**: Filter guides by various criteria

**Filter Options**:
- **Specialization**: Area of expertise
- **Languages**: Languages spoken
- **Experience**: Years of experience
- **Rating**: Minimum rating
- **Availability**: Date range
- **Price Range**: Min-Max slider
- **Mode**: Online, offline, or both
- **Subscription Type**: Monthly, quarterly, one-time

### GuideComparison.jsx
**Purpose**: Compare multiple guides

**Features**:
- **Side-by-Side**: Compare up to 3 guides
- **Key Features**: Compare specializations
- **Pricing**: Price comparison
- **Ratings**: Rating comparison
- **Availability**: Next available slot
- **Select**: Choose guide to book

## Styling Patterns

### Guide Card
```css
.guide-card {
  @apply bg-white rounded-lg shadow-md;
  @apply transition-all duration-300;
  @apply hover:shadow-xl hover:-translate-y-1;
}

.guide-photo {
  @apply w-full h-48 object-cover rounded-t-lg;
}

.listing-badge {
  @apply absolute top-2 right-2;
  @apply bg-blue-600 text-white px-3 py-1 rounded-full text-sm;
}
```

### Availability Calendar
```css
.has-slots {
  @apply bg-green-100 text-green-800;
  @apply font-semibold cursor-pointer;
  @apply hover:bg-green-200;
}

.no-slots {
  @apply text-gray-400 cursor-not-allowed;
}

.selected-date {
  @apply bg-blue-600 text-white;
}
```

### Slot Grid
```css
.slots-grid {
  @apply grid grid-cols-2 md:grid-cols-3 gap-4;
}

.slot {
  @apply border-2 border-gray-300 rounded-lg p-4;
  @apply cursor-pointer transition-all;
  @apply hover:border-blue-500 hover:shadow-md;
}

.slot.selected {
  @apply border-blue-600 bg-blue-50;
}

.slot.full {
  @apply opacity-50 cursor-not-allowed;
}
```

## Data Structure

### Guide Object
```javascript
{
  id: string,
  name: string,
  image: string,
  specialization: string,
  bio: string,
  credentials: string[],
  languages: string[],
  experience: number,
  rating: number,
  reviewCount: number,
  listingType: 'Listing', // Always "Listing", disabled
  
  // Nested slot structure
  online: {
    monthly: {
      price: number,
      slots: [
        {
          date: string,
          time: string,
          duration: number,
          capacity: number,
          booked: number,
          price: number
        }
      ]
    },
    quarterly: { price: number, slots: [] },
    oneTime: { price: number, slots: [] }
  },
  offline: {
    monthly: { price: number, slots: [] },
    quarterly: { price: number, slots: [] },
    oneTime: { price: number, slots: [] }
  },
  
  specializations: string[],
  gallery: string[],
  videos: string[],
  nextAvailable: string,
  startingPrice: number
}
```

## Best Practices

1. **Slot Management**: Efficient nested structure handling
2. **Real-time Updates**: Update availability in real-time
3. **Conflict Prevention**: Prevent double booking
4. **Mobile Responsive**: Touch-friendly calendar
5. **Loading States**: Show loading during slot fetch
6. **Error Handling**: Clear error messages
7. **Accessibility**: Keyboard navigation for calendar
8. **Performance**: Lazy load guide profiles
9. **SEO**: Rich snippets for guides
10. **Analytics**: Track booking patterns

## Future Enhancements

- Video consultation integration
- Instant booking confirmation
- Recurring session scheduling
- Package deals
- Group sessions
- Waitlist for popular guides
- Guide matching algorithm
- Session recording option
- Progress tracking dashboard
- Referral rewards
