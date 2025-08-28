// Subscription expiration utilities

/**
 * Calculate expiration date based on subscription type
 * @param {string} subscriptionType - 'monthly', 'quarterly', 'oneTime'
 * @param {Date} purchaseDate - Date when subscription was purchased
 * @returns {Date|null} - Expiration date or null for one-time purchases
 */
export const calculateExpirationDate = (subscriptionType, purchaseDate = new Date()) => {
    const date = new Date(purchaseDate);
    
    switch (subscriptionType) {
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            return date;
        case 'quarterly':
            date.setMonth(date.getMonth() + 3);
            return date;
        case 'oneTime':
            return null; // One-time purchases never expire
        default:
            return null;
    }
};

/**
 * Check if a subscription has expired
 * @param {Date|string|null} expirationDate - Expiration date
 * @returns {boolean} - True if expired, false otherwise
 */
export const isSubscriptionExpired = (expirationDate) => {
    if (!expirationDate) return false; // One-time purchases never expire
    
    const expDate = new Date(expirationDate);
    const now = new Date();
    
    return now > expDate;
};

/**
 * Get days remaining until expiration
 * @param {Date|string|null} expirationDate - Expiration date
 * @returns {number|null} - Days remaining or null if never expires
 */
export const getDaysUntilExpiration = (expirationDate) => {
    if (!expirationDate) return null; // One-time purchases never expire
    
    const expDate = new Date(expirationDate);
    const now = new Date();
    const diffTime = expDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
};

/**
 * Filter out expired subscriptions from user programs
 * @param {Array} userPrograms - Array of user programs
 * @returns {Array} - Filtered array without expired subscriptions
 */
export const filterExpiredSubscriptions = (userPrograms) => {
    return userPrograms.filter(program => {
        // Keep programs without expiration date (one-time purchases)
        if (!program.expirationDate) return true;
        
        // Check if subscription is still valid
        return !isSubscriptionExpired(program.expirationDate);
    });
};

/**
 * Get expired subscriptions from user programs
 * @param {Array} userPrograms - Array of user programs
 * @returns {Array} - Array of expired subscriptions
 */
export const getExpiredSubscriptions = (userPrograms) => {
    return userPrograms.filter(program => {
        // Skip programs without expiration date (one-time purchases)
        if (!program.expirationDate) return false;
        
        // Return only expired subscriptions
        return isSubscriptionExpired(program.expirationDate);
    });
};

/**
 * Add expiration data to cart items based on subscription type
 * @param {Array} cartItems - Cart items to process
 * @param {Date} purchaseDate - Purchase date
 * @returns {Array} - Cart items with expiration data
 */
export const addExpirationToCartItems = (cartItems, purchaseDate = new Date()) => {
    return cartItems.map(item => {
        // Determine subscription type from item data
        let subscriptionType = 'oneTime'; // default
        
        if (item.isFromBundle) {
            // For bundle items, check the bundle variant
            subscriptionType = item.bundleVariant || 'oneTime';
        } else if (item.subscriptionType) {
            // For individual items
            subscriptionType = item.subscriptionType;
        } else if (item.type) {
            // Infer from type if available
            if (item.type.includes('monthly')) subscriptionType = 'monthly';
            else if (item.type.includes('quarterly')) subscriptionType = 'quarterly';
        }
        
        const expirationDate = calculateExpirationDate(subscriptionType, purchaseDate);
        
        return {
            ...item,
            subscriptionType,
            purchaseDate: purchaseDate.toISOString(),
            expirationDate: expirationDate ? expirationDate.toISOString() : null,
            isExpired: false // Initially not expired
        };
    });
};

/**
 * Check subscription status and return user-friendly message
 * @param {Object} program - User program object
 * @returns {Object} - Status object with message and type
 */
export const getSubscriptionStatus = (program) => {
    if (!program.expirationDate) {
        return {
            type: 'lifetime',
            message: 'Lifetime Access',
            isActive: true,
            daysRemaining: null
        };
    }
    
    const daysRemaining = getDaysUntilExpiration(program.expirationDate);
    const isExpired = isSubscriptionExpired(program.expirationDate);
    
    if (isExpired) {
        return {
            type: 'expired',
            message: 'Subscription Expired',
            isActive: false,
            daysRemaining: 0
        };
    }
    
    if (daysRemaining <= 7) {
        return {
            type: 'expiring_soon',
            message: `Expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`,
            isActive: true,
            daysRemaining
        };
    }
    
    return {
        type: 'active',
        message: `${daysRemaining} days remaining`,
        isActive: true,
        daysRemaining
    };
};
