# Footer Components Documentation

## Overview
This folder contains footer components for the Urban Pilgrim platform, including the main footer and any footer-related sub-components.

## Components

### Footer.jsx
**Purpose**: Main footer component displayed at the bottom of all pages

**Sections**:

#### 1. Company Information
- **Logo**: Urban Pilgrim branding
- **Tagline**: Mission statement or slogan
- **Description**: Brief about the platform
- **Social Media Links**: Facebook, Instagram, Twitter, LinkedIn, YouTube

#### 2. Quick Links
- Home
- About Us
- Sessions
- Retreats
- Guides
- Workshops
- Gift Cards
- Contact Us

#### 3. Legal & Policies
- Terms & Conditions
- Privacy Policy
- Refund Policy
- Cancellation Policy
- Cookie Policy

#### 4. Contact Information
- **Email**: support@urbanpilgrim.com
- **Phone**: +91 XXXXXXXXXX
- **Address**: Office location
- **Business Hours**: Monday - Saturday, 9 AM - 6 PM

#### 5. Newsletter Subscription
- Email input field
- Subscribe button
- Success/error messages
- Privacy notice

**Structure**:
```javascript
<footer className="bg-gray-900 text-white">
  <div className="container mx-auto px-4 py-12">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Company Info */}
      <div>
        <Logo />
        <Description />
        <SocialLinks />
      </div>
      
      {/* Quick Links */}
      <div>
        <h3>Quick Links</h3>
        <LinkList />
      </div>
      
      {/* Legal */}
      <div>
        <h3>Legal</h3>
        <PolicyLinks />
      </div>
      
      {/* Contact & Newsletter */}
      <div>
        <ContactInfo />
        <Newsletter />
      </div>
    </div>
    
    {/* Copyright */}
    <div className="border-t border-gray-700 mt-8 pt-8">
      <Copyright />
    </div>
  </div>
</footer>
```

**Features**:
- **Responsive Grid**: 4 columns on desktop, stacked on mobile
- **Social Media Integration**: Links to all social platforms
- **Newsletter Signup**: Email subscription functionality
- **Dynamic Links**: React Router integration
- **SEO Optimized**: Proper semantic HTML
- **Accessibility**: ARIA labels and keyboard navigation

**Newsletter Subscription**:
```javascript
const handleNewsletterSubmit = async (email) => {
  try {
    await addDoc(collection(db, 'newsletter_subscribers'), {
      email,
      subscribedAt: serverTimestamp(),
      isActive: true
    });
    toast.success('Subscribed successfully!');
    setEmail('');
  } catch (error) {
    toast.error('Subscription failed');
  }
};
```

**Social Media Links**:
```javascript
const socialLinks = [
  { 
    name: 'Facebook', 
    icon: <FaFacebook />, 
    url: 'https://facebook.com/urbanpilgrim' 
  },
  { 
    name: 'Instagram', 
    icon: <FaInstagram />, 
    url: 'https://instagram.com/urbanpilgrim' 
  },
  { 
    name: 'Twitter', 
    icon: <FaTwitter />, 
    url: 'https://twitter.com/urbanpilgrim' 
  },
  { 
    name: 'LinkedIn', 
    icon: <FaLinkedin />, 
    url: 'https://linkedin.com/company/urbanpilgrim' 
  },
  { 
    name: 'YouTube', 
    icon: <FaYoutube />, 
    url: 'https://youtube.com/@urbanpilgrim' 
  }
];
```

## Styling

### Color Scheme
```css
.footer {
  @apply bg-gray-900 text-gray-300;
}

.footer-heading {
  @apply text-white text-lg font-semibold mb-4;
}

.footer-link {
  @apply text-gray-400 hover:text-white;
  @apply transition-colors duration-200;
}

.social-icon {
  @apply w-10 h-10 rounded-full;
  @apply bg-gray-800 hover:bg-blue-600;
  @apply flex items-center justify-center;
  @apply transition-all duration-300;
}
```

### Newsletter Form
```css
.newsletter-form {
  @apply flex flex-col sm:flex-row gap-2;
}

.newsletter-input {
  @apply flex-1 px-4 py-2;
  @apply bg-gray-800 border border-gray-700;
  @apply text-white rounded-md;
  @apply focus:outline-none focus:border-blue-500;
}

.newsletter-button {
  @apply px-6 py-2 bg-blue-600;
  @apply text-white rounded-md;
  @apply hover:bg-blue-700 transition-colors;
}
```

## Firebase Integration

### Newsletter Collection
```javascript
// Collection: newsletter_subscribers
{
  email: string,
  subscribedAt: timestamp,
  isActive: boolean,
  source: 'footer' | 'popup' | 'checkout',
  preferences: {
    sessions: boolean,
    retreats: boolean,
    guides: boolean,
    promotions: boolean
  }
}
```

### Contact Form Submission
```javascript
const handleContactSubmit = async (formData) => {
  try {
    await addDoc(collection(db, 'contact_inquiries'), {
      ...formData,
      submittedAt: serverTimestamp(),
      status: 'pending'
    });
    toast.success('Message sent successfully!');
  } catch (error) {
    toast.error('Failed to send message');
  }
};
```

## Responsive Design

### Mobile (< 768px)
- Single column layout
- Stacked sections
- Larger tap targets
- Simplified newsletter form

### Tablet (768px - 1024px)
- 2 column grid
- Condensed spacing
- Optimized for touch

### Desktop (> 1024px)
- 4 column grid
- Full feature display
- Hover effects enabled

## Accessibility Features

- **Semantic HTML**: `<footer>`, `<nav>`, `<address>` tags
- **ARIA Labels**: Screen reader support for icons
- **Keyboard Navigation**: Tab-accessible links
- **Focus Indicators**: Visible focus states
- **Alt Text**: Descriptive text for images
- **Color Contrast**: WCAG AA compliant

## SEO Optimization

- **Structured Data**: Schema.org markup for organization
- **Internal Linking**: Links to all major pages
- **Contact Information**: Properly formatted
- **Social Profiles**: Linked for social signals

## Performance

- **Lazy Loading**: Images loaded on demand
- **Optimized Icons**: SVG icons for scalability
- **Minimal Dependencies**: Lightweight implementation
- **Cached Data**: Newsletter preferences cached

## Legal Compliance

### GDPR Compliance
- Newsletter consent checkbox
- Unsubscribe link in emails
- Privacy policy link
- Data processing notice

### Cookie Policy
- Cookie consent banner integration
- Cookie policy page link
- Preference management

## Best Practices

1. **Consistent Branding**: Match header styling
2. **Mobile-First**: Design for mobile, enhance for desktop
3. **Loading States**: Show feedback during submissions
4. **Error Handling**: Clear error messages
5. **Validation**: Email format validation
6. **Security**: Sanitize user inputs
7. **Analytics**: Track newsletter signups
8. **Testing**: Test all links regularly

## Future Enhancements

- Multi-language support
- Dynamic content from CMS
- Live chat integration
- App download links
- Payment method icons
- Trust badges and certifications
- Blog feed preview
- Testimonial snippet
