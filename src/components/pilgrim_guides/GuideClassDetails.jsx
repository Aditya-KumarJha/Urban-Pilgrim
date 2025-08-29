import { useEffect, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import GuideCard from "./GuideCard";
import { motion } from "framer-motion";
import SlotModal from "./SlotModal";
import CalendarModal from "./CalendarModal";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { fetchAllEvents } from "../../utils/fetchEvents";
import { useDispatch, useSelector } from "react-redux";
import PersondetailsCard from "../../components/persondetails_card";
import { getProgramButtonConfig } from "../../utils/userProgramUtils";
import { useNavigate } from "react-router-dom";

export default function GuideClassDetails() {
    const { addToCart } = useCart();
    const [mode, setMode] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState("");
    const [subscriptionType, setSubscriptionType] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [mainImage, setMainImage] = useState('');
    const [galleryImages, setGalleryImages] = useState([]);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Get user programs from Redux
    const userPrograms = useSelector((state) => state.userProgram);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sessions = [
        {
            image: "/assets/Anisha.png",
            category: "Yoga",
            title: "Let's Meditate For An Hour - With Anisha",
            price: "199.00",
        },
        {
            image: "/assets/arati_prasad.png",
            category: "Meditation",
            title: "Menopausal Fitness – A 4 Day Regime Curated By Aarti Prasad",
            price: "4,000.00",
        },
        {
            image: "/assets/Anisha.png",
            category: "Yoga",
            title:
                "Discover Your True Self – A 28 Day Soul Search Journey With Rohini Singh Sisodia",
            price: "14,999.00",
        },
    ];

    // Get events from Redux store
    const { allEvents } = useSelector((state) => state.allEvents);

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

    const { guideClassName } = useParams();
    const formattedTitle = guideClassName.replace(/-/g, " ");
    const [sessionData, setSessionData] = useState(null);
    const uid = "pilgrim_guides";

    // Auto-set subscription type based on availability
    useEffect(() => {
        if (sessionData) {
            const availablePlans = [];

            // Check which plans are available
            if (sessionData.online?.monthly?.price || sessionData.offline?.monthly?.price) {
                availablePlans.push("monthly");
            }
            if (sessionData.online?.quarterly?.price || sessionData.offline?.quarterly?.price) {
                availablePlans.push("quarterly");
            }
            if (sessionData.online?.oneTime?.price || sessionData.offline?.oneTime?.price) {
                availablePlans.push("oneTime");
            }

            // If only one plan is available, auto-select it
            if (availablePlans.length === 1) {
                setSubscriptionType(availablePlans[0]);
                setSelectedPlan(availablePlans[0]);
            }
            // If multiple plans available, don't auto-select (let user choose)
            else if (availablePlans.length > 1) {
                setSubscriptionType(null);
                setSelectedPlan("");
            }
        }
    }, [sessionData]);

    // helper to normalize strings for comparison
    const normalize = (str) =>
        str
            ?.toLowerCase()
            .trim()
            .replace(/[-\s]+/g, " "); // collapse dashes & spaces into single space

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const sessionRef = doc(db, `pilgrim_guides/${uid}/guides/data`);
                const snapshot = await getDoc(sessionRef);

                if (snapshot.exists()) {
                    const data = snapshot.data();

                    // Ensure slides is always an array
                    const slidesArray = Array.isArray(data.slides) ? data.slides : Object.values(data.slides || {});

                    const found = slidesArray.find(
                        (r) => normalize(r?.guideCard?.title) === normalize(formattedTitle)
                    );

                    setSessionData(found || null);

                    // Extract and set gallery images
                    if (found?.session?.images && Array.isArray(found.session.images)) {
                        setGalleryImages(found.session.images);
                        setMainImage(found?.guideCard?.thumbnail || found.session.images[0] || "");
                    } else {
                        setMainImage(found?.guideCard?.thumbnail || "");
                        setGalleryImages([]);
                    }
                }
            } catch (error) {
                console.error("Error fetching session:", error);
            }
        };

        fetchSession();
    }, [formattedTitle, uid]);

    useEffect(() => {
        // Assume you already fetched sessionData
        console.log("sessiondata: ", sessionData);
        if (sessionData?.guideCard?.subCategory) {
            const sub = sessionData.guideCard.subCategory.toLowerCase();
            if (sub === "offline") setMode("Offline");
            else if (sub === "online") setMode("Online");
            else if (sub === "both") setMode("Offline"); // default
        }
    }, [sessionData]);

    // Function to get slots based on current mode and subscription type
    const getAvailableSlots = () => {
        if (!sessionData || !mode) return [];

        const modeKey = mode.toLowerCase(); // "online" or "offline"
        let allSlots = [];

        // Get all available slots for the current mode across all subscription types
        if (subscriptionType === "monthly" && sessionData[modeKey]?.monthly?.slots) {
            allSlots = sessionData[modeKey].monthly.slots;
        } else if (subscriptionType === "quarterly" && sessionData[modeKey]?.quarterly?.slots) {
            allSlots = sessionData[modeKey].quarterly.slots;
        } else if (subscriptionType === "oneTime" && sessionData[modeKey]?.oneTime?.slots) {
            allSlots = sessionData[modeKey].oneTime.slots;
        } else {
            // Fallback: collect all slots from available subscription types for the mode
            const monthlySlots = sessionData[modeKey]?.monthly?.slots || [];
            const quarterlySlots = sessionData[modeKey]?.quarterly?.slots || [];
            const oneTimeSlots = sessionData[modeKey]?.oneTime?.slots || [];
            allSlots = [...monthlySlots, ...quarterlySlots, ...oneTimeSlots];
        }

        return allSlots;
    };

    // Update available slots when mode or subscription type changes
    useEffect(() => {
        const slots = getAvailableSlots();
        setAvailableSlots(slots);
    }, [sessionData, mode, subscriptionType]);

    return (
        <div className="px-4 py-10 mt-[100px] bg-gradient-to-r from-[#FAF4F0] to-white">
            {/* title and price */}
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-4xl font-bold">
                    {sessionData?.guideCard?.title}
                </h1>
                <p className="text-2xl font-semibold text-gray-800 mt-2">
                    From <span className="text-3xl">{sessionData?.guideCard?.price &&
                        `₹ ${Number(sessionData.guideCard.price).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}`}
                    </span>
                </p>
            </div>

            {/* Image and subscription */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-7xl mx-auto px-4 py-10">
                {/* Image */}
                <div className="flex-shrink-0 space-y-4">
                    {/* Main Image */}
                    <img
                        src={mainImage || sessionData?.guideCard?.thumbnail}
                        alt="Instructor"
                        className="rounded-xl xl:h-[400px] xl:w-[700px] md:h-[450px] sm:h-[480px] object-cover"
                    />

                    {/* Gallery Images */}
                    {galleryImages.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {/* Main thumbnail */}
                            <img
                                src={sessionData?.guideCard?.thumbnail}
                                alt="Main thumbnail"
                                className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                                onClick={() => setMainImage(sessionData?.guideCard?.thumbnail)}
                            />
                            {/* Gallery thumbnails */}
                            {galleryImages.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`Gallery ${index + 1}`}
                                    className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
                                    onClick={() => setMainImage(image)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Subscription and mode */}
                <div className="flex-1 space-y-6">
                    {/* mode */}
                    <div className="flex flex-wrap gap-4">
                        {/* Show dropdown only if subcategory is BOTH */}
                        {sessionData?.guideCard?.subCategory?.toLowerCase() === "both" && (
                            <div className="relative flex items-center gap-4">
                                <label className="font-medium">Select Mode:</label>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="px-4 py-2 border rounded-full border-[#D69A75] flex items-center gap-2 bg-white"
                                >
                                    {mode || "Choose Mode"} <FiChevronDown />
                                </button>
                                {dropdownOpen && (
                                    <div className="absolute mt-2 bg-white border rounded shadow w-full z-10">
                                        {["Offline", "Online"].map((opt) => (
                                            <div
                                                key={opt}
                                                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${mode === opt ? "bg-gray-100 font-semibold" : ""
                                                    }`}
                                                onClick={() => {
                                                    setMode(opt);
                                                    setDropdownOpen(false);
                                                }}
                                            >
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {
                            sessionData?.guideCard?.subCategory !== "both" && (
                                <div className="flex items-center border-[#D69A75] border rounded-full px-2 font-medium">{sessionData?.guideCard?.subCategory}</div>
                            )
                        }

                        {/* Quantity */}
                        <div className="flex flex-wrap items-center gap-2">
                            <label className="font-medium">No of persons/sessions:</label>
                            <div className="flex items-center border-[#D69A75] border rounded-full px-2">
                                <button
                                    className="p-2"
                                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                >
                                    -
                                </button>
                                <span className="px-3">{quantity}</span>
                                <button
                                    className="px-2"
                                    onClick={() => setQuantity((q) => q + 1)}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        {sessionData?.guideCard?.description?.split('\n').map((line, index) => (
                            <div key={index} className="mb-2">
                                {line}
                            </div>
                        ))}
                    </div>

                    {/* Subscription Type Selector - Only show if multiple options available */}
                    {(((sessionData?.online?.monthly?.price || sessionData?.offline?.monthly?.price) &&
                        (sessionData?.online?.quarterly?.price || sessionData?.offline?.quarterly?.price)) ||
                        (((sessionData?.online?.monthly?.price || sessionData?.offline?.monthly?.price) ||
                            (sessionData?.online?.quarterly?.price || sessionData?.offline?.quarterly?.price)) &&
                            (sessionData?.online?.oneTime?.price || sessionData?.offline?.oneTime?.price))) && (
                            <div className="max-w-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Plan Type</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                                    {/* Monthly Option */}
                                    {(sessionData?.online?.monthly?.price || sessionData?.offline?.monthly?.price) && (
                                        <button
                                            onClick={() => {
                                                setSubscriptionType("monthly");
                                                setSelectedPlan("monthly");
                                            }}
                                            className={`p-3 rounded-lg border-2 transition-all duration-200 ${subscriptionType === "monthly"
                                                    ? "border-[#2F6288] bg-[#2F6288] text-white shadow-md"
                                                    : "border-gray-300 bg-white text-gray-700 hover:border-[#2F6288] hover:bg-gray-50"
                                                }`}
                                        >
                                            <div className="text-center">
                                                <p className="font-semibold">Monthly</p>
                                                <p className="text-xs opacity-90">Flexible</p>
                                            </div>
                                        </button>
                                    )}

                                    {/* Quarterly Option */}
                                    {(sessionData?.online?.quarterly?.price || sessionData?.offline?.quarterly?.price) && (
                                        <button
                                            onClick={() => {
                                                setSubscriptionType("quarterly");
                                                setSelectedPlan("quarterly");
                                            }}
                                            className={`p-3 rounded-lg border-2 transition-all duration-200 ${subscriptionType === "quarterly"
                                                    ? "border-[#2F6288] bg-[#2F6288] text-white shadow-md"
                                                    : "border-gray-300 bg-white text-gray-700 hover:border-[#2F6288] hover:bg-gray-50"
                                                }`}
                                        >
                                            <div className="text-center">
                                                <p className="font-semibold">Quarterly</p>
                                                <p className="text-xs opacity-90">Save more</p>
                                            </div>
                                        </button>
                                    )}

                                    {/* One Time Option */}
                                    {(sessionData?.online?.oneTime?.price || sessionData?.offline?.oneTime?.price) && (
                                        <button
                                            onClick={() => {
                                                setSubscriptionType("oneTime");
                                                setSelectedPlan("oneTime");
                                            }}
                                            className={`p-3 rounded-lg border-2 transition-all duration-200 ${subscriptionType === "oneTime"
                                                    ? "border-[#2F6288] bg-[#2F6288] text-white shadow-md"
                                                    : "border-gray-300 bg-white text-gray-700 hover:border-[#2F6288] hover:bg-gray-50"
                                                }`}
                                        >
                                            <div className="text-center">
                                                <p className="font-semibold">One Time</p>
                                                <p className="text-xs opacity-90">Pay once</p>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                    {/* Pricing Box */}
                    {subscriptionType && (
                        <div className="grid max-w-sm gap-4">
                            {/* Monthly Subscription Plans */}
                            {subscriptionType === "monthly" && (
                                <div className="space-y-4">
                                    {/* Online Monthly Plan */}
                                    {sessionData?.online?.monthly?.price && (
                                        <div
                                            className="border p-4 rounded-xl space-y-2 border-gray-300 bg-white"
                                        >
                                            <p className="text-sm font-semibold text-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                                <span>Monthly Online Subscription</span>
                                                {sessionData.online.monthly.discount && (
                                                    <span className="text-[#E8A87C] text-xs bg-orange-100 px-2 py-1 rounded-full">
                                                        Save {sessionData.online.monthly.discount}%
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-lg font-bold text-[#2F6288]">
                                                ₹ {Number(sessionData.online.monthly.price).toLocaleString("en-IN", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                                <span className="text-sm text-gray-500 font-normal">/month</span>
                                            </p>
                                            {sessionData.online.monthly.description && (
                                                <ul className="text-sm list-disc list-inside text-gray-600 space-y-1">
                                                    {sessionData.online.monthly.description
                                                        .split("\n")
                                                        .filter(line => line.trim())
                                                        .map((line, i) => (
                                                            <li key={i}>{line.trim()}</li>
                                                        ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}

                                    {/* Offline Monthly Plan */}
                                    {sessionData?.offline?.monthly?.price && (
                                        <div
                                            className="border p-4 rounded-xl space-y-2 border-gray-300 bg-white"
                                        >
                                            <p className="text-sm font-semibold text-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                                <span>Monthly Offline Subscription</span>
                                                {sessionData.offline.monthly.discount && (
                                                    <span className="text-[#E8A87C] text-xs bg-orange-100 px-2 py-1 rounded-full">
                                                        Save {sessionData.offline.monthly.discount}%
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-lg font-bold text-[#2F6288]">
                                                ₹ {Number(sessionData.offline.monthly.price).toLocaleString("en-IN", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                                <span className="text-sm text-gray-500 font-normal">/month</span>
                                            </p>
                                            {sessionData.offline.monthly.description && (
                                                <ul className="text-sm list-disc list-inside text-gray-600 space-y-1">
                                                    {sessionData.offline.monthly.description
                                                        .split("\n")
                                                        .filter(line => line.trim())
                                                        .map((line, i) => (
                                                            <li key={i}>{line.trim()}</li>
                                                        ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Quarterly Subscription Plans */}
                            {subscriptionType === "quarterly" && (
                                <div className="space-y-4">
                                    {/* Online Quarterly Plan */}
                                    {sessionData?.online?.quarterly?.price && (
                                        <div
                                            className="border p-4 rounded-xl space-y-2 border-gray-300 bg-white"
                                        >
                                            <p className="text-sm font-semibold text-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                                <span>Quarterly Online Subscription</span>
                                                {sessionData.online.quarterly.discount && (
                                                    <span className="text-[#E8A87C] text-xs bg-orange-100 px-2 py-1 rounded-full">
                                                        Save {sessionData.online.quarterly.discount}%
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-lg font-bold text-[#2F6288]">
                                                ₹ {Number(sessionData.online.quarterly.price).toLocaleString("en-IN", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                                <span className="text-sm text-gray-500 font-normal">/quarter</span>
                                            </p>
                                            {sessionData.online.quarterly.description && (
                                                <ul className="text-sm list-disc list-inside text-gray-600 space-y-1">
                                                    {sessionData.online.quarterly.description
                                                        .split("\n")
                                                        .filter(line => line.trim())
                                                        .map((line, i) => (
                                                            <li key={i}>{line.trim()}</li>
                                                        ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}

                                    {/* Offline Quarterly Plan */}
                                    {sessionData?.offline?.quarterly?.price && (
                                        <div
                                            className="border p-4 rounded-xl space-y-2 border-gray-300 bg-white"
                                        >
                                            <p className="text-sm font-semibold text-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                                <span>Quarterly Offline Subscription</span>
                                                {sessionData.offline.quarterly.discount && (
                                                    <span className="text-[#E8A87C] text-xs bg-orange-100 px-2 py-1 rounded-full">
                                                        Save {sessionData.offline.quarterly.discount}%
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-lg font-bold text-[#2F6288]">
                                                ₹ {Number(sessionData.offline.quarterly.price).toLocaleString("en-IN", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                                <span className="text-sm text-gray-500 font-normal">/quarter</span>
                                            </p>
                                            {sessionData.offline.quarterly.description && (
                                                <ul className="text-sm list-disc list-inside text-gray-600 space-y-1">
                                                    {sessionData.offline.quarterly.description
                                                        .split("\n")
                                                        .filter(line => line.trim())
                                                        .map((line, i) => (
                                                            <li key={i}>{line.trim()}</li>
                                                        ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* One Time Purchase - Only show when selected or when it's the only option */}
                            {subscriptionType === "oneTime" && (
                                <div className="space-y-4">
                                    {/* Online One Time Plan */}
                                    {sessionData?.online?.oneTime?.price && (
                                        <div
                                            className="border p-4 rounded-xl space-y-2 border-gray-300 bg-white"
                                        >
                                            <p className="text-sm font-semibold text-gray-700">
                                                One Time Online Purchase
                                            </p>
                                            <p className="text-lg font-bold text-[#2F6288]">
                                                ₹ {Number(sessionData.online.oneTime.price).toLocaleString("en-IN", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                                <span className="text-sm text-gray-500 font-normal">/session</span>
                                            </p>
                                            <p className="text-xs text-gray-500">Pay once, access forever</p>
                                        </div>
                                    )}

                                    {/* Offline One Time Plan */}
                                    {sessionData?.offline?.oneTime?.price && (
                                        <div
                                            className="border p-4 rounded-xl space-y-2 border-gray-300 bg-white"
                                        >
                                            <p className="text-sm font-semibold text-gray-700">
                                                One Time Offline Purchase
                                            </p>
                                            <p className="text-lg font-bold text-[#2F6288]">
                                                ₹ {Number(sessionData.offline.oneTime.price).toLocaleString("en-IN", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                                <span className="text-sm text-gray-500 font-normal">/session</span>
                                            </p>
                                            <p className="text-xs text-gray-500">Pay once, access forever</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-3 mt-4">
                                {(() => {
                                    // Get button configuration based on user ownership
                                    const buttonConfig = getProgramButtonConfig(
                                        userPrograms,
                                        sessionData?.guideCard?.title,
                                        'guide'
                                    );

                                    const handleButtonClick = () => {
                                        if (buttonConfig.action === 'view') {
                                            // Navigate to user dashboard or program view
                                            navigate('/userdashboard');
                                        } else if (buttonConfig.action === 'renew') {
                                            // Handle renewal - show calendar for rebooking
                                            setShowCalendar(true);
                                        } else {
                                            // Default booking action
                                            setShowCalendar(true);
                                        }
                                    };

                                    if (buttonConfig.action === 'view') {
                                        // User already owns this program
                                        return (
                                            <button
                                                className={`w-full py-3 px-4 rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg ${buttonConfig.className}`}
                                                onClick={handleButtonClick}
                                            >
                                                {buttonConfig.text}
                                            </button>
                                        );
                                    }

                                    // User doesn't own the program - show booking options
                                    return (
                                        <>
                                            {mode === "Offline" && (
                                                <button
                                                    className="w-full bg-[#2F6288] text-white py-3 px-4 rounded-lg hover:bg-[#2F6288]/90 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                                                    onClick={handleButtonClick}
                                                >
                                                    Schedule Your Time - {selectedPlan === "monthly" ? "Monthly" : selectedPlan === "quarterly" ? "Quarterly" : "One Time"}
                                                </button>
                                            )}

                                            {mode === "Online" && (
                                                <>
                                                    <button
                                                        className="w-full bg-[#2F6288] text-white py-3 px-4 rounded-lg hover:bg-[#2F6288]/90 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                                                        onClick={handleButtonClick}
                                                    >
                                                        Book Now - {selectedPlan === "monthly" ? "Monthly" : selectedPlan === "quarterly" ? "Quarterly" : "One Time"}
                                                    </button>
                                                    <button
                                                        className="w-full border-2 border-[#2F6288] text-[#2F6288] py-3 px-4 rounded-lg hover:bg-[#2F6288] hover:text-white transition-all duration-200 font-semibold"
                                                        onClick={handleButtonClick}
                                                    >
                                                        Get Free Trial
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Description */}
            <div className="text-sm text-gray-700 max-w-7xl mx-auto mt-10 px-4">
                <p>
                    {sessionData?.session?.sessiondescription}
                </p>
            </div>

            {/* Yoga Vidya Skills */}
            <div className="max-w-7xl mx-auto mt-10 px-4">
                <h2 className="font-bold text-gray-800 mt-4 capitalize">{sessionData?.session?.title}</h2>
                <ul className="list-disc list-inside text-sm text-gray-700 capitalize mt-2 space-y-1">
                    {sessionData?.session?.description
                        ?.split("\n")
                        .filter((line) => line.trim() !== "")
                        .map((line, i) => (
                            <li key={i}>{line.trim()}</li>
                        ))}
                </ul>

            </div>

            {/* You may also like */}
            <div className="max-w-7xl mx-auto p-6 rounded-2xl grid gap-6 px-4">
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
                                // Filter out the current live session and show events with images
                                const currentSessionTitle = sessionData?.liveSessionCard?.title?.toLowerCase();
                                const eventTitle = eventData?.upcomingSessionCard?.title?.toLowerCase();
                                return eventTitle !== currentSessionTitle && eventData?.upcomingSessionCard?.image;
                            })
                            .sort(() => Math.random() - 0.5) // Randomize the order
                            .slice(0, 3)
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

            {showModal && <SlotModal onClose={() => setShowModal(false)} />}

            {/* Calendar Modal */}
            {showCalendar && (
                <CalendarModal
                    isOpen={showCalendar}
                    onClose={() => setShowCalendar(false)}
                    sessionData={sessionData}
                    selectedPlan={selectedPlan}
                    mode={mode}
                    availableSlots={availableSlots}
                    onAddToCart={(cartItem) => {
                        addToCart(cartItem);
                        setShowCalendar(false);
                    }}
                />
            )}
        </div>
    );
}
