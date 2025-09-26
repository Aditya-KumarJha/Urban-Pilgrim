import YouTubeVideoPlaylist from "../../components/sessions/VideoPlayerSection"
import SEO from "../../components/SEO.jsx";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

const SessionDescription = () => {
    const params = useParams();
    const programId = params.programId;
    const [programData, setProgramData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Get recorded program data from Redux store
    const Data = useSelector((state) => state.pilgrimRecordedSession.RecordedSession);
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    function normalizeSlug(str) {
        return str
            ?.toLowerCase()
            .trim()
            .replace(/\s/g, '-')   // replace EVERY space with a dash; do not collapse
    }

    useEffect(() => {
        if (Data && programId) {
            const program = Data.find(
                (program) =>
                    normalizeSlug(program?.recordedProgramCard?.title) === normalizeSlug(programId)
            );
            setProgramData(program || null);
            setLoading(false);
        } else {
            setLoading(false)
        }
    }, [Data, programId]);

    // Get videos from oneTimeSubscription
    const videos = programData?.recordedVideo?.videos || [];

    return (
        <div className=" bg-gradient-to-b from-[#FAF4F0] to-white mt-[100px]">
            <SEO
                title={`${programData?.recordedProgramCard?.title || "Recorded Program"} | Urban Pilgrim`}
                description={programData?.oneTimeSubscription?.description || "Watch recorded program sessions designed to help you on your wellness journey."}
                keywords={`recorded program, wellness videos, ${programData?.recordedProgramCard?.title}, urban pilgrim`}
                canonicalUrl={`/program/${programId}/slots`}
                ogType="video"
            />
            <div className="relative w-full ">
                <img
                    src="/retreats.svg"
                    alt="Program Header"
                    className="absolute inset-0 w-full h-full object-cover z-0 border-b-2 border-[#ffffff33]"
                />
                <div className="relative z-10 px-6 pt-10 pb-4 flex justify-between max-w-7xl mx-auto">
                    <p className="text-3xl text-[#2F6288] font-bold">
                        {programData?.recordedProgramCard?.title || "Recorded Program"} <span className="bg-[#2F6288] mt-4 w-1/3 min-w-20 h-1 block"></span>
                    </p>
                </div>
                <div className="bg-gradient-to-b from-white/10 via-white/60 to-[#FAF4F0] absolute -bottom-4 z-8 h-24 w-full"></div>
            </div>
            <div className="flex flex-col items-center justify-center bg-gradient-to-b from-[#FAF4F0] to-white px-4 pb-4 max-w-7xl mx-auto z-10 relative">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F6288]"></div>
                        <span className="ml-3 text-gray-600">Loading videos...</span>
                    </div>
                ) : videos.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg font-medium">No videos available</p>
                        <p className="text-gray-500 text-sm mt-1">Check back later for new content</p>
                    </div>
                ) : (
                    <YouTubeVideoPlaylist videos={videos} programData={programData} />
                )}
            </div>
        </div>
    )
}

export default SessionDescription