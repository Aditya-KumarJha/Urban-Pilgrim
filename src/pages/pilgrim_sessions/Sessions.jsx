import FilterBar from "../../components/pilgrim_sessions/FilterBar";
import CategorySelector from "../../components/pilgrim_sessions/CategorySelector";
import { MdKeyboardArrowDown } from "react-icons/md";
import SubscriptionPlans from "../../components/pilgrim_sessions/SubscriptionPlans";
import SEO from "../../components/SEO.jsx";
import LiveSessions from "../../components/pilgrim_sessions/LiveSessions";
import Testimonials from "../../components/Testimonials";
import RecordedPrograms from "../../components/pilgrim_sessions/RecordedPrograms";
import Workshops from "../../components/pilgrim_workshop/Workshops";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { calculateBestSellingPrograms, getTopBestSellingPrograms } from "../../utils/bestSellingUtils";

import OptimizedImage from '../../components/ui/OptimizedImage';
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
        <div className="min-h-screen bg-gradient-to-b from-[#FAF4F0] to-white lg:mt-[100px] mt-[70px]">
            <SEO
                title="Pilgrim Sessions | Online Wellness Classes | Urban Pilgrim"
                description="Join live and recorded wellness sessions with expert guides. Explore yoga, meditation, and mindfulness classes for all levels."
                keywords="wellness sessions, online wellness, yoga classes, meditation sessions, mindfulness classes, urban pilgrim"
                canonicalUrl="/pilgrim_sessions"
                ogImage="/retreats.svg"
            />
            <div className="relative w-full mb-10">
                <OptimizedImage                     src="/retreats.svg"
                    alt="Sessions Header"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
                <div className="relative z-10 px-4 sm:px-6 py-6 sm:py-10 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Pilgrim Sessions</h1>
                    <div className="flex justify-between items-center flex-wrap gap-3 sm:gap-4 my-6 sm:my-8">
                        <FilterBar onFiltersChange={handleFiltersChange} />
                    </div>
                </div>
                <div className="absolute w-full -translate-y-1/3 sm:px-4 scale-90 sm:scale-100 origin-top">
                    <CategorySelector onCategoryChange={handleCategoryChange} />
                </div>
            </div>
            {/* workshop */}
            <Workshops filters={filters} bestSellingActive={bestSellingActive} />
            <LiveSessions filters={filters} bestSellingActive={bestSellingActive} />
            <RecordedPrograms filters={filters} bestSellingActive={bestSellingActive} />
            {/* <SubscriptionPlans /> */}
            <Testimonials />
        </div>
    );
}
