import { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { MdDragIndicator } from "react-icons/md";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import { useDrag, useDrop } from "react-dnd";
import { useDropzone } from "react-dropzone";
import { Plus } from "lucide-react"
import { deleteEventItem, fetchEventData, saveOrUpdateEventData } from "../../../services/upcoming_events/eventService";
import { setEvents, removeEvent } from "../../../features/upcoming_events/eventSlice";
import { useDispatch } from "react-redux";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../services/firebase"
import { showError, showSuccess } from "../../../utils/toast";

const ItemType = "EVENTS";

function SlideItem({ slide, index, moveSlide, onEdit, onDelete, onToggle }) {
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
        <div
            ref={(node) => drag(ref(node))}
            className="flex items-center justify-between p-3 rounded-lg shadow bg-white mb-2 border"
        >
            <div className="flex items-center gap-3">
                <MdDragIndicator className="text-gray-400 cursor-move" />
                <img src={slide?.image} alt="thumb" className="h-12 w-12 rounded object-cover" />
                <div>
                    <p className="font-semibold">{slide?.title}</p>
                    <p className="text-sm text-gray-500">Link: {slide?.link}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => onToggle(index)}
                    className={`text-xs px-3 py-1 rounded font-semibold cursor-pointer 
                        ${slide?.active ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                >
                    {slide?.active ? "Active" : "Inactive"}
                </button>
                <button onClick={() => onEdit(index)} className="text-blue-600"><FaEdit /></button>
                <button onClick={() => onDelete(index)} className="text-gray-600"><FaTrash /></button>
            </div>
        </div>
    );
}

export default function UpcomingEvents() {

    const [formData, setFormData] = useState({
        upcomingSessionCard: {
            title: "",
            image: null,
            location: "",
            price: "",
            category: "",
            categories: []
        },
        monthlySubscription: {
            price: "",
            discount: "",
            description: ""
        },
        oneTimePurchase: {
            price: ""
        },
        programSchedule: [],  // This will now be populated with objects that have title, description, and points array
        eventDescription: [],
        faqs: [],
        meetGuide: {
            title: "",
            description: "",
            image: null
        }
    });
    const dispatch = useDispatch();

    // Current items in the list
    const [items, setItems] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFieldChange = (section, field, value) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    // Upcoming Session Card
    const { getRootProps: getCardImageRootProps,
        getInputProps: getCardImageInputProps,
        isDragActive: isCardDragActive
    } = useDropzone({
        onDrop: (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (file) {
                try {
                    const storageRef = ref(storage, `upcomingEvents/${file.name}_${Date.now()}`);
                    const uploadTask = uploadBytesResumable(storageRef, file);

                    uploadTask.on(
                        "state_changed",
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            console.log("Upload is " + progress + "% done");
                        },
                        (error) => {
                            console.error("Upload failed:", error);
                        },
                        async () => {
                            // Upload complete
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            handleFieldChange("upcomingSessionCard", "image", downloadURL);
                        }
                    );
                } catch (err) {
                    console.error("Error uploading file:", err);
                }
            }
        },
    });

    const handleCategorySelect = (cat) => {
        handleFieldChange("upcomingSessionCard", "category", cat);
    };

    const addNewCategory = () => {
        const newCategory = prompt("Enter new category name:");
        if (newCategory && !formData.upcomingSessionCard.categories.includes(newCategory)) {
            setFormData(prev => ({
                ...prev,
                upcomingSessionCard: {
                    ...prev.upcomingSessionCard,
                    categories: [...prev.upcomingSessionCard.categories, newCategory]
                }
            }));
        }
    };

    // Program Schedule Functions
    const addProgram = () => {
        setFormData((prev) => ({
            ...prev,
            programSchedule: [...prev.programSchedule, {
                title: "",
                points: [{ title: "", subpoints: [] }]
            }],
        }));
    };

    const handleProgramChange = (index, field, value) => {
        const updated = [...formData.programSchedule];
        updated[index][field] = value;
        setFormData((prev) => ({ ...prev, programSchedule: updated }));
    };

    const handleProgramPointChange = (programIndex, pointIndex, value) => {
        const updated = [...formData.programSchedule];
        updated[programIndex].points[pointIndex].title = value;
        setFormData((prev) => ({ ...prev, programSchedule: updated }));
    };

    const handleProgramSubPointChange = (programIndex, pointIndex, subIndex, value) => {
        const updated = [...formData.programSchedule];
        updated[programIndex].points[pointIndex].subpoints[subIndex] = value;
        setFormData((prev) => ({ ...prev, programSchedule: updated }));
    };

    const addProgramPoint = (programIndex) => {
        const updated = [...formData.programSchedule];
        updated[programIndex].points.push({ title: "", subpoints: [] });
        setFormData((prev) => ({ ...prev, programSchedule: updated }));
    };

    const removeProgramPoint = (programIndex, pointIndex) => {
        const updated = [...formData.programSchedule];
        updated[programIndex].points.splice(pointIndex, 1);
        setFormData((prev) => ({ ...prev, programSchedule: updated }));
    };

    const addProgramSubPoint = (programIndex, pointIndex) => {
        const updated = [...formData.programSchedule];
        updated[programIndex].points[pointIndex].subpoints.push("");
        setFormData((prev) => ({ ...prev, programSchedule: updated }));
    };

    const removeProgramSubPoint = (programIndex, pointIndex, subIndex) => {
        const updated = [...formData.programSchedule];
        updated[programIndex].points[pointIndex].subpoints.splice(subIndex, 1);
        setFormData((prev) => ({ ...prev, programSchedule: updated }));
    };

    const removeProgram = (index) => {
        const updated = [...formData.programSchedule];
        updated.splice(index, 1);
        setFormData((prev) => ({ ...prev, programSchedule: updated }));
    };

    // Event Description Functions
    const addDescriptionPoint = () => {
        setFormData((prev) => ({
            ...prev,
            eventDescription: [...prev.eventDescription, { id: Date.now(), title: "", subpoints: [""] }]
        }));
    };

    const handlePointTitleChange = (index, value) => {
        const updated = [...formData.eventDescription];
        updated[index].title = value;
        setFormData((prev) => ({ ...prev, eventDescription: updated }));
    };

    const handleSubPointChange = (pointIndex, subIndex, value) => {
        const updated = [...formData.eventDescription];
        updated[pointIndex].subpoints[subIndex] = value;
        setFormData((prev) => ({ ...prev, eventDescription: updated }));
    };

    const addSubPoint = (index) => {
        const updated = [...formData.eventDescription];
        updated[index].subpoints.push("");
        setFormData((prev) => ({ ...prev, eventDescription: updated }));
    };

    const removeDescriptionPoint = (index) => {
        const updated = [...formData.eventDescription];
        updated.splice(index, 1);
        setFormData((prev) => ({ ...prev, eventDescription: updated }));
    };

    const removeSubPoint = (pointIndex, subIndex) => {
        const updated = [...formData.eventDescription];
        updated[pointIndex].subpoints.splice(subIndex, 1);
        setFormData((prev) => ({ ...prev, eventDescription: updated }));
    };

    // FAQ Functions - Updated to match RecordedSessionForm.jsx functionality
    const handleFaqChange = (index, field, value) => {
        const updated = [...formData.faqs];
        updated[index][field] = value;
        setFormData((prev) => ({ ...prev, faqs: updated }));
    };

    const addFaq = () => {
        setFormData((prev) => ({
            ...prev,
            faqs: [...prev.faqs, { title: "", description: "" }],
        }));
    };

    const removeFaq = (index) => {
        const updated = [...formData.faqs];
        updated.splice(index, 1);
        setFormData((prev) => ({ ...prev, faqs: updated }));
    };

    // Guide Image Functions
    const handleGuideImageChange = (file) => {
        if (!file) return;

        const storageRef = ref(storage, `upcomingEvents/meetGuide/${file.name}_${Date.now()}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                // Optional: track progress
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload is ${progress}% done`);
            },
            (error) => {
                console.error("Upload failed:", error);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                handleFieldChange("meetGuide", "image", downloadURL);
            }
        );
    };

    // List Functions - Improved following RetreatsForm pattern
    const addItem = (form) => {
        const formArray = Array.isArray(form) ? form : [form];

        // Dig inside each object, then inside its numbered key
        const titles = formArray.flatMap(item =>
            Object.values(item).map(inner => inner?.upcomingSessionCard?.title).filter(Boolean)
        );

        const images = formArray.flatMap(item =>
            Object.values(item).map(inner => inner?.upcomingSessionCard?.image).filter(Boolean)
        );

        console.log("formArray: ", formArray[0]);

        // Get the UID keys from formArray[0]
        const uidKeys = Object.keys(formArray[0]);
        
        for (let i = 0; i < titles.length; i++) {
            const uidKey = uidKeys[i];
            const eventData = formArray[0][uidKey];
            
            const newItem = {
                id: uidKey, // Use the actual UID as the ID
                type: 'event',
                active: true,
                title: titles[i] || 'Event',
                image: images[i] || '',
                link: (titles[i] || '').replace(/\s+/g, '-'),
                data: eventData // Use the actual event data from the UID key
            };
            setItems(prevItems => [...prevItems, newItem]);
        }
    };

    const addItem2 = (formData) => {
        const newItem = {
            id: formData.id || Date.now() + Math.random(),
            type: 'event',
            active: true,
            title: formData?.upcomingSessionCard?.title || 'Event',
            image: formData?.upcomingSessionCard?.image || '',
            link: (formData?.upcomingSessionCard?.title || '').replace(/\s+/g, '-'),
            data: formData
        };

        setItems(prevItems => [...prevItems, newItem]);
    };

    const updateItem = (index) => {
        const updatedItems = [...items];
        const updatedItem = {
            ...items[index],
            title: formData?.upcomingSessionCard?.title || items[index].title || "",
            image: formData?.upcomingSessionCard?.image || items[index].image || "",
            link: (formData?.upcomingSessionCard?.title || items[index].title || "").replace(/\s+/g, '-'),
        };

        // Update local items array
        updatedItems[index] = updatedItem;
        setItems(updatedItems);

        updatedItem.data = formData;

        setEditingIndex(null);
    };

    const editItem = (index) => {
        const item = items[index];
        console.log("item: ", item);
        // Load the form data from the item's data property
        setFormData(item?.data || {});
        setEditingIndex(index + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const deleteItem = async (index) => {
        const itemToDelete = items[index];
        const eventId = itemToDelete.id;

        try {
            // Create new array without the deleted item
            const updatedItems = items.filter((_, i) => i !== index);

            // Update state immediately
            setItems(updatedItems);

            // Update backend
            await deleteEventItem(uid, eventId);

            // Update Redux state
            dispatch(removeEvent(eventId));

            showSuccess("Event deleted successfully!");
        } catch (error) {
            console.error("Error deleting event:", error);
            showError("Failed to delete event");
        }
    };

    const toggleItem = (index) => {
        const newItems = [...items];
        newItems[index].active = !newItems[index].active;
        setItems(newItems);
    };

    const moveItem = (from, to) => {
        const updated = [...items];
        const [moved] = updated.splice(from, 1);
        updated.splice(to, 0, moved);
        setItems(updated);
    };

    const resetForm = () => {
        setFormData({
            upcomingSessionCard: {
                title: "",
                image: null,
                location: "",
                price: "",
                category: "",
                categories: []
            },
            monthlySubscription: {
                price: "",
                discount: "",
                description: ""
            },
            oneTimePurchase: {
                price: ""
            },
            programSchedule: [],
            eventDescription: [],
            faqs: [],
            meetGuide: {
                title: "",
                description: "",
                image: null
            }
        });
    };

    const uid = "user-uid";

    useEffect(() => {
        const loadEvents = async () => {
            try {
                setLoading(true);
                const events = await fetchEventData(uid);
                console.log("events: ", events);
                if (events !== null) {
                    addItem(events);
                }
            } catch (err) {
                console.error("Error fetching event cards:", err);
                showError("Failed to load events");
            } finally {
                setLoading(false);
            }
        };

        loadEvents();
    }, [uid, dispatch]);

    const handleSubmitEventCard = async () => {
        try {
            setLoading(true);
            if (editingIndex !== null) {
                // Update the existing event
                const eventId = items[editingIndex - 1]?.id;
                if (eventId) {
                    await saveOrUpdateEventData(uid, eventId, formData);
                    dispatch(setEvents({ id: eventId, data: formData }));
                    updateItem(editingIndex - 1);
                    showSuccess("Event updated successfully!");
                    resetForm();
                    setEditingIndex(null);
                }
            } else {
                // Create a new event
                const result = await saveOrUpdateEventData(uid, 'new', formData);
                if (result.success) {
                    const newEventData = { ...formData, id: result.id };
                    dispatch(setEvents({ id: result.id, data: newEventData }));
                    resetForm();
                    addItem2(newEventData);
                    showSuccess("Event saved successfully!");
                }
            }

        } catch (error) {
            console.error(`Failed to save Event, please try again. ${error.message}`);
            showError(`Failed to save Event: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Header Section */}
            {editingIndex !== null && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mx-8 mt-4">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                <strong>Edit Mode:</strong> You are currently editing an existing event. 
                                Make your changes and click "Update Event Card" to save, or "Cancel Edit" to discard changes.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Upcoming Event Card */}
            <div className="md:p-8 px-4 py-0 mx-auto">
                <h2 className="sm:text-2xl font-bold text-[#2F6288] text-xl mb-0">
                    {editingIndex !== null ? 'Edit Event Card' : 'Upcoming Event Card'}
                    <span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
                </h2>

                {/* Image Upload */}
                <div className="mb-4">
                    <h3 className="block text-md font-semibold text-gray-700 mb-2">Add Thumbnail</h3>
                    <div
                        {...getCardImageRootProps()}
                        className="border-2 border-dashed border-gray-300 h-52 w-full rounded-md flex items-center
                        justify-center cursor-pointer text-center text-sm text-gray-500"
                    >
                        <input {...getCardImageInputProps()} />
                        {formData?.upcomingSessionCard?.image ? (
                            <img
                                src={formData.upcomingSessionCard.image}
                                alt="Uploaded"
                                className="h-full object-contain rounded-md"
                            />
                        ) : (
                            <div className="text-center text-gray-500 flex flex-col items-center">
                                <img src="/assets/admin/upload.svg" alt="Upload Icon" className="w-12 h-12 mb-2" />
                                <p>{isCardDragActive ? "Drop here..." : "Click to upload or drag and drop"}</p>
                                <p>Size: (1126×826)px</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Title */}
                <h3 className="block text-md font-semibold text-gray-700 mb-2">Title</h3>
                <input
                    type="text"
                    placeholder="Enter Title"
                    value={formData?.upcomingSessionCard?.title}
                    onChange={(e) => handleFieldChange("upcomingSessionCard", "title", e.target.value)}
                    className="text-sm w-full border p-3 rounded-lg mb-3"
                />

                {/* Location */}
                <h3 className="block text-md font-semibold text-gray-700 mb-2">Location</h3>
                <input
                    type="text"
                    placeholder="Enter Location"
                    value={formData?.upcomingSessionCard?.location}
                    onChange={(e) => handleFieldChange("upcomingSessionCard", "location", e.target.value)}
                    className="text-sm w-full border p-3 rounded-lg mb-3"
                />

                {/* Category Selection - Updated to match LiveSessions.jsx */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Category</label>
                    <div className="flex flex-wrap gap-3 mb-3">
                        {[...(formData && formData.upcomingSessionCard && Array.isArray(formData.upcomingSessionCard.categories) ? formData.upcomingSessionCard.categories : []), "Cultural and Heritage immersion", "Spiritual and wellness immersion"]
                            .filter((cat, index, arr) => arr.indexOf(cat) === index) // remove duplicates
                            .map((cat, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleCategorySelect(cat)}
                                    className={`px-4 py-2 rounded-full border transition-colors 
                                        ${formData?.upcomingSessionCard?.category === cat
                                            ? 'bg-[#2F6288] text-white border-[#2F6288]'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-[#2F6288]'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))
                        }
                        <button
                            type="button"
                            onClick={addNewCategory}
                            className="px-4 py-2 rounded-full border border-gray-300 text-[#2F6288]
                            hover:bg-[#2F6288] hover:text-white flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add New Category
                        </button>
                    </div>
                </div>

                {/* Price */}
                <h3 className="block text-md font-semibold text-gray-700 mb-2">Price</h3>
                <input
                    type="number"
                    placeholder="Enter Price"
                    value={formData?.upcomingSessionCard?.price}
                    onChange={(e) => handleFieldChange("upcomingSessionCard", "price", e.target.value)}
                    className="text-sm w-full border p-3 rounded-lg mb-3"
                />

                {/* Monthly Subscription */}
                <div className="my-10">
                    <h2 className="sm:text-2xl font-bold text-[#2F6288] text-xl mb-0">
                        Monthly Subscription
                        <span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
                    </h2>
                    <div className=" space-y-4 gap-4">
                        <div>
                            <h3 className="block text-md font-semibold text-gray-700 mb-2">Subscription Price</h3>
                            <input
                                type="number"
                                placeholder="Enter monthly price"
                                value={formData?.monthlySubscription?.price}
                                onChange={(e) => handleFieldChange("monthlySubscription", "price", e.target.value)}
                                className="text-sm w-full border p-3 rounded-lg"
                            />
                        </div>
                        <div>
                            <h3 className="block text-md font-semibold text-gray-700 mb-2">Discount (%)</h3>
                            <input
                                type="number"
                                placeholder="Enter discount %"
                                value={formData?.monthlySubscription?.discount}
                                onChange={(e) => handleFieldChange("monthlySubscription", "discount", e.target.value)}
                                className="text-sm w-full border p-3 rounded-lg"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <h3 className="block text-md font-semibold text-gray-700 mb-2">Description</h3>
                            <textarea
                                rows="3"
                                placeholder="Enter subscription benefits (one per line)"
                                value={formData?.monthlySubscription?.description}
                                onChange={(e) => handleFieldChange("monthlySubscription", "description", e.target.value)}
                                className="text-sm w-full border p-3 rounded-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* One Time Purchase */}
                <div className="mt-10">
                    <h2 className="sm:text-2xl font-bold text-[#2F6288] text-xl mb-0">
                        One Time Purchase
                        <span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
                    </h2>
                    <div>
                        <h3 className="block text-md font-semibold text-gray-700 mb-2">Price</h3>
                        <input
                            type="number"
                            placeholder="Enter one-time price"
                            value={formData?.oneTimePurchase?.price}
                            onChange={(e) => handleFieldChange("oneTimePurchase", "price", e.target.value)}
                            className="text-sm w-full border p-3 rounded-lg"
                        />
                    </div>
                </div>
            </div>

            {/* Program Schedule */}
            <div className="md:p-8 px-4 py-0 mx-auto">
                <h2 className="sm:text-2xl font-bold text-[#2F6288] text-xl mb-6">
                    Program Schedule
                    <span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
                </h2>

                <div className="space-y-6">
                    {formData?.programSchedule && formData?.programSchedule.map((program, programIndex) => (
                        <div key={programIndex} className="p-6 bg-gray-50 rounded-lg border border-gray-200 relative">
                            <button
                                onClick={() => removeProgram(programIndex)}
                                className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-1"
                                title="Delete Program"
                            >
                                <FaTrash className="w-4 h-4" />
                            </button>

                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Day {programIndex + 1} Title</label>
                                <input
                                    type="text"
                                    value={program?.title}
                                    placeholder="Enter title"
                                    onChange={(e) => handleProgramChange(programIndex, "title", e.target.value)}
                                    className="w-full border border-gray-300 p-3 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description Points</label>

                                {program?.points && program?.points.map((point, pointIndex) => (
                                    <div key={pointIndex} className="mb-4 relative">
                                        {/* Points */}
                                        <div className="mb-3">
                                            <label className="block text-sm text-gray-700 mb-2">Point {pointIndex + 1} Title</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={point?.title}
                                                    placeholder={`Point ${pointIndex + 1}`}
                                                    onChange={(e) => handleProgramPointChange(programIndex, pointIndex, e.target.value)}
                                                    className="w-full border border-gray-300 p-3 rounded-lg"
                                                />

                                                {program?.points.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeProgramPoint(programIndex, pointIndex)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <FaTrash className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Sub Points Section */}
                                        <div>
                                            <div className="flex flex-col items-start justify-between">
                                                <label className="block text-sm text-gray-700 mb-2">Sub Points (Optional)</label>
                                            </div>

                                            {point?.subpoints && point?.subpoints.length > 0 && (
                                                <div className="space-y-3 mb-3">
                                                    {point.subpoints.map((subpoint, subIndex) => (
                                                        <div key={subIndex} className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={subpoint}
                                                                placeholder={`Sub Point ${subIndex + 1}`}
                                                                onChange={(e) => handleProgramSubPointChange(programIndex, pointIndex, subIndex, e.target.value)}
                                                                className="w-full border border-gray-300 p-3 rounded-lg"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeProgramSubPoint(programIndex, pointIndex, subIndex)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <FaTimes className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => addProgramSubPoint(programIndex, pointIndex)}
                                                className="w-full px-4 py-3 bg-[#2F6288] text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                                            >
                                                <FaPlus className="w-3 h-3" /> Add Sub Point
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => addProgramPoint(programIndex)}
                                    className="w-full px-4 py-3 bg-[#2F6288] text-white rounded-lg 
                                    transition-colors flex items-center justify-center gap-2"
                                >
                                    <FaPlus className="w-3 h-3" /> Add Point
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={addProgram}
                        className="w-full px-4 py-3 bg-[#2F6288] text-white rounded-lg transition-colors 
                        flex items-center justify-center gap-2"
                    >
                        <FaPlus className="w-5 h-5" />
                        Add Program Day
                    </button>
                </div>
            </div>

            {/* Event Description */}
            <div className="md:p-8 px-4 py-0 mx-auto">
                <h2 className="sm:text-2xl font-bold text-[#2F6288] text-xl mb-6">
                    Event Description<span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
                </h2>

                <div className="space-y-6">
                    {formData?.eventDescription && formData?.eventDescription.map((point, index) => (
                        <div key={index} className="p-6 bg-gray-50 rounded-lg border border-gray-200 relative">
                            <button
                                onClick={() => removeDescriptionPoint(index)}
                                className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-1"
                                title="Delete Description Point"
                            >
                                <FaTrash className="w-4 h-4" />
                            </button>

                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Point {index + 1} Title</label>
                                <input
                                    type="text"
                                    value={point?.title}
                                    placeholder="Enter title"
                                    onChange={(e) => handlePointTitleChange(index, e.target.value)}
                                    className="w-full border border-gray-300 p-3 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Sub Points</label>
                                {point?.subpoints.map((subpoint, subIndex) => (
                                    <div key={subIndex} className="flex items-center gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={subpoint}
                                            placeholder={`Sub Point ${subIndex + 1}`}
                                            onChange={(e) => handleSubPointChange(index, subIndex, e.target.value)}
                                            className="w-full border border-gray-300 p-3 rounded-lg"
                                        />
                                        {point.subpoints.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeSubPoint(index, subIndex)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <FaTimes className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => addSubPoint(index)}
                                    className="mt-3 flex items-center gap-1 text-sm text-[#2F6288] font-semibold hover:underline"
                                >
                                    <FaPlus className="w-3 h-3" /> Add Sub Point
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={addDescriptionPoint}
                        className="w-full px-4 py-3 bg-[#2F6288] text-white rounded-lg transition-colors 
                        flex items-center justify-center gap-2"
                    >
                        <FaPlus className="w-5 h-5" />
                        Add Description Point
                    </button>
                </div>
            </div>

            {/* FAQs */}
            <div className="md:p-8 px-4 py-0 mx-auto">
                <h2 className="text-2xl font-bold text-[#2F6288] mb-6">
                    {editingIndex !== null ? "Edit FAQS" : "FAQS"}
                </h2>
                <div className="relative space-y-4">
                    {formData?.faqs && formData?.faqs.map((faq, i) => (
                        <div key={i} className="space-y-4">
                            <div className="absolute right-0 justify-between items-center">
                                {formData?.faqs.length > 1 && (
                                    <button
                                        onClick={() => removeFaq(i)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                    >
                                        <FaTrash className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">FAQ Title</label>
                                <input
                                    placeholder="Enter FAQ Title"
                                    value={faq?.title}
                                    onChange={(e) => handleFaqChange(i, "title", e.target.value)}
                                    className="w-full border border-gray-300 p-3 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <textarea
                                    rows={4}
                                    placeholder="Enter FAQ Description"
                                    value={faq?.description}
                                    onChange={(e) => handleFaqChange(i, "description", e.target.value)}
                                    className="w-full border border-gray-300 p-3 rounded-lg"
                                />
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={addFaq}
                        className="w-full px-4 py-3 bg-[#2F6288] text-white rounded-lg transition-colors 
                        flex items-center justify-center gap-2"
                    >
                        <FaPlus className="w-5 h-5" />
                        Add New FAQ
                    </button>
                </div>
            </div>

            {/* Meet Guide */}
            <div className="md:p-8 p-4 mx-auto">
                <h2 className="sm:text-2xl font-bold text-[#2F6288] text-xl mb-6">
                    Meet Your Pilgrim Guide
                    <span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
                </h2>

                <div className="mb-6 pt-4 relative">
                    <label className="block font-semibold mb-1">Add Icon</label>
                    {formData?.meetGuide?.image ? (
                        <div className="relative inline-block mb-4">
                            <img
                                src={formData?.meetGuide?.image}
                                alt="Preview"
                                className="w-64 h-auto object-contain rounded shadow"
                            />
                            <button
                                onClick={() => handleFieldChange("meetGuide", "image", null)}
                                className="absolute top-0 right-0 bg-white border border-gray-300 rounded-full 
                                p-1 transform translate-x-1/2 -translate-y-1/2 hover:bg-gray-200"
                            >
                                <FaTimes size={14} />
                            </button>
                        </div>
                    ) : (
                        <div className="mb-4">
                            <label
                                htmlFor="guide-upload"
                                className="w-full h-40 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50"
                            >
                                <img
                                    src="/assets/admin/upload.svg"
                                    alt="Upload Icon"
                                    className="w-12 h-12 mb-2"
                                />
                                <span>Click to upload</span>
                                <input
                                    id="guide-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleGuideImageChange(e.target.files[0])}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    )}

                    <label className="block font-semibold mb-1">Title</label>
                    <input
                        type="text"
                        value={formData?.meetGuide?.title}
                        placeholder="Enter title"
                        onChange={(e) => handleFieldChange("meetGuide", "title", e.target.value)}
                        className="w-full border rounded p-2 mb-4"
                    />

                    <label className="block font-semibold mb-1">Description</label>
                    <textarea
                        type="text"
                        rows="4"
                        value={formData?.meetGuide?.description}
                        placeholder="Enter description"
                        onChange={(e) => handleFieldChange("meetGuide", "description", e.target.value)}
                        className="w-full border rounded p-2 mb-4"
                    />
                </div>
            </div>

            {/* Submit Button */}
            <div className="px-8 text-left flex gap-4">
                <button
                    onClick={handleSubmitEventCard}
                    disabled={loading}
                    className={`p-4 bg-gradient-to-b from-[#C5703F] to-[#C16A00] text-white px-8 py-3 
                    rounded-md text-lg font-semibold transition-colors ${
                        loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#224b66]'
                    }`}
                >
                    {loading ? 'Saving...' : (editingIndex !== null ? 'Update Event Card' : 'Add Event Card')}
                </button>
                
                {editingIndex !== null && (
                    <button
                        onClick={() => {
                            setEditingIndex(null);
                            resetForm();
                        }}
                        className="p-4 bg-gray-500 text-white px-8 py-3 rounded-md text-lg font-semibold 
                        transition-colors hover:bg-gray-600"
                    >
                        Cancel Edit
                    </button>
                )}
            </div>

            {/* Current Events */}
            <div className="p-8">
                <h3 className="text-lg font-bold mt-6 mb-3">Current Event Items</h3>
                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F6288]"></div>
                        <p className="mt-2 text-gray-600">Loading events...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No events found. Create your first event above!</p>
                    </div>
                ) : (
                    <DndProvider backend={HTML5Backend}>
                        {items.map((item, index) => (
                            <SlideItem
                                key={item.id || index}
                                index={index}
                                slide={item}
                                moveSlide={moveItem}
                                onEdit={(i) => editItem(i)}
                                onDelete={deleteItem}
                                onToggle={toggleItem}
                            />
                        ))}
                    </DndProvider>
                )}
            </div>
        </>
    );
}