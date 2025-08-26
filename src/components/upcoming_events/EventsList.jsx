import EventCard from "./EventCard";
import { useEffect, useState, useMemo } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useDispatch } from "react-redux";
import { setEvents } from "../../features/upcoming_events/eventSlice";

export default function EventsList({ filters = {} }) {
    const [allEvents, setAllEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const uid = "user-uid";
    const dispatch = useDispatch();

    useEffect(() => {
        const loadAllEvents = async () => {
            try {
                setLoading(true);
                const events = [];

                // Fetch from pilgrim retreats
                try {
                    const retreatsRef = doc(db, `pilgrim_retreat/${uid}/retreats/data`);
                    const retreatsSnapshot = await getDoc(retreatsRef);
                    if (retreatsSnapshot.exists()) {
                        const retreatsData = retreatsSnapshot.data();
                        Object.keys(retreatsData).forEach((key) => {
                            const retreat = retreatsData[key];
                            if (retreat?.pilgrimRetreatCard) {
                                events.push({
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
                                    events.push({
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
                                    events.push({
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
                    const recordedRef = doc(db, 'pilgrim_sessions/pilgrim_sessions/sessions/recordedSession');
                    const recordedSnapshot = await getDoc(recordedRef);
                    if (recordedSnapshot.exists()) {
                        const recordedData = recordedSnapshot.data();
                        if (recordedData.slides) {
                            recordedData.slides.forEach((program, index) => {
                                if (program?.recordedProgramCard) {
                                    events.push({
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

                // Sort by creation date (most recent first)
                const sortedEvents = events
                    .filter(event => event.title && event.image && event.title !== 'Event')
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                setAllEvents(sortedEvents);
                dispatch(setEvents(sortedEvents));
            } catch (err) {
                console.error("Error fetching all events:", err);
            } finally {
                setLoading(false);
            }
        };

        loadAllEvents();
    }, [uid, dispatch]);

    // Filter events based on applied filters
    const filteredEvents = useMemo(() => {
        if (!allEvents.length) return [];

        return allEvents.filter(event => {
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
        <div className="space-y-4">
            {filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No events found matching your filters.</p>
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your filter criteria.</p>
                </div>
            ) : (
                <>
                    <div className="text-sm text-gray-600 p-6">
                        Showing {filteredEvents.length} of {allEvents.length} events
                    </div>
                    <div className="md:px-10 px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.map((event) => (
                            <EventCard key={event.id} data={event} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
