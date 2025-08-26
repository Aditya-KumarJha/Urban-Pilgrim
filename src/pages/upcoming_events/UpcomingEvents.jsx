import FilterBar from "../../components/upcoming_events/FilterBar";
import CategorySelector from "../../components/upcoming_events/CategorySelector";
import EventsList from "../../components/upcoming_events/EventsList";
import { MdKeyboardArrowDown } from "react-icons/md";
import Testimonials from "../../components/Testimonials";
import SEO from "../../components/SEO.jsx";
import { useEffect, useState } from "react";

export default function UpcomingEvents() {
    const [filters, setFilters] = useState({});

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleFiltersChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handleCategoryChange = (category) => {
        setFilters(prev => ({ ...prev, category }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FAF4F0] to-white mt-[100px]">
            <SEO
                title="Upcoming Events | Urban Pilgrim"
                description="Discover upcoming wellness events, workshops, and sessions with Urban Pilgrim. Find yoga, meditation, retreats, and live sessions happening near you."
                keywords="upcoming events, wellness events, yoga workshops, meditation sessions, urban pilgrim events, live sessions"
                canonicalUrl="/upcoming_events"
                ogImage="/public/assets/eventbg.svg"
            />
            <div className="relative w-full mb-10">
                <img
                    src="/public/assets/eventbg.svg"
                    alt="Events Header"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
                <div className="relative z-10 px-6 py-10 text-center">
                    <h1 className="text-4xl font-bold mb-4">Upcoming Events</h1>
                    <div className="flex justify-between items-center flex-wrap gap-4 my-8">
                        <FilterBar onFiltersChange={handleFiltersChange} />
                        <div className="flex items-center gap-2">
                            <span className="text-sm">Sort By:</span>
                            <button className="px-4 py-1 text-black border-2 border-[#00000033] rounded-full text-sm flex items-center gap-2">
                                <img src="/assets/home/bookmark.svg" /> Most Recent <MdKeyboardArrowDown />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="absolute w-full -translate-y-1/3 px-4">
                    <CategorySelector 
                        onCategoryChange={handleCategoryChange} 
                    />
                </div>
            </div>
            <EventsList filters={filters} />
            <Testimonials />
        </div>
    );
}
