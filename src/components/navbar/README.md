# Navbar Components Documentation

## Overview
This folder contains navigation bar components for the Urban Pilgrim platform, including the main navbar and mobile navigation.

## Components

### Navbar.jsx
**Purpose**: Main navigation bar component displayed across all pages

**Features**:
- **Responsive Design**: Desktop and mobile layouts
- **Authentication State**: Shows different options for logged-in vs guest users
- **Cart Integration**: Cart icon with item count badge
- **Navigation Links**: Home, Sessions, Retreats, Guides, Workshops, Gift Cards
- **User Menu**: Profile dropdown with dashboard and logout options
- **Search Integration**: Quick search functionality
- **Sticky Header**: Fixed position on scroll

**State Management**:
```javascript
const [isMenuOpen, setIsMenuOpen] = useState(false);
const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
const { user, isAuthenticated } = useSelector(state => state.auth);
const { items } = useSelector(state => state.cart);
```

**Navigation Structure**:
```javascript
const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/sessions', label: 'Sessions' },
  { path: '/retreats', label: 'Retreats' },
  { path: '/guides', label: 'Guides' },
  { path: '/workshops', label: 'Workshops' },
  { path: '/gift-cards', label: 'Gift Cards' }
];
```

**User Menu Options**:
- **Authenticated**:
  - My Dashboard
  - My Bookings
  - Profile Settings
  - Logout
- **Guest**:
  - Sign In
  - Sign Up

**Cart Badge**:
- Displays total item count
- Red badge with white text
- Positioned on top-right of cart icon
- Updates in real-time with Redux state

**Mobile Navigation**:
- Hamburger menu icon
- Slide-in drawer from left
- Full-screen overlay
- Touch-friendly tap targets
- Smooth animations

**Styling**:
- TailwindCSS utility classes
- Blue/Orange brand colors
- Shadow on scroll
- Hover effects on links
- Active link highlighting

**Accessibility**:
- ARIA labels for icons
- Keyboard navigation support
- Focus indicators
- Screen reader friendly

**Performance**:
- Memoized cart count calculation
- Debounced scroll events
- Lazy-loaded user menu
- Optimized re-renders

### MobileNav.jsx (if exists)
**Purpose**: Dedicated mobile navigation component

**Features**:
- Drawer-style navigation
- Category filters
- User account access
- Search functionality
- Close button

## Usage Example

```javascript
import Navbar from './components/navbar/Navbar';

function App() {
  return (
    <div>
      <Navbar />
      <main>{/* Page content */}</main>
    </div>
  );
}
```

## Integration Points

### Redux Store
- `state.auth.user`: Current user data
- `state.auth.isAuthenticated`: Authentication status
- `state.cart.items`: Cart items for badge count

### React Router
- Uses `<Link>` for navigation
- `useNavigate` for programmatic navigation
- Active link detection with `useLocation`

### Authentication
- Checks user authentication state
- Conditional rendering based on auth status
- Logout functionality integrated

## Styling Patterns

### Desktop Navbar
```css
.navbar {
  @apply fixed top-0 left-0 right-0 z-50;
  @apply bg-white shadow-md;
  @apply transition-all duration-300;
}

.nav-link {
  @apply px-4 py-2 text-gray-700;
  @apply hover:text-blue-600 transition-colors;
}

.nav-link.active {
  @apply text-blue-600 font-semibold;
}
```

### Mobile Menu
```css
.mobile-menu {
  @apply fixed inset-0 z-50;
  @apply bg-white transform transition-transform;
}

.mobile-menu.closed {
  @apply -translate-x-full;
}

.mobile-menu.open {
  @apply translate-x-0;
}
```

### Cart Badge
```css
.cart-badge {
  @apply absolute -top-2 -right-2;
  @apply bg-red-500 text-white;
  @apply rounded-full w-5 h-5;
  @apply flex items-center justify-center;
  @apply text-xs font-bold;
}
```

## Responsive Breakpoints

- **Mobile**: < 768px (Hamburger menu)
- **Tablet**: 768px - 1024px (Condensed navbar)
- **Desktop**: > 1024px (Full navbar with all links)

## Event Handlers

### handleLogout
```javascript
const handleLogout = async () => {
  try {
    await signOut(auth);
    dispatch(clearUser());
    dispatch(clearCart());
    navigate('/');
    toast.success('Logged out successfully');
  } catch (error) {
    toast.error('Logout failed');
  }
};
```

### handleCartClick
```javascript
const handleCartClick = () => {
  if (!isAuthenticated) {
    toast.info('Please sign in to view cart');
    navigate('/signin');
    return;
  }
  navigate('/cart');
};
```

### handleMobileMenuToggle
```javascript
const handleMobileMenuToggle = () => {
  setIsMenuOpen(!isMenuOpen);
  // Prevent body scroll when menu is open
  document.body.style.overflow = isMenuOpen ? 'auto' : 'hidden';
};
```

## Best Practices

1. **Performance**: Memoize expensive calculations
2. **Accessibility**: Include ARIA labels and keyboard navigation
3. **Responsive**: Test on all device sizes
4. **State Management**: Use Redux for global state
5. **Error Handling**: Handle auth errors gracefully
6. **Loading States**: Show loading indicators during auth checks
7. **SEO**: Use semantic HTML elements
8. **Security**: Validate user permissions before showing admin links

## Future Enhancements

- Notification bell with unread count
- Language selector
- Theme toggle (dark mode)
- Breadcrumb navigation
- Mega menu for categories
- Search autocomplete
- Recently viewed items
