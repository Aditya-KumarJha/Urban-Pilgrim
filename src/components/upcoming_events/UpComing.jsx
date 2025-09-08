import { motion } from 'framer-motion';
import EventCard from './EventCard';
import ViewAll from '../ui/button/ViewAll';
import SEO from '../SEO';
import Calendar from '../ui/Calendar';
import { useEffect, useState, useRef } from 'react';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllEvents } from '../../utils/fetchEvents';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import NormalArrowButton from '../ui/NormalArrowButton';

export default function UpComing() {

    const uid = "user-uid"; // Updated to match the admin component
    const dispatch = useDispatch();

    const [upcomingEvents, setUpcomingEvents] = useState(null);
    const [isFetching, setIsFetching] = useState(false);
    const [allEvents, setAllEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [eventDates, setEventDates] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const scrollContainerRef = useRef(null);
    
    // Extract all dates from event slots
    const extractEventDates = (events) => {
        const dates = new Set();
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of today
        
        Object.values(events).forEach(eventData => {
            
            const eventType = eventData?.type;
            
            if (eventType === 'live-session') {
                // For live-session: get dates from originalData/liveSlots
                const liveSlots = eventData?.originalData?.liveSlots || [];
                liveSlots.forEach(slot => {
                    if (slot?.date) {
                        const eventDate = new Date(slot.date);
                        eventDate.setHours(0, 0, 0, 0);
                        
                        // Only include dates that are today or in the future
                        if (eventDate >= today) {
                            dates.add(slot.date);
                        }
                    }
                });
            } else if (eventType === 'guide') {
                // For guide: get dates from originalData/online and offline slots
                ['monthly', 'quarterly', 'oneTime'].forEach(type => {
                    const onlineSlots = eventData?.originalData?.online?.[type]?.slots || [];
                    const offlineSlots = eventData?.originalData?.offline?.[type]?.slots || [];
                    
                    [...onlineSlots, ...offlineSlots].forEach(slot => {
                        if (slot?.date) {
                            const eventDate = new Date(slot.date);
                            eventDate.setHours(0, 0, 0, 0);
                            
                            // Only include dates that are today or in the future
                            if (eventDate >= today) {
                                dates.add(slot.date);
                            }
                        }
                    });
                });
            }
            // retreat & recorded-session types don't have dates, so we skip them
        });
        
        return Array.from(dates).sort();
    };

    // Convert events object to array and filter active events
    const allActiveEvents = allEvents && Object.keys(allEvents).length > 0 
        ? Object.entries(allEvents)
            .map(([id, eventData]) => ({
                id,
                title: eventData?.upcomingSessionCard?.title || 'Event',
                image: eventData?.upcomingSessionCard?.image || '',
                tags: eventData?.upcomingSessionCard?.category ? [eventData.upcomingSessionCard.category] : [],
                price: eventData?.upcomingSessionCard?.price || '0',
                location: eventData?.upcomingSessionCard?.location || '',
                link: eventData?.upcomingSessionCard?.title ? 
                    eventData.upcomingSessionCard.title.replace(/\s+/g, '-') : '',
                data: eventData,
                category: eventData?.upcomingSessionCard?.category || 'Other'
            }))
            .filter(event => event?.image) // Filter out incomplete events
        : [];

    // Extract unique categories from events
    const categories = ['all', ...new Set(allActiveEvents.map(event => event.category).filter(Boolean))];

    // Filter events by category
    const categoryFilteredEvents = selectedCategory === 'all' 
        ? allActiveEvents 
        : allActiveEvents.filter(event => event.category === selectedCategory);

    // Filter events by selected date
    const activeEvents = selectedDate 
        ? categoryFilteredEvents.filter(event => {
            const eventData = event.data;
            let hasEventOnDate = false;
            const eventType = eventData?.type;
            
            if (eventType === 'live-session') {
                // Check liveSlots for live-session events
                const liveSlots = eventData?.originalData?.liveSlots || [];
                liveSlots.forEach(slot => {
                    if (slot?.date === selectedDate) {
                        hasEventOnDate = true;
                    }
                });
            } else if (eventType === 'guide') {
                // Check online and offline slots for guide events
                ['monthly', 'quarterly', 'oneTime'].forEach(type => {
                    const onlineSlots = eventData?.originalData?.online?.[type]?.slots || [];
                    const offlineSlots = eventData?.originalData?.offline?.[type]?.slots || [];
                    
                    [...onlineSlots, ...offlineSlots].forEach(slot => {
                        if (slot?.date === selectedDate) {
                            hasEventOnDate = true;
                        }
                    });
                });
            }
            // retreat & recorded-session types don't have dates, so they won't match
            
            return hasEventOnDate;
        })
        : categoryFilteredEvents;

    // Scroll functions for navigation arrows
    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -300,
                behavior: 'smooth'
            });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: 300,
                behavior: 'smooth'
            });
        }
    };

    // Fetch all events from multiple sources
    useEffect(() => {
        const loadAllEvents = async () => {
            try {
                setIsFetching(true);
                const events = await fetchAllEvents(dispatch);
                setAllEvents(events);
                
                // Extract dates for calendar
                const dates = extractEventDates(events);
                setEventDates(dates);
            } catch (err) {
                console.error("Error fetching all events:", err);
            } finally {
                setIsFetching(false);
            }
        };

        loadAllEvents();
    }, [dispatch]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const slidesRef = doc(db, `homepage/your-unique-id/title_description/sectionEight`);
                const snapshot = await getDoc(slidesRef);

                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setUpcomingEvents(data?.sectionEight || {});
                } else {
                    console.log("No guides found in Firestore");
                }
            } catch (error) {
                console.error("Error fetching guides from Firestore:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="content4">
            <SEO
                title="Upcoming Wellness Events | Urban Pilgrim"
                description="Find and book upcoming wellness events, workshops, and classes led by trusted Urban Pilgrim guides—happening near you and across soulful spaces"
                keywords="wellness events, workshops, yoga, meditation, breathwork, silence retreats, urban pilgrim"
                canonicalUrl="/upcoming_events"
                ogImage="/public/assets/eventbg.svg"
                ogType="website"
            />
            <div className="c4container">
                <motion.div className="c4top mb-4" initial={{ x: -200, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} viewport={{ once: true }}>
                    <div className="text-2xl md:text-3xl font-bold text-black"><strong>{upcomingEvents?.title || "Upcoming Events"}</strong></div>
                    <div className="lg:text-base text-sm">
                        {upcomingEvents?.description?.split(" ").slice(0, 9).join(" ")}...
                    </div>
                </motion.div>
                
                {/* buttons */}
                <div className="flex justify-end gap-2 items-center flex-wrap">
                    <div className="flex gap-2 items-center flex-wrap">
                        {/* Category Filter Dropdown */}
                        <div className="relative group">
                            <button
                                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                className="flex items-center gap-2 text-xs md:text-sm
                                    bg-gradient-to-b from-[#C5703F] to-[#C16A00] 
                                    bg-clip-text text-transparent 
                                    border-2 border-[#C5703F] rounded-full 
                                    py-1 md:py-2 px-4 md:px-6 cursor-pointer 
                                    transition-all duration-300 
                                    group-hover:text-white hover:bg-gradient-to-b hover:from-[#C5703F] hover:to-[#C16A00] hover:bg-clip-border hover:border-white"
                            >
                                <span className="capitalize">
                                    {selectedCategory === 'all' ? 'Categories' : selectedCategory}
                                </span>
                                <ChevronDown className={`w-3 h-3 text-[#C16A00] group-hover:text-white transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {/* Dropdown Menu */}
                            {showCategoryDropdown && (
                                <div className="absolute top-full left-0 mt-1 w-full min-w-[150px] bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => {
                                                setSelectedCategory(category);
                                                setShowCategoryDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg capitalize
                                                ${selectedCategory === category ? 'bg-[#C5703F] text-white font-medium' : 'text-gray-700'}`}
                                        >
                                            {category === 'all' ? 'All Categories' : category}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Calendar toggle button for all screen sizes */}
                        <button
                            onClick={() => setShowCalendar(!showCalendar)}
                            className="flex items-center gap-2 text-xs md:text-sm
                                bg-gradient-to-b from-[#C5703F] to-[#C16A00] 
                                bg-clip-text text-transparent 
                                border-2 border-[#C5703F] rounded-full 
                                py-1 md:py-2 md:px-6 px-4 cursor-pointer 
                                transition-all duration-300 md:w-[160px] w-[130px]
                                hover:text-white hover:bg-gradient-to-b hover:from-[#C5703F] hover:to-[#C16A00] hover:bg-clip-border hover:border-white"
                            >
                            <span>{showCalendar ? 'Hide Calendar' : 'Show Calendar'}</span>
                        </button>
                        
                        {/* View all */}
                        <div>
                            <ViewAll link="/upcoming_events" />
                        </div>
                    </div>
                </div>
                
                {/* Loading State */}
                {(isFetching) && (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F6288]"></div>
                        <p className="mt-2 text-gray-600">Loading events...</p>
                    </div>
                )}

                {/* Calendar - shows/hides based on toggle for all screen sizes */}
                {!isFetching && showCalendar && (
                    <motion.div 
                        className="mb-6"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Calendar 
                            eventDates={eventDates}
                            onDateSelect={setSelectedDate}
                            selectedDate={selectedDate}
                        />
                    </motion.div>
                )}

                {/* Events Display */}
                {!isFetching && (
                    <div className="w-full">
                        {/* Events Section - full width since calendar is now togglable */}
                        <div className="w-full relative">
                            {(selectedDate || selectedCategory !== 'all') && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-blue-800">
                                        {selectedDate && (
                                            <span>
                                                Showing events for: <span className="font-semibold">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                            </span>
                                        )}
                                        {selectedCategory !== 'all' && (
                                            <span>
                                                {selectedDate ? ' • ' : ''}Category: <span className="font-semibold capitalize">{selectedCategory}</span>
                                            </span>
                                        )}
                                        <div className="flex gap-2 ml-auto">
                                            {selectedDate && (
                                                <button 
                                                    onClick={() => setSelectedDate(null)}
                                                    className="text-blue-600 hover:text-blue-800 underline text-xs"
                                                >
                                                    Clear date
                                                </button>
                                            )}
                                            {selectedCategory !== 'all' && (
                                                <button 
                                                    onClick={() => setSelectedCategory('all')}
                                                    className="text-blue-600 hover:text-blue-800 underline text-xs"
                                                >
                                                    Clear category
                                                </button>
                                            )}
                                            {(selectedDate || selectedCategory !== 'all') && (
                                                <button 
                                                    onClick={() => {
                                                        setSelectedDate(null);
                                                        setSelectedCategory('all');
                                                    }}
                                                    className="text-blue-600 hover:text-blue-800 underline text-xs font-medium"
                                                >
                                                    Show all events
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {activeEvents.length > 0 ? (
                                <div className="relative">
                                    {/* Events Container */}
                                    <div 
                                        ref={scrollContainerRef}
                                        className="flex py-4 pb-12 overflow-x-scroll overflow-y-hidden no-scrollbar whitespace-nowrap"
                                    >
                                        {activeEvents.map((event, index) => (
                                            <div key={event.id || index} className="lg:min-w-[400px] sm:min-w-[350px] min-w-[160px] xl:pl-10 pr-4">
                                                <EventCard data={event} />
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Arrow Navigation - Bottom Right */}
                                    <div className="absolute bottom-0 right-2 sm:hidden flex gap-1 z-10">
                                        <button
                                            onClick={scrollLeft}
                                            className="p-1.5 text-xs rounded-full border border-[#C5703F] hover:bg-[#C5703F]/20 transition text-[#C5703F]"
                                        >
                                            <FaChevronLeft />
                                        </button>
                                        <button
                                            onClick={scrollRight}
                                            className="p-1.5 text-xs rounded-full border border-[#C5703F] hover:bg-[#C5703F]/20 transition text-[#C5703F]"
                                        >
                                            <FaChevronRight />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">
                                        {selectedDate && selectedCategory !== 'all' 
                                            ? `No events found for the selected date and ${selectedCategory} category.`
                                            : selectedDate 
                                                ? 'No events found for the selected date.'
                                                : selectedCategory !== 'all'
                                                    ? `No events found in the ${selectedCategory} category.`
                                                    : 'No upcoming events available at the moment.'
                                        }
                                    </p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        {selectedDate || selectedCategory !== 'all' 
                                            ? 'Try adjusting your filters or view all events.' 
                                            : 'Events will appear here once they are added by administrators.'
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
