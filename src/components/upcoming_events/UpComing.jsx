import { motion } from 'framer-motion';
import EventCard from './EventCard';
import ViewAll from '../ui/button/ViewAll';
import SEO from '../SEO';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useSelector, useDispatch } from 'react-redux';
import { fetchEventData } from '../../services/upcoming_events/eventService';
import { setEvents } from '../../features/upcoming_events/eventSlice';

export default function UpComing() {

    const uid = "user-uid"; // Updated to match the admin component
    const dispatch = useDispatch();

    const [upcomingEvents, setUpcomingEvents] = useState(null);
    const [isFetching, setIsFetching] = useState(false);
    
    // Fetch events from Redux store
    const { events, loading, error } = useSelector((state) => state.events);

    // Convert events object to array and filter active events
    const activeEvents = events && Object.keys(events).length > 0 
        ? Object.entries(events)
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
            .filter(event => event.title !== 'Event' && event.image) // Filter out incomplete events
        : [];

    // Fetch events from service if not in Redux
    useEffect(() => {
        const loadEvents = async () => {
            try {
                // Only fetch if we don't have events in Redux
                if (!events || Object.keys(events).length === 0) {
                    setIsFetching(true);
                    const fetchedEvents = await fetchEventData(uid);
                    if (fetchedEvents && Object.keys(fetchedEvents).length > 0) {
                        // Dispatch events to Redux
                        dispatch(setEvents(fetchedEvents));
                    }
                }
            } catch (err) {
                console.error("Error fetching events:", err);
            } finally {
                setIsFetching(false);
            }
        };

        loadEvents();
    }, [uid, dispatch, events]); // Removed events dependency to avoid infinite loop

    useEffect(() => {
        const fetchData = async () => {
            try {
                const slidesRef = doc(db, `homepage/your-unique-id/title_description/sectionEight`);
                const snapshot = await getDoc(slidesRef);
                console.log(snapshot);

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
                <ViewAll link="/upcoming_events" />
                
                {/* Loading State */}
                {(loading || isFetching) && (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F6288]"></div>
                        <p className="mt-2 text-gray-600">Loading events...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-8">
                        <p className="text-red-600">Error loading events: {error}</p>
                    </div>
                )}

                {/* Events Display */}
                {!loading && !isFetching && !error && (
                    <div className="relative -mx-10 ">
                        {activeEvents.length > 0 ? (
                            <div className="flex py-4 pb-12 overflow-x-scroll overflow-y-hidden no-scrollbar whitespace-nowrap">
                                {activeEvents.map((event, index) => (
                                    <div key={event.id || index} className="md:min-w-[448px] min-w-[300px] pl-10">
                                        <EventCard data={event} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No upcoming events available at the moment.</p>
                                <p className="text-sm text-gray-400 mt-2">Events will appear here once they are added by administrators.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
