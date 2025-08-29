import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import ProgramSchedule from "../../components/pilgrim_retreats/ProgramSchedule";
import Faqs from "../../components/Faqs";
import PilgrimGuide from "../../components/pilgrim_retreats/Pilgrim_Guide";
import SEO from "../../components/SEO.jsx";
import PersondetailsCard from "../../components/persondetails_card";
import FeatureProgram from "../../components/pilgrim_sessions/FeatureProgram";
import ImageGallery from "../../components/pilgrim_retreats/ImageGallery.jsx";
import SubscriptionCard from "../../components/pilgrim_sessions/SubscriptionCard";
import ProgramSection from "../../components/pilgrim_sessions/ProgramSection";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../features/cartSlice.js";
import { showSuccess } from "../../utils/toast.js";
import BundlesPopup from "../../components/pilgrim_retreats/BundlesPopup.jsx";
import { fetchAllEvents } from "../../utils/fetchEvents";

export default function LiveDetails() {
    const params = useParams();
    const [programData, setProgramData] = useState(null);
    const sessionId = params.sessionId;
    const [persons, setPersons] = useState(1);
    const [showBundlesPopup, setShowBundlesPopup] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [showAll, setShowAll] = useState(false);

    const slots = programData?.liveSlots || [];
    const visibleSlots = showAll ? slots : slots.slice(0, 2);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const Data = useSelector((state) => state.pilgrimLiveSession.LiveSession);
    const userPrograms = useSelector((state) => state.userProgram);
    
    // Get events from Redux store
    const { allEvents } = useSelector((state) => state.allEvents);

    // ✅ Check if program already purchased
    const alreadyPurchased = userPrograms?.some(
        (program) => program?.title === programData?.liveSessionCard?.title
    );

    function normalizeSlug(str) {
        return str
            ?.toLowerCase()
            .trim()
            .replace(/\s+/g, "-")   // spaces → dashes
            .replace(/-+/g, "-");   // collapse multiple dashes
    }

    useEffect(() => {
        if (Data && sessionId) {
            const pg = Data.find(
                (program) =>
                    normalizeSlug(program?.liveSessionCard?.title) === normalizeSlug(sessionId)
            );
            setProgramData(pg || null);
        }
    }, [Data, sessionId]);

    // Fetch all events if not already loaded
    useEffect(() => {
        const loadEvents = async () => {
            if (!allEvents || Object.keys(allEvents).length === 0) {
                try {
                    await fetchAllEvents(dispatch);
                } catch (error) {
                    console.error("Error fetching events:", error);
                }
            }
        };
        
        loadEvents();
    }, [dispatch, allEvents]);

    // console.log("programData: ", programData);

    const increment = () => setPersons((prev) => prev + 1);
    const decrement = () => setPersons((prev) => (prev > 1 ? prev - 1 : 1));

    const handleSubscriptionClick = () => {
        // Show bundles popup instead of directly adding to cart
        setShowBundlesPopup(true);
    };

    const handleDirectAddToCart = () => {
        if (!programData) return;

        const cartItem = {
            id: programData?.liveSessionCard?.title, // use unique id if available
            title: programData.liveSessionCard?.title,
            price: programData?.oneTimeSubscription?.price,
            persons,
            image: programData?.liveSessionCard?.thumbnail,
            quantity: 1,
            type: "live",
            organizer: programData?.organizer,
            slots: programData?.liveSlots || [],
        };

        dispatch(addToCart(cartItem));
        console.log("Added to cart:", cartItem);
        showSuccess("Added to cart!");
    };

    const redirectToSession = () => {
        if (!programData) return;
        // Redirect to the program details page
        navigate(`/program_details/${normalizeSlug(programData?.liveSessionCard?.title)}`);
    };

    function formatDateWithSuffix(dateStr) {
        if (!dateStr) return "Not available";
        const date = new Date(dateStr);
        const day = date.getDate();

        const getSuffix = (d) => {
            if (d > 3 && d < 21) return "th";
            switch (d % 10) {
                case 1:
                    return "st";
                case 2:
                    return "nd";
                case 3:
                    return "rd";
                default:
                    return "th";
            }
        };

        const month = date.toLocaleString("en-US", { month: "short" });
        return `${day}${getSuffix(day)} ${month}`;
    }

    return (
        <>
            <SEO
                title={`${programData?.liveSessionCard?.title} | Urban Pilgrim`}
                description={programData?.liveSessionCard?.description}
                keywords={`${programData?.liveSessionCard?.instructor}, wellness program, ${programData?.liveSessionCard?.duration}, urban pilgrim, self-discovery, meditation, yoga`}
                canonicalUrl={`/program_details?id=${encodeURIComponent(
                    programData?.liveSessionCard?.title?.toLowerCase()?.replace(/\s+/g, "-")
                )}`}
                ogImage={programData?.liveSessionCard?.image}
                ogType="product"
            >
                {/* Additional structured data for programs/products */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org/",
                        "@type": "Product",
                        name: programData?.liveSessionCard?.title,
                        description: programData?.liveSessionCard?.description,
                        image: programData?.liveSessionCard?.image,
                        offers: {
                            "@type": "Offer",
                            priceCurrency: "INR",
                            price: programData?.liveSessionCard?.price.replace(/,/g, ""),
                            availability: "https://schema.org/InStock",
                        },
                        brand: {
                            "@type": "Brand",
                            name: "Urban Pilgrim",
                        },
                        instructor: {
                            "@type": "Person",
                            name: programData?.liveSessionCard?.instructor,
                        },
                    })}
                </script>
            </SEO>

            {/* Main content */}
            <div className="xl:max-w-7xl lg:max-w-4xl md:max-w-[700px] mx-auto p-6 grid gap-6 md:mt-[100px] mt-[80px] px-4">
                {/* image section */}
                <div className="space-y-4">
                    <h2 className="md:text-2xl font-bold text-xl">
                        {programData?.liveSessionCard?.title || "Retreat Title"}
                    </h2>
                    <ImageGallery images={programData?.oneTimeSubscription?.images || []} videos={programData?.oneTimeSubscription?.videos || []} />
                </div>

                {/* details subscription */}
                <div className="flex flex-col justify-between">
                    {/* Program details */}
                    <div className="space-y-4 text-gray-700">
                        {/* Price */}
                        <div className="flex text-lg font-semibold text-black">
                            <span>
                                From {programData?.liveSessionCard?.price
                                    ? new Intl.NumberFormat("en-IN", {
                                        style: "currency",
                                        currency: "INR",
                                        maximumFractionDigits: 2,
                                    }).format(programData?.liveSessionCard?.price)
                                    : "Price not available"}
                            </span>
                        </div>

                        {/* Days */}
                        <div className="flex items-center gap-2 text-sm text-[#787B7B] font-bold">
                            <img
                                src="/assets/program/package.svg"
                                alt="package"
                                className="h-4 w-4"
                            />
                            Packages:
                            <span className="px-4 py-2 bg-white rounded-lg text-black font-semibold">
                                {programData?.liveSessionCard?.days} days
                            </span>
                        </div>

                        {/* No. of persons/session */}
                        <div className="flex flex-wrap items-center gap-2 text-sm text-[#787B7B] font-bold">
                            <img
                                src="/assets/program/people.svg"
                                alt="package"
                                className="h-4 w-4"
                            />
                            <span className="mr-1">No. of persons/session:</span>
                            <span className="flex items-center gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-white border-[#D69A75] border rounded-full">
                                <button
                                    onClick={decrement}
                                    className="px-1 sm:px-2 text-base sm:text-lg font-bold"
                                    aria-label="Decrease persons"
                                >
                                    −
                                </button>
                                <span className="min-w-[20px] text-center">{persons}</span>
                                <button
                                    onClick={increment}
                                    className="px-1 sm:px-2 text-base sm:text-lg font-bold"
                                    aria-label="Increase persons"
                                >
                                    +
                                </button>
                            </span>
                        </div>
                    </div>

                    {/* time slots */}
                    {slots.length > 0 && slots.some(slot => slot.date || slot.startTime || slot.endTime) && (
                        <div className="text-[#787B7B] mt-5">
                            <p>
                                <span className="font-medium">Program starts - </span>
                                <span>
                                    {formatDateWithSuffix(programData?.liveSlots?.[0]?.date) || "Not available"}
                                </span>
                            </p>

                            <p>
                                <span className="font-medium">Live sessions with </span>
                                <span className="font-medium">
                                    {programData?.organizer?.name}
                                </span>{" "}
                            </p>

                            {visibleSlots.map((slot, index) => (
                                <div key={index} className="mb-2">
                                    <p className="text-[#787B7B]">
                                        Time -
                                        <span>
                                            {slot.startTime
                                                ? new Date(`1970-01-01T${slot.startTime}`).toLocaleTimeString("en-US", {
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                })
                                                : "Not available"}
                                        </span>{" "}
                                        -
                                        <span>
                                            {slot.endTime
                                                ? new Date(`1970-01-01T${slot.endTime}`).toLocaleTimeString("en-US", {
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                })
                                                : "Not available"}
                                        </span>
                                    </p>
                                    <p>
                                        <span className="font-medium">Date - </span>
                                        <span>{slot.date ? formatDateWithSuffix(slot.date) : "Not available"}</span>
                                    </p>
                                </div>
                            ))}

                            {slots.length > 2 && (
                                <button
                                    onClick={() => setShowAll(!showAll)}
                                    className="text-[#2F5D82] font-medium mt-2 hover:underline"
                                >
                                    {showAll ? "See Less" : "Show More"}
                                </button>
                            )}
                        </div>
                    )}

                    <SubscriptionCard
                        price={programData?.oneTimeSubscription?.price}
                        handleClick={handleSubscriptionClick}
                        title={programData?.liveSessionCard?.title}
                        redirectToProgram={redirectToSession}
                        programType="session"
                    />

                    {   programData?.programSchedule.length>0 && (
                            <div className="flex flex-col">
                                <p className="text-lg font-semibold text-gray-800 mt-4">
                                    Program Schedule
                                </p>
                                <ProgramSchedule programSchedules={programData?.programSchedule} />
                            </div>
                        )
                    }

                    <ProgramSection program={programData?.aboutProgram} journey={programData?.keyHighlights} />
                    <FeatureProgram features={programData?.features} />
                    { programData?.faqs[0].title !== "" && 
                        <Faqs faqs={programData?.faqs} />
                    }
                </div>
            </div>

            {   programData?.guide[0].length > 0 &&
                <PilgrimGuide guides={programData?.guide[0]} />
            }

            {/* You may also like */}
            <div className="max-w-7xl mx-auto p-6  grid gap-6 px-4">
                <h2 className="text-3xl text-[#2F6288] font-bold mb-6">
                    You May Also Like
                </h2>

                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                    initial={{ y: 100, opacity: 0 }} 
                    whileInView={{ y: 0, opacity: 1 }} 
                    transition={{ duration: 0.5, ease: "easeOut" }} 
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {allEvents && Object.keys(allEvents).length > 0 ? (
                        Object.entries(allEvents)
                            .filter(([id, eventData]) => {
                                // Filter out the current live session and show only first 3 events
                                const currentSessionTitle = programData?.liveSessionCard?.title?.toLowerCase();
                                const eventTitle = eventData?.upcomingSessionCard?.title?.toLowerCase();
                                return eventTitle !== currentSessionTitle && eventData?.upcomingSessionCard?.image;
                            })
                            .slice(0, 3)
                            .sort(() => Math.random() - 0.5) // Randomize the order
                            .map(([id, eventData]) => {
                                return (
                                    <PersondetailsCard 
                                        key={id}
                                        image={eventData?.upcomingSessionCard?.image || '/assets/default-event.png'}
                                        title={eventData?.upcomingSessionCard?.title || 'Event'}
                                        price={`${eventData?.upcomingSessionCard?.price || '0'}`}
                                        type={eventData?.type || 'live-session'}
                                    />
                                );
                            })
                    ) : (
                        // Fallback to original cards if no events loaded
                        <>
                            <PersondetailsCard image="/assets/Rohini_singh.png" title="Discover your true self - A 28 day program with Rohini Singh Sisodia" price="Rs.14,999.00" />
                            <PersondetailsCard image="/assets/Anisha.png" title="Let's meditate for an hour - With Anisha" price="Rs.199.00" />
                            <PersondetailsCard image="/assets/arati_prasad.png" title="Menopausal fitness - A 4 day regime curated by Aarti Prasad" price="Rs.4,000.00" />
                        </>
                    )}
                </motion.div>
            </div>

            {/* Bundles Popup */}
            <BundlesPopup 
                isOpen={showBundlesPopup}
                onClose={() => setShowBundlesPopup(false)}
                retreatData={{
                    id: programData?.liveSessionCard?.title,
                    pilgrimRetreatCard: {
                        title: programData?.liveSessionCard?.title,
                        price: programData?.oneTimeSubscription?.price,
                        location: programData?.liveSessionCard?.location
                    },
                    oneTimeSubscription: {
                        images: [programData?.liveSessionCard?.thumbnail]
                    }
                }}
            />
        </>
    );
}
