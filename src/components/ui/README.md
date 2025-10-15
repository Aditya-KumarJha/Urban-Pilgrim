# UI Components Documentation

## Overview
This folder contains reusable UI components and design system elements used throughout the Urban Pilgrim platform.

## Components

### Button.jsx
**Purpose**: Reusable button component with variants

**Variants**:
- **Primary**: Main action buttons (blue)
- **Secondary**: Secondary actions (gray)
- **Danger**: Destructive actions (red)
- **Success**: Success actions (green)
- **Outline**: Outlined buttons
- **Ghost**: Transparent buttons
- **Link**: Link-style buttons

**Props**:
```javascript
{
  variant: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost' | 'link',
  size: 'sm' | 'md' | 'lg',
  disabled: boolean,
  loading: boolean,
  fullWidth: boolean,
  icon: ReactNode,
  iconPosition: 'left' | 'right',
  onClick: () => void,
  children: ReactNode
}
```

**Usage**:
```javascript
<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>

<Button variant="danger" loading={isLoading} icon={<FaTrash />}>
  Delete
</Button>
```

**Styling**:
```css
.btn-primary {
  @apply bg-blue-600 text-white;
  @apply hover:bg-blue-700 active:bg-blue-800;
  @apply disabled:bg-gray-300 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-800;
  @apply hover:bg-gray-300 active:bg-gray-400;
}

.btn-danger {
  @apply bg-red-600 text-white;
  @apply hover:bg-red-700 active:bg-red-800;
}
```

### Input.jsx
**Purpose**: Reusable input field component

**Types**:
- Text
- Email
- Password
- Number
- Tel
- URL
- Search
- Date
- Time

**Props**:
```javascript
{
  type: string,
  label: string,
  placeholder: string,
  value: string,
  onChange: (value) => void,
  error: string,
  disabled: boolean,
  required: boolean,
  icon: ReactNode,
  helperText: string
}
```

**Usage**:
```javascript
<Input
  type="email"
  label="Email Address"
  placeholder="Enter your email"
  value={email}
  onChange={setEmail}
  error={emailError}
  required
  icon={<FaEnvelope />}
/>
```

### Textarea.jsx
**Purpose**: Multi-line text input

**Props**:
```javascript
{
  label: string,
  placeholder: string,
  value: string,
  onChange: (value) => void,
  rows: number,
  maxLength: number,
  error: string,
  disabled: boolean,
  required: boolean
}
```

### Select.jsx
**Purpose**: Dropdown select component

**Props**:
```javascript
{
  label: string,
  options: Array<{ value: string, label: string }>,
  value: string,
  onChange: (value) => void,
  placeholder: string,
  error: string,
  disabled: boolean,
  required: boolean,
  searchable: boolean
}
```

**Usage**:
```javascript
<Select
  label="Category"
  options={[
    { value: 'yoga', label: 'Yoga' },
    { value: 'meditation', label: 'Meditation' },
    { value: 'wellness', label: 'Wellness' }
  ]}
  value={category}
  onChange={setCategory}
  searchable
/>
```

### Checkbox.jsx
**Purpose**: Checkbox input component

**Props**:
```javascript
{
  label: string,
  checked: boolean,
  onChange: (checked) => void,
  disabled: boolean,
  error: string
}
```

### Radio.jsx
**Purpose**: Radio button component

**Props**:
```javascript
{
  name: string,
  options: Array<{ value: string, label: string }>,
  value: string,
  onChange: (value) => void,
  disabled: boolean,
  inline: boolean
}
```

### Switch.jsx
**Purpose**: Toggle switch component

**Props**:
```javascript
{
  checked: boolean,
  onChange: (checked) => void,
  label: string,
  disabled: boolean
}
```

**Usage**:
```javascript
<Switch
  checked={isActive}
  onChange={setIsActive}
  label="Active"
/>
```

### Card.jsx
**Purpose**: Container card component

**Props**:
```javascript
{
  title: string,
  subtitle: string,
  children: ReactNode,
  footer: ReactNode,
  hoverable: boolean,
  clickable: boolean,
  onClick: () => void
}
```

**Usage**:
```javascript
<Card 
  title="Program Title"
  subtitle="Program description"
  hoverable
  footer={<Button>View Details</Button>}
>
  <p>Card content goes here</p>
</Card>
```

### Badge.jsx
**Purpose**: Status badge component

**Variants**:
- **Default**: Gray badge
- **Primary**: Blue badge
- **Success**: Green badge
- **Warning**: Orange badge
- **Danger**: Red badge
- **Info**: Light blue badge

**Props**:
```javascript
{
  variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info',
  size: 'sm' | 'md' | 'lg',
  children: ReactNode,
  dot: boolean
}
```

**Usage**:
```javascript
<Badge variant="success">Active</Badge>
<Badge variant="danger" dot>Expired</Badge>
```

### Avatar.jsx
**Purpose**: User avatar component

**Props**:
```javascript
{
  src: string,
  alt: string,
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
  fallback: string,
  online: boolean
}
```

**Usage**:
```javascript
<Avatar 
  src={user.photoURL}
  alt={user.name}
  size="lg"
  online
  fallback={user.name.charAt(0)}
/>
```

### Spinner.jsx
**Purpose**: Loading spinner component

**Variants**:
- **Circle**: Circular spinner
- **Dots**: Three dots
- **Pulse**: Pulsing circle
- **Bars**: Loading bars

**Props**:
```javascript
{
  variant: 'circle' | 'dots' | 'pulse' | 'bars',
  size: 'sm' | 'md' | 'lg',
  color: string
}
```

### Skeleton.jsx
**Purpose**: Loading skeleton placeholder

**Props**:
```javascript
{
  variant: 'text' | 'circular' | 'rectangular',
  width: string | number,
  height: string | number,
  animation: 'pulse' | 'wave' | 'none'
}
```

**Usage**:
```javascript
<Skeleton variant="rectangular" width="100%" height={200} />
<Skeleton variant="text" width="80%" />
<Skeleton variant="circular" width={40} height={40} />
```

### Alert.jsx
**Purpose**: Alert/notification component

**Variants**:
- **Info**: Information alerts
- **Success**: Success messages
- **Warning**: Warning messages
- **Error**: Error messages

**Props**:
```javascript
{
  variant: 'info' | 'success' | 'warning' | 'error',
  title: string,
  message: string,
  closable: boolean,
  onClose: () => void,
  icon: ReactNode
}
```

**Usage**:
```javascript
<Alert
  variant="success"
  title="Success!"
  message="Your booking has been confirmed"
  closable
  onClose={handleClose}
/>
```

### Tooltip.jsx
**Purpose**: Tooltip component

**Props**:
```javascript
{
  content: string | ReactNode,
  position: 'top' | 'bottom' | 'left' | 'right',
  children: ReactNode,
  delay: number
}
```

**Usage**:
```javascript
<Tooltip content="Click to view details" position="top">
  <Button>Hover me</Button>
</Tooltip>
```

### Dropdown.jsx
**Purpose**: Dropdown menu component

**Props**:
```javascript
{
  trigger: ReactNode,
  items: Array<{
    label: string,
    icon: ReactNode,
    onClick: () => void,
    disabled: boolean,
    divider: boolean
  }>,
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
}
```

**Usage**:
```javascript
<Dropdown
  trigger={<Button>Menu</Button>}
  items={[
    { label: 'Edit', icon: <FaEdit />, onClick: handleEdit },
    { label: 'Delete', icon: <FaTrash />, onClick: handleDelete },
    { divider: true },
    { label: 'Archive', icon: <FaArchive />, onClick: handleArchive }
  ]}
/>
```

### Tabs.jsx
**Purpose**: Tab navigation component

**Props**:
```javascript
{
  tabs: Array<{ label: string, content: ReactNode, disabled: boolean }>,
  defaultTab: number,
  onChange: (index) => void,
  variant: 'line' | 'enclosed' | 'pills'
}
```

**Usage**:
```javascript
<Tabs
  tabs={[
    { label: 'Overview', content: <Overview /> },
    { label: 'Reviews', content: <Reviews /> },
    { label: 'FAQ', content: <FAQ /> }
  ]}
  variant="line"
/>
```

### Accordion.jsx
**Purpose**: Collapsible accordion component

**Props**:
```javascript
{
  items: Array<{
    title: string,
    content: ReactNode,
    defaultOpen: boolean
  }>,
  allowMultiple: boolean
}
```

**Usage**:
```javascript
<Accordion
  items={[
    { 
      title: 'What is included?', 
      content: <p>Details about inclusions</p> 
    },
    { 
      title: 'Cancellation policy', 
      content: <p>Cancellation details</p> 
    }
  ]}
  allowMultiple={false}
/>
```

### Breadcrumb.jsx
**Purpose**: Breadcrumb navigation

**Props**:
```javascript
{
  items: Array<{
    label: string,
    href: string,
    active: boolean
  }>,
  separator: ReactNode
}
```

**Usage**:
```javascript
<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Sessions', href: '/sessions' },
    { label: 'Yoga', href: '/sessions/yoga', active: true }
  ]}
/>
```

### Pagination.jsx
**Purpose**: Pagination component

**Props**:
```javascript
{
  currentPage: number,
  totalPages: number,
  onPageChange: (page) => void,
  siblingCount: number,
  showFirstLast: boolean
}
```

**Usage**:
```javascript
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  siblingCount={1}
  showFirstLast
/>
```

### Progress.jsx
**Purpose**: Progress bar component

**Props**:
```javascript
{
  value: number,
  max: number,
  variant: 'default' | 'success' | 'warning' | 'danger',
  showLabel: boolean,
  animated: boolean
}
```

**Usage**:
```javascript
<Progress 
  value={75} 
  max={100} 
  variant="success"
  showLabel
  animated
/>
```

### Divider.jsx
**Purpose**: Visual divider component

**Props**:
```javascript
{
  orientation: 'horizontal' | 'vertical',
  variant: 'solid' | 'dashed' | 'dotted',
  label: string
}
```

### Rating.jsx
**Purpose**: Star rating component

**Props**:
```javascript
{
  value: number,
  max: number,
  onChange: (value) => void,
  readonly: boolean,
  size: 'sm' | 'md' | 'lg',
  precision: number
}
```

**Usage**:
```javascript
<Rating
  value={rating}
  max={5}
  onChange={setRating}
  size="lg"
  precision={0.5}
/>
```

### Slider.jsx
**Purpose**: Range slider component

**Props**:
```javascript
{
  value: number | [number, number],
  min: number,
  max: number,
  step: number,
  onChange: (value) => void,
  marks: Array<{ value: number, label: string }>,
  showValue: boolean
}
```

**Usage**:
```javascript
<Slider
  value={priceRange}
  min={0}
  max={10000}
  step={100}
  onChange={setPriceRange}
  showValue
/>
```

### DatePicker.jsx
**Purpose**: Date selection component

**Props**:
```javascript
{
  value: Date,
  onChange: (date) => void,
  minDate: Date,
  maxDate: Date,
  disabled: boolean,
  placeholder: string,
  format: string
}
```

### TimePicker.jsx
**Purpose**: Time selection component

**Props**:
```javascript
{
  value: string,
  onChange: (time) => void,
  format: '12h' | '24h',
  step: number,
  disabled: boolean
}
```

## Design Tokens

### Colors
```javascript
const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8'
  },
  secondary: {
    50: '#f9fafb',
    500: '#6b7280',
    700: '#374151'
  },
  success: {
    500: '#10b981',
    600: '#059669'
  },
  warning: {
    500: '#f59e0b',
    600: '#d97706'
  },
  danger: {
    500: '#ef4444',
    600: '#dc2626'
  }
};
```

### Typography
```javascript
const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    serif: ['Georgia', 'serif'],
    mono: ['Menlo', 'monospace']
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem'
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  }
};
```

### Spacing
```javascript
const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem'
};
```

### Shadows
```javascript
const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
};
```

### Border Radius
```javascript
const borderRadius = {
  none: '0',
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  full: '9999px'
};
```

## Accessibility

All UI components follow WCAG 2.1 AA standards:
- **Keyboard Navigation**: Full keyboard support
- **ARIA Labels**: Proper ARIA attributes
- **Focus Indicators**: Visible focus states
- **Color Contrast**: Minimum 4.5:1 ratio
- **Screen Readers**: Screen reader compatible

## Best Practices

1. **Consistency**: Use design tokens for consistency
2. **Composition**: Compose complex components from simple ones
3. **Props**: Use TypeScript for prop validation
4. **Accessibility**: Always include ARIA labels
5. **Performance**: Memoize expensive components
6. **Testing**: Write unit tests for all components
7. **Documentation**: Document props and usage
8. **Storybook**: Create stories for visual testing
9. **Responsive**: Mobile-first responsive design
10. **Dark Mode**: Support dark mode variants

## Future Enhancements

- Dark mode support
- Animation library integration
- More chart components
- File upload component
- Rich text editor
- Color picker
- Image cropper
- Drag and drop components
- Virtual scroll list
- Infinite scroll
