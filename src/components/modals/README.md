# Modals Components Documentation

## Overview
This folder contains reusable modal/dialog components used throughout the Urban Pilgrim platform for various user interactions.

## Components

### AuthModal.jsx
**Purpose**: Authentication modal for sign-in and sign-up

**Features**:
- **Tab Switching**: Toggle between Sign In and Sign Up
- **OTP Authentication**: Phone/Email OTP verification
- **Social Login**: Google, Facebook integration
- **Form Validation**: Real-time input validation
- **Loading States**: Progress indicators
- **Error Handling**: Clear error messages

**Structure**:
```javascript
<Modal isOpen={isOpen} onClose={onClose}>
  <div className="auth-modal">
    <Tabs>
      <Tab label="Sign In">
        <SignInForm />
      </Tab>
      <Tab label="Sign Up">
        <SignUpForm />
      </Tab>
    </Tabs>
  </div>
</Modal>
```

### ConfirmationModal.jsx
**Purpose**: Generic confirmation dialog for destructive actions

**Props**:
```javascript
{
  isOpen: boolean,
  onClose: () => void,
  onConfirm: () => void,
  title: string,
  message: string,
  confirmText: string,
  cancelText: string,
  type: 'danger' | 'warning' | 'info'
}
```

**Usage**:
```javascript
<ConfirmationModal
  isOpen={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  onConfirm={handleDelete}
  title="Delete Booking"
  message="Are you sure you want to delete this booking? This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  type="danger"
/>
```

### BookingDetailsModal.jsx
**Purpose**: Display detailed booking information

**Features**:
- **Booking Summary**: All booking details
- **Program Information**: Title, description, instructor
- **Schedule**: Date, time, duration
- **Payment Details**: Amount, payment method, transaction ID
- **Actions**: Cancel, reschedule, download invoice
- **Status Badge**: Upcoming, completed, cancelled

**Data Structure**:
```javascript
{
  bookingId: string,
  programId: string,
  programTitle: string,
  programImage: string,
  programType: string,
  bookingDate: timestamp,
  scheduleDate: timestamp,
  scheduleTime: string,
  duration: number,
  amount: number,
  paymentId: string,
  status: 'upcoming' | 'completed' | 'cancelled',
  cancellationPolicy: string
}
```

### SlotSelectionModal.jsx
**Purpose**: Select time slot for live sessions

**Features**:
- **Calendar View**: Date picker
- **Available Slots**: Time slots with capacity
- **Capacity Indicator**: Remaining seats
- **Price Display**: Per-slot pricing
- **Multi-slot Selection**: Book multiple slots
- **Conflict Detection**: Prevent double booking

**Slot Display**:
```javascript
<div className="slot-grid">
  {slots.map(slot => (
    <div 
      key={slot.id}
      className={`slot ${slot.available ? 'available' : 'full'}`}
      onClick={() => handleSlotSelect(slot)}
    >
      <div className="time">{slot.time}</div>
      <div className="capacity">
        {slot.remainingCapacity} / {slot.totalCapacity} seats
      </div>
      <div className="price">₹{slot.price}</div>
    </div>
  ))}
</div>
```

### VideoPlayerModal.jsx
**Purpose**: Full-screen video player for recorded sessions

**Features**:
- **Video Controls**: Play, pause, seek, volume
- **Quality Selection**: 360p, 480p, 720p, 1080p
- **Playback Speed**: 0.5x to 2x
- **Subtitles**: Multiple language support
- **Progress Tracking**: Resume from last position
- **Fullscreen Mode**: Native fullscreen support
- **Picture-in-Picture**: PiP mode
- **Keyboard Shortcuts**: Space, arrows, F key

**Video Player Integration**:
```javascript
<Modal isOpen={isOpen} onClose={onClose} fullScreen>
  <VideoPlayer
    src={videoUrl}
    poster={thumbnailUrl}
    onProgress={handleProgress}
    onEnded={handleEnded}
    controls
    autoPlay
  />
</Modal>
```

### CouponModal.jsx
**Purpose**: Apply and manage discount coupons

**Features**:
- **Code Input**: Enter coupon code
- **Available Coupons**: List of applicable coupons
- **Validation**: Real-time code validation
- **Discount Preview**: Show discount amount
- **Terms Display**: Coupon terms and conditions
- **Auto-apply**: Apply best coupon automatically

**Coupon List**:
```javascript
<div className="available-coupons">
  {coupons.map(coupon => (
    <div key={coupon.code} className="coupon-card">
      <div className="coupon-code">{coupon.code}</div>
      <div className="coupon-discount">
        {coupon.discountType === 'percentage' 
          ? `${coupon.discountValue}% OFF`
          : `₹${coupon.discountValue} OFF`
        }
      </div>
      <div className="coupon-terms">{coupon.description}</div>
      <button onClick={() => handleApply(coupon)}>
        Apply
      </button>
    </div>
  ))}
</div>
```

### ImageGalleryModal.jsx
**Purpose**: Full-screen image gallery viewer

**Features**:
- **Image Carousel**: Swipe through images
- **Zoom**: Pinch to zoom
- **Thumbnails**: Bottom thumbnail strip
- **Navigation**: Previous/Next buttons
- **Close Button**: Exit gallery
- **Touch Gestures**: Swipe, pinch, tap

### FilterModal.jsx
**Purpose**: Mobile-friendly filter interface

**Features**:
- **Category Filters**: Select categories
- **Price Range**: Slider for price
- **Date Range**: Date picker
- **Location**: Location selector
- **Sort Options**: Sort by various criteria
- **Apply/Reset**: Apply filters or reset all
- **Active Filter Count**: Badge showing active filters

### ShareModal.jsx
**Purpose**: Share content on social media

**Features**:
- **Social Platforms**: Facebook, Twitter, WhatsApp, LinkedIn, Email
- **Copy Link**: Copy URL to clipboard
- **QR Code**: Generate QR code for sharing
- **Custom Message**: Edit share message
- **Preview**: Show share preview

**Share Options**:
```javascript
const shareOptions = [
  {
    name: 'WhatsApp',
    icon: <FaWhatsapp />,
    handler: () => shareOnWhatsApp(url, message)
  },
  {
    name: 'Facebook',
    icon: <FaFacebook />,
    handler: () => shareOnFacebook(url)
  },
  {
    name: 'Twitter',
    icon: <FaTwitter />,
    handler: () => shareOnTwitter(url, message)
  },
  {
    name: 'Email',
    icon: <FaEnvelope />,
    handler: () => shareViaEmail(url, message)
  },
  {
    name: 'Copy Link',
    icon: <FaCopy />,
    handler: () => copyToClipboard(url)
  }
];
```

### ReviewModal.jsx
**Purpose**: Submit program reviews and ratings

**Features**:
- **Star Rating**: 1-5 star selection
- **Review Text**: Detailed feedback
- **Image Upload**: Add photos to review
- **Anonymous Option**: Post anonymously
- **Edit Review**: Modify existing reviews
- **Guidelines**: Review submission guidelines

## Base Modal Component

### Modal.jsx
**Purpose**: Reusable base modal component

**Props**:
```javascript
{
  isOpen: boolean,
  onClose: () => void,
  title?: string,
  children: ReactNode,
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full',
  closeOnOverlayClick?: boolean,
  showCloseButton?: boolean,
  className?: string
}
```

**Implementation**:
```javascript
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={closeOnOverlayClick ? onClose : undefined}>
      <div className={`modal-content modal-${size}`} onClick={(e) => e.stopPropagation()}>
        {showCloseButton && (
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        )}
        {title && <h2 className="modal-title">{title}</h2>}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};
```

## Styling

### Modal Overlay
```css
.modal-overlay {
  @apply fixed inset-0 z-50;
  @apply bg-black bg-opacity-50;
  @apply flex items-center justify-center;
  @apply p-4 overflow-y-auto;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl;
  @apply relative max-h-[90vh] overflow-y-auto;
  @apply animate-fadeIn;
}

.modal-sm { @apply max-w-sm; }
.modal-md { @apply max-w-md; }
.modal-lg { @apply max-w-lg; }
.modal-xl { @apply max-w-4xl; }
.modal-full { @apply w-full h-full max-w-none max-h-none; }
```

### Modal Animations
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-content {
  animation: fadeIn 0.2s ease-out;
}
```

## Accessibility

- **Focus Trap**: Keep focus within modal
- **ESC Key**: Close modal on ESC press
- **ARIA Labels**: Proper ARIA attributes
- **Screen Reader**: Announce modal opening
- **Focus Management**: Return focus on close

**Focus Trap Implementation**:
```javascript
useEffect(() => {
  if (!isOpen) return;
  
  const focusableElements = modalRef.current.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleTab = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };
  
  modalRef.current.addEventListener('keydown', handleTab);
  firstElement?.focus();
  
  return () => {
    modalRef.current?.removeEventListener('keydown', handleTab);
  };
}, [isOpen]);
```

## Best Practices

1. **Portal Rendering**: Render modals at root level
2. **Body Scroll Lock**: Prevent background scrolling
3. **Focus Management**: Trap and restore focus
4. **ESC Key**: Always allow ESC to close
5. **Overlay Click**: Optional close on overlay click
6. **Loading States**: Show loading during async operations
7. **Error Handling**: Display errors within modal
8. **Mobile Optimization**: Full-screen on mobile
9. **Animation**: Smooth enter/exit animations
10. **Accessibility**: WCAG 2.1 AA compliance

## Future Enhancements

- Nested modals support
- Modal stacking management
- Swipe to dismiss on mobile
- Custom animations
- Modal history (back button)
- Lazy loading modal content
- Modal templates library
- A/B testing integration
