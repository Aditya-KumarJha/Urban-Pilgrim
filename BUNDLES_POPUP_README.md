# Bundles Popup Feature for Retreat Page

## Overview
This feature adds a bundles popup that appears when users click the "Book Now" button on the retreat page. Users can view available bundles, add them to cart, or add the retreat directly to cart.

## Features

### 🎯 Core Functionality
- **Bundles Popup**: Shows available bundles when "Book Now" is clicked
- **Carousel Navigation**: Infinite scroll with navigation arrows and dots
- **Responsive Design**: Adapts to different screen sizes (1-3 bundles per view)
- **Add to Cart**: Users can add bundles or retreats to cart
- **Smart Navigation**: Auto-adjusts bundles per view based on screen size

### 📱 Responsive Design
- **Mobile (< 640px)**: 1 bundle per view
- **Tablet (641px - 1023px)**: 2 bundles per view  
- **Desktop (≥ 1024px)**: 3 bundles per view

### 🎨 UI Components
- **Header**: Gradient background with title and close button
- **Bundle Cards**: Display bundle variants with pricing and programs
- **Navigation**: Left/right arrows for carousel navigation
- **Dots Indicator**: Shows current position in carousel
- **Footer**: Options to continue shopping or add retreat to cart

## Implementation Details

### Files Created/Modified

#### New Files
- `src/components/pilgrim_retreats/BundlesPopup.jsx` - Main popup component
- `src/components/pilgrim_retreats/BundlesPopup.css` - Styling for popup

#### Modified Files
- `src/components/pilgrim_retreats/Retreatdescription.jsx` - Added popup integration
- `src/components/ui/button/index.jsx` - Added onClick support
- `src/services/bundleService.js` - Fixed syntax errors
- `src/features/bundleSlice.js` - Fixed syntax errors

### Key Components

#### BundlesPopup Component
```jsx
<BundlesPopup 
    isOpen={showBundlesPopup}
    onClose={() => setShowBundlesPopup(false)}
    retreatData={retreatData}
/>
```

#### State Management
- Uses Redux for cart management
- Local state for popup visibility and carousel navigation
- Fetches bundles from Firebase on popup open

#### Cart Integration
- Bundles are added with unique IDs (`${bundle.id}-${variant}`)
- Retreats can be added directly from footer
- Cart items include type, pricing, and program details

## Usage

### For Users
1. Navigate to any retreat page
2. Click "Book Now" button
3. View available bundles in the popup
4. Choose to:
   - Add a bundle to cart
   - Add the retreat directly to cart
   - Continue shopping

### For Developers
1. Ensure bundle data exists in Firebase
2. Bundles must have `isActive: true` to appear
3. Each bundle should have `variant1` and/or `variant2` with programs
4. Bundle structure should include pricing and discount information

## Bundle Data Structure

```javascript
{
    id: "bundle-id",
    name: "Bundle Name",
    description: "Bundle description",
    isActive: true,
    discount: 20, // percentage
    variant1: {
        name: "3 Programs Bundle",
        price: 1500, // discounted price
        totalPrice: 2000, // original price
        programs: [
            { title: "Program 1", price: 800 },
            { title: "Program 2", price: 700 },
            { title: "Program 3", price: 500 }
        ]
    },
    variant2: {
        name: "5 Programs Bundle",
        price: 2500,
        totalPrice: 3500,
        programs: [/* ... */]
    }
}
```

## Styling

### CSS Classes
- `.bundles-popup-overlay` - Backdrop styling
- `.bundles-popup-content` - Main content area
- `.bundles-grid` - Responsive grid layout
- `.bundle-variant` - Individual variant styling
- `.bundles-nav-arrow` - Navigation arrows
- `.bundles-dots` - Carousel dots indicator

### Color Scheme
- Primary: `#2F6288` (Blue)
- Secondary: `#1e4a6b` (Dark Blue)
- Success: `#059669` (Green)
- Background: `#f9fafb` (Light Gray)

## Dependencies

### Required Packages
- `framer-motion` - Animations and transitions
- `lucide-react` - Icons
- `react-redux` - State management
- `firebase` - Data fetching

### Redux Store
- `bundleSlice` - Bundle state management
- `cartSlice` - Cart functionality

## Future Enhancements

### Potential Improvements
1. **Bundle Filtering**: Add category or price filters
2. **Search Functionality**: Search within bundles
3. **Bundle Comparison**: Side-by-side bundle comparison
4. **Wishlist**: Save bundles for later
5. **Personalization**: Show bundles based on user preferences
6. **Analytics**: Track bundle view and conversion rates

### Performance Optimizations
1. **Lazy Loading**: Load bundles progressively
2. **Image Optimization**: Compress bundle images
3. **Caching**: Cache bundle data locally
4. **Virtual Scrolling**: For large numbers of bundles

## Troubleshooting

### Common Issues
1. **Bundles not showing**: Check if bundles have `isActive: true`
2. **Cart not updating**: Verify Redux store configuration
3. **Styling issues**: Check if CSS file is imported
4. **Navigation not working**: Ensure bundles array has sufficient items

### Debug Steps
1. Check browser console for errors
2. Verify bundle data structure in Firebase
3. Confirm Redux actions are dispatching correctly
4. Test responsive behavior on different screen sizes

## Testing

### Manual Testing
1. Test on different screen sizes
2. Verify carousel navigation
3. Test add to cart functionality
4. Check responsive behavior
5. Test with empty bundle arrays

### Automated Testing
- Unit tests for component logic
- Integration tests for Redux actions
- E2E tests for user workflows
- Responsive design tests

## Support

For issues or questions:
1. Check this README first
2. Review browser console for errors
3. Verify data structure in Firebase
4. Test with sample bundle data
5. Check Redux DevTools for state changes
