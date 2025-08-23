import { useDispatch } from "react-redux";
import GuideCard from "./GuideCard";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { setGuides } from "../../features/pilgrim_guide/pilgrimGuideSlice"

export default function GuidesDemo() {

    const [guideData, setGuideData] = useState(null);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchLiveSession = async () => {
            try {
                const LiveSessionRef = doc(db, `pilgrim_guides/pilgrim_guides/guides/data`);
                const snapshot = await getDoc(LiveSessionRef);

                if (snapshot.exists()) {
                    const data = snapshot.data();

                    setGuideData(data.slides || null);
                    dispatch(setGuides(data?.slides || []));
                }
            } catch (error) {
                console.error("Error fetching live session:", error);
            }
        };

        fetchLiveSession();
    }, [dispatch]);

    console.log("Data: ", guideData);
    const sessions = guideData?.map((program) => ({
        image: program?.guideCard?.thumbnail,
        category: program?.guideCard?.category,
        title: program?.guideCard?.title,
        price: program?.guideCard?.price,
    }));

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <section className="px-6 py-12 text-gray-900">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions && sessions.map((session, index) => (
                        <GuideCard key={index} {...session} />
                    ))}
                </div>
            </div>
        </section>
    );
}
