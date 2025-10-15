# Admin Components Documentation

## Overview
This folder contains all React components used in the admin panel. These components handle form management, data editing, authentication, and content management for administrators.

## Structure

### Root Level Components

>#### AdminProtectedRoute.jsx
**Purpose**: Route protection wrapper for admin pages
- **Functionality**:
  - Checks Redux admin authentication state
  - Redirects to login if not authenticated
  - Wraps all admin routes for security
- **Usage**: `<AdminProtectedRoute><AdminContent /></AdminProtectedRoute>`

>#### AdminSignIn.jsx
**Purpose**: Admin authentication interface
- **Features**:
  - OTP-based email authentication
  - Email validation against Firestore `admins` collection
  - Two-step process: Email → OTP
  - Loading states and error handling
  - Professional UI with Urban Pilgrim branding
- **Flow**:
  1. Admin enters email
  2. System validates email exists in `admins` collection
  3. OTP sent to email (5-minute expiration)
  4. Admin enters OTP
  5. Firebase verifies and creates admin session
  6. Redux stores admin state

## Subdirectories

>### /home
**Purpose**: Homepage content management components

#### Components:
- **NavbarSection.jsx**: Edit navbar links, logo, and styling
- **ImageSliderAdmin.jsx**: Manage hero carousel images and captions
- **SectionOne.jsx - SectionEight.jsx**: Individual homepage section editors
- **Highlights.jsx**: Manage highlight cards and features
- **TestimonialsEdit.jsx**: Add/edit/delete customer testimonials
- **FooterSection.jsx**: Footer content and links management
- **TitleDescriptionEditor.jsx**: Reusable title/description input component

**Common Features**:
- Real-time Firebase updates
- Image upload to Firebase Storage
- Rich text editing
- Drag-and-drop reordering
- Preview functionality

>### /pilgrim_sessions
**Purpose**: Live and recorded session management

#### Components:
- **LiveSessions2.jsx**: Comprehensive live session form
  - Multi-date calendar interface
  - Slot management (time ranges)
  - Subscription types (monthly, quarterly, one-time)
  - Online/Offline modes
  - Nested data structure
  - Listing type: "Own" (disabled)
  
- **RecordedSession2.jsx**: Recorded program management
  - Similar structure to live sessions
  - Video upload functionality
  - Duration management
  - Listing type: "Own" (disabled)
  
- **LiveSessionSlots.jsx**: Slot editor component
  - Add/edit/delete time slots
  - Multi-date bulk operations
  - Past date validation

**Key Features**:
- **Multi-Select Calendar**: Select multiple dates for bulk slot creation
- **Nested Structure**: `online/offline → monthly/quarterly/oneTime → slots[]`
- **Smart Validation**: Prevents invalid dates and overlapping slots
- **Real-time Updates**: Immediate Firebase sync

>### /pilgrim_retreats
**Purpose**: Retreat program management

#### Components:
- **RetreatsForm.jsx**: Complete retreat creation/editing form
  - Program details (title, description, duration)
  - Listing type: "Listing" or "Own" (admin can modify)
  - Meet Guide section (email, phone, title, description)
  - Image upload
  - Pricing and availability
  - Firebase integration

- **RetreatsCard.jsx**: Display component for retreat cards

**Unique Features**:
- **Meet Guide Integration**: Contact info for retreat coordinators
- **Flexible Listing**: Admin can choose between "Listing" and "Own"
- **Retreat-Specific Fields**: Duration, location, accommodation details

>### /pilgrim_guides
**Purpose**: Pilgrim guide service management

#### Components:
- **GuideForm.jsx**: Guide profile and service management
  - Guide information and bio
  - Listing type: "Listing" (disabled, admin cannot modify)
  - Subscription management (online/offline)
  - Nested slot structure for availability
  - Service pricing
  - Image and media upload

- **GuideCard.jsx**: Display component for guide cards

**Key Features**:
- **Fixed Listing Type**: Always "Listing" (third-party guides)
- **Subscription Model**: Monthly, quarterly, one-time options
- **Availability Slots**: Time-based booking system

>### /workshops
**Purpose**: Workshop program management

#### Components:
- **WorkshopForm.jsx**: Workshop creation and editing
  - Workshop details and description
  - Listing type: "Listing" or "Own" (admin can modify)
  - Schedule and duration
  - Capacity management
  - Image upload
  - Pricing

- **WorkshopCard.jsx**: Display component
- **WorkshopList.jsx**: List view with filtering
- **WorkshopRequests.jsx**: Handle workshop booking requests

**Features**:
- **Request Management**: View and respond to workshop inquiries
- **Capacity Tracking**: Monitor enrollment vs. capacity
- **Flexible Listing**: Admin control over listing type

>### /upcoming_events
**Purpose**: Homepage upcoming events management

#### Components:
- **UpcomingEvents.jsx**: Event selection and ordering interface
  - Drag-and-drop reordering (@dnd-kit library)
  - Program selection from all available events
  - Visibility toggle (show/hide on homepage)
  - Order persistence in Firebase
  - Real-time preview

- **UpcomingEventsCard.jsx**: Event card display component

**Key Features**:
- **Drag-and-Drop**: Smooth reordering with visual feedback
- **Multi-Source**: Select from retreats, sessions, workshops, guides
- **Visibility Control**: Show/hide individual events
- **Order Persistence**: Saves to `admin_settings/upcoming_events_order`

>### /bundles
**Purpose**: Program bundle management

#### Components:
- **BundleForm.jsx**: Create and edit program bundles
  - Multi-program selection
  - Bundle pricing
  - Discount calculation
  - Description and details

- **BundleCard.jsx**: Display component for bundles

**Features**:
- **Multi-Program**: Combine different program types
- **Discount Logic**: Automatic or manual pricing
- **Bundle Visibility**: Control homepage display

>### /organizer
**Purpose**: Organizer account management

#### Components:
- **OrganizerList.jsx**: View and manage organizer accounts
  - Approval workflow
  - Access control
  - Program assignment

**Features**:
- **Approval System**: Review and approve organizer registrations
- **Permission Management**: Control what organizers can access

## Common Patterns

### Form Structure
Most admin forms follow this pattern:
```javascript
const [formData, setFormData] = useState(initialState);
const [loading, setLoading] = useState(false);
const [editing, setEditing] = useState(false);

const handleFieldChange = (section, field, value) => {
  setFormData(prev => ({
    ...prev,
    [section]: {
      ...prev[section],
      [field]: value
    }
  }));
};

const handleSave = async () => {
  setLoading(true);
  try {
    await saveToFirebase(formData);
    showSuccess("Saved successfully!");
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### Image Upload Pattern
```javascript
const handleImageUpload = async (file) => {
  const storageRef = ref(storage, `path/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  return url;
};
```

### Slot Management Pattern
```javascript
const handleSlotChange = (mode, subscriptionType, index, field, value) => {
  setFormData(prev => ({
    ...prev,
    [mode]: {
      ...prev[mode],
      [subscriptionType]: {
        ...prev[mode][subscriptionType],
        slots: prev[mode][subscriptionType].slots.map((slot, i) =>
          i === index ? { ...slot, [field]: value } : slot
        )
      }
    }
  }));
};
```

## Data Flow

### Create Flow
1. Admin opens form component
2. Form initializes with empty/default state
3. Admin fills in fields
4. Image uploads happen immediately to Firebase Storage
5. Form validation on submit
6. Data saved to Firestore
7. Redux state updated
8. Success notification
9. Form resets or navigates away

### Edit Flow
1. Admin selects item to edit
2. Form loads with existing data from Firestore
3. Admin modifies fields
4. Changes saved to Firestore
5. Redux state updated
6. Success notification

### Delete Flow
1. Admin clicks delete button
2. Confirmation modal appears
3. On confirm, Firestore document deleted
4. Associated images deleted from Storage
5. Redux state updated
6. Success notification

## State Management

### Local State (useState)
- Form data
- Loading states
- Error messages
- UI toggles (modals, dropdowns)

### Redux State
- Program data (retreats, sessions, guides, workshops)
- Admin authentication
- User programs
- Cart data
- Bundle data

### Firebase State
- Real-time data sync
- Image storage
- Document updates

## Validation

### Client-Side
- Required field checks
- Email format validation
- Phone number format
- Date range validation
- File type and size checks

### Server-Side
- Firebase Security Rules
- Cloud Function validation
- Admin authentication checks

## Styling Conventions
- **TailwindCSS**: Utility-first styling
- **Responsive**: Mobile-first breakpoints
- **Colors**: 
  - Primary: `#0c3c60` (Blue)
  - Secondary: `#fceee3` (Orange/Peach)
  - Accent: `#2f6288`
- **Spacing**: Consistent padding and margins
- **Forms**: Rounded inputs with focus states
- **Buttons**: Rounded-full with hover effects

## Error Handling
- **Try-Catch**: All async operations wrapped
- **Toast Notifications**: User-friendly error messages
- **Loading States**: Prevent duplicate submissions
- **Fallbacks**: Default values for missing data

## Accessibility
- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Tab order and focus management
- **Color Contrast**: WCAG AA compliance

## Performance Optimizations
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Compressed uploads
- **Debouncing**: Search and filter operations
- **Memoization**: Expensive calculations cached
- **Pagination**: Large lists paginated

## Testing Considerations
- **Form Validation**: Test all validation rules
- **Image Upload**: Test file size limits and formats
- **Slot Management**: Test date/time validations
- **Authentication**: Test protected routes
- **Error Scenarios**: Test network failures and edge cases
