import { useDispatch } from "react-redux";
import LiveSessionCard from "./LiveSessionCard";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { setLiveSessions } from "../../features/pilgrim_session/liveSessionsSlice";

export default function LiveSessions() {

    const [liveSessionData, setLiveSessionData] = useState(null);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchLiveSession = async () => {
            try {
                const LiveSessionRef = doc(db, `pilgrim_sessions/pilgrim_sessions/sessions/liveSession`);
                const snapshot = await getDoc(LiveSessionRef);

                if (snapshot.exists()) {
                    const data = snapshot.data();

                    setLiveSessionData(data.slides || null);
                    dispatch(setLiveSessions(data?.slides || []));
                }
            } catch (error) {
                console.error("Error fetching live session:", error);
            }
        };

        fetchLiveSession();
    }, [dispatch]);

    console.log("Data: ", liveSessionData);
    const sessions = liveSessionData?.map((program) => ({
        image: program?.liveSessionCard?.thumbnail,
        category: program?.liveSessionCard?.category,
        title: program?.liveSessionCard?.title,
        days: program?.liveSessionCard?.days,
        videos: program?.liveSessionCard?.videos,
        price: program?.liveSessionCard?.price,
    }));

    return (
        <section className="px-6 py-12 text-gray-900">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl text-[#2F6288] font-bold mb-6">
                    Live Sessions <span className="bg-[#2F6288] mt-2 w-20 h-1 block"></span>
                </h2>

                <div className="grid grid-cols-1 mt-10 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions.map((session, index) => (
                        <LiveSessionCard key={index} {...session} />
                    ))}
                </div>
            </div>
        </section>
    );
}
