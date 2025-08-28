import { useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { X, Plus, Trash2, GripVertical, Edit2 } from "lucide-react";
import { storage } from "../../../services/firebase";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { deleteSlideByIndex, fetchGuideData, saveOrUpdateGuideData } from "../../../services/pilgrim_guide/guideService";
import { useDispatch, useSelector } from "react-redux";
import { setGuides } from "../../../features/pilgrim_guide/pilgrimGuideSlice";
import { showSuccess, showError } from "../../../utils/toast"

const ItemType = "SLIDE";

function SlideItem({ slide, index, moveSlide, removeSlide, editSlide }) {
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
                    <img src={slide?.thumbnail} alt="Slide Thumbnail" className="w-16 h-16 object-cover rounded mt-1" />
                    <div className="flex flex-col">
                        <p className="font-semibold text-gray-800">{slide?.title}</p>
                        <p className="text-sm text-gray-600">Link: /{slide?.title?.replace(/\s+/g, '-')}</p>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => editSlide(index)}
                    className="text-[#2F6288]0 hover:text-blue-700 p-1"
                    title="Edit Session Card"
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
            occupancy: "",
            showOccupancy: false,
            description: ""
        },
        online: {
            monthly: {
                price: "",
                discount: "",
                description: "",
                slots: []
            },
            quarterly: {
                price: "",
                discount: "",
                description: "",
                slots: []
            },
            oneTime: {
                price: "",
                description: "",
                slots: []
            }
        },
        offline: {
            monthly: {
                price: "",
                discount: "",
                description: "",
                slots: []
            },
            quarterly: {
                price: "",
                discount: "",
                description: "",
                slots: []
            },
            oneTime: {
                price: "",
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
                return {
                    ...prev,
                    [mode]: {
                        ...prev[mode],
                        [subscriptionType]: {
                            ...prev[mode][subscriptionType],
                            [field]: value,
                        },
                    },
                };
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
            if (!file.type.startsWith("image/")) {
                alert("Please upload an image file");
                return;
            }

            // Create a unique storage path for the file
            const filePath = `pilgrim_guides/thumbnails/${uuidv4()}_${file.name}`;
            const storageRef = ref(storage, filePath);

            // Upload file
            const snapshot = await uploadBytes(storageRef, file);
            console.log("File uploaded successfully:", snapshot.metadata.fullPath);

            // Get download URL
            const downloadURL = await getDownloadURL(storageRef);
            console.log("Download URL:", downloadURL);

            // Update formData with the file's download URL
            handleFieldChange("guideCard", "thumbnail", downloadURL);

        } catch (error) {
            console.error("Error uploading file:", error);
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
            ? { date: "", startTime: "", endTime: "" }
            : { date: "", startTime: "", endTime: "", location: "" };
            
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
            const updatedGuides = [...guides];

            let allSlides = updatedGuides.flatMap(g => g.slides);
            if (from < 0 || from >= allSlides.length || to < 0 || to >= allSlides.length) {
                console.warn("Invalid slide move indexes");
                return;
            }

            const [moved] = allSlides.splice(from, 1);
            allSlides.splice(to, 0, moved);

            setSlideData(allSlides);

            updatedGuides[0].slides = allSlides;
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

            // Update local states if you’re keeping them for form rendering
            setFormData((prev) => ({
                ...prev,
                slides: prev.slides?.filter((_, i) => i !== index) || []
            }));

            setSlideData((prev) => prev.filter((_, i) => i !== index));

            console.log("Slide removed locally and from Firestore");
        } catch (err) {
            console.error("Error removing slide:", err);
        }
    };

    const editSlide = (index) => {
        const slideToEdit = allData[index];
        console.log("Editing slide:", slideToEdit);

        // Update formData with the slide being edited
        setFormData((prev) => ({
            ...prev,
            guideCard: {
                title: slideToEdit?.guideCard?.title,
                category: slideToEdit?.guideCard?.category,
                subCategory: slideToEdit?.guideCard?.subCategory || "",
                price: slideToEdit?.guideCard?.price,
                thumbnail: slideToEdit?.guideCard?.thumbnail || null,
                occupancy: slideToEdit?.guideCard?.occupancy || "",
                showOccupancy: slideToEdit?.guideCard?.showOccupancy || false,
                description: slideToEdit?.guideCard?.description || ""
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
                    slots: slideToEdit?.online?.monthly?.slots || []
                },
                quarterly: {
                    price: slideToEdit?.online?.quarterly?.price || "",
                    discount: slideToEdit?.online?.quarterly?.discount || "",
                    slots: slideToEdit?.online?.quarterly?.slots || [],
                    description: slideToEdit?.online?.quarterly?.description || ""
                },
                oneTime: {
                    price: slideToEdit?.online?.oneTime?.price || "",
                    slots: slideToEdit?.online?.oneTime?.slots || [],
                }
            },
            offline: {
                monthly: {
                    price: slideToEdit?.offline?.monthly?.price || "",
                    discount: slideToEdit?.offline?.monthly?.discount || "",
                    slots: slideToEdit?.offline?.monthly?.slots || [],
                    description: slideToEdit?.offline?.monthly?.description || ""
                },
                quarterly: {
                    price: slideToEdit?.offline?.quarterly?.price || "",
                    discount: slideToEdit?.offline?.quarterly?.discount || "",
                    slots: slideToEdit?.offline?.quarterly?.slots || [],
                    description: slideToEdit?.offline?.quarterly?.description || ""
                },
                oneTime: {
                    price: slideToEdit?.offline?.oneTime?.price || "",
                    slots: slideToEdit?.offline?.oneTime?.slots || []
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
                occupancy: "",
                showOccupancy: false,
                description: ""
            },
            online: {
                monthly: {
                    price: "",
                    discount: "",
                    description: "",
                    slots: [{ date: "", startTime: "", endTime: "" }]
                },
                quarterly: {
                    price: "",  
                    discount: "",
                    description: "",
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
                    description: "",    
                    slots: [{ date: "", startTime: "", endTime: "" }]
                },
                quarterly: {
                    price: "",
                    discount: "",
                    description: "",
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
            guideSlots: [{ date: "", startTime: "", endTime: "" }]
        }));
    };

    const addNewCategory = () => {
        const newCategory = prompt("Enter new category name:");
        if (newCategory && !categories.includes(newCategory)) {
            setCategories(prev => [...prev, newCategory]);
        }
    };

    // const validateFields = () => {
    //     const newErrors = {};

    //     const isPriceValid = (value) => /^\d+(\.\d{1,2})?$/.test(value.trim());

    //     if (!formData.guideCard.title) newErrors.title = "Title is required";
    //     if (!formData.guideCard.category) newErrors.category = "Category required";
    //     if (!isPriceValid(formData.guideCard.price)) newErrors.guidePrice = "Invalid Price";

    //     // Validate nested subscription prices
    //     if (!isPriceValid(formData.online.monthly.price)) newErrors.monthlyOnlinePrice = "Invalid Monthly Online Price";
    //     if (formData.online.monthly.discount && isNaN(formData.online.monthly.discount))
    //         newErrors.monthlyOnlineDiscount = "Online Monthly Discount must be number";

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

        const newCard = {
            guideCard: { ...formData.guideCard },
            organizer: { ...formData.organizer },
            online: { ...formData.online },
            offline: { ...formData.offline },
            session: { ...formData.session },
            slides: [
                {
                    title: formData.guideCard.title,
                    thumbnail: formData.guideCard.thumbnail,
                }
            ]
        };

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
                    occupancy: "",
                    showOccupancy: false,
                    description: ""
                },
                online: {
                    monthly: {
                        price: "",
                        discount: "",
                        slots: [{ date: "", startTime: "", endTime: "" }]
                    },
                    quarterly: {
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
                    quarterly: {
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

            try {
                // Create unique path
                const filePath = `pilgrim_guides/session_images/${uuidv4()}_${file.name}`;
                const storageRef = ref(storage, filePath);

                // Upload file
                await uploadBytes(storageRef, file);

                // Get download URL
                const downloadURL = await getDownloadURL(storageRef);
                console.log(`Uploaded ${file.name} → ${downloadURL}`);

                // Append image URL to formData
                setFormData(prev => ({
                    ...prev,
                    session: {
                        ...prev.session,
                        images: [...prev.session.images, downloadURL]
                    }
                }));

            } catch (error) {
                console.error(`Error uploading ${file.name}:`, error);
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
                try {
                    const storageRef = ref(storage, `videos/${Date.now()}-${file.name}`);
                    await uploadBytes(storageRef, file);
                    const downloadURL = await getDownloadURL(storageRef);

                    setFormData(prev => ({
                        ...prev,
                        session: {
                            ...prev.session,
                            videos: [...prev.session.videos, downloadURL]
                        }
                    }));
                } catch (error) {
                    console.error("Error uploading video:", error);
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
            try {
                const storageRef = ref(storage, `freeTrialVideos/${Date.now()}-${file.name}`);
                await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(storageRef);

                handleFieldChange("session", "freeTrialVideo", downloadURL);
            } catch (error) {
                console.error("Error uploading free trial video:", error);
            }
        }
    };

    const handleFreeTrialDrop = async (e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        await handleFreeTrialVideoUpload(file);
    };

    return (
        <div className="min-h-screen bg-gray-50">
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

                    {/* Thumbnail */}
                    <div className="mb-6">
                        <h3 className="block text-md font-semibold text-gray-700 mb-2">Add Thumbnail</h3>
                        <div
                            className={`border-2 border-dashed h-40 rounded mb-4 flex items-center justify-center cursor-pointer transition-colors ${dragActive ? 'border-[#2F6288] bg-[#2F6288]/10' : 'border-gray-300 hover:bg-gray-50'
                                }`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => document.getElementById('thumbnail-upload').click()}
                        >
                            {formData?.guideCard?.thumbnail ? (
                                <div className="relative h-full flex items-center">
                                    <img
                                        src={formData?.guideCard?.thumbnail}
                                        alt="Thumbnail"
                                        className="h-full object-contain rounded"
                                    />
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
                            ) : (
                                <div className="text-center text-sm text-gray-500 flex flex-col items-center">
                                    <img src="/assets/admin/upload.svg" alt="Upload Icon" className="w-12 h-12 mb-2" />
                                    <p>{dragActive ? "Drop here..." : "Click to upload or drag and drop"}</p>
                                    <p className="text-gray-400">Size: (487×387)px</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e.target.files[0])}
                                className="hidden"
                                id="thumbnail-upload"
                            />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="mb-4">
                        <label className="block text-md font-semibold text-gray-700 mb-2">Title</label>
                        <input
                            placeholder="Enter Title"
                            value={formData.guideCard.title}
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

                    {/* Occupancy */}
                    <div className="mb-4">
                        <label
                            htmlFor="guide-session-date"
                            className="block text-md font-semibold text-gray-700 mb-2"
                        >
                            Occupany
                        </label>

                        <div className="flex items-center gap-3 mb-2">
                            <div className="relative w-full">
                                <input
                                    id="guide-session-date"
                                    type="text"
                                    value={formData?.guideCard?.occupancy}
                                    onChange={(e) =>
                                        handleFieldChange("guideCard", "occupancy", e.target.value)
                                    }
                                    className={`text-sm w-full border border-gray-300 p-3 rounded-lg pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer ${!formData?.guideCard?.occupancy ? 'text-transparent' : 'text-black'
                                        }`}
                                    aria-describedby="date-help-text"
                                />

                                {/* Custom placeholder text */}
                                {!formData?.guideCard?.occupancy && (
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none z-5">
                                        Single
                                    </span>
                                )}

                            </div>
                        </div>

                        <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input
                                type="checkbox"
                                checked={formData?.guideCard?.showOccupancy}
                                onChange={(e) =>
                                    handleFieldChange("guideCard", "showOccupancy", e.target.checked)
                                }
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                aria-describedby="show-occupancy-help"
                            />
                            <span id="show-occupancy-help">Check to display occupancy publicy</span>
                        </label>
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

                                <div>
                                    <label className="block text-md font-semibold text-gray-700 mb-2">Monthly Online Subscription Description</label>
                                    <textarea
                                        placeholder="Enter Description"
                                        value={formData.online.monthly.description}
                                        onChange={(e) => handleFieldChange(null, "description", e.target.value, "online", "monthly")}
                                        className="text-sm w-full border border-gray-300 p-3 rounded-lg  h-24 resize-none"
                                    />
                                </div>

                                {/* Monthly Online Slots */}
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Online Slots</h3>
                                    <div className="space-y-4">
                                        {formData?.online?.monthly?.slots?.length === 0 && initializeSlots("online", "monthly")}
                                        {formData?.online?.monthly?.slots && formData?.online?.monthly?.slots?.map((slot, i) => (
                                            <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-blue-50">
                                                <div className="flex justify-between items-center">
                                                    <p className="font-semibold text-gray-700">Online Slot {i + 1}</p>
                                                    {formData?.online?.monthly?.slots?.length > 1 && (
                                                        <button
                                                            onClick={() => removeSlot("online", "monthly", i)}
                                                            className="text-red-500 hover:text-red-700 p-1"
                                                            title="Remove Slot"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                                        <input
                                                            type="date"
                                                            value={slot?.date}
                                                            onChange={(e) => handleSlotChange("online", "monthly", i, "date", e.target.value)}
                                                            className="text-sm w-full border border-gray-300 p-2 rounded-lg"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                                        <input
                                                            type="time"
                                                            value={slot?.startTime}
                                                            onChange={(e) => handleSlotChange("online", "monthly", i, "startTime", e.target.value)}
                                                            className="text-sm w-full border border-gray-300 p-2 rounded-lg"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                                        <input
                                                            type="time"
                                                            value={slot?.endTime}
                                                            onChange={(e) => handleSlotChange("online", "monthly", i, "endTime", e.target.value)}
                                                            className="text-sm w-full border border-gray-300 p-2 rounded-lg"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => addSlot("online", "monthly")}
                                            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#2F6288] hover:text-[#2F6288] transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Online Slot
                                        </button>
                                    </div>
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

                                <div>
                                    <label className="block text-md font-semibold text-gray-700 mb-2">Monthly Offline Subscription Description</label>
                                    <textarea
                                        placeholder="Enter Description"
                                        value={formData.offline.monthly.description}
                                        onChange={(e) => handleFieldChange(null, "description", e.target.value, "offline", "monthly")}
                                        className="text-sm w-full border border-gray-300 p-3 rounded-lg  h-24 resize-none"
                                    />
                                </div>

                                {/* Monthly Offline Slots */}
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Offline Slots</h3>
                                    <div className="space-y-4">
                                        {formData?.offline?.monthly?.slots?.length === 0 && initializeSlots("offline", "monthly")}
                                        {formData?.offline?.monthly?.slots && formData?.offline?.monthly?.slots?.map((slot, i) => (
                                            <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-green-50">
                                                <div className="flex justify-between items-center">
                                                    <p className="font-semibold text-gray-700">Offline Slot {i + 1}</p>
                                                    {formData?.offline?.monthly?.slots?.length > 1 && (
                                                        <button
                                                            onClick={() => removeSlot("offline", "monthly", i)}
                                                            className="text-red-500 hover:text-red-700 p-1"
                                                            title="Remove Slot"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                                        <input
                                                            type="date"
                                                            value={slot.date}
                                                            onChange={(e) => handleSlotChange("offline", "monthly", i, "date", e.target.value)}
                                                            className="text-sm w-full border border-gray-300 p-2 rounded-lg"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                                        <input
                                                            type="time"
                                                            value={slot.startTime}
                                                            onChange={(e) => handleSlotChange("offline", "monthly", i, "startTime", e.target.value)}
                                                            className="text-sm w-full border border-gray-300 p-2 rounded-lg"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                                        <input
                                                            type="time"
                                                            value={slot.endTime}
                                                            onChange={(e) => handleSlotChange("offline", "monthly", i, "endTime", e.target.value)}
                                                            className="text-sm w-full border border-gray-300 p-2 rounded-lg"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Enter location"
                                                            value={slot.location}
                                                            onChange={(e) => handleSlotChange("offline", "monthly", i, "location", e.target.value)}
                                                            className="text-sm w-full border border-gray-300 p-2 rounded-lg"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => addSlot("offline", "monthly")}
                                            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#2F6288] hover:text-[#2F6288] transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Offline Slot
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </>
                )}

                {/* Quarterly Online Subscription */}
                {formData?.guideCard?.subCategory && (formData?.guideCard?.subCategory === "Online" || formData?.guideCard?.subCategory === "Both") && (
                    <div className="mb-8">
                        <h2 className="sm:text-2xl font-bold text-[#2F6288] text-xl mb-6">
                            {isEditing ? "Edit Quarterly Online Subscription" : "Quarterly Online Subscription"} <span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-md font-semibold text-gray-700 mb-2">Quarterly Online Subscription Price</label>
                                <input
                                    placeholder="Enter Price"
                                    type="number"
                                    value={formData?.online?.quarterly?.price}
                                    onChange={(e) => handleFieldChange(null, "price", e.target.value, "online", "quarterly")}
                                    className="text-sm w-full border border-gray-300 p-3 rounded-lg "
                                />
                                {errors?.quarterlyOnlinePrice && <p className="text-red-500 text-sm mt-1">{errors?.quarterlyOnlinePrice}</p>}
                            </div>

                            <div>
                                <label className="block text-md font-semibold text-gray-700 mb-2">Quarterly Online Subscription Discount</label>
                                <input
                                    type="number"
                                    placeholder="Enter Discount Percentage"
                                    value={formData?.online?.quarterly?.discount}
                                    onChange={(e) => handleFieldChange(null, "discount", e.target.value, "online", "quarterly")}
                                    className="text-sm w-full border border-gray-300 p-3 rounded-lg "
                                />
                                {errors?.quarterlyOnlineDiscount && <p className="text-red-500 text-sm mt-1">{errors?.quarterlyOnlineDiscount}</p>}
                            </div>

                            <div>
                                <label className="block text-md font-semibold text-gray-700 mb-2">Quarterly Online Subscription Description</label>
                                <textarea
                                    placeholder="Enter Description"
                                    value={formData?.online?.quarterly?.description}
                                    onChange={(e) => handleFieldChange(null, "description", e.target.value, "online", "quarterly")}
                                    className="text-sm w-full border border-gray-300 p-3 rounded-lg  h-24 resize-none"
                                />
                            </div>

                            {/* Quarterly Online Slots */}
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">Quarterly Online Slots</h3>
                                <div className="space-y-4">
                                    {formData?.online?.quarterly?.slots?.length === 0 && initializeSlots("online", "quarterly")}
                                    {formData?.online?.quarterly?.slots && formData?.online?.quarterly?.slots?.map((slot, i) => (
                                        <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-blue-50">
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold text-gray-700">Online Slot {i + 1}</p>
                                                {formData?.online?.quarterly?.slots?.length > 1 && (
                                                    <button
                                                        onClick={() => removeSlot("online", "quarterly", i)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                        title="Remove Slot"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                                    <input
                                                        type="date"
                                                        value={slot.date}
                                                        onChange={(e) => handleSlotChange("online", "quarterly", i, "date", e.target.value)}
                                                        className="text-sm w-full border border-gray-300 p-2 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                                    <input
                                                        type="time"
                                                        value={slot.startTime}
                                                        onChange={(e) => handleSlotChange("online", "quarterly", i, "startTime", e.target.value)}
                                                        className="text-sm w-full border border-gray-300 p-2 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                                    <input
                                                        type="time"
                                                        value={slot.endTime}
                                                        onChange={(e) => handleSlotChange("online", "quarterly", i, "endTime", e.target.value)}
                                                        className="text-sm w-full border border-gray-300 p-2 rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addSlot("online", "quarterly")}
                                        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#2F6288] hover:text-[#2F6288] transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Online Slot
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quarterly Offline Subscription */}
                {formData.guideCard.subCategory && (formData.guideCard.subCategory === "Offline" || formData.guideCard.subCategory === "Both") && (
                    <div className="mb-8">
                        <h2 className="sm:text-2xl font-bold text-[#2F6288] text-xl mb-6">
                            {isEditing ? "Edit Quarterly Offline Subscription" : "Quarterly Offline Subscription"} <span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-md font-semibold text-gray-700 mb-2">Quarterly Offline Subscription Price</label>
                                <input
                                    placeholder="Enter Price"
                                    type="number"
                                    value={formData.offline.quarterly.price}
                                    onChange={(e) => handleFieldChange(null, "price", e.target.value, "offline", "quarterly")}
                                    className="text-sm w-full border border-gray-300 p-3 rounded-lg "
                                />
                                {errors.quarterlyOfflinePrice && <p className="text-red-500 text-sm mt-1">{errors.quarterlyOfflinePrice}</p>}
                            </div>

                            <div>
                                <label className="block text-md font-semibold text-gray-700 mb-2">Quarterly Offline Subscription Discount</label>
                                <input
                                    type="number"
                                    placeholder="Enter Discount Percentage"
                                    value={formData.offline.quarterly.discount}
                                    onChange={(e) => handleFieldChange(null, "discount", e.target.value, "offline", "quarterly")}
                                    className="text-sm w-full border border-gray-300 p-3 rounded-lg "
                                />
                                {errors.quarterlyOfflineDiscount && <p className="text-red-500 text-sm mt-1">{errors.quarterlyOfflineDiscount}</p>}
                            </div>

                            <div>
                                <label className="block text-md font-semibold text-gray-700 mb-2">Quarterly Offline Subscription Description</label>
                                <textarea
                                    placeholder="Enter Description"
                                    value={formData.offline.quarterly.description}
                                    onChange={(e) => handleFieldChange(null, "description", e.target.value, "offline", "quarterly")}
                                    className="text-sm w-full border border-gray-300 p-3 rounded-lg  h-24 resize-none"
                                />
                            </div>

                            {/* Quarterly Offline Slots */}
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">Quarterly Offline Slots</h3>
                                <div className="space-y-4">
                                    {formData.offline.quarterly.slots.length === 0 && initializeSlots("offline", "quarterly")}
                                    {formData.offline.quarterly.slots.map((slot, i) => (
                                        <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-green-50">
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold text-gray-700">Offline Slot {i + 1}</p>
                                                {formData.offline.quarterly.slots.length > 1 && (
                                                    <button
                                                        onClick={() => removeSlot("offline", "quarterly", i)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                        title="Remove Slot"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                                    <input
                                                        type="date"
                                                        value={slot.date}
                                                        onChange={(e) => handleSlotChange("offline", "quarterly", i, "date", e.target.value)}
                                                        className="text-sm w-full border border-gray-300 p-2 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                                    <input
                                                        type="time"
                                                        value={slot.startTime}
                                                        onChange={(e) => handleSlotChange("offline", "quarterly", i, "startTime", e.target.value)}
                                                        className="text-sm w-full border border-gray-300 p-2 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                                    <input
                                                        type="time"
                                                        value={slot.endTime}
                                                        onChange={(e) => handleSlotChange("offline", "quarterly", i, "endTime", e.target.value)}
                                                        className="text-sm w-full border border-gray-300 p-2 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter location"
                                                        value={slot.location}
                                                        onChange={(e) => handleSlotChange("offline", "quarterly", i, "location", e.target.value)}
                                                        className="text-sm w-full border border-gray-300 p-2 rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={addOfflineSlot}
                                        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#2F6288] hover:text-[#2F6288] transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Offline Slot
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
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

                            {/* One-Time Online Slots */}
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">One-Time Online Slots</h3>
                                <div className="space-y-4">
                                    {formData?.online?.oneTime?.slots?.length === 0 && initializeSlots("online", "oneTime")}
                                    {formData?.online?.oneTime?.slots && formData?.online?.oneTime?.slots.map((slot, i) => (
                                        <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-blue-50">
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold text-gray-700">Online Slot {i + 1}</p>
                                                {formData?.online?.oneTime?.slots && formData?.online?.oneTime?.slots.length > 1 && (
                                                    <button
                                                        onClick={() => removeSlot("online", "oneTime", i)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                        title="Remove Slot"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                                    <input
                                                        type="date"
                                                        value={slot?.date}
                                                        onChange={(e) => handleSlotChange("online", "oneTime", i, "date", e.target.value)}
                                                        className="text-sm w-full border border-gray-300 p-2 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                                    <input
                                                        type="time"
                                                        value={slot?.startTime}
                                                        onChange={(e) => handleSlotChange("online", "oneTime", i, "startTime", e.target.value)}
                                                        className="text-sm w-full border border-gray-300 p-2 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                                    <input
                                                        type="time"
                                                        value={slot?.endTime}
                                                        onChange={(e) => handleSlotChange("online", "oneTime", i, "endTime", e.target.value)}
                                                        className="text-sm w-full border border-gray-300 p-2 rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addSlot("online", "oneTime")}
                                        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#2F6288] hover:text-[#2F6288] transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Online Slot
                                    </button>
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

                            {/* One-Time Offline Slots */}
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">One-Time Offline Slots</h3>
                                <div className="space-y-4">
                                    {formData?.offline?.oneTime?.slots?.length === 0 && initializeSlots("offline", "oneTime")}
                                    {formData?.offline?.oneTime?.slots && formData?.offline?.oneTime?.slots.map((slot, i) => (
                                        <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-green-50">
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold text-gray-700">Offline Slot {i + 1}</p>
                                                {formData?.offline?.oneTime?.slots?.length > 1 && (
                                                    <button
                                                        onClick={() => removeSlot("offline", "oneTime", i)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                        title="Remove Slot"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                                    <input
                                                        type="date"
                                                        value={slot?.date}
                                                        onChange={(e) => handleSlotChange("offline", "oneTime", i, "date", e.target.value)}
                                                        className="text-sm w-full border border-gray-300 p-2 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                                    <input
                                                        type="time"
                                                        value={slot?.startTime}
                                                        onChange={(e) => handleSlotChange("offline", "oneTime", i, "startTime", e.target.value)}
                                                        className="text-sm w-full border border-gray-300 p-2 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                                    <input
                                                        type="time"
                                                        value={slot?.endTime}
                                                        onChange={(e) => handleSlotChange("offline", "oneTime", i, "endTime", e.target.value)}
                                                        className="text-sm w-full border border-gray-300 p-2 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter location"
                                                        value={slot?.location}
                                                        onChange={(e) => handleSlotChange("offline", "oneTime", i, "location", e.target.value)}
                                                        className="text-sm w-full border border-gray-300 p-2 rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={addOfflineSlot}
                                        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#2F6288] hover:text-[#2F6288] transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Offline Slot
                                    </button>
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

                    <label className="block font-semibold mb-2">Add Images ( Maximum 11 Images )</label>
                    <div className="mb-6">
                        {formData?.session?.images && formData?.session?.images?.length < 11 && (
                            <label className="w-56 h-40 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50">
                                <img src="/assets/admin/upload.svg" alt="Upload Icon" className="w-10 h-10 mb-2" />
                                <span>Click to upload image<br />Size: (610 X 515)px</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                        )}
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
                                />
                            </label>
                        )}
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

                    <div className="mb-6 space-y-4">
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

                        <div>
                            <label className="block text-md font-semibold text-gray-700 mb-2">Description</label>
                            <textarea
                                placeholder="Enter Description"
                                value={formData?.session?.description}
                                onChange={(e) => handleFieldChange("session", "description", e.target.value)}
                                className="text-sm w-full border border-gray-300 p-3 rounded-lg  h-24 resize-none"
                            />
                        </div>

                        <div>
                            <h3 className="block text-md font-semibold text-gray-700 mb-2">Free Trial Video Upload</h3>
                            <div
                                className={`border-2 border-dashed h-40 rounded mb-4 flex items-center justify-center cursor-pointer transition-colors ${dragActive ? 'border-[#2F6288] bg-[#2F6288]/10' : 'border-gray-300 hover:bg-gray-50'
                                    }`}
                                onDrop={handleFreeTrialDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => document.getElementById('free-trial-upload').click()}
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