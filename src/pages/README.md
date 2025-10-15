# Pages Documentation

## Overview
This folder contains all main page components for the Urban Pilgrim platform. These are the primary user-facing pages that make up the application's routing structure.

>## Structure

### /admin
**Purpose**: Complete admin panel for platform management
- **Entry Point**: `Admin.jsx`
- **Authentication**: OTP-based admin login
- **Features**: Content management, analytics, coupons, program management
- **See**: `admin/README.md` for detailed documentation

### /home
**Purpose**: Landing page and main entry point

#### Components:
- **Home.jsx**: Main homepage container
- **HomePage.jsx**: Homepage layout and sections

**Sections**:
- Hero carousel with images
- About Urban Pilgrim
- Featured programs
- Highlights and benefits
- Testimonials
- Call-to-action sections
- Newsletter signup

**Features**:
- Dynamic content from Firebase
- Responsive design
- SEO optimized
- Lazy loading for images

### /pilgrim_sessions
**Purpose**: Browse and book live/recorded wellness sessions

#### Components:
- **Sessions.jsx**: Main sessions listing page

**Features**:
- **Filter System**:
  - By category (meditation, yoga, wellness, etc.)
  - By type (live vs recorded)
  - By price range
  - By date/time availability
  - By instructor
  
- **Sort Options**:
  - Best selling (dynamic based on purchase count)
  - Price (low to high, high to low)
  - Newest first
  - Rating

- **Session Cards**:
  - Program image and title
  - Instructor info
  - Duration and schedule
  - Price and subscription options
  - Quick add to cart

- **Search**: Real-time search across session titles and descriptions

**Data Flow**:
1. Fetch sessions from Redux store
2. Apply filters and sorting
3. Display paginated results
4. Click session → Navigate to details page

### /pilgrim_retreats
**Purpose**: Browse and book wellness retreats

#### Components:
- **Retreats.jsx**: Main retreats listing page

**Features**:
- **Retreat Cards**:
  - Destination images
  - Retreat title and description
  - Duration (days/nights)
  - Pricing
  - Guide information
  - Listing type (Own/Listing)

- **Filters**:
  - By location
  - By duration
  - By price range
  - By retreat type (wellness, spiritual, adventure)

- **Meet Guide Section**:
  - Guide contact info (email, phone)
  - Guide bio and expertise
  - Previous retreat experience

**Unique Features**:
- **Retreat Notifications**: Automatic email/WhatsApp to guide on booking
- **Detailed Itinerary**: Day-by-day schedule
- **Accommodation Info**: Lodging details and amenities

### /pilgrim_guides
**Purpose**: Browse and book personal pilgrim guides

#### Components:
- **Guides.jsx**: Main guides listing page

**Features**:
- **Guide Profiles**:
  - Profile photo and bio
  - Specializations and expertise
  - Languages spoken
  - Availability calendar
  - Pricing (hourly/daily/package)

- **Booking System**:
  - Select date and time slots
  - Choose subscription type (monthly, quarterly, one-time)
  - Online or offline guidance
  - Instant booking confirmation

- **Filters**:
  - By language
  - By specialization
  - By availability
  - By price range
  - By rating

### /upcoming_events
**Purpose**: Display upcoming events and programs

#### Components:
- **UpcomingEvents.jsx**: Events listing page

**Features**:
- **Admin-Curated**: Events order managed by admin
- **Event Cards**:
  - Event image and title
  - Date and time
  - Location (online/offline)
  - Category (retreat, session, workshop, guide)
  - Quick registration

- **Calendar View**: Monthly calendar with event markers
- **Filters**: By date range, category, location
- **Integration**: Pulls from all program types (sessions, retreats, workshops)

### /program_details
**Purpose**: Detailed view of individual programs

#### Components:
- **ProgramDetails.jsx**: Main details page
- **ProgramDetailsCard.jsx**: Card layout component

**Features**:
- **Comprehensive Info**:
  - Full description and overview
  - Instructor/guide bio
  - Schedule and duration
  - Pricing and subscription options
  - What's included
  - Prerequisites
  - Cancellation policy

- **Media Gallery**:
  - Multiple images
  - Video previews (for recorded sessions)
  - Virtual tour (for retreats)

- **Booking Section**:
  - Date/time selection
  - Quantity selection
  - Add to cart
  - Buy now (direct checkout)

- **Reviews and Ratings**:
  - User testimonials
  - Star ratings
  - Review submission

- **Related Programs**: Suggestions based on category

### /session_slots
**Purpose**: Select specific time slots for live sessions

#### Components:
- **SessionSlots.jsx**: Slot selection interface
- **SlotCalendar.jsx**: Calendar view of available slots

**Features**:
- **Calendar Interface**:
  - Monthly view
  - Available dates highlighted
  - Sold-out dates grayed out
  - Selected date emphasized

- **Time Slot Selection**:
  - List of available time slots for selected date
  - Capacity indicator
  - Price per slot
  - Multi-slot selection

- **Booking Flow**:
  1. Select date from calendar
  2. Choose time slot
  3. Add to cart or buy now
  4. Proceed to checkout

### /cart
**Purpose**: Shopping cart and checkout

#### Components:
- **CartPage.jsx**: Main cart interface
- **CartItem.jsx**: Individual cart item component

**Features**:
- **Cart Management**:
  - View all items
  - Update quantities
  - Remove items
  - Save for later

- **Coupon System**:
  - Apply coupon code
  - Real-time validation
  - Discount calculation
  - Program-specific coupons
  - Usage limit enforcement

- **Order Summary**:
  - Subtotal
  - Discount (if coupon applied)
  - Tax calculation
  - Total amount

- **Checkout**:
  - Razorpay payment integration
  - Multiple payment methods
  - Order confirmation
  - Email receipt

**Coupon Validation**:
- Program type compatibility
- Expiration date check
- Usage limit check
- Minimum order amount
- Maximum discount cap

### /gift_cards
**Purpose**: Purchase and manage gift cards

#### Components:
- **GiftCards.jsx**: Gift card listing
- **GiftCardDetails.jsx**: Individual gift card details

**Features**:
- **Gift Card Types**:
  - Wellness Retreat cards (for retreat programs)
  - Wellness Program cards (for live sessions)
  - Pilgrim Guide cards (for guide services)

- **Purchase Flow**:
  1. Select gift card type
  2. Choose amount
  3. Select quantity
  4. Complete payment
  5. Receive coupon code via email

- **Email Delivery**:
  - Professional HTML template
  - Coupon code prominently displayed
  - Usage instructions
  - Validity period
  - Program restrictions

- **Coupon Generation**:
  - Unique code generation
  - Collision detection
  - Program-specific restrictions
  - One-time usage
  - Automatic expiration

### /organizer
**Purpose**: Organizer dashboard for program management

#### Components:
- **Home.jsx**: Organizer dashboard home
- **LiveSessions.jsx**: Manage live sessions
- **RecordedSessions.jsx**: Manage recorded programs
- **Retreats.jsx**: Manage retreats
- **Workshops.jsx**: Manage workshops
- **Bookings.jsx**: View and manage bookings

**Features**:
- **Dashboard**:
  - Overview of all programs
  - Booking statistics
  - Revenue tracking
  - Upcoming sessions

- **Program Management**:
  - Create new programs
  - Edit existing programs
  - Manage availability
  - Set pricing

- **Booking Management**:
  - View all bookings
  - Mark sessions as completed
  - Communicate with participants
  - Issue refunds

- **Analytics**:
  - Booking trends
  - Revenue reports
  - Popular programs
  - User demographics

### /join_us_as_guides
**Purpose**: Guide registration and onboarding

#### Components:
- **JoinAsGuide.jsx**: Guide application form

**Features**:
- **Application Form**:
  - Personal information
  - Professional background
  - Certifications and qualifications
  - Areas of expertise
  - Availability
  - Pricing expectations

- **Document Upload**:
  - ID verification
  - Certification documents
  - Profile photo
  - Portfolio/references

- **Approval Process**:
  - Admin review
  - Background verification
  - Interview scheduling
  - Onboarding materials

### /join_us_as_trip_advisors
**Purpose**: Trip advisor registration

#### Components:
- **JoinAsTripAdvisor.jsx**: Trip advisor application

**Features**:
- Similar to guide registration
- Focus on travel expertise
- Destination knowledge assessment
- Language proficiency

### /contact
**Purpose**: Contact form and support

#### Components:
- **Contact.jsx**: Contact form

**Features**:
- **Contact Form**:
  - Name, email, phone
  - Subject selection
  - Message textarea
  - File attachment option

- **Contact Information**:
  - Email address
  - Phone number
  - Office address
  - Social media links

- **Support Categories**:
  - General inquiry
  - Booking support
  - Technical issues
  - Partnership opportunities
  - Feedback

### /whoarewe
**Purpose**: About Us page

#### Components:
- **WhoAreWe.jsx**: Company information

**Features**:
- Company mission and vision
- Team members
- Company history
- Values and principles
- Achievements and milestones

### /whychooseUs
**Purpose**: Benefits and unique selling points

#### Components:
- **WhyChooseUs.jsx**: Benefits showcase

**Features**:
- Key differentiators
- Success stories
- Statistics and metrics
- Customer testimonials
- Trust indicators

### /privacy_policy
**Purpose**: Privacy policy and terms

#### Components:
- **PrivacyPolicy.jsx**: Legal information

**Features**:
- Privacy policy
- Terms of service
- Cookie policy
- Data protection
- User rights

>## Common Patterns

### Page Structure
```javascript
function PageComponent() {
  // State management
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  
  // Redux
  const dispatch = useDispatch();
  const stateData = useSelector(state => state.slice.data);
  
  // Effects
  useEffect(() => {
    fetchData();
  }, []);
  
  // Render
  return (
    <>
      <SEO title="Page Title" description="..." />
      <Navbar />
      <MainContent />
      <Footer />
    </>
  );
}
```

### Data Fetching
- **Redux Thunks**: Async data fetching
- **Firebase Services**: Firestore queries
- **Loading States**: Skeleton loaders
- **Error Handling**: User-friendly error messages

### Routing
- **React Router**: Client-side routing
- **Protected Routes**: Authentication checks
- **Dynamic Routes**: `/program/:id` patterns
- **Query Parameters**: Filter and sort states

### SEO
- **Meta Tags**: Dynamic title and description
- **Open Graph**: Social media sharing
- **Structured Data**: Schema.org markup
- **Canonical URLs**: Duplicate content prevention

### Responsive Design
- **Mobile First**: Base styles for mobile
- **Breakpoints**: sm, md, lg, xl, 2xl
- **Touch Friendly**: Large tap targets
- **Performance**: Optimized images and lazy loading

>## Navigation Flow

### User Journey - Booking a Session
1. Home → Browse Sessions
2. Apply filters/search
3. Click session card → Program Details
4. Select date → Session Slots
5. Choose time slot
6. Add to cart
7. Apply coupon (optional)
8. Checkout → Payment
9. Confirmation email
10. Access in User Dashboard

### User Journey - Purchasing Gift Card
1. Home → Gift Cards
2. Select gift card type
3. Choose amount and quantity
4. Complete payment
5. Receive email with coupon code
6. Recipient uses code at checkout

### Organizer Journey
1. Join as Guide/Organizer
2. Application submission
3. Admin approval
4. Organizer dashboard access
5. Create programs
6. Manage bookings
7. Track analytics

>## State Management

### Redux Slices
- **authSlice**: User authentication
- **adminAuthSlice**: Admin authentication
- **organizerAuthSlice**: Organizer authentication
- **cartSlice**: Shopping cart
- **pilgrim_session**: Sessions data
- **pilgrim_retreat**: Retreats data
- **pilgrim_guide**: Guides data
- **workshopsSlice**: Workshops data
- **bundleSlice**: Bundle data
- **eventsSlice**: Events data
- **userProgramsSlice**: User's purchased programs

### Local Storage
- Admin session
- Cart persistence
- User preferences
- Recent searches

>## Performance Optimizations
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: WebP format, lazy loading
- **Caching**: Redux persist, service workers
- **Debouncing**: Search and filter operations
- **Pagination**: Large lists paginated
- **Memoization**: Expensive calculations cached

>## Accessibility
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard access
- **Focus Management**: Proper focus indicators
- **Color Contrast**: WCAG AA compliance
- **Alt Text**: All images have descriptions
