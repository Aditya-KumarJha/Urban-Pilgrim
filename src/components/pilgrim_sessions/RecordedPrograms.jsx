import { useEffect, useState } from "react";
import RecordedProgramCard from "./RecordedProgramCard";
import { useDispatch } from "react-redux";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { setRecordedSessions } from "../../features/pilgrim_session/recordedSessionSlice";

export default function RecordedPrograms() {

    const [recordedProgramData, setRecordedProgramData] = useState(null);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchRecordedPrograms = async () => {
            try {
                const RecordedProgramsRef = doc(db, `pilgrim_sessions/pilgrim_sessions/sessions/recordedSession`);
                const snapshot = await getDoc(RecordedProgramsRef);

                if (snapshot.exists()) {
                    const data = snapshot.data();

                    setRecordedProgramData(data.slides || null);
                    dispatch(setRecordedSessions(data?.slides || []));
                }
            } catch (error) {
                console.error("Error fetching recorded programs:", error);
            }
        };

        fetchRecordedPrograms();
    }, [dispatch]);

    console.log("Data: ", recordedProgramData);
    const programs = recordedProgramData?.map((program) => ({
        image: program?.recordedProgramCard?.thumbnail,
        category: program?.recordedProgramCard?.category,
        title: program?.recordedProgramCard?.title,
        days: program?.recordedProgramCard?.days,
        videos: program?.recordedProgramCard?.videos,
        price: program?.recordedProgramCard?.price,
    }));

    return (
        <section className="px-6 py-12 text-gray-900">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl text-[#2F6288] font-bold mb-6">
                    Recorded Programs <span className="bg-[#2F6288] mt-4 max-w-xs h-1 block"></span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {programs && programs.map((program, index) => (
                        <RecordedProgramCard key={index} {...program} />
                    ))}
                </div>
            </div>
        </section>
    );
}
