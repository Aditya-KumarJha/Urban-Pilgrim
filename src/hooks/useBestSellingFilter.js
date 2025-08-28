import { useMemo } from 'react';
import { 
    calculateBestSellingPrograms, 
    filterByBestSelling, 
    sortByBestSelling 
} from '../utils/bestSellingUtils';

/**
 * Custom hook for handling best selling program filtering and sorting
 * @param {Array} programs - Array of programs
 * @param {Object} filters - Filter object containing bestSelling boolean
 * @param {number} threshold - Minimum purchases to be considered best selling
 * @returns {Object} - Processed programs and utilities
 */
export const useBestSellingFilter = (programs = [], filters = {}, threshold = 5) => {
    const processedPrograms = useMemo(() => {
        // First, calculate best selling status for all programs
        const programsWithBestSelling = calculateBestSellingPrograms(programs, threshold);
        
        // Apply best selling filter if active
        const filteredPrograms = filterByBestSelling(programsWithBestSelling, filters.bestSelling);
        
        // Sort by best selling status (best sellers first)
        const sortedPrograms = sortByBestSelling(filteredPrograms, 'desc');
        
        return sortedPrograms;
    }, [programs, filters.bestSelling, threshold]);

    const stats = useMemo(() => {
        const programsWithBestSelling = calculateBestSellingPrograms(programs, threshold);
        const bestSellingPrograms = programsWithBestSelling.filter(p => p.isBestSelling);
        
        return {
            totalPrograms: programs.length,
            bestSellingCount: bestSellingPrograms.length,
            filteredCount: processedPrograms.length,
            showingBestSellingOnly: filters.bestSelling || false
        };
    }, [programs, processedPrograms, filters.bestSelling, threshold]);

    return {
        programs: processedPrograms,
        stats,
        hasBestSellingFilter: filters.bestSelling || false
    };
};
