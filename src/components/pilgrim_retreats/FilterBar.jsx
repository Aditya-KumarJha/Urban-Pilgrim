import { useState, useEffect, useRef } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

export default function FilterBar({ onFiltersChange, initialFilters = {} }) {
    const [filters, setFilters] = useState({
        price: initialFilters.price || '',
        location: initialFilters.location || '',
        features: initialFilters.features || ''
    });

    const [dropdownStates, setDropdownStates] = useState({
        features: false,
        price: false,
        location: false,
    });

    const [filterOptions] = useState({
        features: ['Yoga', 'Meditation', 'Nature Walk', 'Culture Immersion', 'Hot Springs'],
        priceRanges: ['Under ₹10,000', '₹10,000-₹25,000', '₹25,000-₹50,000', '₹50,000+'],
        locations: ['Chandigarh', 'Rishikesh', 'Kangra', 'Varanasi', 'Others']
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
    }, [filters]);

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
            features: '',
            price: '',
            location: ''
        });
    };

    const renderDropdown = (filterType, options, icon) => {
        const isOpen = dropdownStates[filterType];
        const selectedValue = filters[filterType];

        return (
            <div className="relative" ref={el => dropdownRefs.current[filterType] = el}>
                <button
                    onClick={() => toggleDropdown(filterType)}
                    className={`px-4 py-1 border-2 rounded-full text-sm flex items-center gap-2 transition-colors ${selectedValue
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
                                className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${selectedValue === option ? 'bg-blue-50 text-blue-700' : ''
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

    const activeFiltersCount = Object.values(filters).filter(value => value !== '').length;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
                <span className="text-lg font-semibold">Filter:</span>

                {renderDropdown('features', filterOptions.features)}
                {renderDropdown('price', filterOptions.priceRanges)}
                {renderDropdown('location', filterOptions.locations)}

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
                        value && (
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
