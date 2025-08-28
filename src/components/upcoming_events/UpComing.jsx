import { motion } from 'framer-motion';
import EventCard from './EventCard';
import ViewAll from '../ui/button/ViewAll';
import SEO from '../SEO';
import Calendar from '../ui/Calendar';
import { useEffect, useState } from 'react';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllEvents } from '../../utils/fetchEvents';
import { Calendar as CalendarIcon } from 'lucide-react';

export default function UpComing() {

    const uid = "user-uid"; // Updated to match the admin component
    const dispatch = useDispatch();

    const [upcomingEvents, setUpcomingEvents] = useState(null);
    const [isFetching, setIsFetching] = useState(false);
    const [allEvents, setAllEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [eventDates, setEventDates] = useState([]);
    
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
                data: eventData
            }))
            .filter(event => event?.image) // Filter out incomplete events
        : [];

    // Filter events by selected date
    const activeEvents = selectedDate 
        ? allActiveEvents.filter(event => {
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
        : allActiveEvents;

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
                <div className="flex justify-between gap-2 items-center">
                    <ViewAll link="/upcoming_events" />
                    
                    {/* Calendar toggle button for screens below lg */}
                    <button
                        onClick={() => setShowCalendar(!showCalendar)}
                        className="text-xs md:text-sm w-[200px] lg:hidden
                            bg-gradient-to-b from-[#C5703F] to-[#C16A00] 
                            bg-clip-text text-transparent 
                            border-2 border-[#C5703F] rounded-full 
                            py-1 md:py-2 px-4 lg:px-8 cursor-pointer 
                            transition-all duration-300
                            hover:text-white hover:bg-gradient-to-b hover:from-[#C5703F] hover:to-[#C16A00] hover:bg-clip-border hover:border-white"
                        >
                        <span>{showCalendar ? 'Hide Calendar' : 'Show Calendar'}</span>
                    </button>
                </div>
                
                {/* Loading State */}
                {(isFetching) && (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F6288]"></div>
                        <p className="mt-2 text-gray-600">Loading events...</p>
                    </div>
                )}

                {/* Calendar for mobile/tablet */}
                {!isFetching && showCalendar && (
                    <div className="lg:hidden mb-6">
                        <Calendar 
                            eventDates={eventDates}
                            onDateSelect={setSelectedDate}
                            selectedDate={selectedDate}
                        />
                    </div>
                )}

                {/* Events Display */}
                {!isFetching && (
                    <div className="lg:flex lg:space-x-6">
                        {/* Events Section - 2/3 width on lg+ */}
                        <div className="lg:w-2/3 relative xl:-ml-12">
                            {selectedDate && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        Showing events for: <span className="font-semibold">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        <button 
                                            onClick={() => setSelectedDate(null)}
                                            className="ml-2 text-blue-600 hover:text-blue-800 underline"
                                        >
                                            Show all events
                                        </button>
                                    </p>
                                </div>
                            )}
                            
                            {activeEvents.length > 0 ? (
                                <div className="flex py-4 pb-12 overflow-x-scroll overflow-y-hidden no-scrollbar whitespace-nowrap">
                                    {activeEvents.map((event, index) => (
                                        <div key={event.id || index} className="lg:min-w-[400px] sm:min-w-[350px] min-w-[280px] xl:pl-10 pr-5">
                                            <EventCard data={event} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">
                                        {selectedDate ? 'No events found for the selected date.' : 'No upcoming events available at the moment.'}
                                    </p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        {selectedDate ? 'Try selecting a different date or view all events.' : 'Events will appear here once they are added by administrators.'}
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        {/* Calendar Section - 1/3 width on lg+ */}
                        <div className="hidden mt-4 lg:block lg:w-1/3">
                            <div className="sticky top-4">
                                <Calendar 
                                    eventDates={eventDates}
                                    onDateSelect={setSelectedDate}
                                    selectedDate={selectedDate}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
