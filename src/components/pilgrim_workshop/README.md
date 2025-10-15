# Pilgrim Workshop Components Documentation

## Overview
This folder contains components for displaying and managing workshop programs on the Urban Pilgrim platform.

## Components

### WorkshopCard.jsx
**Purpose**: Display workshop program in card format

**Features**:
- **Workshop Image**: Thumbnail with hover effect
- **Title & Description**: Workshop details
- **Instructor**: Instructor name and credentials
- **Duration**: Workshop duration
- **Date & Time**: Scheduled date and time
- **Location**: Venue or online platform
- **Price**: Workshop fee
- **Capacity**: Available seats
- **Listing Type**: "Listing" badge (enabled, admin can modify)
- **Category**: Workshop category tag
- **CTA Button**: "Register Now" or "View Details"

**Card Structure**:
```javascript
<div className="workshop-card">
  <div className="card-image">
    <img src={workshop.image} alt={workshop.title} />
    <span className="category-badge">{workshop.category}</span>
    <span className="listing-badge">{workshop.listingType}</span>
  </div>
  
  <div className="card-content">
    <h3>{workshop.title}</h3>
    <p className="description">{workshop.description}</p>
    
    <div className="instructor">
      <img src={workshop.instructor.photo} />
      <span>{workshop.instructor.name}</span>
    </div>
    
    <div className="workshop-details">
      <div className="detail-item">
        <FaCalendar />
        <span>{workshop.date}</span>
      </div>
      <div className="detail-item">
        <FaClock />
        <span>{workshop.time} ({workshop.duration})</span>
      </div>
      <div className="detail-item">
        <FaMapMarkerAlt />
        <span>{workshop.location}</span>
      </div>
      <div className="detail-item">
        <FaUsers />
        <span>{workshop.availableSeats} / {workshop.capacity} seats</span>
      </div>
    </div>
    
    <div className="card-footer">
      <div className="price">₹{workshop.price}</div>
      <button 
        onClick={handleRegister}
        disabled={workshop.availableSeats === 0}
      >
        {workshop.availableSeats > 0 ? 'Register Now' : 'Sold Out'}
      </button>
    </div>
  </div>
</div>
```

### WorkshopDetails.jsx
**Purpose**: Comprehensive workshop information page

**Sections**:
1. **Hero Section**: Large image, title, date, location
2. **Overview**: Description and objectives
3. **What You'll Learn**: Learning outcomes
4. **Schedule**: Detailed agenda
5. **Instructor Bio**: Instructor information
6. **Prerequisites**: Required knowledge/materials
7. **Materials Provided**: What's included
8. **Venue Details**: Location and directions
9. **Reviews**: Past participant reviews
10. **FAQ**: Common questions
11. **Registration**: Booking form

**Details Structure**:
```javascript
<div className="workshop-details">
  <WorkshopHero workshop={workshop} />
  
  <div className="details-container">
    <div className="main-content">
      <OverviewSection />
      <LearningOutcomes />
      <ScheduleSection />
      <InstructorBio />
      <PrerequisitesSection />
      <MaterialsProvided />
      <VenueDetails />
      <ReviewsSection />
      <FAQSection />
    </div>
    
    <div className="registration-sidebar">
      <RegistrationCard />
      <WorkshopInfo />
      <RelatedWorkshops />
    </div>
  </div>
</div>
```

### WorkshopSchedule.jsx
**Purpose**: Display workshop agenda and timeline

**Features**:
- **Timeline View**: Visual timeline of sessions
- **Session Details**: Topics and activities
- **Break Times**: Scheduled breaks
- **Duration**: Time per session
- **Materials**: Required materials per session

**Schedule Structure**:
```javascript
{
  sessions: [
    {
      time: '9:00 AM - 10:30 AM',
      title: 'Introduction and Foundation',
      description: 'Overview of core concepts and principles',
      duration: 90,
      topics: [
        'Welcome and introductions',
        'Workshop objectives',
        'Foundational concepts',
        'Q&A session'
      ],
      materials: ['Workbook', 'Pen and paper']
    },
    {
      time: '10:30 AM - 10:45 AM',
      title: 'Break',
      type: 'break'
    },
    {
      time: '10:45 AM - 12:30 PM',
      title: 'Hands-on Practice',
      description: 'Practical exercises and group activities',
      duration: 105,
      topics: [
        'Guided practice',
        'Group exercises',
        'Individual work',
        'Feedback session'
      ],
      materials: ['Practice materials', 'Props']
    }
  ],
  totalDuration: '6 hours',
  breaks: 3,
  practicalSessions: 4
}
```

**Schedule Display**:
```javascript
<div className="workshop-schedule">
  <h2>Workshop Schedule</h2>
  <div className="schedule-timeline">
    {workshop.schedule.sessions.map((session, index) => (
      <div 
        key={index} 
        className={`session ${session.type === 'break' ? 'break-session' : ''}`}
      >
        <div className="session-time">{session.time}</div>
        <div className="session-content">
          <h3>{session.title}</h3>
          {session.description && (
            <p className="session-description">{session.description}</p>
          )}
          {session.topics && (
            <ul className="topics-list">
              {session.topics.map(topic => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          )}
          {session.materials && (
            <div className="materials">
              <strong>Materials:</strong>
              <span>{session.materials.join(', ')}</span>
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
</div>
```

### WorkshopRegistration.jsx
**Purpose**: Workshop registration and booking interface

**Features**:
- **Participant Info**: Name, email, phone
- **Ticket Quantity**: Number of seats
- **Dietary Preferences**: Meal preferences (if meals included)
- **Special Requirements**: Accessibility needs
- **Emergency Contact**: Emergency contact info
- **Terms Acceptance**: T&C checkbox
- **Payment**: Proceed to payment

**Registration Form**:
```javascript
const [registrationData, setRegistrationData] = useState({
  workshopId: workshop.id,
  participantName: '',
  email: '',
  phone: '',
  quantity: 1,
  dietaryPreferences: [],
  specialRequirements: '',
  emergencyContact: {
    name: '',
    phone: ''
  },
  totalAmount: 0
});

const handleRegistration = async () => {
  try {
    // Validate form
    if (!registrationData.participantName || !registrationData.email) {
      toast.error('Please fill all required fields');
      return;
    }
    
    // Check availability
    if (registrationData.quantity > workshop.availableSeats) {
      toast.error('Not enough seats available');
      return;
    }
    
    // Add to cart
    dispatch(addToCart({
      programId: workshop.id,
      title: workshop.title,
      image: workshop.image,
      price: workshop.price * registrationData.quantity,
      type: 'workshop',
      registrationData: registrationData
    }));
    
    toast.success('Added to cart!');
    navigate('/cart');
  } catch (error) {
    toast.error('Registration failed');
  }
};
```

### WorkshopInstructor.jsx
**Purpose**: Display instructor information

**Features**:
- **Profile Photo**: Instructor image
- **Bio**: Detailed background
- **Credentials**: Certifications and qualifications
- **Experience**: Years of experience
- **Specializations**: Areas of expertise
- **Other Workshops**: Instructor's other workshops
- **Social Links**: Social media profiles

### WorkshopVenue.jsx
**Purpose**: Display venue information and directions

**Features**:
- **Venue Name**: Location name
- **Address**: Full address
- **Map**: Interactive Google Maps
- **Directions**: How to reach
- **Parking**: Parking information
- **Public Transport**: Transit options
- **Accessibility**: Accessibility features
- **Nearby Amenities**: Hotels, restaurants

**Venue Component**:
```javascript
<div className="workshop-venue">
  <h2>Venue Details</h2>
  
  <div className="venue-info">
    <h3>{workshop.venue.name}</h3>
    <p className="address">{workshop.venue.address}</p>
    
    <div className="venue-features">
      <div className="feature">
        <FaParking />
        <span>Free parking available</span>
      </div>
      <div className="feature">
        <FaWheelchair />
        <span>Wheelchair accessible</span>
      </div>
      <div className="feature">
        <FaWifi />
        <span>Free WiFi</span>
      </div>
    </div>
  </div>
  
  <div className="venue-map">
    <GoogleMap
      center={{ lat: workshop.venue.latitude, lng: workshop.venue.longitude }}
      zoom={15}
    >
      <Marker position={{ lat: workshop.venue.latitude, lng: workshop.venue.longitude }} />
    </GoogleMap>
  </div>
  
  <div className="directions">
    <h3>How to Reach</h3>
    <div className="direction-options">
      <button onClick={() => openDirections('car')}>
        <FaCar /> By Car
      </button>
      <button onClick={() => openDirections('transit')}>
        <FaBus /> By Public Transport
      </button>
      <button onClick={() => openDirections('walk')}>
        <FaWalking /> Walking
      </button>
    </div>
  </div>
</div>
```

### WorkshopMaterials.jsx
**Purpose**: Display materials provided and required

**Features**:
- **Provided Materials**: What's included
- **Required Materials**: What to bring
- **Optional Materials**: Recommended items
- **Digital Resources**: Online materials
- **Post-Workshop**: Materials after workshop

**Materials Structure**:
```javascript
{
  provided: [
    'Workshop workbook',
    'Practice materials',
    'Certificate of completion',
    'Refreshments and lunch',
    'Digital resources access'
  ],
  required: [
    'Comfortable clothing',
    'Notebook and pen',
    'Water bottle',
    'Open mind and enthusiasm'
  ],
  optional: [
    'Yoga mat (if practicing)',
    'Laptop for digital exercises',
    'Camera for documentation'
  ],
  postWorkshop: [
    'Lifetime access to recordings',
    'Downloadable resources',
    'Community forum access',
    'Follow-up session invitation'
  ]
}
```

### WorkshopReviews.jsx
**Purpose**: Past participant reviews and ratings

**Features**:
- **Overall Rating**: Average rating with breakdown
- **Review List**: All participant reviews
- **Verified Participants**: Verified attendance badge
- **Helpful Votes**: Upvote reviews
- **Filter**: Filter by rating
- **Sort**: Sort by date, rating, helpful
- **Submit Review**: Add review (past participants only)

### WorkshopFilter.jsx
**Purpose**: Filter workshops by various criteria

**Filter Options**:
- **Category**: Workshop type
- **Date Range**: Upcoming dates
- **Location**: City or online
- **Price Range**: Min-Max slider
- **Duration**: Workshop length
- **Instructor**: Filter by instructor
- **Level**: Beginner, intermediate, advanced
- **Language**: Workshop language
- **Availability**: Only available workshops

### WorkshopComparison.jsx
**Purpose**: Compare multiple workshops

**Features**:
- **Side-by-Side**: Compare up to 3 workshops
- **Key Features**: Compare topics and outcomes
- **Pricing**: Price comparison
- **Dates**: Date comparison
- **Instructors**: Instructor comparison
- **Select**: Choose workshop to register

### WorkshopCertificate.jsx
**Purpose**: Display and download completion certificate

**Features**:
- **Certificate Preview**: Visual preview
- **Participant Name**: Personalized name
- **Workshop Details**: Workshop title and date
- **Instructor Signature**: Digital signature
- **Download**: PDF download
- **Share**: Social media sharing
- **Verification**: QR code for verification

## Styling Patterns

### Workshop Card
```css
.workshop-card {
  @apply bg-white rounded-lg shadow-md overflow-hidden;
  @apply transition-all duration-300;
  @apply hover:shadow-xl hover:-translate-y-1;
}

.workshop-card .card-image {
  @apply relative h-48 overflow-hidden;
}

.workshop-card .card-image img {
  @apply w-full h-full object-cover;
  @apply transition-transform duration-300;
}

.workshop-card:hover .card-image img {
  @apply scale-110;
}
```

### Schedule Timeline
```css
.schedule-timeline {
  @apply relative pl-8;
}

.schedule-timeline::before {
  @apply absolute left-0 top-0 bottom-0;
  @apply w-0.5 bg-blue-300;
  content: '';
}

.session {
  @apply relative mb-6 pb-6;
  @apply border-b border-gray-200;
}

.session::before {
  @apply absolute -left-8 top-2;
  @apply w-4 h-4 rounded-full;
  @apply bg-blue-600 border-4 border-white;
  content: '';
}

.break-session {
  @apply opacity-60;
}

.break-session::before {
  @apply bg-gray-400;
}
```

### Capacity Indicator
```css
.capacity-indicator {
  @apply flex items-center gap-2;
}

.capacity-bar {
  @apply flex-1 h-2 bg-gray-200 rounded-full overflow-hidden;
}

.capacity-fill {
  @apply h-full bg-green-500 transition-all;
}

.capacity-fill.almost-full {
  @apply bg-orange-500;
}

.capacity-fill.full {
  @apply bg-red-500;
}
```

## Data Structure

### Workshop Object
```javascript
{
  id: string,
  title: string,
  description: string,
  image: string,
  category: string,
  listingType: 'Listing' | 'Own', // Admin can modify
  
  instructor: {
    name: string,
    photo: string,
    bio: string,
    credentials: string[]
  },
  
  date: string,
  time: string,
  duration: string,
  location: string,
  venue: {
    name: string,
    address: string,
    latitude: number,
    longitude: number,
    features: string[]
  },
  
  price: number,
  capacity: number,
  availableSeats: number,
  
  schedule: {
    sessions: [],
    totalDuration: string,
    breaks: number
  },
  
  learningOutcomes: string[],
  prerequisites: string[],
  materials: {
    provided: string[],
    required: string[],
    optional: string[]
  },
  
  rating: number,
  reviewCount: number,
  
  isOnline: boolean,
  platform: string, // if online
  
  certificateProvided: boolean,
  recordingProvided: boolean
}
```

## Best Practices

1. **Capacity Management**: Real-time seat availability
2. **Registration Validation**: Verify all required fields
3. **Mobile Responsive**: Touch-friendly forms
4. **Loading States**: Show loading during registration
5. **Error Handling**: Clear error messages
6. **Accessibility**: ARIA labels and keyboard navigation
7. **SEO**: Rich snippets for workshops
8. **Performance**: Lazy load workshop details
9. **Security**: Validate registration data
10. **Analytics**: Track registration funnel

## Future Enhancements

- Waitlist for sold-out workshops
- Early bird discounts
- Group registration discounts
- Workshop series packages
- Virtual workshop support
- Live Q&A integration
- Post-workshop community
- Alumni network
- Workshop recordings
- Certification tracking
- Continuing education credits
- Corporate workshop packages
