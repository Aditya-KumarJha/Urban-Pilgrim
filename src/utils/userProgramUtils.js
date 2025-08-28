// Utility functions for checking user program ownership

/**
 * Check if user has purchased a specific program
 * @param {Array} userPrograms - Array of user's purchased programs
 * @param {string} programTitle - Title of the program to check
 * @param {string} programId - ID of the program to check (optional)
 * @returns {boolean} - True if user owns the program
 */
export const hasUserPurchasedProgram = (userPrograms, programTitle, programId = null) => {
    if (!userPrograms || !Array.isArray(userPrograms)) return false;
    
    return userPrograms.some(program => {
        // Check by title (primary method)
        if (program.title === programTitle) return true;
        
        // Check by ID if provided
        if (programId && program.id === programId) return true;
        
        // Check nested structures for different program types
        if (program.recordedProgramCard?.title === programTitle) return true;
        if (program.liveSessionCard?.title === programTitle) return true;
        if (program.pilgrimRetreatCard?.title === programTitle) return true;
        if (program.guideCard?.title === programTitle) return true;
        
        return false;
    });
};

/**
 * Get the purchased program details if user owns it
 * @param {Array} userPrograms - Array of user's purchased programs
 * @param {string} programTitle - Title of the program to check
 * @returns {Object|null} - Program object if found, null otherwise
 */
export const getUserPurchasedProgram = (userPrograms, programTitle) => {
    if (!userPrograms || !Array.isArray(userPrograms)) return null;
    
    return userPrograms.find(program => {
        if (program.title === programTitle) return true;
        if (program.recordedProgramCard?.title === programTitle) return true;
        if (program.liveSessionCard?.title === programTitle) return true;
        if (program.pilgrimRetreatCard?.title === programTitle) return true;
        if (program.guideCard?.title === programTitle) return true;
        return false;
    }) || null;
};

/**
 * Check if user's subscription is still active (not expired)
 * @param {Object} purchasedProgram - The purchased program object
 * @returns {boolean} - True if subscription is active
 */
export const isSubscriptionActive = (purchasedProgram) => {
    if (!purchasedProgram) return false;
    
    // If no expiration date, it's a one-time purchase (always active)
    if (!purchasedProgram.expirationDate) return true;
    
    // Check if current date is before expiration
    const now = new Date();
    const expirationDate = new Date(purchasedProgram.expirationDate);
    
    return now <= expirationDate;
};

/**
 * Get the appropriate button text and action based on program ownership
 * @param {Array} userPrograms - Array of user's purchased programs
 * @param {string} programTitle - Title of the program
 * @param {string} programType - Type of program ('retreat', 'guide', 'session', etc.)
 * @returns {Object} - Button configuration object
 */
export const getProgramButtonConfig = (userPrograms, programTitle, programType = 'program') => {
    const hasProgram = hasUserPurchasedProgram(userPrograms, programTitle);
    
    if (!hasProgram) {
        return {
            text: 'Book Now',
            action: 'book',
            variant: 'primary',
            className: 'bg-[#2F6288] text-white hover:bg-[#2F6288]/90'
        };
    }
    
    const purchasedProgram = getUserPurchasedProgram(userPrograms, programTitle);
    const isActive = isSubscriptionActive(purchasedProgram);
    
    if (!isActive) {
        return {
            text: 'Renew Subscription',
            action: 'renew',
            variant: 'warning',
            className: 'bg-orange-500 text-white hover:bg-orange-600'
        };
    }
    
    // Determine appropriate "View" text based on program type
    let viewText = 'View Program';
    if (programType === 'session' || programType === 'guide') {
        viewText = 'View Session';
    } else if (programType === 'retreat') {
        viewText = 'View Retreat';
    }
    
    return {
        text: viewText,
        action: 'view',
        variant: 'secondary',
        className: 'bg-green-600 text-white hover:bg-green-700'
    };
};
