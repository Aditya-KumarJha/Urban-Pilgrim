import SessionCard from "./SessionCard";
import { useEffect, useState, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useDispatch } from "react-redux";
import { setLiveSessions } from "../../features/pilgrim_session/liveSessionsSlice";

export default function SessionList({ filters = {} }) {
    const [sessions, setSessions] = useState([]);
    const uid = "user-uid";
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                // Fetch live sessions
                const liveSessionsRef = collection(db, `pilgrim_sessions/${uid}/sessions`);
                const liveSnapshot = await getDocs(liveSessionsRef);
                
                const allSessions = [];

                if (!liveSnapshot.empty) {
                    liveSnapshot.forEach((doc) => {
                        if (doc.id === 'liveSession') {
                            const data = doc.data();
                            if (data.slides) {
                                data.slides.forEach((slide, index) => {
                                    allSessions.push({
                                        id: `live-${index}`,
                                        type: 'live',
                                        ...slide.liveSessionCard,
                                        sessionData: slide
                                    });
                                });
                            }
                        } else if (doc.id === 'recordedSession') {
                            const data = doc.data();
                            if (data.slides) {
                                data.slides.forEach((slide, index) => {
                                    allSessions.push({
                                        id: `recorded-${index}`,
                                        type: 'recorded',
                                        ...slide.recordedSessionCard,
                                        sessionData: slide
                                    });
                                });
                            }
                        }
                    });
                }

                setSessions(allSessions);
                dispatch(setLiveSessions(allSessions));
            } catch (error) {
                console.error("Error fetching sessions from Firestore:", error);
            }
        };

        if (uid) fetchSessions();
    }, [uid, dispatch]);

    // Filter sessions based on applied filters
    const filteredSessions = useMemo(() => {
        if (!sessions.length) return [];

        return sessions.filter(session => {
            // Category filter
            if (filters.category && session?.category) {
                if (session.category.toLowerCase() !== filters.category.toLowerCase()) {
                    return false;
                }
            }

            // Features filter
            if (filters.features && session?.features) {
                const hasMatchingFeature = session.features.some(feature => {
                    if (typeof feature === 'string') {
                        return feature.toLowerCase().includes(filters.features.toLowerCase());
                    }
                    if (feature?.title) {
                        return feature.title.toLowerCase().includes(filters.features.toLowerCase());
                    }
                    return false;
                });
                if (!hasMatchingFeature) return false;
            }

            // Type filter (live/recorded)
            if (filters.type && session?.type) {
                if (session.type !== filters.type) {
                    return false;
                }
            }

            // Price filter
            if (filters.price && session?.price) {
                const price = parseFloat(session.price);
                
                switch (filters.price) {
                    case 'Under ₹1,000':
                        if (price >= 1000) return false;
                        break;
                    case '₹1,000-₹2,500':
                        if (price < 1000 || price > 2500) return false;
                        break;
                    case '₹2,500-₹5,000':
                        if (price < 2500 || price > 5000) return false;
                        break;
                    case '₹5,000+':
                        if (price < 5000) return false;
                        break;
                }
            }

            // Duration filter
            if (filters.duration && session?.duration) {
                if (!session.duration.toLowerCase().includes(filters.duration.toLowerCase())) {
                    return false;
                }
            }

            return true;
        });
        
    }, [sessions, filters]);

    return (
        <div className="space-y-4">
            {filteredSessions.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No sessions found matching your filters.</p>
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your filter criteria.</p>
                </div>
            ) : (
                <>
                    <div className="text-sm text-gray-600 px-6">
                        Showing {filteredSessions.length} of {sessions.length} sessions
                    </div>
                    <div className="md:flex md:flex-wrap grid sm:grid-cols-2 gap-8 px-6 py-4 pt-4 md:pt-4">
                        {filteredSessions.map((session) => (
                            <SessionCard key={session.id} session={session} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
