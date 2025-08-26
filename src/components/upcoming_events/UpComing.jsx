import { motion } from 'framer-motion';
import EventCard from './EventCard';
import ViewAll from '../ui/button/ViewAll';
import SEO from '../SEO';
import { useEffect, useState } from 'react';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
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

    // Fetch all events from multiple sources
    useEffect(() => {
        const loadAllEvents = async () => {
            try {
                setIsFetching(true);
                const allEvents = [];

                // Fetch from pilgrim retreats
                try {
                    const retreatsRef = doc(db, 'pilgrim_retreat/user-uid/retreats/data');
                    const retreatsSnapshot = await getDoc(retreatsRef);
                    if (retreatsSnapshot.exists()) {
                        const retreatsData = retreatsSnapshot.data();
                        // Handle object structure instead of slides array
                        Object.keys(retreatsData).forEach((key) => {
                            const retreat = retreatsData[key];
                            if (retreat?.pilgrimRetreatCard) {
                                allEvents.push({
                                    id: `retreat-${key}`,
                                    title: retreat.pilgrimRetreatCard.title || 'Retreat',
                                    image: retreat.pilgrimRetreatCard.image || '',
                                    tags: retreat.pilgrimRetreatCard.category ? [retreat.pilgrimRetreatCard.category] : [],
                                    price: retreat.pilgrimRetreatCard.price || '0',
                                    location: retreat.pilgrimRetreatCard.location || '',
                                    type: 'retreat',
                                    createdAt: retreat.createdAt || new Date().toISOString(),
                                    data: retreat
                                });
                            }
                        });
                    }
                } catch (error) {
                    console.error("Error fetching retreats:", error);
                }

                // Fetch from pilgrim guides
                try {
                    const guidesRef = doc(db, 'pilgrim_guides/pilgrim_guides/guides/data');
                    const guidesSnapshot = await getDoc(guidesRef);
                    if (guidesSnapshot.exists()) {
                        const guidesData = guidesSnapshot.data();
                        if (guidesData.slides) {
                            guidesData.slides.forEach((guide, index) => {
                                if (guide?.guideCard) {
                                    allEvents.push({
                                        id: `guide-${index}`,
                                        title: guide.guideCard.title || 'Guide Session',
                                        image: guide.guideCard.thumbnail || '',
                                        tags: guide.guideCard.category ? [guide.guideCard.category] : [],
                                        price: guide.guideCard.price || '0',
                                        location: guide.guideCard.subCategory || 'Online',
                                        type: 'guide',
                                        createdAt: guide.createdAt || new Date().toISOString(),
                                        data: guide
                                    });
                                }
                            });
                        }
                    }
                } catch (error) {
                    console.error("Error fetching guides:", error);
                }

                // Fetch from live sessions
                try {
                    const liveSessionsRef = doc(db, 'pilgrim_sessions/pilgrim_sessions/sessions/liveSession');
                    const liveSessionsSnapshot = await getDoc(liveSessionsRef);
                    if (liveSessionsSnapshot.exists()) {
                        const liveSessionsData = liveSessionsSnapshot.data();
                        if (liveSessionsData.slides) {
                            liveSessionsData.slides.forEach((session, index) => {
                                if (session?.liveSessionCard) {
                                    allEvents.push({
                                        id: `live-${index}`,
                                        title: session.liveSessionCard.title || 'Live Session',
                                        image: session.liveSessionCard.thumbnail || '',
                                        tags: session.liveSessionCard.category ? [session.liveSessionCard.category] : [],
                                        price: session.liveSessionCard.price || '0',
                                        location: session.liveSessionCard.subCategory || 'Online',
                                        type: 'live-session',
                                        createdAt: session.createdAt || new Date().toISOString(),
                                        data: session
                                    });
                                }
                            });
                        }
                    }
                } catch (error) {
                    console.error("Error fetching live sessions:", error);
                }

                // Fetch from recorded programs
                try {
                    const recordedRef = doc(db, 'pilgrim_sessions/pilgrim_sessions/sessions/recordedPrograms');
                    const recordedSnapshot = await getDoc(recordedRef);
                    if (recordedSnapshot.exists()) {
                        const recordedData = recordedSnapshot.data();
                        if (recordedData.slides) {
                            recordedData.slides.forEach((program, index) => {
                                if (program?.recordedProgramCard) {
                                    allEvents.push({
                                        id: `recorded-${index}`,
                                        title: program.recordedProgramCard.title || 'Recorded Program',
                                        image: program.recordedProgramCard.thumbnail || '',
                                        tags: program.recordedProgramCard.category ? [program.recordedProgramCard.category] : [],
                                        price: program.recordedProgramCard.price || '0',
                                        location: program.recordedProgramCard.subCategory || 'Online',
                                        type: 'recorded-session',
                                        createdAt: program.createdAt || new Date().toISOString(),
                                        data: program
                                    });
                                }
                            });
                        }
                    }
                } catch (error) {
                    console.error("Error fetching recorded programs:", error);
                }

                // Filter events created within the last month and sort by creation date
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                
                const sortedEvents = allEvents
                    .filter(event => {
                        // Filter out incomplete events
                        if (!event.title || !event.image || event.title === 'Event') {
                            return false;
                        }
                        
                        // Filter events created within the last month
                        const eventDate = new Date(event.createdAt);
                        return eventDate >= oneMonthAgo;
                    })
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 10); // Show only the 10 most recent events within the month

                // Convert to the format expected by the component
                const eventsObject = {};
                sortedEvents.forEach((event, index) => {
                    eventsObject[event.id] = {
                        upcomingSessionCard: {
                            title: event.title,
                            image: event.image,
                            category: event.tags[0] || '',
                            price: event.price,
                            location: event.location
                        },
                        type: event.type,
                        createdAt: event.createdAt,
                        originalData: event.data
                    };
                });

                dispatch(setEvents(eventsObject));
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
