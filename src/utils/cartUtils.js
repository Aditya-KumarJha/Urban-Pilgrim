// Utility functions for cart processing
import { addExpirationToCartItems } from './subscriptionUtils';

/**
 * Expands bundle items into individual cart items for backend processing
 * @param {Array} cartData - Array of cart items
 * @returns {Array} - Expanded cart items with bundles converted to individual items
 */
export const expandBundlesForCheckout = (cartData) => {
    const expandedItems = [];
    
    cartData.forEach(item => {
        if (item.type === 'bundle' && item.programs && item.programs.length > 0) {
            // Expand bundle into individual program items
            item.programs.forEach((program, index) => {
                const expandedItem = {
                    id: `${item.id}-program-${index}`,
                    originalBundleId: item.id,
                    bundleId: item.bundleId,
                    bundleVariant: item.variant,
                    bundleName: item.title,
                    title: program.title,
                    price: program.price || 0, // Individual program price if available
                    image: program.image || item.image,
                    type: program.type || 'program', // Individual program type
                    persons: item.persons || 1,
                    quantity: item.quantity || 1,
                    // Keep bundle reference for tracking
                    isFromBundle: true,
                    bundleDiscount: item.discount,
                    bundleTotalPrice: item.originalPrice,
                    // Include any additional program-specific data
                    ...program
                };
                expandedItems.push(expandedItem);
            });
        } else {
            // Keep non-bundle items as they are
            expandedItems.push({
                ...item,
                isFromBundle: false
            });
        }
    });
    
    return expandedItems;
};

/**
 * Calculates pricing for expanded cart items
 * @param {Array} expandedItems - Expanded cart items
 * @returns {Object} - Pricing breakdown
 */
export const calculateExpandedCartPricing = (expandedItems) => {
    let subtotal = 0;
    let bundleDiscount = 0;
    let regularDiscount = 0;
    
    expandedItems.forEach(item => {
        const itemTotal = (item.price * (item.persons || 1) * (item.quantity || 1));
        subtotal += itemTotal;
        
        if (item.isFromBundle) {
            // Bundle items already have discounted pricing
            // Calculate what the discount would be based on bundle savings
            if (item.bundleDiscount && item.bundleTotalPrice) {
                const bundleDiscountAmount = (item.bundleTotalPrice * item.bundleDiscount / 100) / item.programs?.length || 1;
                bundleDiscount += bundleDiscountAmount;
            }
        } else {
            // Apply regular discount to non-bundle items
            regularDiscount += Math.round(itemTotal * 0.2);
        }
    });
    
    const totalDiscount = bundleDiscount + regularDiscount;
    const total = subtotal - totalDiscount;
    
    return {
        subtotal,
        bundleDiscount,
        regularDiscount,
        totalDiscount,
        total,
        expandedItems
    };
};

/**
 * Prepares cart data for backend processing
 * @param {Array} cartData - Original cart data
 * @param {Object} formData - User form data
 * @param {Object} user - User object
 * @returns {Object} - Formatted data for backend
 */
export const prepareCheckoutData = (cartData, formData, user) => {
    const purchaseDate = new Date();
    const expandedItems = expandBundlesForCheckout(cartData);
    const pricing = calculateExpandedCartPricing(expandedItems);
    
    // Add expiration dates to expanded items
    const itemsWithExpiration = addExpirationToCartItems(expandedItems, purchaseDate);
    
    return {
        userId: user.uid,
        email: user.email,
        name: `${formData.firstName} ${formData.lastName}`,
        originalCartData: cartData, // Keep original for reference
        expandedCartData: itemsWithExpiration, // Individual items with expiration data
        pricing,
        formData,
        purchaseDate: purchaseDate.toISOString(),
        timestamp: purchaseDate.toISOString()
    };
};

/**
 * Prepare user programs data for Redux store after successful purchase
 * @param {Array} expandedCartData - Cart items with expiration data
 * @returns {Array} - Formatted user programs for Redux
 */
export const prepareUserProgramsData = (expandedCartData) => {
    return expandedCartData.map(item => ({
        id: item.id,
        title: item.title,
        type: item.type,
        subscriptionType: item.subscriptionType,
        purchaseDate: item.purchaseDate,
        expirationDate: item.expirationDate,
        isExpired: false,
        image: item.image,
        price: item.price,
        // One-time guide slot metadata to identify booked slots per user
        ...(item.type === 'guide' && item.subscriptionType === 'oneTime' && (item.slot || item.date) ? {
            slotDate: item.date || item.slot?.date,
            slotStart: item.slot?.startTime || item.slot?.time,
            slotEnd: item.slot?.endTime,
        } : {}),
        // Guide monthly: selectedSlots booked by user (if provided in checkout item)
        ...(item.type === 'guide' && (item.subscriptionType === 'monthly' || item.subscriptionType === 'Monthly') && Array.isArray(item.selectedSlots) && item.selectedSlots.length > 0 ? {
            selectedSlots: item.selectedSlots,
        } : {}),
        // Live sessions: include booked slots and sessionId if present so dashboard can deep-link
        ...(item.type === 'live' && Array.isArray(item.slots) && item.slots.length > 0 ? {
            slots: item.slots,
            sessionId: item.sessionId || null,
        } : {}),
        // Bundle information if applicable
        ...(item.isFromBundle && {
            bundleId: item.bundleId,
            bundleName: item.bundleName,
            bundleVariant: item.bundleVariant,
            isFromBundle: true
        })
    }));
};
