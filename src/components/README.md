# Components Documentation

## Overview
This folder contains all reusable React components used throughout the Urban Pilgrim platform. Components are organized by feature area and shared across multiple pages.

## Root Level Components

### Animated_card.jsx
**Purpose**: Animated card component with hover effects
- **Features**:
  - Smooth animations on hover
  - Customizable content
  - CSS transitions
- **Usage**: Feature showcases, program highlights

### Faqs.jsx
**Purpose**: Frequently Asked Questions accordion
- **Features**:
  - Expandable/collapsible questions
  - Smooth transitions
  - Search functionality
  - Category filtering
- **Usage**: Help pages, program details

### HeroCarousel.jsx
**Purpose**: Homepage hero image carousel
- **Features**:
  - Auto-play with pause on hover
  - Navigation arrows
  - Dot indicators
  - Responsive images
  - Lazy loading
- **Data Source**: Firebase admin-managed images
- **Usage**: Homepage hero section

### Highlights.jsx
**Purpose**: Display key features and benefits
- **Features**:
  - Icon + title + description cards
  - Grid layout
  - Hover effects
- **Usage**: Homepage, about page

### Loader.jsx & Loader2.jsx
**Purpose**: Loading spinners and skeleton screens
- **Loader.jsx**: Full-page loading spinner
- **Loader2.jsx**: Inline loading indicator
- **Usage**: Async operations, page transitions

### Pagination.jsx
**Purpose**: Reusable pagination component
- **Features**:
  - Page number buttons
  - Previous/Next navigation
  - Current page highlighting
  - Configurable items per page
- **Props**: `currentPage`, `totalPages`, `onPageChange`
- **Usage**: All listing pages

### ProgramExplorer.jsx
**Purpose**: Interactive program discovery interface
- **Features**:
  - Category tabs
  - Program cards
  - Quick filters
  - Search integration
- **Usage**: Homepage, explore page

### SEO.jsx
**Purpose**: Dynamic SEO meta tags
- **Features**:
  - Dynamic title and description
  - Open Graph tags
  - Twitter cards
  - Canonical URLs
- **Props**: `title`, `description`, `image`, `url`
- **Usage**: All pages (wrap in component)

### SearchBar.jsx
**Purpose**: Global search functionality
- **Features**:
  - Real-time search across programs
  - Autocomplete suggestions
  - Recent searches
  - Category filtering
  - Debounced input
  - Mobile responsive
- **Search Scope**: Sessions, retreats, guides, workshops
- **Usage**: Navbar, dedicated search page

### SignIn.jsx
**Purpose**: User authentication modal
- **Features**:
  - OTP-based authentication
  - Email/phone input
  - OTP verification
  - Loading states
  - Error handling
  - Auto-close on success
- **Flow**:
  1. User enters email/phone
  2. OTP sent via Firebase
  3. User enters OTP
  4. Verification and session creation
  5. Redux state update

### StepWizard.jsx
**Purpose**: Multi-step form wizard
- **Features**:
  - Step indicators
  - Progress bar
  - Next/Previous navigation
  - Step validation
  - Data persistence between steps
- **Usage**: Booking flows, registration forms

### Steps.jsx
**Purpose**: Visual step indicator
- **Features**:
  - Numbered steps
  - Completed/active/pending states
  - Connecting lines
  - Responsive layout
- **Usage**: Checkout process, onboarding

### Testimonials.jsx
**Purpose**: Customer testimonials carousel
- **Features**:
  - Auto-rotating testimonials
  - Star ratings
  - Customer photos
  - Quote formatting
  - Navigation controls
- **Data Source**: Firebase admin-managed
- **Usage**: Homepage, about page

### UserDashboard.jsx
**Purpose**: User account dashboard
- **Features**:
  - Purchased programs
  - Upcoming sessions
  - Booking history
  - Profile management
  - Subscription status
  - Download invoices
- **Sections**:
  - My Programs
  - Upcoming Sessions
  - Past Sessions
  - Subscriptions
  - Profile Settings
- **Integration**: Firebase user data, Redux state

### WhatsAppFloatingButton.jsx
**Purpose**: Floating WhatsApp contact button
- **Features**:
  - Fixed position (bottom-right)
  - WhatsApp icon
  - Click to open WhatsApp chat
  - Mobile responsive
- **Usage**: All pages (global)

### YogaCard.jsx
**Purpose**: Program card component
- **Features**:
  - Program image
  - Title and description
  - Price display
  - Rating stars
  - Quick actions (cart, wishlist)
  - Hover effects
- **Usage**: Program listings

### YogaDesc.jsx
**Purpose**: Program description component
- **Features**:
  - Formatted description
  - Read more/less toggle
  - Rich text support
- **Usage**: Program details pages

## Subdirectories

### /about
**Purpose**: About page components
- **Components**: Company info, team members, mission/vision
- **Features**: Responsive layouts, image galleries

### /admin
**Purpose**: Admin panel components
- **See**: `admin/README.md` for detailed documentation
- **Components**: Forms, editors, management interfaces

### /footer
**Purpose**: Site footer components
- **Components**:
  - Footer.jsx: Main footer with links
  - FooterLinks.jsx: Link sections
- **Features**:
  - Multi-column layout
  - Social media links
  - Newsletter signup
  - Copyright info

### /gift_card
**Purpose**: Gift card related components

#### Components:
- **GiftCardList.jsx**: Display available gift cards
- **GiftCardDetails.jsx**: Individual gift card details
- **GiftCardPurchase.jsx**: Purchase flow
- **GiftCardEmail.jsx**: Email template preview

**Features**:
- **Card Types**: Retreat, Program, Guide cards
- **Purchase Flow**: Amount selection → Payment → Email delivery
- **Coupon Generation**: Automatic unique code creation
- **Email Templates**: Professional HTML emails with branding

### /modals
**Purpose**: Reusable modal components

#### Components:
- **ConfirmModal.jsx**: Confirmation dialogs
- **InfoModal.jsx**: Information displays
- **FormModal.jsx**: Modal with forms

**Features**:
- Backdrop click to close
- ESC key to close
- Customizable content
- Animation transitions

### /navbar
**Purpose**: Navigation bar components

#### Components:
- **NavBar.jsx**: Main navigation bar
- **MobileMenu.jsx**: Mobile navigation menu

**Features**:
- **Desktop Nav**:
  - Logo
  - Main menu links
  - Search bar
  - User account dropdown
  - Cart icon with count
  - Sign in button

- **Mobile Nav**:
  - Hamburger menu
  - Slide-out drawer
  - Collapsible sections
  - Touch-friendly

- **User Menu**:
  - Dashboard link
  - My Programs
  - Profile settings
  - Logout

### /pilgrim_guides
**Purpose**: Guide-specific components

#### Components:
- **GuideCard.jsx**: Guide profile card
- **GuideList.jsx**: List of guides
- **GuideFilter.jsx**: Filter sidebar
- **GuideDetails.jsx**: Detailed guide profile
- **GuideBooking.jsx**: Booking interface
- **GuideReviews.jsx**: Reviews and ratings
- **GuideAvailability.jsx**: Calendar availability
- **GuideSubscription.jsx**: Subscription options
- **GuideSlots.jsx**: Time slot selection
- **GuideContact.jsx**: Contact guide form
- **GuideTestimonials.jsx**: Guide testimonials

**Features**:
- **Profile Display**: Bio, expertise, languages, certifications
- **Booking System**: Date/time selection, subscription types
- **Reviews**: Star ratings, written reviews, verified bookings
- **Availability**: Real-time calendar with available slots

### /pilgrim_retreats
**Purpose**: Retreat-specific components

#### Components:
- **RetreatCard.jsx**: Retreat card display
- **RetreatList.jsx**: List of retreats
- **RetreatFilter.jsx**: Filter options
- **RetreatDetails.jsx**: Detailed retreat info
- **RetreatItinerary.jsx**: Day-by-day schedule
- **RetreatAccommodation.jsx**: Lodging details
- **RetreatBooking.jsx**: Booking form
- **RetreatGuide.jsx**: Guide information
- **RetreatGallery.jsx**: Image gallery
- **RetreatReviews.jsx**: Reviews and ratings
- **RetreatInclusions.jsx**: What's included
- **RetreatLocation.jsx**: Map and location info
- **RetreatFAQ.jsx**: Retreat-specific FAQs
- **RetreatCancellation.jsx**: Cancellation policy

**Features**:
- **Comprehensive Info**: Itinerary, accommodation, inclusions
- **Guide Contact**: Email/phone integration for bookings
- **Gallery**: Multiple images, virtual tours
- **Location**: Interactive maps, directions

### /pilgrim_sessions
**Purpose**: Session-specific components

#### Components:
- **SessionCard.jsx**: Session card display
- **SessionList.jsx**: List of sessions
- **SessionFilter.jsx**: Advanced filters
- **SessionDetails.jsx**: Detailed session info
- **SessionSlots.jsx**: Time slot selection
- **SessionInstructor.jsx**: Instructor profile
- **SessionBooking.jsx**: Booking interface
- **SessionReviews.jsx**: Reviews and ratings
- **LiveSessionCard.jsx**: Live session specific
- **RecordedSessionCard.jsx**: Recorded session specific
- **SessionCalendar.jsx**: Calendar view
- **SessionSubscription.jsx**: Subscription options
- **SessionVideo.jsx**: Video player (recorded)
- **SessionChat.jsx**: Live chat (live sessions)
- **SessionMaterials.jsx**: Downloadable materials

**Features**:
- **Live Sessions**: Real-time video, chat, Q&A
- **Recorded Sessions**: On-demand video, playback controls
- **Slot Booking**: Calendar interface, time selection
- **Subscriptions**: Monthly, quarterly, one-time options
- **Materials**: PDFs, worksheets, resources

### /pilgrim_workshop
**Purpose**: Workshop-specific components

#### Components:
- **WorkshopCard.jsx**: Workshop card display
- **WorkshopList.jsx**: List of workshops
- **WorkshopDetails.jsx**: Detailed workshop info
- **WorkshopBooking.jsx**: Booking and registration

**Features**:
- Workshop schedule and curriculum
- Capacity and enrollment tracking
- Registration forms
- Certificate issuance

### /sessions
**Purpose**: General session components
- **SessionWrapper.jsx**: Common session layout
- **Features**: Shared functionality between live and recorded

### /ui
**Purpose**: UI utility components (shadcn/ui based)

#### Components:
- **button.jsx**: Button variants
- **card.jsx**: Card layouts
- **dialog.jsx**: Dialog/modal
- **dropdown-menu.jsx**: Dropdown menus
- **input.jsx**: Form inputs
- **label.jsx**: Form labels
- **select.jsx**: Select dropdowns
- **textarea.jsx**: Text areas
- **toast.jsx**: Toast notifications
- **calendar.jsx**: Calendar picker
- **badge.jsx**: Badge component

**Features**:
- **Consistent Styling**: TailwindCSS based
- **Variants**: Multiple style variants per component
- **Accessibility**: ARIA compliant
- **Composable**: Build complex UIs from simple components

### /upcoming_events
**Purpose**: Upcoming events components

#### Components:
- **UpcomingEventCard.jsx**: Event card display
- **UpcomingEventList.jsx**: List of events
- **UpcomingEventCalendar.jsx**: Calendar view
- **UpcomingEventFilter.jsx**: Filter options
- **UpcomingEventDetails.jsx**: Event details
- **UpcomingEventRegistration.jsx**: Registration form

**Features**:
- **Admin Curated**: Order managed by admin panel
- **Multi-Source**: Events from all program types
- **Calendar Integration**: Monthly view with event markers
- **Quick Registration**: One-click event registration

### /whyus
**Purpose**: Why Choose Us components
- **WhyUsCard.jsx**: Benefit cards
- **Features**: Icons, titles, descriptions, statistics

## Component Patterns

### Card Component Pattern
```javascript
function ProgramCard({ program, onAddToCart, onViewDetails }) {
  return (
    <div className="card">
      <img src={program.image} alt={program.title} />
      <h3>{program.title}</h3>
      <p>{program.description}</p>
      <div className="actions">
        <button onClick={() => onViewDetails(program.id)}>
          View Details
        </button>
        <button onClick={() => onAddToCart(program)}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}
```

### Filter Component Pattern
```javascript
function FilterSidebar({ filters, onFilterChange }) {
  return (
    <div className="filters">
      <FilterSection 
        title="Category"
        options={categories}
        selected={filters.category}
        onChange={(val) => onFilterChange('category', val)}
      />
      <FilterSection 
        title="Price Range"
        type="range"
        value={filters.priceRange}
        onChange={(val) => onFilterChange('priceRange', val)}
      />
    </div>
  );
}
```

### Modal Component Pattern
```javascript
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
```

## Styling Conventions

### TailwindCSS Classes
- **Spacing**: `p-4`, `m-2`, `gap-3`
- **Colors**: `bg-blue-500`, `text-gray-700`
- **Responsive**: `md:flex`, `lg:grid-cols-3`
- **Hover**: `hover:bg-blue-600`
- **Transitions**: `transition-all duration-300`

### Custom CSS
- Component-specific styles in `.css` files
- BEM naming convention for custom classes
- CSS modules for scoped styles

## State Management

### Props
- Data passed from parent components
- Event handlers for user interactions
- Configuration options

### Local State (useState)
- UI state (open/closed, selected, etc.)
- Form inputs
- Loading states

### Redux State
- Global application state
- User authentication
- Cart data
- Program data

### Context
- Theme context
- Auth context
- Cart context

## Performance Optimizations

### React.memo
- Prevent unnecessary re-renders
- Used for expensive components

### useMemo
- Cache expensive calculations
- Filter/sort operations

### useCallback
- Memoize callback functions
- Prevent child re-renders

### Lazy Loading
- Code splitting for large components
- Image lazy loading
- Route-based splitting

## Accessibility

### ARIA Attributes
- `aria-label` for icon buttons
- `aria-expanded` for collapsible sections
- `aria-hidden` for decorative elements

### Keyboard Navigation
- Tab order
- Enter/Space for buttons
- Escape to close modals

### Screen Readers
- Semantic HTML
- Alt text for images
- Descriptive link text

## Testing Considerations

### Unit Tests
- Component rendering
- Props handling
- Event handlers
- State changes

### Integration Tests
- Component interactions
- Data flow
- API calls

### E2E Tests
- User workflows
- Form submissions
- Navigation

## Reusability Guidelines

### Props Interface
- Clear prop names
- TypeScript/PropTypes for validation
- Default props for optional values
- Destructured props in function signature

### Composition
- Small, focused components
- Composable building blocks
- Render props pattern
- Children prop for flexibility

### Customization
- Style props for custom styling
- Variant props for different looks
- Callback props for custom behavior
- Slot props for custom content
