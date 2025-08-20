import { useEffect, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import GuideCard from "./GuideCard";
import SlotModal from "./SlotModal";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useParams } from "react-router-dom";

export default function GuideClassDetails() {
    const [mode, setMode] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

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

    const { guideClassName } = useParams();
    const formattedTitle = guideClassName.replace(/-/g, " ");
    const [sessionData, setSessionData] = useState(null);
    const uid = "pilgrim_guides";

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

                    const found = data.slides.find(
                        (r) => normalize(r?.guideCard?.title) === normalize(formattedTitle)
                    );

                    setSessionData(found || null);
                }
            } catch (error) {
                console.error("Error fetching session:", error);
            }
        };

        fetchSession();
    }, [formattedTitle]);

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

    return (
        <div className="px-4 py-10 mt-[100px] bg-gradient-to-r from-[#FAF4F0] to-white">
            {/* title and price */}
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-4xl font-bold">
                    {sessionData?.guideCard?.title}
                </h1>
                <p className="text-2xl font-semibold text-gray-800 mt-2">
                    From <span className="text-4xl">{sessionData?.guideCard?.price &&
                        `₹ ${Number(sessionData.guideCard.price).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}`}
                    </span>
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-7xl mx-auto px-4 py-10">
                {/* Image */}
                <div className="flex-shrink-0">
                    <img
                        src="https://images.unsplash.com/photo-1529070538774-1843cb3265df"
                        alt="Instructor"
                        className="rounded-xl h-full object-cover"
                    />
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
                                    className="px-2"
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

                    {/* Pricing Box (static for now) */}
                    <div className="grid max-w-sm gap-4">
                        {/* Monthly Subscription */}
                        <div
                            onClick={() => setSelectedPlan("monthly")}
                            className={`cursor-pointer border p-4 rounded-xl space-y-2 transition 
                                    ${selectedPlan === "monthly"
                                    ? "border-[#2F6288] bg-blue-50 shadow-md"
                                    : "border-gray-300 bg-white"}`
                            }
                        >
                            <p className="text-sm font-semibold text-gray-700 flex justify-between items-center">
                                <span>Monthly Subscription</span>
                                <span className="text-[#E8A87C] ml-2 text-xs">Save {sessionData?.monthlySubscription?.discount}%</span>
                            </p>
                            <p className="text-lg font-bold text-[#2F6288]">
                                {sessionData?.monthlySubscription?.price &&
                                    `₹ ${Number(sessionData.monthlySubscription.price).toLocaleString("en-IN", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}`}
                            </p>
                            <ul className="text-sm list-disc list-inside text-gray-600">
                                {sessionData?.monthlySubscription?.description
                                    ?.split("\n")
                                    .map((line, i) => (
                                        <li key={i}>{line}</li>
                                    ))}
                            </ul>
                        </div>

                        {/* One Time Purchase */}
                        <div
                            onClick={() => setSelectedPlan("oneTime")}
                            className={`cursor-pointer border p-4 rounded-xl space-y-2 transition 
                                    ${selectedPlan === "oneTime"
                                    ? "border-[#2F6288] bg-blue-50 shadow-md"
                                    : "border-gray-300 bg-white"}`}
                        >
                            <p className="text-sm font-semibold text-gray-700">
                                One Time Purchase
                            </p>
                            <p className="text-lg font-bold">
                                {sessionData?.oneTimePurchase?.price &&
                                    `₹ ${Number(sessionData.oneTimePurchase.price).toLocaleString("en-IN", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}`}
                            </p>
                        </div>

                        {/* Buttons */}
                        {mode === "Offline" && (
                            <button
                                className="w-full bg-[#2F6288] text-white py-2 rounded hover:bg-[#2F6288]/90 transition"
                                onClick={() => setShowModal(true)}
                            >
                                Book Now
                            </button>
                        )}

                        {mode === "Online" && (
                            <>
                                <button className="w-full bg-[#2F6288] text-white py-2 rounded hover:bg-[#2F6288]/90 transition">
                                    Schedule Your Time
                                </button>
                                <button className="w-full border border-[#2F6288] text-[#2F6288] py-2 rounded hover:border-[#2F6288]/90 transition">
                                    Get Free Trial
                                </button>
                            </>
                        )}
                    </div>
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

            {/* Recommendations */}
            <div className="max-w-7xl mx-auto p-4">
                <h2 className="text-3xl text-[#2F6288] font-bold mb-6">
                    You May Also Like <span className="bg-[#2F6288] mt-4 w-xs h-1 block"></span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions.map((session, index) => (
                        <GuideCard key={index} {...session} />
                    ))}
                </div>
            </div>

            {showModal && <SlotModal onClose={() => setShowModal(false)} />}
        </div>
    );
}
