import { useState } from 'react';

export default function CategorySelector({ onCategoryChange }) {
    const [selectedCategory, setSelectedCategory] = useState("");

    const categories = ['Retreats', 'Guide Sessions', 'Live Sessions', 'Recorded Sessions'];

    const handleCategorySelect = (category) => {
        const newCategory = selectedCategory === category ? '' : category;
        setSelectedCategory(newCategory);
        if (onCategoryChange) {
            onCategoryChange(newCategory);
        }
    };

    const handleMobileSelect = (e) => {
        const category = e.target.value;
        setSelectedCategory(category);
        if (onCategoryChange) {
            onCategoryChange(category);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow sm:px-6 px-3 sm:py-4 py-2.5 mb-2">
            <div className="flex flex-col md:flex-row md:items-center items-start mb-2">
                <span className="font-semibold text-gray-700 sm:mb-4 mb-2 md:mb-0 sm:mr-2 mr-0">Select Category:</span>

                {/* Mobile Dropdown */}
                <select
                    className="block sm:hidden border border-gray-300 rounded px-2 py-1 text-sm w-full"
                    value={selectedCategory}
                    onChange={handleMobileSelect}
                >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>

                {/* Desktop Scrollable Buttons */}
                <div className="hidden sm:flex space-x-4 overflow-x-auto">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => handleCategorySelect(category)}
                            className={`px-4 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${selectedCategory === category
                                    ? 'bg-black text-white'
                                    : 'bg-white border border-gray-300 text-black hover:bg-gray-50'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
