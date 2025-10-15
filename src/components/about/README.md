# About Components Documentation

## Overview
This folder contains components for the About Us page, showcasing the Urban Pilgrim platform's mission, team, and values.

## Components

### AboutHero.jsx
**Purpose**: Hero section for About page

**Features**:
- **Hero Image**: Large background image
- **Mission Statement**: Platform mission
- **Value Proposition**: Key benefits
- **CTA Button**: Call to action

### OurStory.jsx
**Purpose**: Platform origin story and journey

**Features**:
- **Timeline**: Company history
- **Milestones**: Key achievements
- **Vision**: Future goals
- **Founder Message**: Personal note

### TeamSection.jsx
**Purpose**: Display team members

**Features**:
- **Team Grid**: Team member cards
- **Photos**: Professional headshots
- **Roles**: Position and expertise
- **Social Links**: LinkedIn, Twitter
- **Bio**: Brief background

**Team Member Structure**:
```javascript
{
  name: string,
  role: string,
  photo: string,
  bio: string,
  expertise: string[],
  social: {
    linkedin: string,
    twitter: string,
    email: string
  }
}
```

### ValuesSection.jsx
**Purpose**: Display company values and principles

**Features**:
- **Value Cards**: Core values
- **Icons**: Visual representations
- **Descriptions**: Value explanations

**Values Structure**:
```javascript
const values = [
  {
    title: 'Authenticity',
    description: 'Genuine spiritual experiences',
    icon: <FaHeart />
  },
  {
    title: 'Community',
    description: 'Building connections',
    icon: <FaUsers />
  },
  {
    title: 'Growth',
    description: 'Personal transformation',
    icon: <FaSeedling />
  }
];
```

### StatsSection.jsx
**Purpose**: Platform statistics and achievements

**Features**:
- **Counter Animation**: Animated numbers
- **Key Metrics**: Users, sessions, retreats
- **Visual Impact**: Large numbers with icons

**Stats Example**:
```javascript
const stats = [
  { label: 'Happy Users', value: 10000, icon: <FaUsers /> },
  { label: 'Sessions Conducted', value: 5000, icon: <FaCalendar /> },
  { label: 'Retreats Organized', value: 500, icon: <FaMountain /> },
  { label: 'Expert Guides', value: 100, icon: <FaStar /> }
];
```

### TestimonialsSection.jsx
**Purpose**: User testimonials and success stories

**Features**:
- **Testimonial Carousel**: Rotating testimonials
- **User Photos**: Verified users
- **Ratings**: Star ratings
- **Stories**: Transformation stories

### PartnersSection.jsx
**Purpose**: Display partner organizations and certifications

**Features**:
- **Partner Logos**: Organization logos
- **Certifications**: Industry certifications
- **Accreditations**: Professional accreditations

## Styling Patterns

### Hero Section
```css
.about-hero {
  @apply relative h-screen flex items-center justify-center;
  @apply bg-gradient-to-br from-blue-600 to-purple-600;
  @apply text-white text-center;
}

.about-hero::before {
  @apply absolute inset-0 bg-black opacity-40;
  content: '';
}
```

### Team Grid
```css
.team-grid {
  @apply grid gap-8;
  @apply grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4;
}

.team-member-card {
  @apply bg-white rounded-lg shadow-lg overflow-hidden;
  @apply transition-transform duration-300;
  @apply hover:-translate-y-2 hover:shadow-2xl;
}
```

## Best Practices

1. **Storytelling**: Compelling narrative
2. **Visual Appeal**: High-quality images
3. **Credibility**: Real testimonials
4. **Transparency**: Honest communication
5. **Accessibility**: Screen reader friendly
6. **Mobile**: Responsive design
7. **SEO**: Proper meta tags
8. **Performance**: Optimized images
