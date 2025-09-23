import { useEffect, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { FaUser } from "react-icons/fa";
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
import FreeTrailModal from "../modals/FreeTrailModal";
import { showError, showSuccess } from "../../utils/toast";

export default function GuideClassDetails() {
    const { addToCart } = useCart();
    const [mode, setMode] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState("");
    const [subscriptionType, setSubscriptionType] = useState(null); // 'oneTime' | 'monthly'
    const [variation, setVariation] = useState(null); // 'individual' | 'couples' | 'group'
    const [selectedSlot, setSelectedSlot] = useState(null); // { date, startTime, endTime }
    const [availableSlots, setAvailableSlots] = useState([]);
    const [mainImage, setMainImage] = useState('');
    const [galleryImages, setGalleryImages] = useState([]);
    const [mainImageType, setMainImageType] = useState('image');
    const [showFreeTrail, setShowFreeTrail] = useState(false);
    const [selectedOccupancy, setSelectedOccupancy] = useState(null);
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

    // Each booking counts as 1 seat towards capacity (even for couple/group)
    // Pricing by occupancy is handled separately; do not multiply persons in cart
    const getPersonsPerBooking = () => 1;

    const getCapacityMax = () => {
        // For one-time capacity we will compute specifically when passing to CalendarModal
        const max = Number(selectedOccupancy?.max || 0);
        return isNaN(max) ? 0 : max;
    };

    // One-time capacity derived from selected occupancy type and occupancy config (Group max comes from occupancies)
    const getOneTimeCapacityForSelected = () => {
        const label = (selectedOccupancy?.type || '').toLowerCase();
        if (!sessionData || !mode) return 0;
        if (label.includes('couple') || label.includes('twin')) return 2;
        if (label.includes('group')) {
            const g = Number(selectedOccupancy?.max || 0);
            return isNaN(g) ? 0 : g;
        }
        // individual/default
        return 1;
    };

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

    // Helper function to determine if URL is video or image
    const getMediaType = (url) => {
        if (!url) return 'image';
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov'];
        const isVideo = videoExtensions.some(ext => url.toLowerCase().includes(ext)) || url.toLowerCase().includes('video');
        return isVideo ? 'video' : 'image';
    };

    // Handle media selection for main display
    const handleMediaSelect = (mediaUrl) => {
        setMainImage(mediaUrl);
        setMainImageType(getMediaType(mediaUrl));
    };

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

                    // Extract and set gallery images and videos
                    if (found?.session?.images && Array.isArray(found.session.images)) {
                        setGalleryImages(found.session.images);
                        const firstMedia = found?.guideCard?.thumbnail || found.session.images[0] || "";
                        setMainImage(firstMedia);
                        setMainImageType(getMediaType(firstMedia));
                    } else {
                        const thumbnail = found?.guideCard?.thumbnail || "";
                        setMainImage(thumbnail);
                        setMainImageType(getMediaType(thumbnail));
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

    // Get slots by subscription type and mode
    const getAvailableSlots = () => {
        if (!sessionData || !mode || !subscriptionType) return [];
        const modeKey = mode.toLowerCase();
        const plan = sessionData?.[modeKey]?.[subscriptionType] || {};

        // One-time: use stored date slots directly
        if (subscriptionType === 'oneTime') {
            const slots = Array.isArray(plan.slots) ? plan.slots : [];
            // Only upcoming dates
            const today = new Date();
            const todayYmd = today.toISOString().slice(0,10);
            const occLabel = (selectedOccupancy?.type || '').toLowerCase();
            let viewType = 'individual';
            if (occLabel.includes('couple') || occLabel.includes('twin')) viewType = 'couple';
            else if (occLabel.includes('group')) viewType = 'group';
            return slots
                .filter(s => (s?.date || '') >= todayYmd)
                .filter(s => (s?.type || 'individual') === viewType);
        }

        // Monthly: generate next 30 days from weeklyPattern (respect reservedMonths)
        if (subscriptionType === 'monthly') {
            const pattern = Array.isArray(plan.weeklyPattern) ? plan.weeklyPattern : [];
            if (pattern.length === 0) return [];
            const reservedMonths = new Set(
                Array.isArray(plan.reservedMonths) ? plan.reservedMonths : []
            ); // ['YYYY-MM']
            const out = [];
            const today = new Date();
            for (let i = 0; i < 30; i++) {
                const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
                const dayShort = d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0,3); // Sun, Mon...
                const ymd = d.toISOString().slice(0,10);
                const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                if (reservedMonths.has(ym)) continue; // block entire month
                pattern.forEach((row, rowIdx) => {
                    if ((row.days || []).includes(dayShort)) {
                        (row.times || []).forEach((t, tIdx) => {
                            out.push({
                                date: ymd,
                                startTime: t.startTime,
                                endTime: t.endTime,
                                type: t.type || 'individual',
                                bookedCount: Number(t.bookedCount || 0),
                                rowIdx,
                                tIdx,
                            });
                        });
                    }
                });
            }
            // Filter by selected occupancy type and capacity visibility
            const occLabel = (selectedOccupancy?.type || '').toLowerCase();
            let viewType = 'individual';
            if (occLabel.includes('couple') || occLabel.includes('twin')) viewType = 'couple';
            else if (occLabel.includes('group')) viewType = 'group';

            const groupMax = Number(plan.groupMax || 0);
            const filtered = out.filter(s => {
                if (viewType === 'couple') {
                    return s.type === 'couple' && Number(s.bookedCount || 0) < 2;
                }
                if (viewType === 'group') {
                    return s.type === 'group' && (groupMax > 0 ? Number(s.bookedCount || 0) < groupMax : true);
                }
                // individual: show only individual; requirement did not specify capacity cap here
                return s.type === 'individual';
            });
            return filtered;
        }

        return [];
    };

    // Update available slots when mode or subscription type changes
    useEffect(() => {
        const s = getAvailableSlots();
        setAvailableSlots(s);
    }, [sessionData, mode, subscriptionType, selectedOccupancy]);

    const getPricesForSelection = () => {
        if (!sessionData || !mode || !subscriptionType) return {};
        const plan = sessionData[mode.toLowerCase()]?.[subscriptionType] || {};
        return {
            individual: plan.individualPrice || plan.price || 0,
            couples: plan.couplesPrice || 0,
            group: plan.groupPrice || 0,
            groupMin: plan.groupMin || 0,
            groupMax: plan.groupMax || 0,
        };
    };

    const getPlan = () => {
        if (!sessionData || !mode || !subscriptionType) return {};
        return sessionData[mode.toLowerCase()]?.[subscriptionType] || {};
    };

    const hasVariation = (v) => {
        const p = getPlan();
        if (v === 'individual') return !!(p.individualPrice || p.price);
        if (v === 'couples') return !!p.couplesPrice;
        if (v === 'group') return !!p.groupPrice;
        return false;
    };

    const planHasPrice = (planObj) => !!(planObj?.price || planObj?.individualPrice || planObj?.couplesPrice || planObj?.groupPrice);

    const planAvailable = (planKey) => {
        if (!sessionData || !mode) return false;
        const pk = sessionData[mode.toLowerCase()]?.[planKey];
        return planHasPrice(pk);
    };

    // Available across any mode (Online/Offline)
    const planAvailableAny = (planKey) => {
        if (!sessionData) return false;
        return planHasPrice(sessionData?.online?.[planKey]) || planHasPrice(sessionData?.offline?.[planKey]);
    };

    const findModeForPlan = (planKey) => {
        if (planHasPrice(sessionData?.online?.[planKey])) return 'Online';
        if (planHasPrice(sessionData?.offline?.[planKey])) return 'Offline';
        return null;
    };

    const getPlanFromPrice = (planObj) => {
        if (!planObj) return null;
        const prices = [planObj.price, planObj.individualPrice, planObj.couplesPrice, planObj.groupPrice]
            .map(v => (v === undefined || v === null || v === '' ? null : Number(v)))
            .filter(v => typeof v === 'number' && !isNaN(v) && v >= 0);
        if (prices.length === 0) return null;
        return Math.min(...prices);
    };

    const getPlanPricePreview = (planKey) => {
        if (!sessionData) return null;
        const current = sessionData[mode?.toLowerCase?.()]?.[planKey];
        let price = getPlanFromPrice(current);
        let usedMode = mode;
        if (price == null) {
            const altMode = mode === 'Online' ? 'offline' : 'online';
            const alt = sessionData[altMode]?.[planKey];
            price = getPlanFromPrice(alt);
            usedMode = altMode === 'online' ? 'Online' : altMode === 'offline' ? 'Offline' : usedMode;
        }
        if (price == null) return null;
        return { price, mode: usedMode };
    };

    // Prefer selected occupancy price if provided, else use plan price preview
    const getDisplayedPrice = () => {
        if (!subscriptionType) return null;
        if (selectedOccupancy && selectedOccupancy.price) {
            const n = Number(selectedOccupancy.price);
            return isNaN(n) ? null : n;
        }
        const pv = getPlanPricePreview(subscriptionType);
        return pv?.price ?? null;
    };

    const handleShowFreeTrail = () => {
        // Check if there are any videos available for free trial
        const hasVideoContent = sessionData?.session?.freeTrialVideo
        
        if (hasVideoContent) {
            setShowFreeTrail(true);
        } else {
            showError("Free trial is not available for this program");
        }
    }

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
                    {/* Main Media Display */}
                    {mainImageType === 'video' ? (
                        <video
                            src={mainImage || sessionData?.guideCard?.thumbnail}
                            controls
                            autoPlay
                            muted
                            className="rounded-xl xl:h-[400px] xl:w-[700px] md:h-[450px] sm:h-[480px] object-cover"
                            preload="metadata"
                        >
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <img
                            src={mainImage || sessionData?.guideCard?.thumbnail}
                            alt="Instructor"
                            className="rounded-xl xl:h-[400px] xl:w-[700px] md:h-[450px] sm:h-[480px] object-cover"
                        />
                    )}

                    {/* Gallery Media Thumbnails */}
                    {galleryImages.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {/* Main thumbnail */}
                            {sessionData?.guideCard?.thumbnail && (
                                <div className="relative flex-shrink-0">
                                    {getMediaType(sessionData.guideCard.thumbnail) === 'video' ? (
                                        <div className="relative">
                                            <video
                                                src={sessionData.guideCard.thumbnail}
                                                className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                                muted
                                                preload="metadata"
                                                onClick={() => handleMediaSelect(sessionData.guideCard.thumbnail)}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="bg-black bg-opacity-50 rounded-full p-1">
                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M8 5v10l8-5-8-5z"/>
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <img
                                            src={sessionData.guideCard.thumbnail}
                                            alt="Main thumbnail"
                                            className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => handleMediaSelect(sessionData.guideCard.thumbnail)}
                                        />
                                    )}
                                </div>
                            )}
                            
                            {/* Gallery thumbnails */}
                            {galleryImages.map((media, index) => (
                                <div key={index} className="relative flex-shrink-0">
                                    {getMediaType(media) === 'video' ? (
                                        <div className="relative">
                                            <video
                                                src={media}
                                                className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                                muted
                                                preload="metadata"
                                                onClick={() => handleMediaSelect(media)}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="bg-black bg-opacity-50 rounded-full p-1">
                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M8 5v10l8-5-8-5z"/>
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <img
                                            src={media}
                                            alt={`Gallery ${index + 1}`}
                                            className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => handleMediaSelect(media)}
                                        />
                                    )}
                                </div>
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

                    {/* occupency/group type */}
                    {sessionData?.guideCard?.occupancies && sessionData?.guideCard?.occupancies.length > 0 && sessionData?.guideCard?.showOccupancy && (
                        <div className="flex flex-col gap-3">
                            {
                                sessionData?.guideCard?.occupancies[0].type === "Single" || sessionData?.guideCard?.occupancies[0].type === "Twin" ? (
                                    <div className="flex items-center gap-2">
                                        <FaUser className="text-[#C5703F]" />
                                        <span className="text-sm font-medium">Select Occupancy:</span>
                                    </div>
                                ) : ""
                            }
                            <div className="flex flex-wrap gap-2">
                                {sessionData.guideCard.occupancies.map((occupancy, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedOccupancy(occupancy)}
                                        className={`px-4 py-2 rounded-lg border transition-all duration-200 text-sm ${
                                            selectedOccupancy?.type === occupancy.type
                                                ? "border-[#C5703F] bg-[#C5703F] text-white shadow-md"
                                                : "border-gray-300 bg-white text-gray-700 hover:border-[#C5703F] hover:bg-gray-50"
                                        }`}
                                    >
                                        <div className="text-center">
                                            <p className="font-semibold">{occupancy.type}</p>
                                            {occupancy.price && (
                                                <p className="text-xs opacity-90">
                                                    ₹{new Intl.NumberFormat("en-IN").format(occupancy.price)}
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Subscription Type Selector - show if admin provided plan in ANY mode */}
                    {(planAvailableAny('monthly') || planAvailableAny('oneTime')) && (
                        <div className="max-w-sm">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Plan Type</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                                {/* Monthly Option */}
                                {planAvailableAny('monthly') && (
                                        <button
                                            onClick={() => {
                                                setSubscriptionType("monthly");
                                                setSelectedPlan("monthly");
                                                if (!planAvailable('monthly')) {
                                                    const m = findModeForPlan('monthly');
                                                    if (m) setMode(m);
                                                }
                                            }}
                                            className={`p-3 rounded-lg border-2 transition-all duration-200 ${subscriptionType === "monthly"
                                                ? "border-[#C5703F] bg-[#C5703F] text-white shadow-md"
                                                : "border-gray-300 bg-white text-gray-700 hover:border-[#C5703F] hover:bg-gray-50"
                                            }`}
                                        >
                                            <div className="text-center">
                                                <p className="font-semibold">Monthly</p>
                                                {(() => {
                                                    const pv = getPlanPricePreview('monthly');
                                                    return pv ? (
                                                        <p className="text-xs mt-1">From ₹{new Intl.NumberFormat('en-IN').format(pv.price)}{planAvailable('monthly') ? '' : ` • ${pv.mode}`}</p>
                                                    ) : null;
                                                })()}
                                            </div>
                                        </button>
                                    )}

                                {/* One Time Option */}
                                {planAvailableAny('oneTime') && (
                                    <button
                                        onClick={() => {
                                            setSubscriptionType("oneTime");
                                            setSelectedPlan("oneTime");
                                            if (!planAvailable('oneTime')) {
                                                const m = findModeForPlan('oneTime');
                                                if (m) setMode(m);
                                            }
                                        }}
                                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${subscriptionType === "oneTime"
                                                ? "border-[#C5703F] bg-[#C5703F] text-white shadow-md"
                                                : "border-gray-300 bg-white text-gray-700 hover:border-[#C5703F] hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="text-center">
                                            <p className="font-semibold">One Time</p>
                                            {(() => {
                                                const pv = getPlanPricePreview('oneTime');
                                                return pv ? (
                                                    <p className="text-xs mt-1">From ₹{new Intl.NumberFormat('en-IN').format(pv.price)}{planAvailable('oneTime') ? '' : ` • ${pv.mode}`}</p>
                                                ) : null;
                                            })()}
                                        </div>
                                    </button>
                                )}
                            </div>
                            {/* Selected Plan Price Summary (uses occupancy price if selected) */}
                            {subscriptionType && (() => {
                                const title = subscriptionType === 'oneTime' ? 'One Time Purchase' : 'Monthly Subscription';
                                const price = getDisplayedPrice();
                                if (price == null) return null;
                                return (
                                    <div className="mt-2 border rounded-xl p-4 bg-white">
                                        <div className="font-semibold underline mb-2">{title}</div>
                                        <div className="text-2xl font-bold">₹ {new Intl.NumberFormat('en-IN').format(price)}</div>
                                        <div className="text-sm text-gray-500">Total</div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* Book Now opens Calendar Modal with available slots */}
                    {subscriptionType && (
                        <div className="max-w-sm mt-6 space-y-3">
                            {(() => {
                                const buttonConfig = getProgramButtonConfig(userPrograms, sessionData?.guideCard?.title, 'guide');
                                const hasPreviousBooking = buttonConfig.action !== 'book';
                                return (
                                    <>
                                        <button
                                            onClick={() => setShowCalendar(true)}
                                            className={`w-full px-4 py-3 rounded-lg text-white font-semibold bg-[#2F6288] hover:bg-[#2F6288]/90`}
                                        >
                                            Book Now
                                        </button>
                                        {hasPreviousBooking ? (
                                            <button
                                                onClick={() => navigate('/userdashboard')}
                                                className="w-full px-4 py-3 rounded-lg border border-[#2F6288] text-[#2F6288] hover:bg-blue-50 font-semibold"
                                            >
                                                See your previous booking
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleShowFreeTrail}
                                                className="w-full px-4 py-3 rounded-lg border border-[#2F6288] text-[#2F6288] hover:bg-blue-50 font-semibold"
                                            >
                                                Get a Free Trial
                                            </button>
                                        )}
                                    </>
                                );
                            })()}
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
                            .filter(([id, data]) => {
                                // Only show guide cards
                                return !!data?.guideCard?.image;
                            })
                            .sort(() => Math.random() - 0.5)
                            .slice(0, 3)
                            .map(([id, data]) => (
                                <PersondetailsCard
                                    key={id}
                                    image={data?.guideCard?.image || '/assets/default-event.png'}
                                    title={data?.guideCard?.title || 'Guide'}
                                    price={`${data?.guideCard?.price || '0'}`}
                                    type={'guide'}
                                />
                            ))
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
                    personsPerBooking={getPersonsPerBooking()}
                    occupancyType={selectedOccupancy?.type || ''}
                    capacityMax={selectedPlan === 'oneTime' ? getOneTimeCapacityForSelected() : 0}
                    onAddToCart={(cartItem) => {
                        addToCart(cartItem);
                        setShowCalendar(false);
                    }}
                />
            )}

            {showFreeTrail && (
                <FreeTrailModal 
                    onClose={() => setShowFreeTrail(false)} 
                    videoUrl={sessionData?.session?.freeTrialVideo}
                    title={sessionData?.guideCard?.title}
                />
            )}
        </div>
    );
}
