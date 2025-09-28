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
    const [scrollProgress, setScrollProgress] = useState(0);
    const [adminSelectedEvents, setAdminSelectedEvents] = useState([]);
    
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

    // Load admin-selected events order
    useEffect(() => {
        const loadAdminSelectedEvents = async () => {
            try {
                const docRef = doc(db, 'admin_settings', 'upcoming_events_order');
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const selectedPrograms = data.selectedPrograms || [];
                    // Only include visible programs
                    const visiblePrograms = selectedPrograms.filter(program => program.isVisible !== false);
                    setAdminSelectedEvents(visiblePrograms);
                }
            } catch (error) {
                console.error('Error loading admin selected events:', error);
            }
        };

        loadAdminSelectedEvents();
    }, []);

    // Convert events object to array and filter active events
    // If admin has selected events, use those in order, otherwise show all events
    const allActiveEvents = adminSelectedEvents.length > 0 
        ? adminSelectedEvents.map(selectedEvent => {
            // Find the full event data from allEvents
            const fullEventData = allEvents[selectedEvent.id];
            if (fullEventData) {
                return {
                    id: selectedEvent.id,
                    title: fullEventData?.upcomingSessionCard?.title || selectedEvent.title,
                    image: fullEventData?.upcomingSessionCard?.image || selectedEvent.image,
                    tags: fullEventData?.upcomingSessionCard?.category ? [fullEventData.upcomingSessionCard.category] : [],
                    price: fullEventData?.upcomingSessionCard?.price || selectedEvent.price,
                    location: fullEventData?.upcomingSessionCard?.location || selectedEvent.location,
                    link: fullEventData?.upcomingSessionCard?.title ? 
                        fullEventData.upcomingSessionCard.title.replace(/\s+/g, '-') : '',
                    data: fullEventData,
                    category: fullEventData?.upcomingSessionCard?.category || selectedEvent.category
                };
            }
            return null;
        }).filter(Boolean)
        : allEvents && Object.keys(allEvents).length > 0 
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

    // Handle scroll progress tracking
    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            const maxScroll = scrollWidth - clientWidth;
            const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
            setScrollProgress(progress);
        }
    };

    // Handle progress bar click to scroll to position
    const handleProgressBarClick = (e) => {
        if (scrollContainerRef.current) {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const progressBarWidth = rect.width;
            const clickProgress = (clickX / progressBarWidth) * 100;
            
            const { scrollWidth, clientWidth } = scrollContainerRef.current;
            const maxScroll = scrollWidth - clientWidth;
            const targetScrollLeft = (clickProgress / 100) * maxScroll;
            
            scrollContainerRef.current.scrollTo({
                left: targetScrollLeft,
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
                        className="my-4"
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
                                        onScroll={handleScroll}
                                    >
                                        {activeEvents.map((event, index) => (
                                            <div key={event.id || index} className="flex-shrink-0 lg:w-[400px] sm:w-[350px] w-[240px] xl:pl-10 pr-4">
                                                <EventCard data={event} />
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Horizontal Progress Bar - Bottom Center */}
                                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 sm:hidden mb-3 z-10">
                                        <div 
                                            className="w-24 h-1.5 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300 transition-colors"
                                            onClick={handleProgressBarClick}
                                        >
                                            <div 
                                                className="h-full bg-[#C5703F] rounded-full transition-all duration-300 ease-out"
                                                style={{ width: `${scrollProgress}%` }}
                                            />
                                        </div>
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
