// Best selling tracking utilities

/**
 * Calculate best selling programs based on purchase count
 * @param {Array} programs - Array of programs with purchasedUsers data
 * @param {number} threshold - Minimum purchases to be considered best selling (default: 5)
 * @returns {Array} - Programs marked with bestSelling status
 */
export const calculateBestSellingPrograms = (programs, threshold = 5) => {
    if (!programs || !Array.isArray(programs)) return [];

    // Calculate purchase counts and add bestSelling flag
    const programsWithCounts = programs.map(program => {
        let purchaseCount = 0;

        // Count purchases from different data structures
        if (program.purchasedUsers && Array.isArray(program.purchasedUsers)) {
            purchaseCount = program.purchasedUsers.length;
        } else if (program.slides && Array.isArray(program.slides)) {
            // For sessions with slides structure
            purchaseCount = program.slides.reduce((total, slide) => {
                const slideUsers = slide.purchasedUsers || [];
                return total + slideUsers.length;
            }, 0);
        } else if (program.liveSessionCard?.purchasedUsers) {
            purchaseCount = program.liveSessionCard.purchasedUsers.length;
        } else if (program.recordedProgramCard?.purchasedUsers) {
            purchaseCount = program.recordedProgramCard.purchasedUsers.length;
        } else if (program.pilgrimRetreatCard?.purchasedUsers) {
            purchaseCount = program.pilgrimRetreatCard.purchasedUsers.length;
        }

        return {
            ...program,
            purchaseCount,
            isBestSelling: purchaseCount >= threshold
        };
    });

    return programsWithCounts;
};

/**
 * Get top best selling programs
 * @param {Array} programs - Array of programs with purchase counts
 * @param {number} limit - Number of top programs to return (default: 10)
 * @returns {Array} - Top best selling programs
 */
export const getTopBestSellingPrograms = (programs, limit = 10) => {
    return programs
        .filter(program => program.isBestSelling)
        .sort((a, b) => b.purchaseCount - a.purchaseCount)
        .slice(0, limit);
};

/**
 * Filter programs by best selling status
 * @param {Array} programs - Array of programs
 * @param {boolean} showBestSellingOnly - Whether to show only best selling programs
 * @returns {Array} - Filtered programs
 */
export const filterByBestSelling = (programs, showBestSellingOnly) => {
    if (!showBestSellingOnly) return programs;
    return programs.filter(program => program.isBestSelling);
};

/**
 * Get best selling statistics for a program category
 * @param {Array} programs - Array of programs
 * @returns {Object} - Statistics object
 */
export const getBestSellingStats = (programs) => {
    const totalPrograms = programs.length;
    const bestSellingPrograms = programs.filter(p => p.isBestSelling);
    const totalPurchases = programs.reduce((sum, p) => sum + (p.purchaseCount || 0), 0);
    const avgPurchasesPerProgram = totalPrograms > 0 ? totalPurchases / totalPrograms : 0;

    return {
        totalPrograms,
        bestSellingCount: bestSellingPrograms.length,
        bestSellingPercentage: totalPrograms > 0 ? (bestSellingPrograms.length / totalPrograms) * 100 : 0,
        totalPurchases,
        avgPurchasesPerProgram: Math.round(avgPurchasesPerProgram * 100) / 100
    };
};

/**
 * Update program purchase count (for real-time updates)
 * @param {Object} program - Program object
 * @param {number} newPurchaseCount - New purchase count
 * @param {number} threshold - Best selling threshold
 * @returns {Object} - Updated program object
 */
export const updateProgramPurchaseCount = (program, newPurchaseCount, threshold = 5) => {
    return {
        ...program,
        purchaseCount: newPurchaseCount,
        isBestSelling: newPurchaseCount >= threshold
    };
};

/**
 * Sort programs by best selling status and purchase count
 * @param {Array} programs - Array of programs
 * @param {string} sortOrder - 'desc' for highest first, 'asc' for lowest first
 * @returns {Array} - Sorted programs
 */
export const sortByBestSelling = (programs, sortOrder = 'desc') => {
    return [...programs].sort((a, b) => {
        // First sort by best selling status
        if (a.isBestSelling && !b.isBestSelling) return -1;
        if (!a.isBestSelling && b.isBestSelling) return 1;
        
        // Then sort by purchase count
        const aCount = a.purchaseCount || 0;
        const bCount = b.purchaseCount || 0;
        
        return sortOrder === 'desc' ? bCount - aCount : aCount - bCount;
    });
};

/**
 * Get best selling badge configuration
 * @param {Object} program - Program object
 * @returns {Object|null} - Badge configuration or null
 */
export const getBestSellingBadge = (program) => {
    if (!program.isBestSelling) return null;

    const purchaseCount = program.purchaseCount || 0;
    
    if (purchaseCount >= 50) {
        return {
            text: 'Top Seller',
            className: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
            icon: '🏆'
        };
    } else if (purchaseCount >= 20) {
        return {
            text: 'Best Seller',
            className: 'bg-gradient-to-r from-green-400 to-blue-500 text-white',
            icon: '⭐'
        };
    } else {
        return {
            text: 'Popular',
            className: 'bg-gradient-to-r from-blue-400 to-purple-500 text-white',
            icon: '🔥'
        };
    }
};
