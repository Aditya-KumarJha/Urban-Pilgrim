import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { setAllEvents } from '../features/eventsSlice';

// Fetch all events from multiple sources
export const fetchAllEvents = async (dispatch) => {
    try {
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
            const recordedRef = doc(db, 'pilgrim_sessions/pilgrim_sessions/sessions/recordedSession');
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
                if (!event.title || !event.image) {
                    return false;
                }
                
                // Filter events created within the last month
                const eventDate = new Date(event.createdAt);
                return eventDate >= oneMonthAgo;
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

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

        if (dispatch) {
            dispatch(setAllEvents(eventsObject));
        }
        
        return eventsObject;
    } catch (err) {
        console.error("Error fetching all events:", err);
        throw err;
    }
};