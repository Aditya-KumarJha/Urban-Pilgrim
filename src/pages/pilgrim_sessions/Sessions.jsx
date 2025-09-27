import FilterBar from "../../components/pilgrim_sessions/FilterBar";
import CategorySelector from "../../components/pilgrim_sessions/CategorySelector";
import { MdKeyboardArrowDown } from "react-icons/md";
import SubscriptionPlans from "../../components/pilgrim_sessions/SubscriptionPlans";
import SEO from "../../components/SEO.jsx";
import LiveSessions from "../../components/pilgrim_sessions/LiveSessions";
import Testimonials from "../../components/Testimonials";
import RecordedPrograms from "../../components/pilgrim_sessions/RecordedPrograms";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { calculateBestSellingPrograms, getTopBestSellingPrograms } from "../../utils/bestSellingUtils";

export default function Sessions() {
    const [filters, setFilters] = useState({});
    const [bestSellingActive, setBestSellingActive] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    
    // Get data from Redux store
    const liveSessionsData = useSelector(state => state.pilgrimLiveSession?.LiveSession || []);
    const recordedSessionsData = useSelector(state => state.pilgrimRecordedSession?.recordedSessions || []);

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
    
    // Calculate best selling programs
    const bestSellingPrograms = useMemo(() => {
        const allPrograms = [];
        
        // Process live sessions
        if (liveSessionsData?.length) {
            const livePrograms = liveSessionsData.map(program => ({
                title: program?.liveSessionCard?.title || 'Untitled',
                type: 'Live',
                purchaseCount: Array.isArray(program?.purchasedUsers) ? program.purchasedUsers.length : 0,
                category: program?.liveSessionCard?.category || 'General'
            }));
            allPrograms.push(...calculateBestSellingPrograms(livePrograms, 1));
        }
        
        // Process recorded sessions
        if (recordedSessionsData?.length) {
            const recordedPrograms = recordedSessionsData.map(program => ({
                title: program?.recordedProgramCard?.title || 'Untitled',
                type: 'Recorded',
                purchaseCount: Array.isArray(program?.purchasedUsers) ? program.purchasedUsers.length : 0,
                category: program?.recordedProgramCard?.category || 'General'
            }));
            allPrograms.push(...calculateBestSellingPrograms(recordedPrograms, 1));
        }
        
        return getTopBestSellingPrograms(allPrograms, 5);
    }, [liveSessionsData, recordedSessionsData]);
    
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
        <div className="min-h-screen bg-gradient-to-b from-[#FAF4F0] to-white mt-[100px]">
            <SEO
                title="Pilgrim Sessions | Online Wellness Classes | Urban Pilgrim"
                description="Join live and recorded wellness sessions with expert guides. Explore yoga, meditation, and mindfulness classes for all levels."
                keywords="wellness sessions, online wellness, yoga classes, meditation sessions, mindfulness classes, urban pilgrim"
                canonicalUrl="/pilgrim_sessions"
                ogImage="/retreats.svg"
            />
            <div className="relative w-full mb-10">
                <img
                    src="/retreats.svg"
                    alt="Sessions Header"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
                <div className="relative z-10 px-6 py-10 text-center">
                    <h1 className="text-4xl font-bold mb-4">Pilgrim Sessions</h1>
                    <div className="flex justify-between items-center flex-wrap gap-4 my-8">
                        <FilterBar onFiltersChange={handleFiltersChange} />
                        <div className="flex items-center gap-2 relative" ref={dropdownRef}>
                            <span className="text-sm">Sort By:</span>
                            <button 
                                onClick={toggleBestSelling}
                                className={`px-4 py-1 border-2 rounded-full text-sm flex items-center gap-2 transition-colors ${
                                    bestSellingActive 
                                        ? 'bg-[#D4A574] text-white border-[#D4A574]' 
                                        : 'text-black border-[#00000033] hover:border-[#D4A574]'
                                }`}
                            >
                                <img src="/assets/retreats/bookmark.svg" alt="bookmark" /> 
                                Best Selling ({bestSellingPrograms.length})
                                <MdKeyboardArrowDown className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {/* Dropdown */}
                            {showDropdown && (
                                <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                    <div className="p-3 border-b border-gray-100">
                                        <h3 className="font-semibold text-gray-800">Top Best Selling Programs</h3>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {bestSellingPrograms.length > 0 ? (
                                            bestSellingPrograms.map((program, index) => (
                                                <div key={index} className="p-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="bg-[#D4A574] text-white text-xs px-2 py-1 rounded-full font-medium">
                                                                    #{index + 1}
                                                                </span>
                                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                                    program.type === 'Live' 
                                                                        ? 'bg-green-100 text-green-700' 
                                                                        : 'bg-blue-100 text-blue-700'
                                                                }`}>
                                                                    {program.type}
                                                                </span>
                                                            </div>
                                                            <h4 className="font-medium text-gray-800 mt-1 text-sm leading-tight">
                                                                {program.title}
                                                            </h4>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {program.category}
                                                            </p>
                                                        </div>
                                                        <div className="text-right ml-3">
                                                            <div className="text-sm font-semibold text-[#D4A574]">
                                                                {program.purchaseCount}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                purchases
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-gray-500 text-sm">
                                                No best selling programs found
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
            <LiveSessions filters={filters} bestSellingActive={bestSellingActive} />
            <RecordedPrograms filters={filters} bestSellingActive={bestSellingActive} />
            {/* <SubscriptionPlans /> */}
            <Testimonials />
        </div>
    );
}
