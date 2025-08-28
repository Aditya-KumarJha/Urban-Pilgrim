import { FiPlay, FiCalendar, FiClock } from "react-icons/fi";
import { motion } from "framer-motion";
import SEO from "../../components/SEO.jsx";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

const SessionSlots = () => {
    const params = useParams();
    const sessionId = params.sessionId;
    const [sessionData, setSessionData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Get live session data from Redux store
    const Data = useSelector((state) => state.pilgrimLiveSession.LiveSession);

    useEffect(() => {
        window.scrollTo(0,0);
    },[])

    function normalizeSlug(str) {
        return str
            ?.toLowerCase()
            .trim()
            .replace(/\s+/g, "-")   // spaces → dashes
            .replace(/-+/g, "-");   // collapse multiple dashes
    }

    useEffect(() => {
        if (Data && sessionId) {
            const session = Data.find(
                (program) =>
                    normalizeSlug(program?.liveSessionCard?.title) === normalizeSlug(sessionId)
            );
            setSessionData(session || null);
            setLoading(false);
        }
    }, [Data, sessionId]);

    // Get slots from session data
    const slots = sessionData?.liveSlots || [];
    console.log("sessionData", sessionData)
    return (
        <div className=" bg-gradient-to-b from-[#FAF4F0] to-white mt-[100px]">
            <SEO
                title="Live Session Slots | Meditation with Anisha | Urban Pilgrim"
                description="Book your spot for live meditation sessions with Anisha. View available dates and times for 'Let's meditate for an hour'."
                keywords="meditation slots, book meditation, live meditation, anisha meditation, urban pilgrim sessions"
                canonicalUrl="/session_slots"
                ogImage="https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0"
            />
            <div className="relative w-full ">
                <img
                    src="/retreats.svg"
                    alt="Guides Header"
                    className="absolute inset-0 w-full h-full object-cover z-0 border-b-2 border-[#ffffff33]"
                />
                <div className="relative z-10 px-6 pt-10 pb-4 flex justify-between max-w-7xl mx-auto">
                    <p className="text-3xl text-[#2F6288] font-bold">
                        {sessionData?.liveSessionCard?.title || "Live Session"} <span className="bg-[#2F6288] mt-4 w-1/3 min-w-20 h-1 block"></span>
                    </p>
                    <img src="/assets/slots/zoom.png" alt="Zoom Icon" className="w-48 h-full" />
                </div>
                <div className="bg-gradient-to-b from-white/10 via-white/60 to-[#FAF4F0] absolute -bottom-4 z-8 h-24 w-full"></div>
            </div>


            <div className="flex flex-col items-center justify-center bg-gradient-to-b from-[#FAF4F0] to-white px-4 pb-4 max-w-7xl mx-auto z-10 relative">
                <h2 className="text-xl font-semibold mb-6 w-full">All Slots</h2>
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F6288]"></div>
                        <span className="ml-3 text-gray-600">Loading slots...</span>
                    </div>
                ) : slots.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-lg mb-2">📅</div>
                        <p className="text-gray-600 text-lg font-medium">No slots available</p>
                        <p className="text-gray-500 text-sm mt-1">Check back later for new session slots</p>
                    </div>
                ) : (
                    <div className="space-y-6 w-full">
                        {slots.map((slot, index) => {
                            // Check if the slot date has passed
                            const slotDate = new Date(slot.date);
                            const currentDate = new Date();
                            const hasEnded = slotDate < currentDate;

                            return (
                                <motion.div
                                    key={slot.id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex flex-col md:flex-row gap-4 p-4 border rounded-xl shadow w-full"
                                >
                                    <div className="relative w-full md:w-56 h-36 flex-shrink-0 overflow-hidden rounded-lg">
                                        <img
                                            src={slot.image || sessionData?.liveSessionCard?.thumbnail || "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0"}
                                            alt="Slot Thumbnail"
                                            className="w-full h-full object-cover"
                                        />
                                        <span className={`absolute top-2 right-2 text-white text-xs px-2 py-1 rounded ${
                                            hasEnded ? 'bg-gray-600' : 'bg-red-600'
                                        }`}>
                                            {hasEnded ? 'ENDED' : 'LIVE'}
                                        </span>
                                    <span className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center">
                                            <FiPlay className="text-black w-4 h-4 ml-1" />
                                        </div>
                                    </span>
                                </div>

                                <div className="flex flex-col justify-between w-full">
                                    <div>
                                        <h3 className="text-base font-semibold mb-2">{slot.title || sessionData?.liveSessionCard?.title}</h3>
                                        <div className="flex items-center text-sm text-gray-600 mb-1">
                                            <FiCalendar className="w-4 h-4 mr-2" /> 
                                            Date: {" "} 
                                            {new Date(slot.date).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                            })}

                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <FiClock className="w-4 h-4 mr-2" /> 
                                            Time: {" "}
                                            {new Date(`1970-01-01T${slot.startTime}`).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true,
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default SessionSlots