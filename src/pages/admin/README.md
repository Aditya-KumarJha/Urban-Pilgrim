# Admin Panel - Pages Documentation

## Overview
The admin panel is a comprehensive management system for Urban Pilgrim platform administrators. It provides full control over content, programs, analytics, and user management through a secure, authenticated interface.

## Authentication Flow
1. **Entry Point**: `/admin` route
2. **Protection**: `AdminProtectedRoute` component wraps all admin pages
3. **Login**: `AdminSignIn.jsx` component handles OTP-based authentication
4. **Authorization**: Admin emails must exist in Firestore `admins` collection
5. **Session**: Redux state management with persistent storage

>## Main Components

### Admin.jsx
**Purpose**: Main container component for the admin panel
- **State Management**: Controls active section navigation
- **Layout**: Sidebar + Content area (responsive)
- **Routing**: Switch-case navigation between sections
- **Protection**: Wrapped in `AdminProtectedRoute`

### SideBar.jsx
**Purpose**: Navigation sidebar with admin info and menu
- **Features**:
  - Admin profile display (email, role)
  - Navigation menu with icons
  - Logout functionality
  - Mobile responsive with hamburger menu
- **Menu Items**:
  - Home Page
  - Pilgrim Retreats
  - Pilgrim Sessions
  - Workshops
  - Pilgrim Guides
  - Upcoming Events
  - Organizer
  - Coupons
  - Analytics

>## Section Pages

### Home.jsx
**Purpose**: Manage homepage content sections
- **Location**: `src/components/admin/home/`
- **Sections Managed**:
  - Navbar Section
  - Image Slider (Hero Carousel)
  - Section One through Eight
  - Highlights
  - Testimonials
  - Footer Section
- **Features**:
  - Real-time content editing
  - Image upload and management
  - Title/description editors
  - Firebase integration for persistence

### Retreats.jsx
**Purpose**: Manage Pilgrim Retreat programs
- **Component**: `RetreatsForm` from `components/admin/pilgrim_retreats/`
- **Features**:
  - Create/Edit/Delete retreat programs
  - Listing type: "Listing" or "Own" (admin can modify)
  - Meet Guide info (email, phone, title, description)
  - Image upload
  - Duration and pricing
  - Firebase storage integration

### Sessions.jsx
**Purpose**: Manage Live and Recorded Sessions
- **Components**:
  - `LiveSessions2` for live programs
  - `RecordedSession2` for recorded programs
- **Features**:
  - Multi-date slot management
  - Subscription types (monthly, quarterly, one-time)
  - Online/Offline modes
  - Listing type: "Own" (disabled, admin cannot modify)
  - Nested data structure for slots
  - Calendar-based slot creation

### Workshops.jsx
**Purpose**: Manage Workshop programs
- **Component**: `WorkshopForm`
- **Features**:
  - Workshop creation and editing
  - Listing type: "Listing" or "Own" (admin can modify)
  - Description and details management
  - Image upload
  - Firebase integration

### Guides.jsx
**Purpose**: Manage Pilgrim Guide services
- **Component**: `GuideForm`
- **Features**:
  - Guide profile management
  - Listing type: "Listing" (disabled, admin cannot modify)
  - Subscription management (online/offline, monthly/quarterly/one-time)
  - Nested slot structure
  - Guide card information

### Events.jsx
**Purpose**: Manage Upcoming Events
- **Component**: `UpcomingEvents` from `components/admin/upcoming_events/`
- **Features**:
  - Drag-and-drop event reordering (@dnd-kit library)
  - Program selection from available events
  - Visibility toggle (show/hide on homepage)
  - Order persistence in Firebase
  - Real-time sync with homepage

### Bundles.jsx
**Purpose**: Manage program bundles
- **Features**:
  - Create bundle packages
  - Select multiple programs
  - Set bundle pricing
  - Discount management
  - Bundle visibility control

### Coupons.jsx
**Purpose**: Comprehensive coupon management system
- **Features**:
  - Create/Edit/Delete coupons
  - Discount types: percentage or fixed amount
  - Program-specific coupons (Live, Recorded, Retreats, Guides)
  - Expiration dates
  - Usage limits and tracking
  - Minimum order amount
  - Maximum discount caps
  - Active/Inactive status toggle
- **Integration**: Works with cart page for discount application

### Analysis.jsx
**Purpose**: Analytics dashboard with charts and metrics
- **Features**:
  - Total Revenue bar chart (monthly data)
  - Total Users bar chart (monthly data)
  - Growth indicators and trends
  - Period filters (Last Year, 6 Months, 3 Months)
  - Summary cards with percentages
  - Live Sessions metrics placeholder
- **Library**: Recharts for data visualization
- **Status**: Sample data structure ready for Firebase integration

### Organizers.jsx
**Purpose**: Manage organizer accounts and permissions
- **Features**:
  - Organizer registration approval
  - Access control
  - Program assignment
  - Performance tracking

>## Data Flow

### Create/Edit Flow
1. Admin selects section from sidebar
2. Form component loads with existing data (if editing)
3. Admin makes changes
4. Form validation
5. Firebase update/create operation
6. Success/error toast notification
7. Redux state update
8. UI refresh

### Authentication Flow
1. Admin navigates to `/admin`
2. `AdminProtectedRoute` checks Redux state
3. If not authenticated → Show `AdminSignIn`
4. Admin enters email → Firebase validates against `admins` collection
5. OTP sent to email → Admin enters OTP
6. Firebase verifies OTP → Creates custom token with admin claims
7. Redux stores admin session
8. Admin panel loads

### Data Persistence
- **Firebase Firestore**: All program data, settings, and configurations
- **Firebase Storage**: Images and media files
- **Redux Store**: Client-side state management
- **Local Storage**: Persistent admin session

>## Key Features

### Listing Type System
- **"Listing"**: Third-party programs (can be modified in Retreats/Workshops)
- **"Own"**: Urban Pilgrim's own programs (fixed in Sessions/Guides)
- **Purpose**: Differentiate between owned and listed content

### Multi-Date Slot Management
- **Calendar Interface**: Visual date selection
- **Multi-Select Mode**: Bulk slot creation for multiple dates
- **Time Range Management**: Add/edit/delete time slots
- **Smart Validation**: Prevents past date slots

### Nested Data Structure
```javascript
{
  online: {
    monthly: { slots: [] },
    quarterly: { slots: [] },
    oneTime: { slots: [] }
  },
  offline: {
    monthly: { slots: [] },
    quarterly: { slots: [] },
    oneTime: { slots: [] }
  }
}
```

### Image Management
- **Upload**: Direct to Firebase Storage
- **Preview**: Real-time image preview
- **Validation**: File type and size checks
- **Storage**: Organized by program type

>## Security

### Admin Authentication
- **OTP-based**: Email verification required
- **Firestore Validation**: Admin email must exist in `admins` collection
- **Custom Claims**: Firebase custom tokens with admin role
- **Session Management**: Redux with persistent storage
- **Route Protection**: All admin routes wrapped in `AdminProtectedRoute`

### Data Access
- **Firebase Rules**: Admin-only write access
- **Validation**: Server-side validation in Cloud Functions
- **Error Handling**: Comprehensive error catching and logging

>## Styling
- **Framework**: TailwindCSS
- **Theme**: Blue/Orange color scheme
- **Responsive**: Mobile-first design
- **Icons**: Custom SVG icons in `/public/assets/admin/`

>## Dependencies
- **React**: UI framework
- **Redux Toolkit**: State management
- **Firebase**: Backend services
- **Recharts**: Analytics charts
- **@dnd-kit**: Drag-and-drop functionality
- **React Hot Toast**: Notifications

>## Future Enhancements
- Real-time analytics data integration
- Bulk operations for programs
- Advanced filtering and search
- Export functionality for reports
- Role-based access control (multiple admin levels)
- Activity logs and audit trail
