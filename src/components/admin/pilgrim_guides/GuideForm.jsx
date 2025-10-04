import { useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { X, Plus, Trash2, GripVertical, Edit2 } from "lucide-react";
import { storage } from "../../../services/firebase";
import { deleteObject, getDownloadURL, ref, uploadBytes, uploadBytesResumable } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { deleteSlideByIndex, fetchGuideData, saveOrUpdateGuideData } from "../../../services/pilgrim_guide/guideService";
import { useDispatch, useSelector } from "react-redux";
import { setGuides } from "../../../features/pilgrim_guide/pilgrimGuideSlice";
import { showSuccess, showError } from "../../../utils/toast"
import toast from "react-hot-toast";

const ItemType = "SLIDE";

function SlideItem({ slide, index, moveSlide, removeSlide, editSlide, isLoading }) {
    const [, ref] = useDrop({
        accept: ItemType,
        hover: (item) => {
            if (item.index !== index) {
                moveSlide(item.index, index);
                item.index = index;
            }
        },
    });

    const [, drag] = useDrag({
        type: ItemType,
        item: { index },
    });

    return (
        <div ref={(node) => drag(ref(node))} className="flex justify-between items-center p-4 rounded-lg shadow-sm bg-[#F5F5F5] mb-3 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
                <GripVertical className="text-gray-400 cursor-move w-5 h-5" />
                <div className="flex space-x-4">
                    {slide?.thumbnailType && slide?.thumbnailType.startsWith('video/') ? (
                        <video
                            src={slide?.thumbnail}
                            className="w-16 h-16 object-cover rounded mt-1"
                            autoPlay
                            muted
                            loop
                        />
                    ) : (
                        <img src={slide?.thumbnail} alt="Slide Thumbnail" className="w-16 h-16 object-cover rounded mt-1" />
                    )}
                    <div className="flex flex-col">
                        <p className="font-semibold text-gray-800">{slide?.title}</p>
                        <p className="text-sm text-gray-600">Link: /{slide?.title?.replace(/\s+/g, '-')}</p>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => {
                        console.log("Edit button clicked for index:", index);
                        editSlide(index);
                    }}
                    disabled={isLoading}
                    className={`p-1 ${isLoading ? 'text-gray-400 cursor-not-allowed' : 'text-[#2F6288] hover:text-blue-700'}`}
                    title={isLoading ? "Loading..." : "Edit Session Card"}
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => removeSlide(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Delete Session Card"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

export default function GuideForm() {

    const [formData, setFormData] = useState({
        guideCard: {
            title: "",
            category: "",
            subCategory: "",
            price: "",
            thumbnail: null,
            thumbnailType: null,
            occupancies: [{ type: "Single", price: "" }],
            showOccupancy: false,
            description: "",
            listingType: "Listing" // Default to "Listing"
        },
        // Common open slots (weekly pattern) for both online and offline
        openSlots: [
            // { days: ["Mon","Wed","Fri"], times: [{ startTime: "07:00", endTime: "08:00" }] }
        ],
        online: {
            monthly: {
                // Pricing variations
                price: "", // backward compatibility
                individualPrice: "",
                couplesPrice: "",
                groupPrice: "",
                groupMin: "",
                groupMax: "",
                discount: "",
                description: "",
                sessionsCount: "", // number of sessions per month
                slots: [],
                weeklyPattern: [] // [{ days:["Sun","Mon"], times:[{startTime, endTime}]}]
            },
            oneTime: {
                price: "", // backward compatibility
                individualPrice: "",
                couplesPrice: "",
                groupPrice: "",
                groupMin: "",
                groupMax: "",
                description: "",
                slots: []
            }
        },
        offline: {
            monthly: {
                price: "", // backward compatibility
                individualPrice: "",
                couplesPrice: "",
                groupPrice: "",
                groupMin: "",
                groupMax: "",
                discount: "",
                description: "",
                sessionsCount: "", // number of sessions per month
                slots: [],
                weeklyPattern: []
            },
            oneTime: {
                price: "", // backward compatibility
                individualPrice: "",
                couplesPrice: "",
                groupPrice: "",
                groupMin: "",
                groupMax: "",
                description: "",
                slots: []
            }
        },
        organizer: {
            name: "",
            email: "",
            address: "",
            googleMeetLink: "",
            contactNumber: ""
        },
        session: {
            sessiondescription: "",
            images: [],
            videos: [],
            title: "",
            description: "",
            freeTrialVideo: null
        },
        slides: [],
    });
    const dispatch = useDispatch();
    const guides = useSelector((state) => state.pilgrimGuides.guides);
    const uid = "pilgrim_guides";

    const [allData, setAllData] = useState([]);
    const [slideData, setSlideData] = useState([]);

    const [errors, setErrors] = useState({});
    const [dragActive, setDragActive] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [thumbnailUploadProgress, setThumbnailUploadProgress] = useState(0);
    const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);
    const [sessionImageUploadProgress, setSessionImageUploadProgress] = useState({});
    const [isSessionImageUploading, setIsSessionImageUploading] = useState({});
    const [sessionVideoUploadProgress, setSessionVideoUploadProgress] = useState({});
    const [isSessionVideoUploading, setIsSessionVideoUploading] = useState({});
    const [freeTrialVideoUploadProgress, setFreeTrialVideoUploadProgress] = useState(0);
    const [isFreeTrialVideoUploading, setIsFreeTrialVideoUploading] = useState(false);
    // One-Time multi-date selection (Online/Offline)
    const [otOnlineSelectedDates, setOtOnlineSelectedDates] = useState([]);
    const [otOnlineMulti, setOtOnlineMulti] = useState(false);
    const [otOnlinePending, setOtOnlinePending] = useState({ open: false, startTime: "", endTime: "", type: "individual" });
    const [otOfflineSelectedDates, setOtOfflineSelectedDates] = useState([]);
    const [otOfflineMulti, setOtOfflineMulti] = useState(false);
    const [otOfflinePending, setOtOfflinePending] = useState({ open: false, startTime: "", endTime: "", type: "individual" });

    const [categories, setCategories] = useState([
        "Yoga Guides",
        "Meditation Guides",
        "Mental Wellness",
        "Ritual Pandits"
    ]);
    // const subCategories = ["Online", "Offline", "both"];

    const handleFieldChange = (section, field, value, mode = null, subscriptionType = null) => {
        setFormData((prev) => {
            if (mode && subscriptionType) {
                // Handle nested structure for online/offline subscriptions
                const updated = {
                    ...prev,
                    [mode]: {
                        ...prev[mode],
                        [subscriptionType]: {
                            ...prev[mode][subscriptionType],
                            [field]: value,
                        },
                    },
                };
                
                // Debug: Log when sessionsCount changes
                if (field === 'sessionsCount') {
                    console.log(`Sessions count updated for ${mode} ${subscriptionType}:`, value);
                    console.log(`Updated data:`, updated[mode][subscriptionType]);
                }
                
                return updated;
            } else {
                // Handle regular sections
                return {
                    ...prev,
                    [section]: {
                        ...prev[section],
                        [field]: value,
                    },
                };
            }
        });
    };

    const handleFileUpload = async (file) => {
        if (!file) return;

        try {
            if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
                alert("Please upload an image or video file");
                return;
            }

            setIsThumbnailUploading(true);
            setThumbnailUploadProgress(0);

            // Create a unique storage path for the file
            const filePath = `pilgrim_guides/thumbnails/${uuidv4()}_${file.name}`;
            const storageRef = ref(storage, filePath);

            // Upload file with progress tracking
            const uploadTask = uploadBytesResumable(storageRef, file);
            
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setThumbnailUploadProgress(Math.round(progress));
                },
                (error) => {
                    console.error("Error uploading file:", error);
                    setIsThumbnailUploading(false);
                    setThumbnailUploadProgress(0);
                    alert("Error uploading file. Please try again.");
                },
                async () => {
                    // Get download URL
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    
                    // Update formData with the media data
                    handleFieldChange("guideCard", "thumbnail", downloadURL);
                    handleFieldChange("guideCard", "thumbnailType", file.type);
                    
                    setIsThumbnailUploading(false);
                    setThumbnailUploadProgress(0);
                }
            );

        } catch (error) {
            console.error("Error uploading file:", error);
            setIsThumbnailUploading(false);
            setThumbnailUploadProgress(0);
            alert("Error uploading file. Please try again.");
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        handleFileUpload(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragActive(false);
    };

    // Generic slot management functions
    const handleSlotChange = (mode, subscriptionType, index, field, value) => {
        setFormData((prev) => {
            const updated = { ...prev };
            const slots = [...updated[mode][subscriptionType].slots];
            slots[index][field] = value;
            updated[mode][subscriptionType].slots = slots;
            return updated;
        });
    };

    const addSlot = (mode, subscriptionType) => {
        const newSlot = mode === 'Online' 
            ? { date: "", startTime: "", endTime: "", type: "individual" }
            : { date: "", startTime: "", endTime: "", location: "", type: "individual" };
            
        setFormData((prev) => {
            const updated = { ...prev };
            updated[mode.toLowerCase()][subscriptionType].slots = [
                ...updated[mode.toLowerCase()][subscriptionType].slots,
                newSlot
            ];
            return updated;
        });
    };

    const removeSlot = (mode, subscriptionType, index) => {
        setFormData((prev) => {
            const updated = { ...prev };
            const slots = [...updated[mode.toLowerCase()][subscriptionType].slots];
            slots.splice(index, 1);
            updated[mode.toLowerCase()][subscriptionType].slots = slots;
            return updated;
        });
    };

    // Initialize slots for each subscription type
    const initializeSlots = (mode, subscriptionType) => {
        if (formData[mode.toLowerCase()][subscriptionType].slots.length === 0) {
            addSlot(mode, subscriptionType);
        }
    };

    // Session slot management functions
    const handleSessionSlotChange = (mode, index, field, value) => {
        setFormData((prev) => {
            const updated = { ...prev };
            const slots = [...updated.session[`${mode.toLowerCase()}Slots`]];
            slots[index][field] = value;
            updated.session[`${mode.toLowerCase()}Slots`] = slots;
            return updated;
        });
    };

    const addSessionSlot = (mode) => {
        setFormData((prev) => {
            const updated = { ...prev };
            const newSlot = mode === "Online" 
                ? { date: "", startTime: "", endTime: "" }
                : { date: "", startTime: "", endTime: "", location: "" };
            console.log("newSlot", newSlot);
            updated.session[`${mode.toLowerCase()}Slots`] = [
                ...(updated.session[`${mode.toLowerCase()}Slots`] || []), newSlot
            ];
            return updated;
        });
    };

    const removeSessionSlot = (mode, index) => {
        setFormData((prev) => {
            const updated = { ...prev };
            const slots = [...updated.session[`${mode.toLowerCase()}Slots`]];
            slots.splice(index, 1);
            updated.session[`${mode.toLowerCase()}Slots`] = slots;
            return updated;
        });
    };

    // Additional slot handlers for backward compatibility and specific use cases
    const handleOnlineSlotChange = (index, field, value) => {
        handleSessionSlotChange("Online", index, field, value);
    };

    const addOfflineSlot = () => {
        addSessionSlot("Offline");
    };

    const addOnlineSlot = () => {
        addSessionSlot("Online");
    };

    const moveSlide = async (from, to) => {
        try {
            // Reorder guides themselves (each guide has a single slide used as its card)
            const updatedGuides = [...guides];
            if (from < 0 || from >= updatedGuides.length || to < 0 || to >= updatedGuides.length) {
                console.warn("Invalid slide move indexes");
                return;
            }

            const [movedGuide] = updatedGuides.splice(from, 1);
            updatedGuides.splice(to, 0, movedGuide);

            // Update local UI list of slides
            setSlideData(updatedGuides.flatMap(g => g.slides || []));

            // Update Redux and persist reordered guides list (stored in Firestore as 'slides')
            dispatch(setGuides(updatedGuides));
            await saveOrUpdateGuideData(uid, "slides", updatedGuides);

        } catch (err) {
            console.error("Error moving slide:", err);
        }
    };

    const removeSlide = async (index) => {
        try {
            if (!uid) throw new Error("User not logged in");

            // Remove from Firestore first
            await deleteSlideByIndex(uid, index);

            // Remove from Redux store
            const updatedGuides = guides.filter((_, i) => i !== index);
            dispatch(setGuides(updatedGuides));

            // Update local states if you're keeping them for form rendering
            setFormData((prev) => ({
                ...prev,
                slides: prev.slides?.filter((_, i) => i !== index) || []
            }));

            setSlideData((prev) => prev.filter((_, i) => i !== index));

            console.log("Slide removed locally and from Firestore");
            toast.success("Guide removed successfully")
        } catch (err) {
            console.error("Error removing slide:", err);
        }
    };

    const editSlide = async (index) => {
        console.log("🔄 Loading latest data for edit...", { 
            index, 
            allDataLength: allData.length,
            guidesLength: guides.length,
            slideDataLength: slideData.length 
        });
        
        // Check against slideData instead of allData since that's what the UI shows
        if (index < 0 || index >= slideData.length) {
            console.error("Invalid index for edit:", index, "slideData length:", slideData.length);
            showError("Invalid slide index");
            return;
        }
        
        // Show loading state
        setIsLoading(true);
        
        let slideToEdit;

        // Resolve the full guide object for the clicked slide.
        // The list UI shows slideData (flattened slides), but the form expects a full guide object
        // containing guideCard, organizer, online/offline, etc.
        try {
            const clickedSlide = slideData[index];

            // Prefer matching by unique title to locate the parent guide
            if (clickedSlide?.title && Array.isArray(guides)) {
                slideToEdit = guides.find(g => g?.guideCard?.title === clickedSlide.title);
            }

            // If not found in current Redux state, fetch latest and try again
            if (!slideToEdit) {
                console.log("Guide not found in Redux by title, fetching latest data...");
                const latestData = await fetchGuideData(uid);
                setAllData(latestData);

                // Some backends return an object with a `slides` array of guides
                let guidesArray = Array.isArray(latestData) ? latestData : [];
                if (!guidesArray.length && latestData && latestData.slides) {
                    // if `slides` is an object or array of guide entries, normalize it
                    const raw = latestData.slides;
                    const arr = Array.isArray(raw) ? raw : Object.values(raw || {});
                    guidesArray = arr;
                }

                slideToEdit = guidesArray.find(g => g?.guideCard?.title === clickedSlide?.title);
            }

            if (!slideToEdit) {
                setIsLoading(false);
                showError("Could not resolve the guide for this slide. Please ensure the slide title matches the guide title.");
                return;
            }
            
            console.log("✅ Editing latest slide data:", slideToEdit);
            console.log("Monthly online data:", slideToEdit?.online?.monthly);
            console.log("Monthly offline data:", slideToEdit?.offline?.monthly);
            console.log("Organizer data:", slideToEdit?.organizer);
        } catch (error) {
            console.error("Error in editSlide:", error);
            setIsLoading(false);
            showError("Failed to load slide data for editing.");
            return;
        }

        // Normalize types and add stable ids for backward compatibility
        const normalizeSlots = (slots = []) => slots.map(s => ({ ...s, id: s?.id || uuidv4(), type: s?.type || 'individual' }));
        const normalizeWeekly = (wp = []) => (wp || []).map(r => ({
            ...r,
            times: (r?.times || []).map(t => ({ ...t, id: t?.id || uuidv4(), type: t?.type || 'individual' }))
        }));

        // Update formData with the slide being edited
        setFormData((prev) => ({
            ...prev,
            guideCard: {
                title: slideToEdit?.guideCard?.title,
                category: slideToEdit?.guideCard?.category,
                subCategory: slideToEdit?.guideCard?.subCategory || "",
                price: slideToEdit?.guideCard?.price,
                thumbnail: slideToEdit?.guideCard?.thumbnail || null,
                thumbnailType: slideToEdit?.guideCard?.thumbnailType || null,
                occupancies: slideToEdit?.guideCard?.occupancies || [{ type: "Single", price: "" }],
                showOccupancy: slideToEdit?.guideCard?.showOccupancy || false,
                description: slideToEdit?.guideCard?.description || "",
                listingType: slideToEdit?.guideCard?.listingType || "Listing" // Default to "Listing" if not present
            },
            organizer: {
                name: slideToEdit?.organizer?.name || "",
                email: slideToEdit?.organizer?.email || "",
                address: slideToEdit?.organizer?.address || "",
                googleMeetLink: slideToEdit?.organizer?.googleMeetLink || "",
                contactNumber: slideToEdit?.organizer?.contactNumber || "",
            },
            online: {
                monthly: {
                    price: slideToEdit?.online?.monthly?.price || "",
                    discount: slideToEdit?.online?.monthly?.discount || "",
                    description: slideToEdit?.online?.monthly?.description || "",
                    sessionsCount: slideToEdit?.online?.monthly?.sessionsCount || "",
                    slots: normalizeSlots(slideToEdit?.online?.monthly?.slots || []),
                    weeklyPattern: normalizeWeekly(slideToEdit?.online?.monthly?.weeklyPattern || []),
                    dayBasedPattern: slideToEdit?.online?.monthly?.dayBasedPattern || null,
                    groupMin: slideToEdit?.online?.monthly?.groupMin || "",
                    groupMax: slideToEdit?.online?.monthly?.groupMax || ""
                },
                oneTime: {
                    price: slideToEdit?.online?.oneTime?.price || "",
                    slots: normalizeSlots(slideToEdit?.online?.oneTime?.slots || []),
                }
            },
            offline: {
                monthly: {
                    price: slideToEdit?.offline?.monthly?.price || "",
                    discount: slideToEdit?.offline?.monthly?.discount || "",
                    sessionsCount: slideToEdit?.offline?.monthly?.sessionsCount || "",
                    slots: normalizeSlots(slideToEdit?.offline?.monthly?.slots || []),
                    description: slideToEdit?.offline?.monthly?.description || "",
                    weeklyPattern: normalizeWeekly(slideToEdit?.offline?.monthly?.weeklyPattern || []),
                    dayBasedPattern: slideToEdit?.offline?.monthly?.dayBasedPattern || null,
                    groupMin: slideToEdit?.offline?.monthly?.groupMin || "",
                    groupMax: slideToEdit?.offline?.monthly?.groupMax || ""
                },
                oneTime: {
                    price: slideToEdit?.offline?.oneTime?.price || "",
                    slots: normalizeSlots(slideToEdit?.offline?.oneTime?.slots || [])
                }
            },
            session: {
                sessiondescription: slideToEdit?.session?.sessiondescription || "",
                images: slideToEdit?.session?.images || [],
                videos: slideToEdit?.session?.videos || [],
                title: slideToEdit?.session?.title || "",
                description: slideToEdit?.session?.description || "",
                freeTrialVideo: slideToEdit?.session?.freeTrialVideo || null,
            },
            slides: slideToEdit?.slides || []
        }));

        // Update slideData to reflect the slide being edited
        setSlideData((prev) => {
            const updated = [...prev];
            updated[index] = slideToEdit;
            return updated;
        });

        setIsEditing(true);
        setEditIndex(index);

        // Preselect calendar dates (one-time) so slots are visible immediately
        try {
            const firstOnlineOT = (slideToEdit?.online?.oneTime?.slots || []).find(s => !!s?.date);
            if (firstOnlineOT?.date) {
                const d = new Date(ymd(firstOnlineOT.date));
                setOtOnlineDate(ymd(firstOnlineOT.date));
                if (!isNaN(d.getTime())) setOtOnlineMonth(new Date(d.getFullYear(), d.getMonth(), 1));
            }
        } catch {}
        try {
            const firstOfflineOT = (slideToEdit?.offline?.oneTime?.slots || []).find(s => !!s?.date);
            if (firstOfflineOT?.date) {
                const d = new Date(ymd(firstOfflineOT.date));
                setOtOfflineDate(ymd(firstOfflineOT.date));
                if (!isNaN(d.getTime())) setOtOfflineMonth(new Date(d.getFullYear(), d.getMonth(), 1));
            }
        } catch {}

        // Hide loading state
        setIsLoading(false);
        
        // Scroll to top of form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditIndex(null);
        setFormData((prev) => ({
            ...prev,
            guideCard: {
                title: "",
                category: "",
                subCategory: "",
                price: "",
                thumbnail: null,
                thumbnailType: null,
                occupancy: "",
                showOccupancy: false,
                description: "",
                listingType: "Listing" // Reset to default "Listing"
            },
            openSlots: [],
            online: {
                monthly: {
                    price: "",
                    individualPrice: "",
                    couplesPrice: "",
                    groupPrice: "",
                    groupMin: "",
                    groupMax: "",
                    discount: "",
                    description: "",
                    sessionsCount: "",
                    slots: [{ date: "", startTime: "", endTime: "", type: "individual" }],
                    weeklyPattern: []
                },
                oneTime: {
                    price: "",
                    individualPrice: "",
                    couplesPrice: "",
                    groupPrice: "",
                    groupMin: "",
                    groupMax: "",
                    slots: [{ date: "", startTime: "", endTime: "", type: "individual" }]
                }
            },
            offline: {
                monthly: {
                    price: "",
                    individualPrice: "",
                    couplesPrice: "",
                    groupPrice: "",
                    groupMin: "",
                    groupMax: "",
                    discount: "",
                    description: "",    
                    sessionsCount: "",
                    slots: [{ date: "", startTime: "", endTime: "", type: "individual" }],
                    weeklyPattern: []
                },
                oneTime: {
                    price: "",
                    individualPrice: "",
                    couplesPrice: "",
                    groupPrice: "",
                    groupMin: "",
                    groupMax: "",
                    slots: [{ date: "", startTime: "", endTime: "", type: "individual" }]   
                }
            },
            organizer: { name: "", email: "", address: "", googleMeetLink: "", contactNumber: "" },
            session: {
                sessiondescription: "",
                images: [],
                videos: [],
                title: "",
                description: "",
                freeTrialVideo: null
            },
            guideSlots: [{ date: "", startTime: "", endTime: "" }]
        }));
    };

    const addNewCategory = () => {
        const newCategory = prompt("Enter new category name:");
        if (newCategory && !categories.includes(newCategory)) {
            setCategories(prev => [...prev, newCategory]);
        }
    };

    // ========== Common Open Slots (Weekly) Handlers ==========
    const weekdayOptions = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

    const addOpenSlot = () => {
        setFormData(prev => ({
            ...prev,
            openSlots: [...(prev.openSlots || []), { days: [], times: [{ startTime: "", endTime: "" }] }]
        }));
    };

    const removeOpenSlot = (index) => {
        setFormData(prev => ({
            ...prev,
            openSlots: (prev.openSlots || []).filter((_, i) => i !== index)
        }));
    };

    const toggleOpenSlotDay = (index, day) => {
        setFormData(prev => {
            const next = [...(prev.openSlots || [])];
            const set = new Set(next[index].days || []);
            if (set.has(day)) set.delete(day); else set.add(day);
            next[index].days = Array.from(set);
            return { ...prev, openSlots: next };
        });
    };

    const addOpenSlotTime = (index) => {
        setFormData(prev => {
            const next = [...(prev.openSlots || [])];
            next[index].times = [...(next[index].times || []), { startTime: "", endTime: "" }];
            return { ...prev, openSlots: next };
        });
    };

    const updateOpenSlotTime = (index, tIndex, field, value) => {
        setFormData(prev => {
            const next = [...(prev.openSlots || [])];
            const times = [...(next[index].times || [])];
            times[tIndex] = { ...times[tIndex], [field]: value };
            next[index].times = times;
            return { ...prev, openSlots: next };
        });
    };

    const removeOpenSlotTime = (index, tIndex) => {
        setFormData(prev => {
            const next = [...(prev.openSlots || [])];
            const times = [...(next[index].times || [])];
            times.splice(tIndex, 1);
            next[index].times = times;
            return { ...prev, openSlots: next };
        });
    };

    // ========== Monthly Weekly Pattern Handlers (Online/Offline) ==========
    const addMonthlyPatternRow = (modeKey) => {
        setFormData(prev => {
            const next = { ...prev };
            const list = [...(next[modeKey].monthly.weeklyPattern || [])];
            list.push({ days: [], times: [{ startTime: "", endTime: "" }] });
            next[modeKey].monthly.weeklyPattern = list;
            return next;
        });
    };

    const removeMonthlyPatternRow = (modeKey, rowIdx) => {
        setFormData(prev => {
            const next = { ...prev };
            const list = [...(next[modeKey].monthly.weeklyPattern || [])];
            list.splice(rowIdx, 1);
            next[modeKey].monthly.weeklyPattern = list;
            return next;
        });
    };

    const toggleMonthlyPatternDay = (modeKey, rowIdx, day) => {
        setFormData(prev => {
            const next = { ...prev };
            const list = [...(next[modeKey].monthly.weeklyPattern || [])];
            const set = new Set(list[rowIdx].days || []);
            if (set.has(day)) set.delete(day); else set.add(day);
            list[rowIdx].days = Array.from(set);
            next[modeKey].monthly.weeklyPattern = list;
            return next;
        });
    };

    const addMonthlyPatternTime = (modeKey, rowIdx) => {
        setFormData(prev => {
            const next = { ...prev };
            const list = [...(next[modeKey].monthly.weeklyPattern || [])];
            list[rowIdx].times = [...(list[rowIdx].times || []), { startTime: "", endTime: "", type: "individual" }];
            next[modeKey].monthly.weeklyPattern = list;
            return next;
        });
    };

    const updateMonthlyPatternTime = (modeKey, rowIdx, tIdx, field, value) => {
        setFormData(prev => {
            const next = { ...prev };
            const list = [...(next[modeKey].monthly.weeklyPattern || [])];
            const times = [...(list[rowIdx].times || [])];
            times[tIdx] = { ...times[tIdx], [field]: value };
            list[rowIdx].times = times;
            next[modeKey].monthly.weeklyPattern = list;
            return next;
        });
    };

    const removeMonthlyPatternTime = (modeKey, rowIdx, tIdx) => {
        setFormData(prev => {
            const next = { ...prev };
            const list = [...(next[modeKey].monthly.weeklyPattern || [])];
            const times = [...(list[rowIdx].times || [])];
            times.splice(tIdx, 1);
            list[rowIdx].times = times;
            next[modeKey].monthly.weeklyPattern = list;
            return next;
        });
    };
    
    // Quick-setup: create 7 rows (Sun..Sat), each with its own times, recurring weekly
    const initWeekdayRows = (modeKey) => {
        setFormData(prev => {
            const next = { ...prev };
            const weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
            
            // Preserve existing weeklyPattern if it exists
            const existingPattern = next[modeKey].monthly.weeklyPattern || [];
            const existingDays = new Set();
            
            // Collect existing days to avoid duplicates
            existingPattern.forEach(row => {
                if (row.days && Array.isArray(row.days)) {
                    row.days.forEach(day => existingDays.add(day));
                }
            });
            
            // Only add missing weekdays, preserve existing ones
            const newRows = weekdays
                .filter(day => !existingDays.has(day))
                .map(day => ({ 
                    days: [day], 
                    times: [{ startTime: "", endTime: "", type: "individual" }] 
                }));
            
            // Combine existing pattern with new rows
            next[modeKey].monthly.weeklyPattern = [...existingPattern, ...newRows];
            
            return next;
        });
    };

    // ========== New Day-Based Weekly Pattern Functions ==========
    const initializeDayBasedWeeklyPattern = (modeKey) => {
        setFormData(prev => {
            const next = { ...prev };
            const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
            
            // Preserve existing dayBasedPattern if it exists
            const existingPattern = next[modeKey].monthly.dayBasedPattern || {};
            
            // Only initialize missing days, preserve existing ones
            const newPattern = { ...existingPattern };
            weekdays.forEach(day => {
                if (!newPattern[day]) {
                    newPattern[day] = { slots: [] };
                }
            });
            
            next[modeKey].monthly.dayBasedPattern = newPattern;
            return next;
        });
    };

    const addSlotToDay = (modeKey, dayName) => {
        setFormData(prev => {
            const next = { ...prev };
            if (!next[modeKey].monthly.dayBasedPattern) {
                next[modeKey].monthly.dayBasedPattern = {};
            }
            if (!next[modeKey].monthly.dayBasedPattern[dayName]) {
                next[modeKey].monthly.dayBasedPattern[dayName] = { slots: [] };
            }
            next[modeKey].monthly.dayBasedPattern[dayName].slots.push({
                startTime: "",
                endTime: "",
                type: "individual"
            });
            
            console.log(`Slot added to ${dayName} for ${modeKey}:`, next[modeKey].monthly.dayBasedPattern[dayName]);
            console.log(`Total dayBasedPattern:`, next[modeKey].monthly.dayBasedPattern);
            
            return next;
        });
    };

    const updateDaySlot = (modeKey, dayName, slotIndex, field, value) => {
        setFormData(prev => {
            const next = { ...prev };
            if (next[modeKey].monthly.dayBasedPattern?.[dayName]?.slots?.[slotIndex]) {
                next[modeKey].monthly.dayBasedPattern[dayName].slots[slotIndex][field] = value;
                console.log(`Updated ${field} for ${dayName} slot ${slotIndex}:`, value);
                console.log(`Updated slot:`, next[modeKey].monthly.dayBasedPattern[dayName].slots[slotIndex]);
            }
            return next;
        });
    };

    const removeDaySlot = (modeKey, dayName, slotIndex) => {
        setFormData(prev => {
            const next = { ...prev };
            if (next[modeKey].monthly.dayBasedPattern?.[dayName]?.slots) {
                next[modeKey].monthly.dayBasedPattern[dayName].slots.splice(slotIndex, 1);
            }
            return next;
        });
    };

    const replicateWeekToMonth = (modeKey) => {
        setFormData(prev => {
            const next = { ...prev };
            const dayPattern = next[modeKey].monthly.dayBasedPattern;
            console.log(`🔄 Replicating week to month for ${modeKey}:`, dayPattern);
            
            if (!dayPattern || Object.keys(dayPattern).length === 0) {
                showError("❌ No day-based pattern found to replicate. Please add slots first using 'Initialize Day-Based Setup'.");
                console.log("❌ No dayBasedPattern found to replicate");
                return prev;
            }

            // Convert day-based pattern to old weeklyPattern format for compatibility
            const weeklyPattern = [];
            Object.entries(dayPattern).forEach(([dayName, dayData]) => {
                console.log(`Processing ${dayName}:`, dayData);
                
                // Check if dayData exists and has slots
                if (dayData && dayData.slots && Array.isArray(dayData.slots) && dayData.slots.length > 0) {
                    // Map day names to short format
                    const dayMap = {
                        "Monday": "Mon", "Tuesday": "Tue", "Wednesday": "Wed", 
                        "Thursday": "Thu", "Friday": "Fri", "Saturday": "Sat", "Sunday": "Sun"
                    };
                    const shortDay = dayMap[dayName];
                    
                    // Filter out empty slots and process valid ones
                    const validSlots = dayData.slots.filter(slot => 
                        slot && slot.startTime && slot.endTime && 
                        slot.startTime.trim() !== "" && slot.endTime.trim() !== ""
                    );
                    
                    if (validSlots.length > 0) {
                        // Process each slot and ensure proper format
                        const processedTimes = validSlots.map(slot => ({
                            startTime: slot.startTime || "",
                            endTime: slot.endTime || "",
                            type: slot.type || "individual",
                            bookedCount: slot.bookedCount || 0
                        }));
                        
                        weeklyPattern.push({
                            days: [shortDay],
                            times: processedTimes
                        });
                        
                        console.log(`✅ Added ${shortDay} with ${processedTimes.length} valid slots`);
                    } else {
                        console.log(`❌ ${dayName} has no valid slots (empty times)`);
                    }
                } else {
                    console.log(`❌ ${dayName} has no slots or invalid structure`);
                }
            });
            
            if (weeklyPattern.length === 0) {
                showError("❌ No valid slots found to replicate. Please add time slots to your days.");
                return prev;
            }
            
            console.log(`🎯 Generated weeklyPattern:`, weeklyPattern);
            next[modeKey].monthly.weeklyPattern = weeklyPattern;
            console.log(`📅 Final monthly data:`, next[modeKey].monthly);
            
            showSuccess(`✅ Week pattern replicated! ${weeklyPattern.length} day(s) will repeat every week.`);
            return next;
        });
    };
    const [otOnlineMonth, setOtOnlineMonth] = useState(() => new Date());
    const [otOnlineDate, setOtOnlineDate] = useState(() => new Date().toISOString().slice(0,10));
    const [otOfflineMonth, setOtOfflineMonth] = useState(() => new Date());
    const [otOfflineDate, setOtOfflineDate] = useState(() => new Date().toISOString().slice(0,10));
    const [onlineMonthlyViewType, setOnlineMonthlyViewType] = useState('individual');
    const [offlineMonthlyViewType, setOfflineMonthlyViewType] = useState('individual');

    const fmtYMD = (d) => {
        if (!(d instanceof Date)) return "";
        const y = d.getFullYear();
        const m = String(d.getMonth()+1).padStart(2,'0');
        const dd = String(d.getDate()).padStart(2,'0');
        return `${y}-${m}-${dd}`;
    };

    // Normalize various date shapes (string, Date, Firestore Timestamp) to YYYY-MM-DD
    const ymd = (val) => {
        if (!val) return "";
        if (typeof val === 'string') return val;
        if (val instanceof Date) return fmtYMD(val);
        // Firestore Timestamp support {seconds, nanoseconds}
        if (typeof val === 'object' && typeof val.seconds === 'number') {
            return fmtYMD(new Date(val.seconds * 1000));
        }
        try { return fmtYMD(new Date(val)); } catch { return ""; }
    };

    const calGrid = (monthDate) => {
        const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const end = new Date(monthDate.getFullYear(), monthDate.getMonth()+1, 0);
        const startIdx = start.getDay();
        const cells = [];
        for (let i=0;i<startIdx;i++) cells.push(null);
        for (let d=1; d<=end.getDate(); d++) cells.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), d));
        while (cells.length % 7 !== 0 || cells.length < 42) cells.push(null);
        return cells;
    };

    const isPast = (dateObj) => {
        if (!dateObj) return true;
        const today = new Date();
        return fmtYMD(dateObj) < fmtYMD(today);
    };

    const prevMonthGuard = (setter, current) => {
        const today = new Date();
        const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const target = new Date(current.getFullYear(), current.getMonth()-1, 1);
        if (target < minMonth) return;
        setter(target);
    };

    // Apply pending multi slot to all selected online dates
    const applyOtOnlinePending = () => {
        const { startTime, endTime, type } = otOnlinePending;
        if (!startTime || !endTime) return;
        if (endTime <= startTime) return;
        const todayYmd = fmtYMD(new Date());
        const valid = (otOnlineSelectedDates || []).filter(d => d && d >= todayYmd);
        if (valid.length === 0) return;
        setFormData(prev => {
            const next = { ...prev };
            const slots = next.online.oneTime.slots || [];
            next.online.oneTime.slots = [
                ...slots,
                ...valid.map(date => ({ id: uuidv4(), date, startTime, endTime, type: type || 'individual' }))
            ];
            return next;
        });
        setOtOnlinePending({ open: false, startTime: "", endTime: "", type: "individual" });
    };

    // Apply pending multi slot to all selected offline dates
    const applyOtOfflinePending = () => {
        const { startTime, endTime, type } = otOfflinePending;
        if (!startTime || !endTime) return;
        if (endTime <= startTime) return;
        const todayYmd = fmtYMD(new Date());
        const valid = (otOfflineSelectedDates || []).filter(d => d && d >= todayYmd);
        if (valid.length === 0) return;
        setFormData(prev => {
            const next = { ...prev };
            const slots = next.offline.oneTime.slots || [];
            next.offline.oneTime.slots = [
                ...slots,
                ...valid.map(date => ({ id: uuidv4(), date, startTime, endTime, type: type || 'individual' }))
            ];
            return next;
        });
        setOtOfflinePending({ open: false, startTime: "", endTime: "", type: "individual" });
    };

    // One-time slot CRUD using existing add/remove handlers
    const addOneTimeSlotFor = (modeKey, dateYmd) => {
        if (!dateYmd) return;
        const todayYmd = fmtYMD(new Date());
        if (dateYmd < todayYmd) return;

        setFormData(prev => {
            const newSlot = { 
                id: uuidv4(),
                date: dateYmd, 
                startTime: '', 
                endTime: '',
                type: 'individual' // Default to individual type
            };
            
            return {
                ...prev,
                [modeKey]: {
                    ...prev[modeKey],
                    oneTime: {
                        ...prev[modeKey].oneTime,
                        slots: [...(prev[modeKey].oneTime.slots || []), newSlot]
                    }
                }
            };
        });
    }

    // Update/remove one-time slot by unique id for robust editing
    const updateOneTimeSlot = (modeKey, slotId, field, value) => {
        setFormData(prev => {
            const next = { ...prev };
            next[modeKey].oneTime.slots = (next[modeKey].oneTime.slots || []).map(s =>
                s.id === slotId ? { ...s, [field]: value } : s
            );
            return next;
        });
    };

    const removeOneTimeSlot = (modeKey, slotId) => {
        setFormData(prev => {
            const next = { ...prev };
            next[modeKey].oneTime.slots = (next[modeKey].oneTime.slots || []).filter(s => s.id !== slotId);
            return next;
        });
    };

// ... (rest of the code remains the same)
    //     if (!isPriceValid(formData.offline.monthly.price)) newErrors.monthlyOfflinePrice = "Invalid Monthly Offline Price";
    //     if (formData.offline.monthly.discount && isNaN(formData.offline.monthly.discount))
    //         newErrors.monthlyOfflineDiscount = "Offline Monthly Discount must be number";

    //     if (!isPriceValid(formData.online.quarterly.price)) newErrors.quarterlyOnlinePrice = "Invalid Quarterly Online Price";
    //     if (formData.online.quarterly.discount && isNaN(formData.online.quarterly.discount))
    //         newErrors.quarterlyOnlineDiscount = "Online Quarterly Discount must be number";

    //     if (!isPriceValid(formData.offline.quarterly.price)) newErrors.quarterlyOfflinePrice = "Invalid Quarterly Offline Price";
    //     if (formData.offline.quarterly.discount && isNaN(formData.offline.quarterly.discount))
    //         newErrors.quarterlyOfflineDiscount = "Offline Quarterly Discount must be number";

    //     if (!formData.organizer.name) newErrors.organizerName = "Organizer name is required";
    //     if (!formData.organizer.email) newErrors.organizerEmail = "Organizer email is required";
    //     if (!formData.organizer.googleMeetLink) newErrors.organizerGoogleMeetLink = "Google Meet link is required";

    //     if (!isPriceValid(formData.online.oneTime.price)) newErrors.oneTimeOnlinePrice = "Invalid Online One-Time Price";
    //     if (!isPriceValid(formData.offline.oneTime.price)) newErrors.oneTimeOfflinePrice = "Invalid Offline One-Time Price";

    //     setErrors(newErrors);
    //     return Object.keys(newErrors).length === 0;
    // };

    // Monitor thumbnail changes
    // useEffect(() => {
    //     if (formData?.guideCard?.thumbnail) {
    //         console.log("Thumbnail updated in state: ", formData.guideCard.thumbnail);
    //         console.log("Thumbnail type: ", formData.guideCard.thumbnailType);
    //         console.log("Is video file: ", formData.guideCard.thumbnailType?.startsWith('video/'));
    //     }
    // }, [formData?.guideCard?.thumbnail, formData?.guideCard?.thumbnailType]);

    useEffect(() => {
        const loadCards = async () => {
            try {
                const guides = await fetchGuideData(uid);
                console.log("Fetched guide cards:", guides);
                
                // Handle both object and array structures
                let slidesData = [];
                if (guides.slides) {
                    // If slides is an object, convert to array
                    if (typeof guides.slides === 'object' && !Array.isArray(guides.slides)) {
                        slidesData = Object.values(guides.slides);
                    } else if (Array.isArray(guides.slides)) {
                        slidesData = guides.slides;
                    }
                }
                
                setAllData(slidesData);
                // Keep Redux state in sync with fetched data
                dispatch(setGuides(slidesData));
                
                if (slidesData.length > 0) {
                    let allSlides = [];
                    for (const guide of slidesData) {
                        if (guide.slides) {
                            allSlides = [...allSlides, ...guide.slides];
                        }
                    }
                    setSlideData(allSlides);
                }

            } catch (err) {
                console.error("Error fetching guide cards:", err);
            }
        };

        loadCards();
    }, [uid]);

    const onSaveRetreat = async () => {
        // if (!validateFields()) {
        //     alert("Fix validation errors");
        //     return;
        // }

        // Debug: Check what data is being saved
        console.log("=== SAVING GUIDE DATA ===");
        console.log("FormData before save:", formData);
        console.log("Online monthly data:", formData.online?.monthly);
        console.log("Offline monthly data:", formData.offline?.monthly);
        console.log("Sessions count online:", formData.online?.monthly?.sessionsCount);
        console.log("Sessions count offline:", formData.offline?.monthly?.sessionsCount);
        console.log("Weekly pattern online:", formData.online?.monthly?.weeklyPattern);
        console.log("Weekly pattern offline:", formData.offline?.monthly?.weeklyPattern);
        console.log("Day based pattern online:", formData.online?.monthly?.dayBasedPattern);
        console.log("Day based pattern offline:", formData.offline?.monthly?.dayBasedPattern);

        const newCard = {
            guideCard: { ...formData.guideCard },
            organizer: { ...formData.organizer },
            openSlots: [...(formData.openSlots || [])],
            online: { ...formData.online },
            offline: { ...formData.offline },
            session: { ...formData.session },
            slides: [
                {
                    title: formData.guideCard.title,
                    thumbnail: formData.guideCard.thumbnail,
                    thumbnailType: formData.guideCard.thumbnailType,
                }
            ]
        };

        console.log("NewCard being saved:", newCard);
        console.log("NewCard online monthly:", newCard.online?.monthly);
        console.log("NewCard offline monthly:", newCard.offline?.monthly);
        
        // Final validation check
        console.log("=== FINAL VALIDATION CHECK ===");
        if (newCard.online?.monthly?.weeklyPattern?.length > 0) {
            console.log("✅ Online monthly weeklyPattern has slots:", newCard.online.monthly.weeklyPattern.length);
        } else {
            console.log("❌ Online monthly weeklyPattern is empty or missing");
        }
        
        if (newCard.offline?.monthly?.weeklyPattern?.length > 0) {
            console.log("✅ Offline monthly weeklyPattern has slots:", newCard.offline.monthly.weeklyPattern.length);
        } else {
            console.log("❌ Offline monthly weeklyPattern is empty or missing");
        }
        
        if (newCard.online?.monthly?.sessionsCount) {
            console.log("✅ Online sessions count:", newCard.online.monthly.sessionsCount);
        } else {
            console.log("❌ Online sessions count missing");
        }
        
        if (newCard.offline?.monthly?.sessionsCount) {
            console.log("✅ Offline sessions count:", newCard.offline.monthly.sessionsCount);
        } else {
            console.log("❌ Offline sessions count missing");
        }

        try {
            if (!uid) throw new Error("User not logged in");

            let updatedGuides;

            if (isEditing && editIndex !== null) {
                // Replace the existing card at editIndex
                updatedGuides = [...guides];
                updatedGuides[editIndex] = newCard;
                console.log("Session Card Updated Successfully");
            } else {
                // Add a new card
                updatedGuides = [...guides, newCard];
                console.log("Session Card Added Successfully");
            }

            // Update Redux store
            dispatch(setGuides(updatedGuides));

            // Also update slideData
            setSlideData(updatedGuides.flatMap(g => g.slides));

            // Save full updated guides array to Firestore
            const status = await saveOrUpdateGuideData(uid, "slides", updatedGuides);
            console.log(`Firestore ${status} successfully`);
            showSuccess("Session saved successfully");

            // Reset local form state
            setFormData({
                guideCard: {
                    title: "",
                    category: "",
                    subCategory: "",
                    price: "",
                    thumbnail: null,
                    thumbnailType: null,
                    occupancies: [{ type: "Single", price: "" }],
                    showOccupancy: false,
                    description: "",
                    listingType: "Listing" // Reset to default "Listing"
                },
                online: {
                    monthly: {
                        price: "",
                        discount: "",
                        slots: [{ date: "", startTime: "", endTime: "" }]
                    },
                    oneTime: {
                        price: "",
                        slots: [{ date: "", startTime: "", endTime: "" }]
                    }
                },
                offline: {
                    monthly: {
                        price: "",
                        discount: "",
                        slots: [{ date: "", startTime: "", endTime: "" }]
                    },
                    oneTime: {
                        price: "",
                        slots: [{ date: "", startTime: "", endTime: "" }]
                    }
                },
                organizer: { name: "", email: "", address: "", googleMeetLink: "", contactNumber: "" },
                session: {
                    sessiondescription: "",
                    images: [],
                    videos: [],
                    title: "",
                    description: "",
                    freeTrialVideo: null
                },
            });
            setIsEditing(false);
            setEditIndex(null);

        } catch (err) {
            console.error("Error saving retreat:", err);
            showError("Error saving retreat data. Please try again.");
        }
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        const remainingSlots = 11 - formData.session.images.length;
        const filesToProcess = files.slice(0, remainingSlots);

        for (const file of filesToProcess) {
            if (!file.type.startsWith("image/")) {
                console.warn(`${file.name} is not an image, skipping...`);
                continue;
            }

            const uploadId = uuidv4();
            setIsSessionImageUploading(prev => ({ ...prev, [uploadId]: true }));
            setSessionImageUploadProgress(prev => ({ ...prev, [uploadId]: 0 }));

            try {
                // Create unique path
                const filePath = `pilgrim_guides/session_images/${uuidv4()}_${file.name}`;
                const storageRef = ref(storage, filePath);

                // Upload file with progress tracking
                const uploadTask = uploadBytesResumable(storageRef, file);
                
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        setSessionImageUploadProgress(prev => ({ ...prev, [uploadId]: Math.round(progress) }));
                    },
                    (error) => {
                        console.error(`Error uploading ${file.name}:`, error);
                        setIsSessionImageUploading(prev => ({ ...prev, [uploadId]: false }));
                        setSessionImageUploadProgress(prev => ({ ...prev, [uploadId]: 0 }));
                    },
                    async () => {
                        // Get download URL
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        
                        // Append image URL to formData
                        setFormData(prev => ({
                            ...prev,
                            session: {
                                ...prev.session,
                                images: [...prev.session.images, downloadURL]
                            }
                        }));
                        
                        setIsSessionImageUploading(prev => ({ ...prev, [uploadId]: false }));
                        setSessionImageUploadProgress(prev => ({ ...prev, [uploadId]: 0 }));
                    }
                );

            } catch (error) {
                console.error(`Error uploading ${file.name}:`, error);
                setIsSessionImageUploading(prev => ({ ...prev, [uploadId]: false }));
                setSessionImageUploadProgress(prev => ({ ...prev, [uploadId]: 0 }));
            }
        }
    };

    const removeImage = async (index) => {
        setFormData(prev => {
            const imageURL = prev?.session?.images[index];

            // Remove from Firebase Storage
            if (imageURL) {
                const storageRef = ref(storage, imageURL);
                deleteObject(storageRef)
                    .then(() => console.log(`Deleted image from storage: ${imageURL}`))
                    .catch((error) => console.error("Error deleting image:", error));
            }

            // Remove from local state
            return {
                ...prev,
                session: {
                    ...prev.session,
                    images: prev.session.images.filter((_, i) => i !== index)
                }
            };
        });
    };

    const handleVideoUpload = async (e) => {
        const files = Array.from(e.target.files);
        const remainingSlots = 6 - formData.session.videos.length;
        const filesToProcess = files.slice(0, remainingSlots);

        for (const file of filesToProcess) {
            if (file?.type.startsWith('video/')) {
                const uploadId = uuidv4();
                setIsSessionVideoUploading(prev => ({ ...prev, [uploadId]: true }));
                setSessionVideoUploadProgress(prev => ({ ...prev, [uploadId]: 0 }));

                try {
                    const storageRef = ref(storage, `videos/${Date.now()}-${file.name}`);
                    
                    // Upload file with progress tracking
                    const uploadTask = uploadBytesResumable(storageRef, file);
                    
                    uploadTask.on('state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setSessionVideoUploadProgress(prev => ({ ...prev, [uploadId]: Math.round(progress) }));
                        },
                        (error) => {
                            console.error("Error uploading video:", error);
                            setIsSessionVideoUploading(prev => ({ ...prev, [uploadId]: false }));
                            setSessionVideoUploadProgress(prev => ({ ...prev, [uploadId]: 0 }));
                        },
                        async () => {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                            setFormData(prev => ({
                                ...prev,
                                session: {
                                    ...prev.session,
                                    videos: [...prev.session.videos, downloadURL]
                                }
                            }));
                            
                            setIsSessionVideoUploading(prev => ({ ...prev, [uploadId]: false }));
                            setSessionVideoUploadProgress(prev => ({ ...prev, [uploadId]: 0 }));
                        }
                    );
                } catch (error) {
                    console.error("Error uploading video:", error);
                    setIsSessionVideoUploading(prev => ({ ...prev, [uploadId]: false }));
                    setSessionVideoUploadProgress(prev => ({ ...prev, [uploadId]: 0 }));
                }
            }
        }
    };

    // Remove video from Firebase Storage & state
    const removeVideo = async (index) => {
        setFormData(prev => {
            const videoURL = prev?.session?.videos[index];

            if (videoURL) {
                try {
                    // Extract storage path from full URL
                    const path = decodeURIComponent(videoURL.split('/o/')[1].split('?')[0]);
                    const storageRef = ref(storage, path);
                    deleteObject(storageRef)
                        .then(() => console.log(`Deleted video: ${videoURL}`))
                        .catch((error) => console.error("Error deleting video:", error));
                } catch (error) {
                    console.error("Invalid video URL:", error);
                }
            }

            return {
                ...prev,
                session: {
                    ...prev.session,
                    videos: prev.session.videos.filter((_, i) => i !== index)
                }
            };
        });
    };

    const handleFreeTrialVideoUpload = async (file) => {
        if (file && file.type.startsWith('video/')) {
            setIsFreeTrialVideoUploading(true);
            setFreeTrialVideoUploadProgress(0);

            try {
                const storageRef = ref(storage, `freeTrialVideos/${Date.now()}-${file.name}`);
                
                const uploadTask = uploadBytesResumable(storageRef, file);
                
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        setFreeTrialVideoUploadProgress(Math.round(progress));
                    },
                    (error) => {
                        console.error("Error uploading free trial video:", error);
                        setIsFreeTrialVideoUploading(false);
                        setFreeTrialVideoUploadProgress(0);
                        alert("Error uploading video. Please try again.");
                    },
                    async () => {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        handleFieldChange("session", "freeTrialVideo", downloadURL);
                        setIsFreeTrialVideoUploading(false);
                        setFreeTrialVideoUploadProgress(0);
                    }
                );
            } catch (error) {
                console.error("Error uploading free trial video:", error);
                setIsFreeTrialVideoUploading(false);
                setFreeTrialVideoUploadProgress(0);
                alert("Error uploading video. Please try again.");
            }
        }
    };

    const handleFreeTrialDrop = async (e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        await handleFreeTrialVideoUpload(file);
    };

    // Occupancy management functions
    const addOccupancy = () => {
        const updated = [...formData.guideCard.occupancies, { type: "", price: "", min: "", max: "" }];
        handleFieldChange("guideCard", "occupancies", updated);
    };

    const updateOccupancy = (index, field, value) => {
        const updated = [...formData.guideCard.occupancies];
        updated[index] = { ...updated[index], [field]: value };
        handleFieldChange("guideCard", "occupancies", updated);
    };

    const removeOccupancy = (index) => {
        const updated = [...formData.guideCard.occupancies];
        updated.splice(index, 1);
        handleFieldChange("guideCard", "occupancies", updated);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2F6288]"></div>
                        <span className="text-gray-700">Loading latest data...</span>
                    </div>
                </div>
            )}
            
            <div className="md:p-8 px-4 py-0 mx-auto">

                {/* Guide Card */}
                <div className="mb-8">
                    {/* Guide Title */}
                    <div className="flex justify-between items-center mb-0">
                        <h2 className="sm:text-2xl font-bold text-[#2F6288] text-xl">
                            {isEditing ? "Edit Pilgrim Guide" : "Add Pilgrim Guide"} <span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
                        </h2>
                        {isEditing && (
                            <button
                                onClick={cancelEdit}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Cancel Edit
                            </button>
                        )}
                    </div>

                    {/* image */}
                    <div className="mb-6">
                        <h3 className="block text-md font-semibold text-gray-700 mb-2">Add Thumbnail</h3>
                        <div
                            className={`border-2 border-dashed h-40 rounded mb-4 flex items-center justify-center cursor-pointer transition-colors ${
                                dragActive ? 'border-[#2F6288] bg-[#2F6288]/10' : 'border-gray-300 hover:bg-gray-50'
                                }`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => !isThumbnailUploading && document.getElementById('thumbnail-upload').click()}
                        >
                            {formData?.guideCard?.thumbnail ? (
                                <div className="relative h-full flex items-center">
                                    {formData?.guideCard?.thumbnailType && formData?.guideCard?.thumbnailType.startsWith('video/') ? (
                                        <video
                                            src={formData?.guideCard?.thumbnail}
                                            className="h-full object-contain rounded"
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                        />
                                    ) : (
                                        <img
                                            src={formData?.guideCard?.thumbnail}
                                            alt="Thumbnail"
                                            className="h-full object-contain rounded"
                                        />
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleFieldChange("guideCard", "thumbnail", null)
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : isThumbnailUploading ? (
                                <div className="text-center flex flex-col items-center">
                                    <div className="relative w-12 h-12 mb-3">
                                        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                                        <div 
                                            className="absolute inset-0 border-4 border-[#2F6288] rounded-full border-t-transparent animate-spin"
                                            style={{
                                                background: `conic-gradient(from 0deg, #2F6288 ${thumbnailUploadProgress * 3.6}deg, transparent ${thumbnailUploadProgress * 3.6}deg)`
                                            }}
                                        ></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xs font-semibold text-[#2F6288]">{thumbnailUploadProgress}%</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-[#2F6288] font-medium">Uploading...</p>
                                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-2">
                                        <div 
                                            className="bg-[#2F6288] h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${thumbnailUploadProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-sm text-gray-500 flex flex-col items-center">
                                    <img src="/assets/admin/upload.svg" alt="Upload Icon" className="w-12 h-12 mb-2" />
                                    <p>{dragActive ? "Drop here..." : "Click to upload or drag and drop"}</p>
                                    <p className="text-gray-400">Size: (487×387)px</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*,video/*"
                                onChange={(e) => handleFileUpload(e.target.files[0])}
                                className="hidden"
                                id="thumbnail-upload"
                                disabled={isThumbnailUploading}
                            />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="mb-4">
                        <label className="block text-md font-semibold text-gray-700 mb-2">Title</label>
                        <input
                            placeholder="Enter Title"
                            value={formData?.guideCard?.title ?? ""}
                            onChange={(e) => handleFieldChange("guideCard", "title", e.target.value)}
                            className="text-sm w-full border p-3 rounded-lg"
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>

                    {/* Category Selection */}
                    <div className="mb-4">
                        <label className="block text-md font-semibold text-gray-700 mb-2">Select Category</label>
                        <div className="flex flex-wrap gap-3 mb-3">
                            {categories.map((cat, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleFieldChange("guideCard", "category", cat)}
                                    className={`text-sm px-4 py-2 rounded-full border transition-colors ${formData.guideCard.category === cat
                                            ? 'bg-[#2F6288] text-white border-[#2F6288]'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-[#2F6288]'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}

                            <button
                                onClick={addNewCategory}
                                className="text-sm px-4 py-2 rounded-full border border-gray-300 text-[#2F6288] hover:bg-[#2F6288] hover:text-white flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add New
                            </button>
                        </div>
                        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                    </div>

                    {/* Sub Category (Mode Selection) */}
                    <div className="mb-4">
                        <label className="block text-md font-semibold text-gray-700 mb-2">Select Mode</label>
                        <div className="flex flex-wrap gap-3 mb-3">
                            {["Online", "Offline", "Both"].map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => handleFieldChange("guideCard", "subCategory", mode)}
                                    className={`text-sm px-4 py-2 rounded-full border transition-colors ${formData?.guideCard?.subCategory === mode
                                        ? 'bg-[#2F6288] text-white border-[#2F6288]'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-[#2F6288]'
                                        }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                        {errors.subCategory && <p className="text-red-500 text-sm mt-1">{errors.subCategory}</p>}
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                        <label className="block text-md font-semibold text-gray-700 mb-2">Price</label>
                        <input
                            placeholder="Enter Price"
                            type="number"
                            value={formData?.guideCard?.price}
                            onChange={(e) => handleFieldChange("guideCard", "price", e.target.value)}
                            className="text-sm w-full border border-gray-300 p-3 rounded-lg "
                        />
                        {errors.guidePrice && <p className="text-red-500 text-sm mt-1">{errors.guidePrice}</p>}
                    </div>

                    {/* Occupancy & Price */}
                    <div className="mb-4">
                        <label className="block text-md font-semibold text-gray-700 mb-2 mt-4">Occupancy & Price</label>
                        {formData?.guideCard?.occupancies.map((occ, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2 items-center">
                                <input
                                    type="text"
                                    value={occ.type || ""}
                                    placeholder="Enter Occupancy Type"
                                    onChange={(e) => updateOccupancy(index, "type", e.target.value)}
                                    className="text-sm w-full border p-3 rounded-lg"
                                />
                                <input
                                    type="number"
                                    value={occ.price || ""}
                                    placeholder="Price"
                                    onChange={(e) => updateOccupancy(index, "price", e.target.value)}
                                    className="text-sm w-full border p-3 rounded-lg"
                                />
                                <input
                                    type="number"
                                    value={occ.min || ""}
                                    placeholder="Min persons"
                                    onChange={(e) => updateOccupancy(index, "min", e.target.value)}
                                    className="text-sm w-full border p-3 rounded-lg"
                                />
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={occ.max || ""}
                                        placeholder="Max persons"
                                        onChange={(e) => updateOccupancy(index, "max", e.target.value)}
                                        className="text-sm w-full border p-3 rounded-lg"
                                    />
                                {index === formData?.guideCard?.occupancies.length - 1 ? (
                                    <button
                                        onClick={addOccupancy}
                                        type="button"
                                        className="border border-dashed px-2 py-1 rounded text-xl"
                                    >
                                        +
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => removeOccupancy(index)}
                                        type="button"
                                        className="border border-dashed px-2 py-1 rounded text-xl"
                                    >-</button>
                                )}
                                </div>
                            </div>
                        ))}

                        <div className="flex items-center gap-2 mt-2">
                            <input
                                type="checkbox"
                                id="showOccupancy"
                                checked={formData?.guideCard?.showOccupancy}
                                onChange={() => handleFieldChange("guideCard", "showOccupancy", !formData?.guideCard?.showOccupancy)}
                                className="w-4 h-4"
                            />
                            <label htmlFor="showOccupancy" className="text-sm text-gray-600">
                                *Tick it to Show Occupancy in Pilgrim Guide
                            </label>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-md font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                            placeholder="Enter Description"
                            value={formData?.guideCard?.description}
                            onChange={(e) => handleFieldChange("guideCard", "description", e.target.value)}
                            className="text-sm w-full border border-gray-300 p-3 rounded-lg "
                            rows={3}
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    {/* Listing Type */}
                    <div>
                        <label className="block text-md font-semibold text-gray-700 mb-2">Listing Type</label>
                        <div className="flex gap-4">
                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    id="listing"
                                    name="listingType"
                                    value="Listing"
                                    checked={formData?.guideCard?.listingType === "Listing"}
                                    onChange={(e) => handleFieldChange("guideCard", "listingType", e.target.value)}
                                    disabled={true} // Admin cannot change this option
                                    className="mr-2 text-[#2F6288] focus:ring-[#2F6288] cursor-not-allowed"
                                />
                                <label htmlFor="listing" className="text-sm font-medium text-gray-700 cursor-not-allowed">
                                    Listing
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    id="own"
                                    name="listingType"
                                    value="Own"
                                    checked={formData?.guideCard?.listingType === "Own"}
                                    onChange={(e) => handleFieldChange("guideCard", "listingType", e.target.value)}
                                    disabled={true} // Admin cannot change this option
                                    className="mr-2 text-[#2F6288] focus:ring-[#2F6288] cursor-not-allowed"
                                />
                                <label htmlFor="own" className="text-sm font-medium text-gray-700 cursor-not-allowed">
                                    Own
                                </label>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Default: Listing (Admin cannot modify this option)
                        </p>
                    </div>
                </div>

                {/* Conditional Subscription Plans based on SubCategory (Mode) */}
                {formData?.guideCard?.subCategory && (formData?.guideCard?.subCategory === "Online" || formData?.guideCard?.subCategory === "Both") && (
                    <>
                        {/* Monthly Online Subscription */}
                        <div className="mb-8">
                            <h2 className="sm:text-2xl font-bold text-[#2F6288] text-xl mb-6">
                                {isEditing ? "Edit Monthly Online Subscription" : "Monthly Online Subscription"} <span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-md font-semibold text-gray-700 mb-2">Monthly Online Subscription Price</label>
                                    <input
                                        placeholder="Enter Price"
                                        type="number"
                                        value={formData?.online?.monthly?.price}
                                        onChange={(e) => handleFieldChange(null, "price", e.target.value, "online", "monthly")}
                                        className="text-sm w-full border border-gray-300 p-3 rounded-lg "
                                    />
                                    {errors.monthlyOnlinePrice && <p className="text-red-500 text-sm mt-1">{errors.monthlyOnlinePrice}</p>}
                                </div>

                                <div>
                                    <label className="block text-md font-semibold text-gray-700 mb-2">Monthly Online Subscription Discount</label>
                                    <input
                                        type="number"
                                        placeholder="Enter Discount Percentage"
                                        value={formData?.online?.monthly?.discount}
                                        onChange={(e) => handleFieldChange(null, "discount", e.target.value, "online", "monthly")}
                                        className="text-sm w-full border border-gray-300 p-3 rounded-lg "
                                    />
                                    {errors.monthlyOnlineDiscount && <p className="text-red-500 text-sm mt-1">{errors.monthlyOnlineDiscount}</p>}
                                </div>

                                {/* Monthly Online Sessions Count */}
                                <div>
                                    <label className="block text-md font-semibold text-gray-700 mb-2">Number of Sessions (per month)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="e.g., 4"
                                        value={formData?.online?.monthly?.sessionsCount}
                                        onChange={(e) => handleFieldChange(null, "sessionsCount", e.target.value, "online", "monthly")}
                                        className="text-sm w-full border border-gray-300 p-3 rounded-lg "
                                    />
                                </div>

                                <div>
                                    <label className="block text-md font-semibold text-gray-700 mb-2">Monthly Online Subscription Description</label>
                                    <textarea
                                        placeholder="Enter Description"
                                        value={formData.online.monthly.description}
                                        onChange={(e) => handleFieldChange(null, "description", e.target.value, "online", "monthly")}
                                        className="text-sm w-full border border-gray-300 p-3 rounded-lg  h-24 resize-none"
                                    />
                                </div>

                                {/* Monthly Online Weekly Pattern */}
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Online – Weekly Hours</h3>
                                    
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-sm text-gray-600">Setup Mode:</span>
                                        <button 
                                            onClick={() => initializeDayBasedWeeklyPattern('online')} 
                                            className="px-3 py-1.5 rounded border text-sm bg-[#2F6288] text-white border-[#2F6288] hover:bg-[#224b66]"
                                        >
                                            Initialize Day-Based Setup
                                        </button>
                                        <button 
                                            onClick={() => replicateWeekToMonth('online')} 
                                            className="px-3 py-1.5 rounded border text-sm bg-[#2F6288] text-white border-[#2F6288] hover:bg-[#224b66]"
                                        >
                                            Apply Week to All Month
                                        </button>
                                    </div>
                                    {/* New Day-Based Weekly Pattern UI */}
                                    {formData?.online?.monthly?.dayBasedPattern && (
                                        <div className="space-y-6">
                                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(dayName => (
                                                <div key={dayName} className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="font-semibold text-gray-800 text-lg">{dayName}</h3>
                                                        <button
                                                            onClick={() => addSlotToDay('online', dayName)}
                                                            className="px-3 py-1 bg-[#2F6288] text-white rounded text-sm hover:bg-blue-700"
                                                        >
                                                            Add Slot
                                                        </button>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {(formData?.online?.monthly?.dayBasedPattern?.[dayName]?.slots || []).map((slot, slotIndex) => (
                                                            <div key={slotIndex} className="flex flex-col md:flex-row md:items-center gap-3 p-3 border rounded bg-white">
                                                                <div className="flex items-center gap-4">
                                                                    <label className="inline-flex items-center">
                                                                        <input 
                                                                            type="radio" 
                                                                            name={`online-${dayName}-${slotIndex}`} 
                                                                            checked={(slot.type || 'individual') === 'individual'} 
                                                                            onChange={() => updateDaySlot('online', dayName, slotIndex, 'type', 'individual')} 
                                                                            className="form-radio h-4 w-4 text-[#2F6288]" 
                                                                        />
                                                                        <span className="ml-2">Individual</span>
                                                                    </label>
                                                                    <label className="inline-flex items-center">
                                                                        <input 
                                                                            type="radio" 
                                                                            name={`online-${dayName}-${slotIndex}`} 
                                                                            checked={slot.type === 'couple'} 
                                                                            onChange={() => updateDaySlot('online', dayName, slotIndex, 'type', 'couple')} 
                                                                            className="form-radio h-4 w-4 text-[#2F6288]" 
                                                                        />
                                                                        <span className="ml-2">Couple</span>
                                                                    </label>
                                                                    <label className="inline-flex items-center">
                                                                        <input 
                                                                            type="radio" 
                                                                            name={`online-${dayName}-${slotIndex}`} 
                                                                            checked={slot.type === 'group'} 
                                                                            onChange={() => updateDaySlot('online', dayName, slotIndex, 'type', 'group')} 
                                                                            className="form-radio h-4 w-4 text-[#2F6288]" 
                                                                        />
                                                                        <span className="ml-2">Group</span>
                                                                    </label>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="time"
                                                                        value={slot.startTime || ''}
                                                                        onChange={(e) => updateDaySlot('online', dayName, slotIndex, 'startTime', e.target.value)}
                                                                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                                    />
                                                                    <span className="text-gray-500">to</span>
                                                                    <input
                                                                        type="time"
                                                                        value={slot.endTime || ''}
                                                                        onChange={(e) => updateDaySlot('online', dayName, slotIndex, 'endTime', e.target.value)}
                                                                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                                    />
                                                                    <button
                                                                        onClick={() => removeDaySlot('online', dayName, slotIndex)}
                                                                        className="text-red-600 text-sm hover:text-red-800"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {(formData?.online?.monthly?.dayBasedPattern?.[dayName]?.slots || []).length === 0 && (
                                                            <p className="text-gray-500 text-sm italic">No slots added for {dayName}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Old Weekly Pattern UI (fallback) */}
                                    {!formData?.online?.monthly?.dayBasedPattern && (
                                        <div className="space-y-4">
                                            {(formData?.online?.monthly?.weeklyPattern || []).map((row, idx) => (
                                            <div key={idx} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-blue-50">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-semibold text-gray-700">Row {idx + 1}</p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => removeMonthlyPatternRow('online', idx)}
                                                            className="text-red-600 text-sm"
                                                        >Delete</button>
                                                        <button
                                                            onClick={() => setFormData(prev => { const next={...prev}; const list=[...(next.online.monthly.weeklyPattern||[])]; list.splice(idx+1,0, JSON.parse(JSON.stringify(list[idx]))); next.online.monthly.weeklyPattern=list; return next; })}
                                                            className="text-[#2F6288] text-sm"
                                                        >Copy</button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {weekdayOptions.map(d => (
                                                        <button
                                                            key={d}
                                                            onClick={() => toggleMonthlyPatternDay('online', idx, d)}
                                                            className={`px-3 py-1 rounded-full border text-sm ${row.days?.includes(d) ? 'bg-[#2F6288] text-white border-[#2F6288]' : 'bg-white text-gray-700 border-gray-300'}`}
                                                        >{d}</button>
                                                    ))}
                                                </div>
                                                <div className="space-y-2">
                                                    {(row.times || [])
                                                        .filter(t => (t.type || 'individual') === onlineMonthlyViewType)
                                                        .filter(t => {
                                                            if (onlineMonthlyViewType === 'couple') {
                                                                const booked = Number(t.bookedCount || 0);
                                                                return booked < 2; // hide if full
                                                            }
                                                            if (onlineMonthlyViewType === 'group') {
                                                                const booked = Number(t.bookedCount || 0);
                                                                const gMax = Number(formData?.online?.monthly?.groupMax || 0);
                                                                return gMax > 0 ? booked < gMax : true;
                                                            }
                                                            return true;
                                                        })
                                                        .map((t, tIdx) => (
                                                        <div key={tIdx} className="flex flex-col md:flex-row md:items-center gap-2 p-2 border rounded bg-white">
                                                            <div className="flex items-center gap-4">
                                                                <label className="inline-flex items-center">
                                                                    <input type="radio" name={`mo-online-${idx}-${tIdx}`} checked={(t.type||'individual')==='individual'} onChange={()=>updateMonthlyPatternTime('online', idx, tIdx, 'type', 'individual')} className="form-radio h-4 w-4 text-[#2F6288]" />
                                                                    <span className="ml-2">Individual</span>
                                                                </label>
                                                                <label className="inline-flex items-center">
                                                                    <input type="radio" name={`mo-online-${idx}-${tIdx}`} checked={t.type==='couple'} onChange={()=>updateMonthlyPatternTime('online', idx, tIdx, 'type', 'couple')} className="form-radio h-4 w-4 text-[#2F6288]" />
                                                                    <span className="ml-2">Couple</span>
                                                                </label>
                                                                <label className="inline-flex items-center">
                                                                    <input type="radio" name={`mo-online-${idx}-${tIdx}`} checked={t.type==='group'} onChange={()=>updateMonthlyPatternTime('online', idx, tIdx, 'type', 'group')} className="form-radio h-4 w-4 text-[#2F6288]" />
                                                                    <span className="ml-2">Group</span>
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center gap-2 flex-1">
                                                                <input type="time" value={t.startTime || ''} onChange={(e)=>updateMonthlyPatternTime('online', idx, tIdx, 'startTime', e.target.value)} className="border p-2 rounded flex-1" />
                                                                <span>-</span>
                                                                <input type="time" value={t.endTime || ''} onChange={(e)=>updateMonthlyPatternTime('online', idx, tIdx, 'endTime', e.target.value)} className="border p-2 rounded flex-1" />
                                                                {onlineMonthlyViewType !== 'individual' && (
                                                                    <>
                                                                        <div className="flex items-center gap-2">
                                                                            <label className="text-xs text-gray-600">Booked</label>
                                                                            <input type="number" min="0" value={Number(t.bookedCount||0)} onChange={(e)=>updateMonthlyPatternTime('online', idx, tIdx, 'bookedCount', Number(e.target.value))} className="w-20 border p-2 rounded text-sm" />
                                                                        </div>
                                                                        {onlineMonthlyViewType==='couple' && (
                                                                            <span className="text-xs text-gray-700">Remaining: {Math.max(0, 2 - Number(t.bookedCount||0))}</span>
                                                                        )}
                                                                        {onlineMonthlyViewType==='group' && (
                                                                            <div className="flex items-center gap-2 text-xs text-gray-700">
                                                                                <span>Remaining: {Math.max(0, (Number(formData?.online?.monthly?.groupMax||0) || 0) - Number(t.bookedCount||0))}</span>
                                                                                <span className="ml-2">Min</span>
                                                                                <input type="number" min="0" value={formData?.online?.monthly?.groupMin || ''} onChange={(e)=>handleFieldChange(null, 'groupMin', e.target.value, 'online', 'monthly')} className="w-16 border p-1 rounded" />
                                                                                <span>Max</span>
                                                                                <input type="number" min="0" value={formData?.online?.monthly?.groupMax || ''} onChange={(e)=>handleFieldChange(null, 'groupMax', e.target.value, 'online', 'monthly')} className="w-16 border p-1 rounded" />
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}
                                                                <button onClick={()=>removeMonthlyPatternTime('online', idx, tIdx)} className="text-red-600 text-sm">Delete</button>
                                                                <button onClick={()=>addMonthlyPatternTime('online', idx)} className="text-[#2F6288] text-sm">Add</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    </>
                )}

                {formData?.guideCard?.subCategory && (formData?.guideCard?.subCategory === "Offline" || formData?.guideCard?.subCategory === "Both") && (
                    <>
                        {/* Monthly Offline Subscription */}
                        <div className="mb-8">
                            <h2 className="sm:text-2xl font-bold text-[#2F6288] text-xl mb-6">
                                {isEditing ? "Edit Monthly Offline Subscription" : "Monthly Offline Subscription"} <span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-md font-semibold text-gray-700 mb-2">Monthly Offline Subscription Price</label>
                                    <input
                                        placeholder="Enter Price"
                                        type="number"
                                        value={formData?.offline?.monthly?.price}
                                        onChange={(e) => handleFieldChange(null, "price", e.target.value, "offline", "monthly")}
                                        className="text-sm w-full border border-gray-300 p-3 rounded-lg "
                                    />
                                    {errors.monthlyOfflinePrice && <p className="text-red-500 text-sm mt-1">{errors.monthlyOfflinePrice}</p>}
                                </div>

                                <div>
                                    <label className="block text-md font-semibold text-gray-700 mb-2">Monthly Offline Subscription Discount</label>
                                    <input
                                        type="number"
                                        placeholder="Enter Discount Percentage"
                                        value={formData?.offline?.monthly?.discount}
                                        onChange={(e) => handleFieldChange(null, "discount", e.target.value, "offline", "monthly")}
                                        className="text-sm w-full border border-gray-300 p-3 rounded-lg "
                                    />
                                    {errors.monthlyOfflineDiscount && <p className="text-red-500 text-sm mt-1">{errors.monthlyOfflineDiscount}</p>}
                                </div>

                                {/* Monthly Offline Sessions Count */}
                                <div>
                                    <label className="block text-md font-semibold text-gray-700 mb-2">Number of Sessions (per month)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="e.g., 4"
                                        value={formData?.offline?.monthly?.sessionsCount}
                                        onChange={(e) => handleFieldChange(null, "sessionsCount", e.target.value, "offline", "monthly")}
                                        className="text-sm w-full border border-gray-300 p-3 rounded-lg "
                                    />
                                </div>

                                <div>
                                    <label className="block text-md font-semibold text-gray-700 mb-2">Monthly Offline Subscription Description</label>
                                    <textarea
                                        placeholder="Enter Description"
                                        value={formData.offline.monthly.description}
                                        onChange={(e) => handleFieldChange(null, "description", e.target.value, "offline", "monthly")}
                                        className="text-sm w-full border border-gray-300 p-3 rounded-lg  h-24 resize-none"
                                    />
                                </div>

                                {/* Monthly Offline Weekly Pattern */}
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Offline – Weekly Hours</h3>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-sm text-gray-600">Setup Mode:</span>
                                        <button 
                                            onClick={() => initializeDayBasedWeeklyPattern('offline')} 
                                            className="px-3 py-1.5 rounded border text-sm bg-[#2F6288] text-white border-[#2F6288] hover:bg-[#224b66]"
                                        >
                                            Initialize Day-Based Setup
                                        </button>
                                        <button 
                                            onClick={() => replicateWeekToMonth('offline')} 
                                            className="px-3 py-1.5 rounded border text-sm bg-[#2F6288] text-white border-[#2F6288] hover:bg-[#224b66]"
                                        >
                                            Apply Week to All Month
                                        </button>
                                    </div>

                                    {/* New Day-Based Weekly Pattern UI for Offline */}
                                    {formData?.offline?.monthly?.dayBasedPattern && (
                                        <div className="space-y-6">
                                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(dayName => (
                                                <div key={dayName} className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="font-semibold text-gray-800 text-lg">{dayName}</h3>
                                                        <button
                                                            onClick={() => addSlotToDay('offline', dayName)}
                                                            className="px-3 py-1 bg-[#2F6288] text-white rounded text-sm hover:bg-blue-700"
                                                        >
                                                            Add Slot
                                                        </button>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {(formData?.offline?.monthly?.dayBasedPattern?.[dayName]?.slots || []).map((slot, slotIndex) => (
                                                            <div key={slotIndex} className="flex flex-col md:flex-row md:items-center gap-3 p-3 border rounded bg-white">
                                                                <div className="flex items-center gap-4">
                                                                    <label className="inline-flex items-center">
                                                                        <input 
                                                                            type="radio" 
                                                                            name={`offline-${dayName}-${slotIndex}`} 
                                                                            checked={(slot.type || 'individual') === 'individual'} 
                                                                            onChange={() => updateDaySlot('offline', dayName, slotIndex, 'type', 'individual')} 
                                                                            className="form-radio h-4 w-4 text-[#2F6288]" 
                                                                        />
                                                                        <span className="ml-2">Individual</span>
                                                                    </label>
                                                                    <label className="inline-flex items-center">
                                                                        <input 
                                                                            type="radio" 
                                                                            name={`offline-${dayName}-${slotIndex}`} 
                                                                            checked={slot.type === 'couple'} 
                                                                            onChange={() => updateDaySlot('offline', dayName, slotIndex, 'type', 'couple')} 
                                                                            className="form-radio h-4 w-4 text-[#2F6288]" 
                                                                        />
                                                                        <span className="ml-2">Couple</span>
                                                                    </label>
                                                                    <label className="inline-flex items-center">
                                                                        <input 
                                                                            type="radio" 
                                                                            name={`offline-${dayName}-${slotIndex}`} 
                                                                            checked={slot.type === 'group'} 
                                                                            onChange={() => updateDaySlot('offline', dayName, slotIndex, 'type', 'group')} 
                                                                            className="form-radio h-4 w-4 text-[#2F6288]" 
                                                                        />
                                                                        <span className="ml-2">Group</span>
                                                                    </label>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="time"
                                                                        value={slot.startTime || ''}
                                                                        onChange={(e) => updateDaySlot('offline', dayName, slotIndex, 'startTime', e.target.value)}
                                                                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                                    />
                                                                    <span className="text-gray-500">to</span>
                                                                    <input
                                                                        type="time"
                                                                        value={slot.endTime || ''}
                                                                        onChange={(e) => updateDaySlot('offline', dayName, slotIndex, 'endTime', e.target.value)}
                                                                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                                    />
                                                                    <button
                                                                        onClick={() => removeDaySlot('offline', dayName, slotIndex)}
                                                                        className="text-red-600 text-sm hover:text-red-800"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {(formData?.offline?.monthly?.dayBasedPattern?.[dayName]?.slots || []).length === 0 && (
                                                            <p className="text-gray-500 text-sm italic">No slots added for {dayName}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Old Weekly Pattern UI (fallback) for Offline */}
                                    {!formData?.offline?.monthly?.dayBasedPattern && (
                                        <div className="space-y-4">
                                            {(formData?.offline?.monthly?.weeklyPattern || []).map((row, idx) => (
                                            <div key={idx} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-green-50">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-semibold text-gray-700">Row {idx + 1}</p>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => removeMonthlyPatternRow('offline', idx)} className="text-red-600 text-sm">Delete</button>
                                                        <button onClick={() => setFormData(prev => { const next={...prev}; const list=[...(next.offline.monthly.weeklyPattern||[])]; list.splice(idx+1,0, JSON.parse(JSON.stringify(list[idx]))); next.offline.monthly.weeklyPattern=list; return next; })} className="text-[#2F6288] text-sm">Copy</button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {weekdayOptions.map(d => (
                                                        <button key={d} onClick={() => toggleMonthlyPatternDay('offline', idx, d)} className={`px-3 py-1 rounded-full border text-sm ${row.days?.includes(d) ? 'bg-[#2F6288] text-white border-[#2F6288]' : 'bg-white text-gray-700 border-gray-300'}`}>{d}</button>
                                                    ))}
                                                </div>
                                                <div className="space-y-2">
                                                    {(row.times || [])
                                                        .filter(t => (t.type || 'individual') === offlineMonthlyViewType)
                                                        .filter(t => {
                                                            if (offlineMonthlyViewType === 'couple') {
                                                                const booked = Number(t.bookedCount || 0);
                                                                return booked < 2;
                                                            }
                                                            if (offlineMonthlyViewType === 'group') {
                                                                const booked = Number(t.bookedCount || 0);
                                                                const gMax = Number(formData?.offline?.monthly?.groupMax || 0);
                                                                return gMax > 0 ? booked < gMax : true;
                                                            }
                                                            return true;
                                                        })
                                                        .map((t, tIdx) => (
                                                        <div key={tIdx} className="flex flex-col md:flex-row md:items-center gap-2 p-2 border rounded bg-white">
                                                            <div className="flex items-center gap-4">
                                                                <label className="inline-flex items-center">
                                                                    <input type="radio" name={`mo-offline-${idx}-${tIdx}`} checked={(t.type||'individual')==='individual'} onChange={()=>updateMonthlyPatternTime('offline', idx, tIdx, 'type', 'individual')} className="form-radio h-4 w-4 text-[#2F6288]" />
                                                                    <span className="ml-2">Individual</span>
                                                                </label>
                                                                <label className="inline-flex items-center">
                                                                    <input type="radio" name={`mo-offline-${idx}-${tIdx}`} checked={t.type==='couple'} onChange={()=>updateMonthlyPatternTime('offline', idx, tIdx, 'type', 'couple')} className="form-radio h-4 w-4 text-[#2F6288]" />
                                                                    <span className="ml-2">Couple</span>
                                                                </label>
                                                                <label className="inline-flex items-center">
                                                                    <input type="radio" name={`mo-offline-${idx}-${tIdx}`} checked={t.type==='group'} onChange={()=>updateMonthlyPatternTime('offline', idx, tIdx, 'type', 'group')} className="form-radio h-4 w-4 text-[#2F6288]" />
                                                                    <span className="ml-2">Group</span>
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center gap-2 flex-1">
                                                                <input type="time" value={t.startTime || ''} onChange={(e)=>updateMonthlyPatternTime('offline', idx, tIdx, 'startTime', e.target.value)} className="border p-2 rounded flex-1" />
                                                                <span>-</span>
                                                                <input type="time" value={t.endTime || ''} onChange={(e)=>updateMonthlyPatternTime('offline', idx, tIdx, 'endTime', e.target.value)} className="border p-2 rounded flex-1" />
                                                                {offlineMonthlyViewType !== 'individual' && (
                                                                    <>
                                                                        <div className="flex items-center gap-2">
                                                                            <label className="text-xs text-gray-600">Booked</label>
                                                                            <input type="number" min="0" value={Number(t.bookedCount||0)} onChange={(e)=>updateMonthlyPatternTime('offline', idx, tIdx, 'bookedCount', Number(e.target.value))} className="w-20 border p-2 rounded text-sm" />
                                                                        </div>
                                                                        {offlineMonthlyViewType==='couple' && (
                                                                            <span className="text-xs text-gray-700">Remaining: {Math.max(0, 2 - Number(t.bookedCount||0))}</span>
                                                                        )}
                                                                        {offlineMonthlyViewType==='group' && (
                                                                            <div className="flex items-center gap-2 text-xs text-gray-700">
                                                                                <span>Remaining: {Math.max(0, (Number(formData?.offline?.monthly?.groupMax||0) || 0) - Number(t.bookedCount||0))}</span>
                                                                                <span className="ml-2">Min</span>
                                                                                <input type="number" min="0" value={formData?.offline?.monthly?.groupMin || ''} onChange={(e)=>handleFieldChange(null, 'groupMin', e.target.value, 'offline', 'monthly')} className="w-16 border p-1 rounded" />
                                                                                <span>Max</span>
                                                                                <input type="number" min="0" value={formData?.offline?.monthly?.groupMax || ''} onChange={(e)=>handleFieldChange(null, 'groupMax', e.target.value, 'offline', 'monthly')} className="w-16 border p-1 rounded" />
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}
                                                                <button onClick={()=>removeMonthlyPatternTime('offline', idx, tIdx)} className="text-red-600 text-sm">Delete</button>
                                                                <button onClick={()=>addMonthlyPatternTime('offline', idx)} className="text-[#2F6288] text-sm">Add</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    </>
                )}

                {/* One-Time Online Purchase */}
                {formData?.guideCard?.subCategory && (formData?.guideCard?.subCategory === "Online" || formData?.guideCard?.subCategory === "Both") && (
                    <div className="mb-8">
                        <h2 className="sm:text-2xl font-bold text-[#2F6288] text-xl mb-6">
                            {isEditing ? "Edit One-Time Online Purchase" : "One-Time Online Purchase"} <span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-md font-semibold text-gray-700 mb-2">One-Time Online Purchase Price</label>
                                <input
                                    placeholder="Enter Price"
                                    type="number"
                                    value={formData?.online?.oneTime?.price}
                                    onChange={(e) => handleFieldChange(null, "price", e.target.value, "online", "oneTime")}
                                    className="text-sm w-full border border-gray-300 p-3 rounded-lg "
                                />
                                {errors.oneTimeOnlinePrice && <p className="text-red-500 text-sm mt-1">{errors.oneTimeOnlinePrice}</p>}
                            </div>

                            {/* One-Time Online Slots - Calendar Based */}
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">One-Time Online – Calendar</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Calendar */}
                                    <div className="border rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <button onClick={()=>prevMonthGuard(setOtOnlineMonth, otOnlineMonth)} className="px-2 py-1 border rounded">Prev</button>
                                            <div className="font-semibold">{otOnlineMonth.toLocaleString('default',{month:'long'})} {otOnlineMonth.getFullYear()}</div>
                                            <button onClick={()=>setOtOnlineMonth(new Date(otOnlineMonth.getFullYear(), otOnlineMonth.getMonth()+1, 1))} className="px-2 py-1 border rounded">Next</button>
                                        </div>
                                        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-600 mb-1">
                                            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=> <div key={d}>{d}</div>)}
                                        </div>
                                        <div className="grid grid-cols-7 gap-1">
                                            {calGrid(otOnlineMonth).map((d,i)=> {
                                                const y = d ? fmtYMD(d) : '';
                                                const selected = y && otOnlineSelectedDates.includes(y);
                                                return (
                                                    <button
                                                        key={i}
                                                        disabled={!d || isPast(d)}
                                                        onClick={()=> {
                                                            if (!d || isPast(d)) return;
                                                            const ymd = fmtYMD(d);
                                                            if (otOnlineMulti) {
                                                                setOtOnlineSelectedDates(prev => prev.includes(ymd) ? prev.filter(x => x !== ymd) : [...prev, ymd]);
                                                            } else {
                                                                setOtOnlineSelectedDates([ymd]);
                                                                setOtOnlineDate(ymd);
                                                            }
                                                        }}
                                                        className={`h-10 rounded border text-sm ${(!d || isPast(d))
                                                            ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                                                            : (selected || (y===otOnlineDate && !otOnlineMulti))
                                                                ? 'bg-[#2F6288] text-white border-[#2F6288]'
                                                                : 'bg-white text-gray-700 border-gray-200 hover:border-[#2F6288]'
                                                        }`}
                                                    >
                                                        {d? d.getDate(): ''}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Multi-select controls */}
                                        <div className="mt-2 flex items-center justify-between">
                                            <label className="flex items-center gap-2 text-sm">
                                                <input type="checkbox" className="h-4 w-4 text-[#2F6288]" checked={otOnlineMulti} onChange={(e)=> setOtOnlineMulti(e.target.checked)} />
                                                <span>Multi-select dates</span>
                                            </label>
                                            {otOnlineSelectedDates.length > 1 && (
                                                <button type="button" onClick={()=> setOtOnlineSelectedDates([])} className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">Clear All</button>
                                            )}
                                        </div>
                                        {otOnlineSelectedDates.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {otOnlineSelectedDates.map(d => (
                                                    <span key={d} className="text-xs bg-[#2F6288] text-white px-2 py-0.5 rounded">{d}</span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-3">
                                            <button
                                                type="button"
                                                onClick={()=>{
                                                    if (otOnlineSelectedDates.length > 1) {
                                                        setOtOnlinePending(p => ({ ...p, open: true }));
                                                    } else {
                                                        const target = otOnlineSelectedDates[0] || otOnlineDate;
                                                        if (target) addOneTimeSlotFor('online', target);
                                                    }
                                                }}
                                                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#2F6288]"
                                            >
                                                {otOnlineSelectedDates.length > 1 ? `Add Time Range to ${otOnlineSelectedDates.length} dates` : `Add Slot for ${otOnlineDate}`}
                                            </button>
                                        </div>

                                        {otOnlinePending.open && otOnlineSelectedDates.length > 1 && (
                                            <div className="mt-3 border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Add a time range that will apply to all selected dates</p>
                                                <div className="grid sm:grid-cols-[auto_1fr_auto_1fr_auto] grid-cols-1 gap-2 items-center">
                                                    <div className="flex items-center gap-3">
                                                        <label className="inline-flex items-center text-xs">
                                                            <input type="radio" name="ot-online-type" checked={(otOnlinePending.type||'individual')==='individual'} onChange={()=>setOtOnlinePending(p=>({...p,type:'individual'}))} className="h-4 w-4 text-[#2F6288]" />
                                                            <span className="ml-1">Individual</span>
                                                        </label>
                                                        <label className="inline-flex items-center text-xs">
                                                            <input type="radio" name="ot-online-type" checked={otOnlinePending.type==='couple'} onChange={()=>setOtOnlinePending(p=>({...p,type:'couple'}))} className="h-4 w-4 text-[#2F6288]" />
                                                            <span className="ml-1">Couple</span>
                                                        </label>
                                                        <label className="inline-flex items-center text-xs">
                                                            <input type="radio" name="ot-online-type" checked={otOnlinePending.type==='group'} onChange={()=>setOtOnlinePending(p=>({...p,type:'group'}))} className="h-4 w-4 text-[#2F6288]" />
                                                            <span className="ml-1">Group</span>
                                                        </label>
                                                    </div>
                                                    <input type="time" value={otOnlinePending.startTime} onChange={(e)=> setOtOnlinePending(p=>({...p,startTime:e.target.value}))} className="text-sm w-full border border-gray-300 p-2 rounded-lg" />
                                                    <span className="hidden sm:flex justify-center text-gray-500">-</span>
                                                    <input type="time" value={otOnlinePending.endTime} onChange={(e)=> setOtOnlinePending(p=>({...p,endTime:e.target.value}))} className="text-sm w-full border border-gray-300 p-2 rounded-lg" />
                                                    <div className="flex items-center gap-2">
                                                        <button type="button" onClick={applyOtOnlinePending} className="text-xs px-3 py-1.5 bg-[#2F6288] text-white rounded-md">Apply to {otOnlineSelectedDates.length} dates</button>
                                                        <button type="button" onClick={()=> setOtOnlinePending({ open:false, startTime:"", endTime:"", type:"individual" })} className="text-xs px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md">Cancel</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {/* Slots for selected date */}
                                    <div className="border rounded-lg p-3">
                                        <div className="font-semibold mb-2">Slots for {otOnlineDate}</div>
                                        <div className="space-y-3">
                                            {(formData?.online?.oneTime?.slots||[]).filter(s=>ymd(s.date)===otOnlineDate).map((s, idx) => (
                                                <div key={`${otOnlineDate}-${idx}`} className="border rounded-lg p-3 space-y-2 bg-gray-50">
                                                    <div className="flex items-center gap-4 mb-2">
                                                        <label className="inline-flex items-center">
                                                            <input 
                                                                type="radio" 
                                                                name={`online-slot-type-${idx}`}
                                                                checked={(s.type || 'individual') === 'individual'}
                                                                onChange={() => updateOneTimeSlot('online', s.id, 'type', 'individual')}
                                                                className="form-radio h-4 w-4 text-[#2F6288]"
                                                            />
                                                            <span className="ml-2">Individual</span>
                                                        </label>
                                                        <label className="inline-flex items-center">
                                                            <input 
                                                                type="radio" 
                                                                name={`online-slot-type-${idx}`}
                                                                checked={s.type === 'couple'}
                                                                onChange={() => updateOneTimeSlot('online', s.id, 'type', 'couple')}
                                                                className="form-radio h-4 w-4 text-[#2F6288]"
                                                            />
                                                            <span className="ml-2">Couple</span>
                                                        </label>
                                                        <label className="inline-flex items-center">
                                                            <input 
                                                                type="radio" 
                                                                name={`online-slot-type-${idx}`}
                                                                checked={s.type === 'group'}
                                                                onChange={() => updateOneTimeSlot('online', s.id, 'type', 'group')}
                                                                className="form-radio h-4 w-4 text-[#2F6288]"
                                                            />
                                                            <span className="ml-2">Group</span>
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input 
                                                            type="time" 
                                                            value={s.startTime||''} 
                                                            onChange={(e)=>updateOneTimeSlot('online', s.id, 'startTime', e.target.value)} 
                                                            className="border p-2 rounded flex-1" 
                                                        />
                                                        <span>-</span>
                                                        <input 
                                                            type="time" 
                                                            value={s.endTime||''} 
                                                            onChange={(e)=>updateOneTimeSlot('online', s.id, 'endTime', e.target.value)} 
                                                            className="border p-2 rounded flex-1" 
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={()=>removeOneTimeSlot('online', s.id)} 
                                                            className="text-red-600 hover:text-red-800 p-1"
                                                            title="Delete slot"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* One-Time Offline Purchase */}
                {formData?.guideCard?.subCategory && (formData?.guideCard?.subCategory === "Offline" || formData?.guideCard?.subCategory === "Both") && (
                    <div className="mb-8">
                        <h2 className="sm:text-2xl font-bold text-[#2F6288] text-xl mb-6">
                            {isEditing ? "Edit One-Time Offline Purchase" : "One-Time Offline Purchase"} <span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-md font-semibold text-gray-700 mb-2">One-Time Offline Purchase Price</label>
                                <input
                                    placeholder="Enter Price"
                                    type="number"
                                    value={formData?.offline?.oneTime?.price}
                                    onChange={(e) => handleFieldChange(null, "price", e.target.value, "offline", "oneTime")}
                                    className="text-sm w-full border border-gray-300 p-3 rounded-lg "
                                />
                                {errors.oneTimeOfflinePrice && <p className="text-red-500 text-sm mt-1">{errors.oneTimeOfflinePrice}</p>}
                            </div>

                            {/* One-Time Offline Slots - Calendar Based */}
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">One-Time Offline – Calendar</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Calendar */}
                                    <div className="border rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <button onClick={()=>prevMonthGuard(setOtOfflineMonth, otOfflineMonth)} className="px-2 py-1 border rounded">Prev</button>
                                            <div className="font-semibold">{otOfflineMonth.toLocaleString('default',{month:'long'})} {otOfflineMonth.getFullYear()}</div>
                                            <button onClick={()=>setOtOfflineMonth(new Date(otOfflineMonth.getFullYear(), otOfflineMonth.getMonth()+1, 1))} className="px-2 py-1 border rounded">Next</button>
                                        </div>
                                        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-600 mb-1">
                                            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=> <div key={d}>{d}</div>)}
                                        </div>
                                        <div className="grid grid-cols-7 gap-1">
                                            {calGrid(otOfflineMonth).map((d,i)=> {
                                                const y = d ? fmtYMD(d) : '';
                                                const selected = y && otOfflineSelectedDates.includes(y);
                                                return (
                                                    <button
                                                        key={i}
                                                        disabled={!d || isPast(d)}
                                                        onClick={()=> {
                                                            if (!d || isPast(d)) return;
                                                            const ymd = fmtYMD(d);
                                                            if (otOfflineMulti) {
                                                                setOtOfflineSelectedDates(prev => prev.includes(ymd) ? prev.filter(x => x !== ymd) : [...prev, ymd]);
                                                            } else {
                                                                setOtOfflineSelectedDates([ymd]);
                                                                setOtOfflineDate(ymd);
                                                            }
                                                        }}
                                                        className={`h-10 rounded border text-sm ${(!d || isPast(d))
                                                            ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                                                            : (selected || (y===otOfflineDate && !otOfflineMulti))
                                                                ? 'bg-[#2F6288] text-white border-[#2F6288]'
                                                                : 'bg-white text-gray-700 border-gray-200 hover:border-[#2F6288]'
                                                        }`}
                                                    >
                                                        {d? d.getDate(): ''}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Multi-select controls */}
                                        <div className="mt-2 flex items-center justify-between">
                                            <label className="flex items-center gap-2 text-sm">
                                                <input type="checkbox" className="h-4 w-4 text-[#2F6288]" checked={otOfflineMulti} onChange={(e)=> setOtOfflineMulti(e.target.checked)} />
                                                <span>Multi-select dates</span>
                                            </label>
                                            {otOfflineSelectedDates.length > 1 && (
                                                <button type="button" onClick={()=> setOtOfflineSelectedDates([])} className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">Clear All</button>
                                            )}
                                        </div>
                                        {otOfflineSelectedDates.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {otOfflineSelectedDates.map(d => (
                                                    <span key={d} className="text-xs bg-[#2F6288] text-white px-2 py-0.5 rounded">{d}</span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-3">
                                            <button
                                                type="button"
                                                onClick={()=>{
                                                    if (otOfflineSelectedDates.length > 1) {
                                                        setOtOfflinePending(p => ({ ...p, open: true }));
                                                    } else {
                                                        const target = otOfflineSelectedDates[0] || otOfflineDate;
                                                        if (target) addOneTimeSlotFor('offline', target);
                                                    }
                                                }}
                                                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#2F6288]"
                                            >
                                                {otOfflineSelectedDates.length > 1 ? `Add Time Range to ${otOfflineSelectedDates.length} dates` : `Add Slot for ${otOfflineDate}`}
                                            </button>
                                        </div>

                                        {otOfflinePending.open && otOfflineSelectedDates.length > 1 && (
                                            <div className="mt-3 border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
                                                <p className="text-sm font-medium text-gray-700 mb-2">Add a time range that will apply to all selected dates</p>
                                                <div className="grid sm:grid-cols-[auto_1fr_auto_1fr_auto] grid-cols-1 gap-2 items-center">
                                                    <div className="flex items-center gap-3">
                                                        <label className="inline-flex items-center text-xs">
                                                            <input type="radio" name="ot-offline-type" checked={(otOfflinePending.type||'individual')==='individual'} onChange={()=>setOtOfflinePending(p=>({...p,type:'individual'}))} className="h-4 w-4 text-[#2F6288]" />
                                                            <span className="ml-1">Individual</span>
                                                        </label>
                                                        <label className="inline-flex items-center text-xs">
                                                            <input type="radio" name="ot-offline-type" checked={otOfflinePending.type==='couple'} onChange={()=>setOtOfflinePending(p=>({...p,type:'couple'}))} className="h-4 w-4 text-[#2F6288]" />
                                                            <span className="ml-1">Couple</span>
                                                        </label>
                                                        <label className="inline-flex items-center text-xs">
                                                            <input type="radio" name="ot-offline-type" checked={otOfflinePending.type==='group'} onChange={()=>setOtOfflinePending(p=>({...p,type:'group'}))} className="h-4 w-4 text-[#2F6288]" />
                                                            <span className="ml-1">Group</span>
                                                        </label>
                                                    </div>
                                                    <input type="time" value={otOfflinePending.startTime} onChange={(e)=> setOtOfflinePending(p=>({...p,startTime:e.target.value}))} className="text-sm w-full border border-gray-300 p-2 rounded-lg" />
                                                    <span className="hidden sm:flex justify-center text-gray-500">-</span>
                                                    <input type="time" value={otOfflinePending.endTime} onChange={(e)=> setOtOfflinePending(p=>({...p,endTime:e.target.value}))} className="text-sm w-full border border-gray-300 p-2 rounded-lg" />
                                                    <div className="flex items-center gap-2">
                                                        <button type="button" onClick={applyOtOfflinePending} className="text-xs px-3 py-1.5 bg-[#2F6288] text-white rounded-md">Apply to {otOfflineSelectedDates.length} dates</button>
                                                        <button type="button" onClick={()=> setOtOfflinePending({ open:false, startTime:"", endTime:"", type:"individual" })} className="text-xs px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md">Cancel</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {/* Slots for selected date */}
                                    <div className="border rounded-lg p-3">
                                        <div className="font-semibold mb-2">Slots for {otOfflineDate}</div>
                                        <div className="space-y-3">
                                            {(formData?.offline?.oneTime?.slots||[]).filter(s=>ymd(s.date)===otOfflineDate).map((s, idx) => (
                                                <div key={`${otOfflineDate}-${idx}`} className="border rounded-lg p-3 space-y-2 bg-gray-50">
                                                    <div className="flex items-center gap-4 mb-2">
                                                        <label className="inline-flex items-center">
                                                            <input 
                                                                type="radio" 
                                                                name={`offline-slot-type-${idx}`}
                                                                checked={(s.type || 'individual') === 'individual'}
                                                                onChange={() => updateOneTimeSlot('offline', s.id, 'type', 'individual')}
                                                                className="form-radio h-4 w-4 text-[#2F6288]"
                                                            />
                                                            <span className="ml-2">Individual</span>
                                                        </label>
                                                        <label className="inline-flex items-center">
                                                            <input 
                                                                type="radio" 
                                                                name={`offline-slot-type-${idx}`}
                                                                checked={s.type === 'couple'}
                                                                onChange={() => updateOneTimeSlot('offline', s.id, 'type', 'couple')}
                                                                className="form-radio h-4 w-4 text-[#2F6288]"
                                                            />
                                                            <span className="ml-2">Couple</span>
                                                        </label>
                                                        <label className="inline-flex items-center">
                                                            <input 
                                                                type="radio" 
                                                                name={`offline-slot-type-${idx}`}
                                                                checked={s.type === 'group'}
                                                                onChange={() => updateOneTimeSlot('offline', s.id, 'type', 'group')}
                                                                className="form-radio h-4 w-4 text-[#2F6288]"
                                                            />
                                                            <span className="ml-2">Group</span>
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input 
                                                            type="time" 
                                                            value={s.startTime||''} 
                                                            onChange={(e)=>updateOneTimeSlot('offline', s.id, 'startTime', e.target.value)} 
                                                            className="border p-2 rounded flex-1" 
                                                        />
                                                        <span>-</span>
                                                        <input 
                                                            type="time" 
                                                            value={s.endTime||''} 
                                                            onChange={(e)=>updateOneTimeSlot('offline', s.id, 'endTime', e.target.value)} 
                                                            className="border p-2 rounded flex-1" 
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={()=>removeOneTimeSlot('offline', s.id)} 
                                                            className="text-red-600 hover:text-red-800 p-1"
                                                            title="Delete slot"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    {/* Location removed for One-Time Offline slots */}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Organizer Information */}
                <div className="mb-8">
                    <h2 className="sm:text-2xl font-bold text-[#2F6288] text-xl mb-6">
                        {isEditing ? "Edit Organizer Information" : "Organizer Information"} <span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-md font-semibold text-gray-700 mb-2">Organizer Name</label>
                            <input
                                placeholder="Enter Organizer Name"
                                type="text"
                                value={formData?.organizer?.name}
                                onChange={(e) => handleFieldChange("organizer", "name", e.target.value)}
                                className="text-sm w-full border border-gray-300 p-3 rounded-lg "
                            />
                            {errors?.organizerName && <p className="text-red-500 text-sm mt-1">{errors?.organizerName}</p>}
                        </div>

                        <div>
                            <label className="block text-md font-semibold text-gray-700 mb-2">Organizer Email</label>
                            <input
                                placeholder="Enter Organizer Email"
                                type="email"
                                value={formData?.organizer?.email}
                                onChange={(e) => handleFieldChange("organizer", "email", e.target.value)}
                                className="text-sm w-full border border-gray-300 p-3 rounded-lg "
                            />
                            {errors?.organizerEmail && <p className="text-red-500 text-sm mt-1">{errors?.organizerEmail}</p>}
                        </div>

                        <div>
                            <label className="block text-md font-semibold text-gray-700 mb-2">Organizer Address</label>
                            <textarea
                                placeholder="Enter Organizer Address"
                                value={formData?.organizer?.address}
                                onChange={(e) => handleFieldChange("organizer", "address", e.target.value)}
                                className="text-sm w-full border border-gray-300 p-3 rounded-lg  h-24 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-md font-semibold text-gray-700 mb-2">Google Meet Link</label>
                            <input
                                placeholder="Enter Google Meet Link"
                                type="url"
                                value={formData?.organizer?.googleMeetLink}
                                onChange={(e) => handleFieldChange("organizer", "googleMeetLink", e.target.value)}
                                className="text-sm w-full border border-gray-300 p-3 rounded-lg "
                            />
                            {errors?.organizerGoogleMeetLink && <p className="text-red-500 text-sm mt-1">{errors?.organizerGoogleMeetLink}</p>}
                        </div>

                        <div>
                            <label className="block text-md font-semibold text-gray-700 mb-2">Contact Number</label>
                            <input
                                placeholder="Enter Contact Number"
                                type="tel"
                                value={formData?.organizer?.contactNumber}
                                onChange={(e) => handleFieldChange("organizer", "contactNumber", e.target.value)}
                                className="text-sm w-full border border-gray-300 p-3 rounded-lg "
                            />
                        </div>
                    </div>
                </div>

                {/* Session */}
                <div className="mb-8">
                    {/* session title/description */}
                    <h2 className="sm:text-2xl font-bold text-[#2F6288] text-xl mb-6">
                        {isEditing ? "Edit Session" : "Session"} <span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
                    </h2>
                    <div>
                        <label className="block text-md font-semibold text-gray-700 mb-2">Session Description</label>
                        <textarea
                            placeholder="Enter Description"
                            value={formData?.session?.sessiondescription}
                            onChange={(e) => handleFieldChange("session", "sessiondescription", e.target.value)}
                            className="text-sm w-full border border-gray-300 p-3 rounded-lg  h-32 resize-none"
                        />
                    </div>

                    {/* images */}
                    <label className="block font-semibold mb-2">Add Images ( Maximum 11 Images )</label>
                    <div className="mb-6">
                        {formData?.session?.images && formData?.session?.images?.length < 11 && (
                            <label className="w-56 h-40 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50">
                                <img src="/assets/admin/upload.svg" alt="Upload Icon" className="w-10 h-10 mb-2" />
                                <span>Click to upload image</span>
                                <p className="text-gray-400">Size: (700×400)px</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    disabled={Object.keys(isSessionImageUploading || {}).some(key => isSessionImageUploading[key])}
                                />
                            </label>
                        )}
                        
                        {/* Show upload progress loaders */}
                        <div className="flex flex-wrap gap-4 mt-4">
                            {Object.keys(isSessionImageUploading || {}).filter(key => isSessionImageUploading[key]).map(uploadId => (
                                <div key={uploadId} className="w-40 h-28 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center">
                                    <div className="text-center flex flex-col items-center">
                                        <div className="relative w-8 h-8 mb-2">
                                            <div className="absolute inset-0 border-2 border-gray-200 rounded-full"></div>
                                            <div 
                                                className="absolute inset-0 border-2 border-[#2F6288] rounded-full border-t-transparent animate-spin"
                                                style={{
                                                    background: `conic-gradient(from 0deg, #2F6288 ${(sessionImageUploadProgress[uploadId] || 0) * 3.6}deg, transparent ${(sessionImageUploadProgress[uploadId] || 0) * 3.6}deg)`
                                                }}
                                            ></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-xs font-semibold text-[#2F6288]">{sessionImageUploadProgress[uploadId] || 0}%</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-[#2F6288] font-medium">Uploading...</p>
                                        <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                                            <div 
                                                className="bg-[#2F6288] h-1 rounded-full transition-all duration-300"
                                                style={{ width: `${sessionImageUploadProgress[uploadId] || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex flex-wrap gap-4 mt-4">
                            {formData?.session?.images && formData?.session?.images.map((img, index) => (
                                <div key={index} className="relative w-40 h-28">
                                    <img src={img} alt={`img-${index}`} className="w-full h-full object-cover rounded shadow" />
                                    <button
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-white border border-gray-300 rounded-full p-1 hover:bg-gray-200"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* videos */}
                    <label className="block font-semibold mb-2">Add Videos ( Maximum 6 Videos )</label>
                    <div className="mb-4">
                        {formData?.session?.videos && formData?.session?.videos.length < 6 && (
                            <label className="w-56 h-40 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50">
                                <img src="/assets/admin/upload.svg" alt="Upload Icon" className="w-10 h-10 mb-2" />
                                <span>Click to upload Videos</span>
                                <input
                                    type="file"
                                    accept="video/*"
                                    multiple
                                    onChange={handleVideoUpload}
                                    className="hidden"
                                    disabled={Object.keys(isSessionVideoUploading || {}).some(key => isSessionVideoUploading[key])}
                                />
                            </label>
                        )}
                        
                        {/* Show upload progress loaders */}
                        <div className="flex flex-wrap gap-4 mt-4">
                            {Object.keys(isSessionVideoUploading || {}).filter(key => isSessionVideoUploading[key]).map(uploadId => (
                                <div key={uploadId} className="w-40 h-28 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center bg-black">
                                    <div className="text-center flex flex-col items-center">
                                        <div className="relative w-8 h-8 mb-2">
                                            <div className="absolute inset-0 border-2 border-gray-200 rounded-full"></div>
                                            <div 
                                                className="absolute inset-0 border-2 border-[#2F6288] rounded-full border-t-transparent animate-spin"
                                                style={{
                                                    background: `conic-gradient(from 0deg, #2F6288 ${(sessionVideoUploadProgress[uploadId] || 0) * 3.6}deg, transparent ${(sessionVideoUploadProgress[uploadId] || 0) * 3.6}deg)`
                                                }}
                                            ></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-xs font-semibold text-white">{sessionVideoUploadProgress[uploadId] || 0}%</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-white font-medium">Uploading...</p>
                                        <div className="w-16 bg-gray-600 rounded-full h-1 mt-1">
                                            <div 
                                                className="bg-[#2F6288] h-1 rounded-full transition-all duration-300"
                                                style={{ width: `${sessionVideoUploadProgress[uploadId] || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex flex-wrap gap-4 mt-4">
                            {formData?.session && formData?.session?.videos.map((vid, index) => (
                                <div key={index} className="relative w-40 h-28 bg-black">
                                    <video src={vid} controls className="w-full h-full rounded shadow object-cover" />
                                    <button
                                        onClick={() => removeVideo(index)}
                                        className="absolute top-1 right-1 bg-white border border-gray-300 rounded-full p-1 hover:bg-gray-200"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* title/description/free trial video upload */}
                    <div className="mb-6 space-y-4">
                        {/* title */}
                        <div>
                            <label className="block text-md font-semibold text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                placeholder="Enter Title"
                                value={formData?.session?.title}
                                onChange={(e) => handleFieldChange("session", "title", e.target.value)}
                                className="text-sm w-full border border-gray-300 p-3 rounded-lg "
                            />
                            {errors?.monthlyDiscount && <p className="text-red-500 text-sm mt-1">{errors?.monthlyDiscount}</p>}
                        </div>
                        
                        {/* description */}
                        <div>
                            <label className="block text-md font-semibold text-gray-700 mb-2">Description</label>
                            <textarea
                                placeholder="Enter Description"
                                value={formData?.session?.description}
                                onChange={(e) => handleFieldChange("session", "description", e.target.value)}
                                className="text-sm w-full border border-gray-300 p-3 rounded-lg  h-24 resize-none"
                            />
                        </div>
                        
                        {/* free trial video upload */}
                        <div>
                            <h3 className="block text-md font-semibold text-gray-700 mb-2">Free Trial Video Upload</h3>
                            <div
                                className={`border-2 border-dashed h-40 rounded mb-4 flex items-center justify-center cursor-pointer transition-colors ${
                                    dragActive ? 'border-[#2F6288] bg-[#2F6288]/10' : 'border-gray-300 hover:bg-gray-50'
                                    }`}
                                onDrop={handleFreeTrialDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => !isFreeTrialVideoUploading && document.getElementById('free-trial-upload').click()}
                            >
                                {formData?.session && formData?.session?.freeTrialVideo ? (
                                    <div className="relative h-full flex items-center">
                                        <video
                                            src={formData?.session?.freeTrialVideo}
                                            className="h-full object-contain rounded"
                                            controls
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleFieldChange("session", "freeTrialVideo", null)
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : isFreeTrialVideoUploading ? (
                                    <div className="text-center flex flex-col items-center">
                                        <div className="relative w-12 h-12 mb-3">
                                            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                                            <div 
                                                className="absolute inset-0 border-4 border-[#2F6288] rounded-full border-t-transparent animate-spin"
                                                style={{
                                                    background: `conic-gradient(from 0deg, #2F6288 ${freeTrialVideoUploadProgress * 3.6}deg, transparent ${freeTrialVideoUploadProgress * 3.6}deg)`
                                                }}
                                            ></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-xs font-semibold text-[#2F6288]">{freeTrialVideoUploadProgress}%</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-[#2F6288] font-medium">Uploading Video...</p>
                                        <div className="w-24 bg-gray-200 rounded-full h-2 mt-2">
                                            <div 
                                                className="bg-[#2F6288] h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${freeTrialVideoUploadProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500 flex flex-col items-center">
                                        <img src="/assets/admin/upload.svg" alt="Upload Icon" className="w-12 h-12 mb-2" />
                                        <p>{dragActive ? "Drop video here..." : "Click to upload or drag and drop"}</p>
                                        <p className="text-sm text-gray-400">Upload trial video</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => handleFreeTrialVideoUpload(e.target.files[0])}
                                    className="hidden"
                                    id="free-trial-upload"
                                    disabled={isFreeTrialVideoUploading}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dynamic Guide Slots based on Sub-Category */}
                {formData?.guideCard?.subCategory && (
                    <div className="mb-8">
                        <h2 className="sm:text-2xl font-bold text-[#2F6288] text-xl mb-6">
                            {isEditing ? "Edit Guide Slots" : "Guide Slots"} <span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
                        </h2>
                        
                        {/* Online Slots */}
                        {(formData?.guideCard?.subCategory === "Online" || formData?.guideCard?.subCategory === "both") && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">Session Online Slots</h3>
                                <div className="space-y-4">
                                    {formData?.session?.onlineSlots && formData.session.onlineSlots.map((slot, i) => (
                                        <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-blue-50">
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold text-gray-700">Online Slot {i + 1}</p>
                                                {formData.session.onlineSlots.length > 1 && (
                                                    <button
                                                        onClick={() => removeSessionSlot("online", i)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            <label className="block text-md font-semibold text-gray-700 mb-2">Preferred Date</label>
                                            <input
                                                type="date"
                                                value={slot.date}
                                                onChange={(e) => handleOnlineSlotChange(i, "date", e.target.value)}
                                                className="sm:flex block w-full border border-gray-300 p-3 rounded-lg"
                                            />

                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-md font-semibold text-gray-700 mb-2">Start Time</label>
                                                    <input
                                                        type="time"
                                                        value={slot.startTime}
                                                        onChange={(e) => handleOnlineSlotChange(i, "startTime", e.target.value)}
                                                        className="text-sm w-full border border-gray-300 p-3 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-md font-semibold text-gray-700 mb-2">End Time</label>
                                                    <input
                                                        type="time"
                                                        value={slot.endTime}
                                                        onChange={(e) => handleOnlineSlotChange(i, "endTime", e.target.value)}
                                                        className="text-sm w-full border border-gray-300 p-3 rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={addOnlineSlot}
                                        className="text-sm w-full px-4 py-3 text-white rounded-lg transition-colors flex items-center justify-center gap-2 hover:opacity-90"
                                        style={{ backgroundColor: 'rgb(47, 98, 136)' }}
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Online Slot
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Offline Slots */}
                        {(formData?.guideCard?.subCategory === "Offline" || formData?.guideCard?.subCategory === "both") && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">Session Offline Slots</h3>
                                <div className="space-y-4">
                                    {formData?.guideCard?.subCategory && formData?.session?.offlineSlots?.map((slot, i) => (
                                        <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-green-50">
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold text-gray-700">Offline Slot {i + 1}</p>
                                                {formData?.session?.offlineSlots.length > 1 && (
                                                    <button
                                                        onClick={() => removeSessionSlot("offline", i)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            <label className="block text-md font-semibold text-gray-700 mb-2">Preferred Date</label>
                                            <input
                                                type="date"
                                                value={slot.date}
                                                onChange={(e) => handleSlotChange(i, "date", e.target.value)}
                                                className="sm:flex block w-full border border-gray-300 p-3 rounded-lg"
                                            />

                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-md font-semibold text-gray-700 mb-2">Start Time</label>
                                                    <input
                                                        type="time"
                                                        value={slot.startTime}
                                                        onChange={(e) => handleSlotChange("offline", "quarterly", i, "startTime", e.target.value)}
                                                        className="text-sm w-full border border-gray-300 p-3 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-md font-semibold text-gray-700 mb-2">End Time</label>
                                                    <input
                                                        type="time"
                                                        value={slot.endTime}
                                                        onChange={(e) => handleSlotChange("offline", "quarterly", i, "endTime", e.target.value)}
                                                        className="text-sm w-full border border-gray-300 p-3 rounded-lg"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-md font-semibold text-gray-700 mb-2">Location</label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter location for offline session"
                                                    value={slot.location}
                                                    onChange={(e) => handleSlotChange(i, "location", e.target.value)}
                                                    className="text-sm w-full border border-gray-300 p-3 rounded-lg"
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={addOfflineSlot}
                                        className="text-sm w-full px-4 py-3 text-white rounded-lg transition-colors flex items-center justify-center gap-2 hover:opacity-90"
                                        style={{ backgroundColor: 'rgb(47, 98, 136)' }}
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Offline Slot
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Save Button */}
                <div className="flex gap-4">
                    <button
                        onClick={onSaveRetreat}
                        className="text-sm flex p-4 bg-gradient-to-b from-[#C5703F] to-[#C16A00] text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                    >
                        {isEditing ? "Update Pilgrim Guide" : "Add Pilgrim Guide"}
                    </button>
                    {isEditing && (
                        <button
                            onClick={cancelEdit}
                            className="text-sm px-8 py-4 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>

                {/* Current Guides */}
                {allData && (
                    <div className="mt-8">
                        <h2 className="sm:text-2xl font-bold text-[#2F6288] text-xl mb-6">Current Guides</h2>
                        <DndProvider backend={HTML5Backend}>
                            <div className="space-y-3">
                                {slideData.map((slide, index) => (
                                    <SlideItem
                                        key={index}
                                        index={index}
                                        slide={slide}
                                        moveSlide={moveSlide}
                                        removeSlide={removeSlide}
                                        editSlide={editSlide}
                                        isLoading={isLoading}
                                    />
                                ))}
                            </div>
                        </DndProvider>
                    </div>
                )}

            </div>
        </div>
    );
}         
    