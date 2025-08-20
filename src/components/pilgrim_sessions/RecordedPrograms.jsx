import { useSelector } from "react-redux";
import RecordedProgramCard from "./RecordedProgramCard";

export default function RecordedPrograms() {

    const Data = useSelector(
        (state) => state?.pilgrimRecordedSession?.recordedSessions
    );

    console.log("Data: ", Data);
    const programs = Data?.map((program) => ({
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
                    {programs.map((program, index) => (
                        <RecordedProgramCard key={index} {...program} />
                    ))}
                </div>
            </div>
        </section>
    );
}
