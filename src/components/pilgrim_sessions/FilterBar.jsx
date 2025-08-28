import { useState, useEffect, useRef } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

export default function FilterBar({ onFiltersChange, initialFilters = {} }) {
    const [filters, setFilters] = useState({
        mode: initialFilters.mode || '',
        type: initialFilters.type || '',
        price: initialFilters.price || '',
        duration: initialFilters.duration || ''
    });

    const [dropdownStates, setDropdownStates] = useState({
        mode: false,
        type: false,
        price: false,
        duration: false,
    });

    const [filterOptions] = useState({
        modes: ['Online', 'Offline'],
        priceRanges: ['Under ₹1,000', '₹1,000-₹2,500', '₹2,500-₹5,000', '₹5,000+'],
        types: ['Live', 'Recorded'],
        durations: ['30 minutes', '1 hour', '90 minutes', '2 hours']
    });

    const dropdownRefs = useRef({});

    // Handle clicks outside dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            Object.keys(dropdownRefs.current).forEach(key => {
                if (dropdownRefs.current[key] && !dropdownRefs.current[key].contains(event.target)) {
                    setDropdownStates(prev => ({ ...prev, [key]: false }));
                }
            });
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Notify parent component of filter changes
    useEffect(() => {
        if (onFiltersChange) {
            onFiltersChange(filters);
        }
    }, [filters, onFiltersChange]);

    const toggleDropdown = (filterType) => {
        setDropdownStates(prev => ({
            ...prev,
            [filterType]: !prev[filterType]
        }));
    };

    const handleFilterSelect = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: prev[filterType] === value ? '' : value
        }));
        setDropdownStates(prev => ({ ...prev, [filterType]: false }));
    };

    const clearAllFilters = () => {
        setFilters({
            type: '',
            price: '',
            duration: ''
        });
    };

    const renderDropdown = (filterType, options, icon) => {
        const isOpen = dropdownStates[filterType];
        const selectedValue = filters[filterType];
        
        return (
            <div className="relative" ref={el => dropdownRefs.current[filterType] = el}>
                <button 
                    onClick={() => toggleDropdown(filterType)}
                    className={`px-4 py-1 border-2 rounded-full text-sm flex items-center gap-2 transition-colors ${
                        selectedValue 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-[#00000033] hover:border-gray-400'
                    }`}
                >
                    {icon && <img src={icon} alt="" className="w-4 h-4" />}
                    {selectedValue || filterType.charAt(0).toUpperCase() + filterType.slice(1).replace(/([A-Z])/g, ' $1')}
                    {isOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                </button>
                
                {isOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px] max-h-60 overflow-y-auto">
                        {options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleFilterSelect(filterType, option)}
                                className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                                    selectedValue === option ? 'bg-blue-50 text-blue-700' : ''
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const activeFiltersCount = Object.values(filters).filter(value => value !== '' && value !== false).length;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
                <span className="text-lg font-semibold">Filter:</span>
                
                {renderDropdown('type', filterOptions.types)}
                {renderDropdown('price', filterOptions.priceRanges)}
                {renderDropdown('duration', filterOptions.durations)}
                
                {activeFiltersCount > 0 && (
                    <button
                        onClick={clearAllFilters}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 underline"
                    >
                        Clear All ({activeFiltersCount})
                    </button>
                )}
            </div>
            
            {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-gray-600">Active filters:</span>
                    {Object.entries(filters).map(([key, value]) => 
                        (value && value !== false) && (
                            <span
                                key={key}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                            >
                                {value}
                                <button
                                    onClick={() => handleFilterSelect(key, value)}
                                    className="hover:text-blue-600"
                                >
                                    ×
                                </button>
                            </span>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
