import FilterBar from "../../components/pilgrim_guides/FilterBar";
import CategorySelector from "../../components/pilgrim_guides/CategorySelector";
import { MdKeyboardArrowDown } from "react-icons/md";
import SEO from "../../components/SEO.jsx";
import GuidesDemo from "../../components/pilgrim_guides/GuidesDemo";
import WhyChooseUs from "../../components/pilgrim_guides/WhyChooseUs";
import Testimonials from "../../components/Testimonials";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { calculateBestSellingPrograms, getTopBestSellingPrograms } from "../../utils/bestSellingUtils";

export default function Guides() {
    const [filters, setFilters] = useState({
        category: '',
        mode: '',
        experience: '',
        price: '',
        availability: ''
    });
    const [bestSellingActive, setBestSellingActive] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    
    // Get guides data from Redux store
    const guidesData = useSelector(state => state.pilgrimGuides?.guides || []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleFiltersChange = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    const handleCategoryChange = useCallback((category) => {
        setFilters(prev => ({ ...prev, category }));
    }, []);

    const toggleBestSelling = () => {
        setBestSellingActive(!bestSellingActive);
        setShowDropdown(!showDropdown);
    };
    
    // Calculate best selling guides
    const bestSellingGuides = useMemo(() => {
        if (!guidesData?.length) return [];
        const actual = Object.values(guidesData);        
        const guidesWithCounts = actual.map(guide => ({
            title: guide?.guideCard?.title || 'Unnamed Guide',
            type: 'Guide',
            purchaseCount: Array.isArray(guide?.purchasedUsers) ? guide.purchasedUsers.length : 0,
            category: guide?.guideCard?.category || 'General',
            experience: guide?.guideCard?.experience || 'N/A'
        }));
        
        return getTopBestSellingPrograms(calculateBestSellingPrograms(guidesWithCounts, 1), 5);
    }, [guidesData]);
    
    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            <SEO
                title="Pilgrim Guides | Expert Wellness Instructors | Urban Pilgrim"
                description="Find experienced wellness guides and instructors for yoga, meditation, and holistic health practices. Connect with teachers who resonate with your path."
                keywords="wellness guides, yoga instructors, meditation teachers, wellness experts, holistic health practitioners, urban pilgrim"
                canonicalUrl="/pilgrim_guides"
                ogImage="/retreats.svg"
            />
            <div className="min-h-screen bg-gradient-to-b from-[#FAF4F0] to-white mt-[100px]">
                <div className="relative w-full mb-10">
                    <img
                        src="/retreats.svg"
                        alt="Guides Header"
                        className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                    <div className="relative z-10 px-6 py-10 text-center">
                        <h1 className="text-4xl font-bold mb-4">Pilgrim Guides</h1>
                        <p>Find the teacher who resonates with your path</p>
                        <WhyChooseUs />
                        <div className="flex justify-between items-center flex-wrap gap-4 my-8">
                            <FilterBar onFiltersChange={handleFiltersChange} />
                            <div className="flex items-center gap-2 relative" ref={dropdownRef}>
                                <span className="text-sm">Sort By:</span>
                                <button
                                    onClick={toggleBestSelling}
                                    className={`px-4 py-1 border-2 rounded-full text-sm flex items-center gap-2 transition-colors ${bestSellingActive
                                            ? 'bg-[#D4A574] text-white border-[#D4A574]'
                                            : 'text-black border-[#00000033] hover:border-[#D4A574]'
                                        }`}
                                >
                                    <img src="/assets/retreats/bookmark.svg" alt="bookmark" /> 
                                    Best Selling ({bestSellingGuides.length})
                                    <MdKeyboardArrowDown className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {/* Dropdown */}
                                {showDropdown && (
                                    <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                        <div className="p-3 border-b border-gray-100">
                                            <h3 className="font-semibold text-gray-800">Top Best Selling Guides</h3>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {bestSellingGuides.length > 0 ? (
                                                bestSellingGuides.map((guide, index) => (
                                                    <div key={index} className="p-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="bg-[#D4A574] text-white text-xs px-2 py-1 rounded-full font-medium">
                                                                        #{index + 1}
                                                                    </span>
                                                                    <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                                                                        {guide.type}
                                                                    </span>
                                                                </div>
                                                                <h4 className="font-medium text-gray-800 mt-1 text-sm leading-tight">
                                                                    {guide.title}
                                                                </h4>
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {guide.category} • {guide.experience}
                                                                </p>
                                                            </div>
                                                            <div className="text-right ml-3">
                                                                <div className="text-sm font-semibold text-[#D4A574]">
                                                                    {guide.purchaseCount}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    bookings
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-gray-500 text-sm">
                                                    No best selling guides found
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="absolute w-full -translate-y-1/3 px-4">
                        <CategorySelector onCategoryChange={handleCategoryChange} />
                    </div>
                </div>
                <GuidesDemo filters={filters} bestSellingActive={bestSellingActive} />
            </div>
            <Testimonials />
        </>
    );
}
