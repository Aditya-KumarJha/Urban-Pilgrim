# Upcoming Events Components Documentation

## Overview
This folder contains components for displaying and managing upcoming events on the Urban Pilgrim homepage, with admin-curated ordering functionality.

## Components

### UpcomingEvents.jsx
**Purpose**: Display upcoming events section on homepage

**Features**:
- Admin-curated order from Firebase
- Multi-source events (sessions, retreats, workshops, guides)
- Visibility control
- Category and date filtering
- Calendar view option
- Fallback to all events if no admin order

### EventCard.jsx
**Purpose**: Display individual event in card format

**Features**:
- Event image and details
- Date, time, location
- Category badge
- Price display
- CTA button

### EventFilters.jsx
**Purpose**: Filter upcoming events by category, date, location, price

### EventCalendar.jsx
**Purpose**: Calendar view with event indicators and selection

### AdminEventManager.jsx
**Purpose**: Admin component for managing event order

**Features**:
- Program selection from all sources
- Drag-and-drop reordering (@dnd-kit)
- Visibility toggle
- Save to Firebase
- Preview functionality

## Firebase Integration

**Collection**: `admin_settings/upcoming_events_order`

**Structure**:
```javascript
{
  selectedPrograms: [
    {
      id: string,
      title: string,
      image: string,
      category: string,
      type: string,
      isVisible: boolean,
      order: number
    }
  ],
  lastUpdated: timestamp
}
```

## Best Practices

1. **Real-time Updates**: Sync with Firebase
2. **Fallback**: Show all events if no admin order
3. **Performance**: Lazy load event details
4. **Accessibility**: Keyboard navigation
5. **Mobile**: Touch-friendly drag-and-drop
6. **SEO**: Structured data for events
