import EventCard from "./EventCard";
import { useEffect, useState, useMemo } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllEvents } from "../../utils/fetchEvents";

export default function EventsList({ filters = {} }) {
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    
    // Get events from Redux store
    const { allEvents, loading: reduxLoading } = useSelector((state) => state.allEvents);

    useEffect(() => {
        const loadAllEvents = async () => {
            try {
                setLoading(true);
                await fetchAllEvents(dispatch);
            } catch (err) {
                console.error("Error fetching all events:", err);
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if we don't have events in Redux store
        if (!allEvents || Object.keys(allEvents).length === 0) {
            loadAllEvents();
        } else {
            setLoading(false);
        }
    }, [dispatch, allEvents]);

    // Convert Redux events object to array and filter based on applied filters
    const filteredEvents = useMemo(() => {
        if (!allEvents || Object.keys(allEvents).length === 0) return [];

        // Convert Redux events object to array format
        const eventsArray = Object.entries(allEvents).map(([id, eventData]) => ({
            id,
            title: eventData.upcomingSessionCard?.title || 'Event',
            image: eventData.upcomingSessionCard?.image || '',
            tags: eventData.upcomingSessionCard?.category ? [eventData.upcomingSessionCard.category] : [],
            price: eventData.upcomingSessionCard?.price || '0',
            location: eventData.upcomingSessionCard?.location || '',
            type: eventData.type || '',
            createdAt: eventData.createdAt || new Date().toISOString(),
            data: eventData.originalData
        }));

        return eventsArray.filter(event => {
            // Category filter
            if (filters.category) {
                const categoryMap = {
                    'Retreats': 'retreat',
                    'Guide Sessions': 'guide',
                    'Live Sessions': 'live-session',
                    'Recorded Sessions': 'recorded-session'
                };
                if (categoryMap[filters.category] !== event.type) {
                    return false;
                }
            }

            // Type filter
            if (filters.type) {
                const typeMap = {
                    'Retreat': 'retreat',
                    'Guide Session': 'guide',
                    'Live Session': 'live-session',
                    'Recorded Session': 'recorded-session'
                };
                if (typeMap[filters.type] !== event.type) {
                    return false;
                }
            }

            // Location filter
            if (filters.location && event.location) {
                if (filters.location === 'Others') {
                    const specificLocations = ['Online', 'Chandigarh', 'Rishikesh', 'Kangra', 'Varanasi'];
                    const matchesSpecificLocation = specificLocations.some(location => 
                        event.location.toLowerCase().includes(location.toLowerCase())
                    );
                    if (matchesSpecificLocation) return false;
                } else {
                    if (!event.location.toLowerCase().includes(filters.location.toLowerCase())) {
                        return false;
                    }
                }
            }

            // Price filter
            if (filters.price && event.price) {
                const price = parseFloat(event.price);
                
                switch (filters.price) {
                    case 'Free':
                        if (price > 0) return false;
                        break;
                    case 'Under ₹1,000':
                        if (price >= 1000) return false;
                        break;
                    case '₹1,000-₹5,000':
                        if (price < 1000 || price > 5000) return false;
                        break;
                    case '₹5,000-₹15,000':
                        if (price < 5000 || price > 15000) return false;
                        break;
                    case '₹15,000+':
                        if (price < 15000) return false;
                        break;
                }
            }

            return true;
        });
    }, [allEvents, filters]);

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F6288]"></div>
                <p className="mt-2 text-gray-600">Loading events...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:mt-0 mt-16 pb-5">
            {filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No events found matching your filters.</p>
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your filter criteria.</p>
                </div>
            ) : (
                <>
                    <div className="text-sm text-gray-600 xl:px-20 lg:px-10 px-6 sm:py-5">
                        Showing {filteredEvents.length} of {Object.keys(allEvents || {}).length} events
                    </div>
                    <div className="xl:px-20 lg:px-10 px-6 grid grid-col-1 sm:grid-cols-2 lg:grid-cols-3 xl:gap-20 md:gap-10 gap-6">
                        {filteredEvents.map((event) => (
                            <EventCard key={event.id} data={event} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
