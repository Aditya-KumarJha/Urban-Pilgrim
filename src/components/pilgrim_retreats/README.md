# Pilgrim Retreats Components Documentation

## Overview
This folder contains components for displaying and managing retreat programs on the Urban Pilgrim platform, including booking, itinerary display, and guide information.

## Components

### RetreatCard.jsx
**Purpose**: Display retreat program in card format

**Features**:
- **Hero Image**: Large retreat location image
- **Title & Description**: Retreat details
- **Location**: Destination with map icon
- **Duration**: Number of days/nights
- **Price**: Per person pricing
- **Dates**: Available dates
- **Listing Type**: "Own" or "Listing" badge
- **Highlights**: Key features (accommodation, meals, activities)
- **Guide Info**: Meet guide section preview
- **Rating**: Star rating and reviews

**Card Structure**:
```javascript
<div className="retreat-card">
  <div className="card-image">
    <img src={retreat.image} alt={retreat.title} />
    <span className="duration-badge">{retreat.duration} Days</span>
    <span className="listing-badge">{retreat.listingType}</span>
  </div>
  
  <div className="card-content">
    <h3>{retreat.title}</h3>
    <div className="location">
      <FaMapMarkerAlt />
      <span>{retreat.location}</span>
    </div>
    
    <p className="description">{retreat.description}</p>
    
    <div className="highlights">
      {retreat.highlights.map(highlight => (
        <span key={highlight} className="highlight-badge">
          {highlight}
        </span>
      ))}
    </div>
    
    <div className="guide-preview">
      <img src={retreat.meetGuide.image} />
      <span>Guide: {retreat.meetGuide.title}</span>
    </div>
    
    <div className="card-footer">
      <div className="price">
        <span className="amount">₹{retreat.price}</span>
        <span className="per-person">per person</span>
      </div>
      <button onClick={handleViewDetails}>View Details</button>
    </div>
  </div>
</div>
```

### RetreatDetails.jsx
**Purpose**: Comprehensive retreat information page

**Sections**:
1. **Hero Section**: Large image gallery, title, location
2. **Overview**: Description, duration, dates
3. **Itinerary**: Day-by-day schedule
4. **Accommodation**: Room details, amenities
5. **Meals**: Food and dietary options
6. **Activities**: Included activities and experiences
7. **Meet Guide**: Detailed guide information with contact
8. **Inclusions/Exclusions**: What's included and not included
9. **Location**: Map and directions
10. **Reviews**: Guest reviews and ratings
11. **FAQ**: Common questions
12. **Booking Section**: Price and booking form

**Details Structure**:
```javascript
<div className="retreat-details">
  <ImageGallery images={retreat.images} />
  
  <div className="details-container">
    <div className="main-content">
      <RetreatOverview />
      <RetreatItinerary />
      <AccommodationDetails />
      <MealsInfo />
      <ActivitiesSection />
      <MeetGuideSection />
      <InclusionsExclusions />
      <LocationMap />
      <ReviewsSection />
      <FAQSection />
    </div>
    
    <div className="booking-sidebar">
      <BookingCard />
      <GuideContact />
      <SafetyInfo />
    </div>
  </div>
</div>
```

### RetreatItinerary.jsx
**Purpose**: Display day-by-day retreat schedule

**Features**:
- **Day Cards**: Expandable day-wise schedule
- **Timeline View**: Visual timeline
- **Activities**: Activities per day
- **Meals**: Meal times and menus
- **Free Time**: Leisure periods
- **Images**: Photos for each day
- **Print Option**: Downloadable PDF

**Itinerary Structure**:
```javascript
{
  days: [
    {
      day: 1,
      title: 'Arrival and Welcome',
      activities: [
        {
          time: '10:00 AM',
          title: 'Check-in',
          description: 'Welcome drinks and room allocation',
          duration: 60
        },
        {
          time: '12:00 PM',
          title: 'Lunch',
          description: 'Traditional vegetarian meal',
          duration: 90
        },
        {
          time: '3:00 PM',
          title: 'Orientation Session',
          description: 'Introduction to retreat and guidelines',
          duration: 120
        }
      ],
      meals: ['Lunch', 'Dinner'],
      accommodation: 'Deluxe Room',
      image: '/images/day1.jpg'
    }
  ]
}
```

**Day Card Component**:
```javascript
<div className="day-card">
  <div className="day-header" onClick={toggleExpand}>
    <h3>Day {day.day}: {day.title}</h3>
    <FaChevronDown className={expanded ? 'rotate-180' : ''} />
  </div>
  
  {expanded && (
    <div className="day-content">
      <img src={day.image} alt={`Day ${day.day}`} />
      
      <div className="activities-timeline">
        {day.activities.map(activity => (
          <div key={activity.time} className="activity">
            <div className="time">{activity.time}</div>
            <div className="activity-details">
              <h4>{activity.title}</h4>
              <p>{activity.description}</p>
              <span className="duration">{activity.duration} min</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="meals-info">
        <h4>Meals Included</h4>
        <div className="meals">
          {day.meals.map(meal => (
            <span key={meal} className="meal-badge">{meal}</span>
          ))}
        </div>
      </div>
    </div>
  )}
</div>
```

### MeetGuide.jsx
**Purpose**: Display retreat guide information and contact

**Features**:
- **Guide Profile**: Photo, name, bio
- **Credentials**: Certifications and experience
- **Specializations**: Areas of expertise
- **Languages**: Languages spoken
- **Contact Info**: Email and phone (from meetGuide object)
- **Reviews**: Guide ratings and reviews
- **Other Retreats**: Guide's other programs
- **Message Button**: Direct contact option

**Meet Guide Data Structure**:
```javascript
{
  meetGuide: {
    title: string,        // Guide name
    description: string,  // Guide bio
    email: string,        // Guide email (for notifications)
    number: string,       // Guide phone (for WhatsApp notifications)
    image: string,        // Guide photo
    credentials: string[],
    languages: string[],
    experience: number,   // years
    rating: number,
    reviewCount: number
  }
}
```

**Guide Contact Section**:
```javascript
<div className="guide-contact">
  <h3>Contact Guide</h3>
  <div className="contact-methods">
    <a href={`mailto:${meetGuide.email}`} className="contact-btn">
      <FaEnvelope />
      <span>Email Guide</span>
    </a>
    <a href={`tel:${meetGuide.number}`} className="contact-btn">
      <FaPhone />
      <span>Call Guide</span>
    </a>
    <a 
      href={`https://wa.me/${formatPhoneNumber(meetGuide.number)}`}
      target="_blank"
      className="contact-btn"
    >
      <FaWhatsapp />
      <span>WhatsApp</span>
    </a>
  </div>
  <p className="contact-note">
    Guide will be notified automatically upon booking confirmation
  </p>
</div>
```

### RetreatBooking.jsx
**Purpose**: Retreat booking interface

**Features**:
- **Date Selection**: Available retreat dates
- **Participant Count**: Number of guests
- **Room Selection**: Room type and occupancy
- **Add-ons**: Optional extras (spa, excursions)
- **Dietary Preferences**: Meal preferences
- **Special Requests**: Additional notes
- **Price Breakdown**: Detailed cost calculation
- **Terms Acceptance**: T&C checkbox
- **Payment**: Proceed to payment

**Booking Form**:
```javascript
const [bookingData, setBookingData] = useState({
  retreatId: retreat.id,
  selectedDate: null,
  participants: 1,
  roomType: 'deluxe',
  occupancy: 'single',
  addOns: [],
  dietaryPreferences: [],
  specialRequests: '',
  totalAmount: 0
});

const handleBooking = async () => {
  try {
    // Validate booking data
    if (!bookingData.selectedDate) {
      toast.error('Please select a date');
      return;
    }
    
    // Add to cart
    dispatch(addToCart({
      programId: retreat.id,
      title: retreat.title,
      image: retreat.image,
      price: calculateTotalPrice(),
      type: 'retreat',
      bookingData: bookingData,
      meetGuide: retreat.meetGuide // Include guide info for notifications
    }));
    
    toast.success('Added to cart!');
    navigate('/cart');
  } catch (error) {
    toast.error('Booking failed');
  }
};
```

**Price Calculation**:
```javascript
const calculateTotalPrice = () => {
  let total = retreat.basePrice * bookingData.participants;
  
  // Room type surcharge
  if (bookingData.roomType === 'suite') {
    total += 2000 * bookingData.participants;
  }
  
  // Occupancy discount
  if (bookingData.occupancy === 'shared') {
    total *= 0.8; // 20% discount
  }
  
  // Add-ons
  bookingData.addOns.forEach(addon => {
    total += addon.price;
  });
  
  return total;
};
```

### RetreatAccommodation.jsx
**Purpose**: Display accommodation details

**Features**:
- **Room Types**: Different room categories
- **Amenities**: Room facilities
- **Photos**: Room images
- **Capacity**: Occupancy limits
- **Pricing**: Price per room type
- **Availability**: Room availability

**Room Types**:
```javascript
const roomTypes = [
  {
    type: 'standard',
    name: 'Standard Room',
    description: 'Comfortable room with basic amenities',
    capacity: 2,
    amenities: ['AC', 'WiFi', 'TV', 'Attached Bathroom'],
    images: [],
    price: 0, // included in base price
    available: true
  },
  {
    type: 'deluxe',
    name: 'Deluxe Room',
    description: 'Spacious room with premium amenities',
    capacity: 2,
    amenities: ['AC', 'WiFi', 'TV', 'Mini Bar', 'Balcony'],
    images: [],
    price: 1000, // additional per night
    available: true
  },
  {
    type: 'suite',
    name: 'Suite',
    description: 'Luxury suite with separate living area',
    capacity: 4,
    amenities: ['AC', 'WiFi', 'TV', 'Mini Bar', 'Balcony', 'Jacuzzi'],
    images: [],
    price: 2000,
    available: false
  }
];
```

### RetreatLocation.jsx
**Purpose**: Display location and map

**Features**:
- **Interactive Map**: Google Maps integration
- **Directions**: How to reach
- **Nearby Attractions**: Points of interest
- **Transportation**: Travel options
- **Distance**: From major cities
- **Weather**: Local weather info

**Map Integration**:
```javascript
<GoogleMap
  center={{ lat: retreat.latitude, lng: retreat.longitude }}
  zoom={15}
  mapContainerStyle={{ width: '100%', height: '400px' }}
>
  <Marker
    position={{ lat: retreat.latitude, lng: retreat.longitude }}
    title={retreat.title}
  />
</GoogleMap>
```

### RetreatReviews.jsx
**Purpose**: Guest reviews and ratings

**Features**:
- **Overall Rating**: Average rating with breakdown
- **Review List**: All guest reviews
- **Verified Guests**: Verified attendance badge
- **Photos**: Guest photos
- **Helpful Votes**: Upvote reviews
- **Filter**: Filter by rating
- **Sort**: Sort by date, rating, helpful
- **Submit Review**: Add review (past guests only)

**Rating Breakdown**:
```javascript
<div className="rating-breakdown">
  <div className="overall-rating">
    <span className="rating-number">{retreat.rating}</span>
    <StarRating value={retreat.rating} />
    <span className="review-count">
      Based on {retreat.reviewCount} reviews
    </span>
  </div>
  
  <div className="rating-bars">
    {[5, 4, 3, 2, 1].map(star => (
      <div key={star} className="rating-bar">
        <span>{star} ★</span>
        <div className="bar">
          <div 
            className="fill"
            style={{ width: `${getRatingPercentage(star)}%` }}
          />
        </div>
        <span>{getRatingCount(star)}</span>
      </div>
    ))}
  </div>
</div>
```

### RetreatInclusions.jsx
**Purpose**: Display what's included and excluded

**Features**:
- **Inclusions List**: What's included in price
- **Exclusions List**: What's not included
- **Icons**: Visual indicators
- **Expandable**: Show more/less
- **Pricing Notes**: Additional cost items

**Inclusions Structure**:
```javascript
{
  inclusions: [
    'Accommodation for duration of retreat',
    'All meals (breakfast, lunch, dinner)',
    'Yoga and meditation sessions',
    'Guided nature walks',
    'Welcome and farewell ceremonies',
    'Course materials',
    'Airport transfers'
  ],
  exclusions: [
    'Airfare to destination',
    'Travel insurance',
    'Personal expenses',
    'Optional spa treatments',
    'Alcoholic beverages',
    'Tips and gratuities'
  ]
}
```

### RetreatFilter.jsx
**Purpose**: Filter retreats by various criteria

**Filter Options**:
- **Location**: Destination
- **Duration**: Number of days
- **Price Range**: Min-Max slider
- **Dates**: Available dates
- **Type**: Yoga, meditation, wellness, spiritual
- **Accommodation**: Room types
- **Meals**: Dietary options
- **Activities**: Included activities
- **Rating**: Minimum rating

### RetreatComparison.jsx
**Purpose**: Compare multiple retreats

**Features**:
- **Side-by-Side**: Compare up to 3 retreats
- **Key Features**: Compare features
- **Pricing**: Price comparison
- **Ratings**: Rating comparison
- **Highlights**: Quick comparison
- **Select**: Choose retreat to book

## Styling Patterns

### Retreat Card
```css
.retreat-card {
  @apply rounded-lg overflow-hidden shadow-lg;
  @apply transition-all duration-300;
  @apply hover:shadow-2xl hover:-translate-y-2;
}

.retreat-card .card-image {
  @apply relative h-64 overflow-hidden;
}

.retreat-card .card-image img {
  @apply w-full h-full object-cover;
  @apply transition-transform duration-300;
  @apply hover:scale-110;
}
```

### Itinerary Timeline
```css
.activities-timeline {
  @apply relative pl-8;
}

.activities-timeline::before {
  @apply absolute left-0 top-0 bottom-0;
  @apply w-0.5 bg-blue-300;
  content: '';
}

.activity {
  @apply relative mb-6;
}

.activity::before {
  @apply absolute -left-8 top-2;
  @apply w-4 h-4 rounded-full;
  @apply bg-blue-600 border-4 border-white;
  content: '';
}
```

## Retreat Booking Notifications

### Guide Notification System
When a retreat is booked, the system automatically notifies the guide:

**Email Notification**:
- Sent to `retreat.meetGuide.email`
- Contains booking details, customer info, payment ID
- Professional HTML template with branding

**WhatsApp Notification**:
- Sent to `retreat.meetGuide.number`
- Formatted message with booking information
- Automatic phone number formatting (+91 for India)

**Implementation** (handled by Firebase Cloud Function):
```javascript
// In confirmPayment function
if (isRetreat(program)) {
  await sendRetreatGuideNotifications({
    guideEmail: program.meetGuide.email,
    guidePhone: program.meetGuide.number,
    retreatTitle: program.title,
    customerName: user.displayName,
    customerEmail: user.email,
    customerPhone: user.phoneNumber,
    bookingDate: new Date().toLocaleDateString(),
    paymentId: paymentId
  });
}
```

## Best Practices

1. **Image Optimization**: Compress retreat images
2. **Mobile Responsive**: Touch-friendly booking
3. **Loading States**: Show loading during booking
4. **Error Handling**: Clear error messages
5. **Accessibility**: ARIA labels and keyboard nav
6. **SEO**: Rich snippets for retreats
7. **Performance**: Lazy load images and maps
8. **Security**: Validate booking data
9. **Analytics**: Track booking funnel
10. **Guide Communication**: Ensure guide notifications work

## Future Enhancements

- Virtual retreat tours
- Live chat with guide
- Group booking discounts
- Early bird pricing
- Last-minute deals
- Retreat packages
- Loyalty rewards
- Referral program
- Social sharing
- Retreat blog integration
