import { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { MdDragIndicator } from "react-icons/md";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import { useDrag, useDrop } from "react-dnd";
import { useDropzone } from "react-dropzone";
import { Plus } from "lucide-react"
import { deleteRetreatItem, fetchRetreatData, saveOrUpdateRetreatData } from "../../../services/pilgrim_retreat/retreatService";
import { setRetreatData } from "../../../features/pilgrim_retreat/pilgrimRetreatSlice";
import { useDispatch } from "react-redux";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../../../services/firebase"
import { showError, showSuccess } from "../../../utils/toast";

const ItemType = "RETREAT";

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

export default function RetreatsForm() {

    const [formData, setFormData] = useState({
        pilgrimRetreatCard: {
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
            price: "",
            images: [],
            videos: []
        },
        session: {
            title: "",
            description1: "",
            description2: "",
            description3: "",
            dateOptions: [{ start: "", end: "" }],
            occupancies: ["Single"],
            showOccupancyInRetreat: false
        },
        features: [],
        location: "",
        programSchedule: [],  // This will now be populated with objects that have title, description, and points array
        retreatDescription: [],
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
    // const [dragActive, setDragActive] = useState(false);

    const handleFieldChange = (section, field, value) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    // Pilgrim Retreat Card
    const { getRootProps: getCardImageRootProps,
        getInputProps: getCardImageInputProps,
        isDragActive: isCardDragActive
    } = useDropzone({
        onDrop: (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (file) {
                try {
                    const storageRef = ref(storage, `pilgrimCards/${file.name}_${Date.now()}`);
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
                            handleFieldChange("pilgrimRetreatCard", "image", downloadURL);
                        }
                    );
                } catch (err) {
                    console.error("Error uploading file:", err);
                }
            }
        },
    });

    // const toggleCategory = (cat) => {
    //     const categories = [...formData.pilgrimRetreatCard.categories];
    //     const index = categories.indexOf(cat);

    //     if (index === -1) {
    //         categories.push(cat);
    //     } else {
    //         categories.splice(index, 1);
    //     }

    //     handleFieldChange("pilgrimRetreatCard", "categories", categories);
    // };

    const handleCategorySelect = (cat) => {
        handleFieldChange("pilgrimRetreatCard", "category", cat);
    };

    const addNewCategory = () => {
        const newCategory = prompt("Enter new category name:");
        if (newCategory && !formData.pilgrimRetreatCard.categories.includes(newCategory)) {
            setFormData(prev => ({
                ...prev,
                pilgrimRetreatCard: {
                    ...prev.pilgrimRetreatCard,
                    categories: [...prev.pilgrimRetreatCard.categories, newCategory]
                }
            }));
        }
    };

    // Session Functions
    const addDateOption = () => {
        const updated = [...formData.session.dateOptions, { start: "", end: "" }];
        handleFieldChange("session", "dateOptions", updated);
    };

    const updateDateOption = (index, field, value) => {
        const updated = [...formData.session.dateOptions];
        updated[index][field] = value;
        handleFieldChange("session", "dateOptions", updated);
    };

    const removeDateOption = (index) => {
        const updated = [...formData.session.dateOptions];
        updated.splice(index, 1);
        handleFieldChange("session", "dateOptions", updated);
    };

    const addOccupancy = () => {
        const updated = [...formData.session.occupancies, ""];
        handleFieldChange("session", "occupancies", updated);
    };

    const updateOccupancy = (index, value) => {
        const updated = [...formData.session.occupancies];
        updated[index] = value;
        handleFieldChange("session", "occupancies", updated);
    };

    const removeOccupancy = (index) => {
        const updated = [...formData.session.occupancies];
        updated.splice(index, 1);
        handleFieldChange("session", "occupancies", updated);
    };

    const addFeature = () => {
        setFormData((prev) => ({
            ...prev,
            features: [...prev.features, { id: Date.now(), title: "", shortdescription: "", image: null }],
        }));
    };

    const handleFeatureChange = (index, field, value) => {
        const updated = [...formData.features];
        updated[index][field] = value;
        setFormData((prev) => ({ ...prev, features: updated }));
    };

    const handleFeatureImageChange = async (index, file) => {
        if (!file) return;

        try {
            const storageRef = ref(storage, `featureImages/${file.name}_${Date.now()}`); // unique file name
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    // Optional: track upload progress
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                },
                (error) => {
                    console.error("Upload failed:", error);
                },
                async () => {
                    // Upload complete, get the download URL
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    const updated = [...formData.features];
                    updated[index].image = downloadURL;
                    setFormData((prev) => ({ ...prev, features: updated }));
                }
            );
        } catch (err) {
            console.error("Error uploading file:", err);
        }
    };

    const removeFeature = (index) => {
        const updated = [...formData.features];
        updated.splice(index, 1);
        setFormData((prev) => ({ ...prev, features: updated }));
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

    // Retreat Description Functions
    const addDescriptionPoint = () => {
        setFormData((prev) => ({
            ...prev,
            retreatDescription: [...prev.retreatDescription, { id: Date.now(), title: "", subpoints: [""] }]
        }));
    };

    const handlePointTitleChange = (index, value) => {
        const updated = [...formData.retreatDescription];
        updated[index].title = value;
        setFormData((prev) => ({ ...prev, retreatDescription: updated }));
    };

    const handleSubPointChange = (pointIndex, subIndex, value) => {
        const updated = [...formData.retreatDescription];
        updated[pointIndex].subpoints[subIndex] = value;
        setFormData((prev) => ({ ...prev, retreatDescription: updated }));
    };

    const addSubPoint = (index) => {
        const updated = [...formData.retreatDescription];
        updated[index].subpoints.push("");
        setFormData((prev) => ({ ...prev, retreatDescription: updated }));
    };

    const removeDescriptionPoint = (index) => {
        const updated = [...formData.retreatDescription];
        updated.splice(index, 1);
        setFormData((prev) => ({ ...prev, retreatDescription: updated }));
    };

    const removeSubPoint = (pointIndex, subIndex) => {
        const updated = [...formData.retreatDescription];
        updated[pointIndex].subpoints.splice(subIndex, 1);
        setFormData((prev) => ({ ...prev, retreatDescription: updated }));
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

    // One Time Purchase Image Functions
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const allowed = 5 - formData.oneTimePurchase.images.length;

        files.slice(0, allowed).forEach((file) => {
            const storageRef = ref(storage, `oneTimePurchase/${file.name}_${Date.now()}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    // Optional: progress tracking
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                },
                (error) => {
                    console.error("Upload failed:", error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    const updatedImages = [...formData.oneTimePurchase.images, downloadURL];
                    handleFieldChange("oneTimePurchase", "images", updatedImages);
                }
            );
        });
    };

    const removeImage = async (index) => {
        try {
            const updated = [...formData.oneTimePurchase.images];
            const urlToDelete = updated[index];

            // Delete from Firebase Storage
            const fileRef = ref(storage, urlToDelete);
            await deleteObject(fileRef);

            // Remove from state
            updated.splice(index, 1);
            handleFieldChange("oneTimePurchase", "images", updated);
        } catch (err) {
            console.error("Error removing image:", err);
            // Even if deletion fails, remove from UI
            const updated = [...formData.oneTimePurchase.images];
            updated.splice(index, 1);
            handleFieldChange("oneTimePurchase", "images", updated);
        }
    };

    // One Time Purchase Video Functions
    const handleVideoUpload = (e) => {
        const files = Array.from(e.target.files);
        const allowed = 6 - formData.oneTimePurchase.videos.length;

        files.slice(0, allowed).forEach((file) => {
            const storageRef = ref(storage, `oneTimePurchase/videos/${file.name}_${Date.now()}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    // Optional: track upload progress
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Video upload is ${progress}% done`);
                },
                (error) => {
                    console.error("Video upload failed:", error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    const updatedVideos = [...formData.oneTimePurchase.videos, downloadURL];
                    handleFieldChange("oneTimePurchase", "videos", updatedVideos);
                }
            );
        });
    };

    const removeVideo = async (index) => {
        try {
            const updated = [...formData.oneTimePurchase.videos];
            const urlToDelete = updated[index];

            // Delete from Firebase Storage
            const fileRef = ref(storage, urlToDelete);
            await deleteObject(fileRef);

            // Remove from state
            updated.splice(index, 1);
            handleFieldChange("oneTimePurchase", "videos", updated);
        } catch (err) {
            console.error("Error removing video:", err);
            // Even if deletion fails, remove from UI
            const updated = [...formData.oneTimePurchase.videos];
            updated.splice(index, 1);
            handleFieldChange("oneTimePurchase", "videos", updated);
        }
    };

    // Guide Image Functions
    const handleGuideImageChange = (file) => {
        if (!file) return;

        const storageRef = ref(storage, `meetGuide/${file.name}_${Date.now()}`);
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

    // List Functions
    const addItem = (form) => {
        const formArray = Array.isArray(form) ? form : [form];

        // Dig inside each object, then inside its numbered key
        const titles = formArray.flatMap(item =>
            Object.values(item).map(inner => inner?.pilgrimRetreatCard?.title).filter(Boolean)
        );

        const images = formArray.flatMap(item =>
            Object.values(item).map(inner => inner?.pilgrimRetreatCard?.image).filter(Boolean)
        );

        console.log("Titles:", titles);
        console.log("Images:", images);
        // console.log("Form Array:", formArray[0][1]);

        for (let i = 0; i < titles.length; i++) {
            const newItem = {
                id: Date.now() + Math.random(),
                type: 'retreat',
                active: true,
                title: titles[i] || 'Retreat',
                image: images[i] || '',
                link: (titles[i] || '').replace(/\s+/g, '-'),
                data: formArray[0][i + 1]
            };
            setItems(prevItems => [...prevItems, newItem]);
            console.log("newItem :", newItem);
        }

    };

    const addItem2 = (formData) => {
        const newItem = {
            id: Date.now() + Math.random(),
            type: 'retreat',
            active: true,
            title: formData?.pilgrimRetreatCard?.title || 'Retreat',
            image: formData?.pilgrimRetreatCard?.image || '',
            link: (formData?.pilgrimRetreatCard?.title || '').replace(/\s+/g, '-'),
            data: formData
        };

        setItems(prevItems => [...prevItems, newItem]);
        console.log("newItem2 :", newItem);
    };

    const updateItem = (index) => {
        const updatedItems = [...items];
        const updatedItem = {
            ...items[index],
            title: formData?.pilgrimRetreatCard?.title || items[index].title || "",
            image: formData?.pilgrimRetreatCard?.image || items[index].image || "",
            link: (formData?.pilgrimRetreatCard?.title || items[index].title || "").replace(/\s+/g, '-'),
        };

        // Update local items array
        updatedItems[index] = updatedItem;
        setItems(updatedItems);

        console.log("after update: ", updatedItem);

        updatedItem.data = formData;

        setEditingIndex(null);
    };

    const editItem = (index) => {
        const item = items[index];
        console.log("item: ", items);
        // If you ever stored an array in data, grab the first element; otherwise use the object.

        // Optional: log to verify the shape
        console.log("Editing raw item:", item);
        console.log("Form payload:", item?.data || {});

        setFormData(item?.data || {});          // <- put the real form data back into the form
        setEditingIndex(index + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const deleteItem = async (index) => {
        const backendIndex = index + 1;

        // Create new array without the deleted item
        const updatedItems = items.filter((_, i) => i !== index);

        // Reindex locally so frontend matches backend
        const reindexedItems = updatedItems.map((item, idx) => ({
            ...item,
            arrayName: idx + 1 // or whatever field you use for backend index
        }));

        // Update state immediately
        setItems(reindexedItems);

        // Update backend
        await deleteRetreatItem(uid, backendIndex);

        // Update Redux state
        dispatch(setRetreatData(uid, backendIndex, reindexedItems));

        console.log(`Item at index ${backendIndex} deleted successfully.`);
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
            pilgrimRetreatCard: {
                title: "",
                image: null,
                location: "",
                price: "",
                category: "", // Changed from categories array to single category string
                categories: [] // Keep for backward compatibility if needed
            },
            monthlySubscription: {
                price: "",
                discount: "",
                description: ""
            },
            oneTimePurchase: {
                price: "",
                images: [],
                videos: []
            },
            session: {
                title: "",
                description1: "",
                description2: "",
                description3: "",
                dateOptions: [{ start: "", end: "" }],
                occupancies: ["Single"],
                showOccupancyInRetreat: false
            },
            features: [],
            location: "",
            programSchedule: [],  // This will now be populated with objects that have title, description, and points array
            retreatDescription: [],
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
        const loadCards = async () => {
            try {
                const cards = await fetchRetreatData(uid);
                console.log("Fetched retreat cards:", cards);
                if (cards !== null) {
                    addItem(cards);
                }
            } catch (err) {
                console.error("Error fetching retreat cards:", err);
            }
        };

        loadCards();
    }, [uid, dispatch]);

    const handleSubmitRetreatCard = async () => {
        try {
            if (editingIndex !== null) {
                // Update the existing card
                await saveOrUpdateRetreatData(uid, editingIndex, formData);
                dispatch(setRetreatData(uid, editingIndex, items));
                updateItem(editingIndex - 1);
                console.log(`Retreat updated successfully!`, formData);
                showSuccess("Retreat updated successfully!");
                resetForm();
                setEditingIndex(null);
            } else {
                // Create a new card
                await saveOrUpdateRetreatData(uid, items.length + 1, formData);
                dispatch(setRetreatData(uid, items.length + 1, items));
                console.log(`Retreat saved successfully!`, formData);
                resetForm();
                addItem2(formData);
                showError("Retreat saved successfully!");
                console.log(`after reset`, formData);
            }

        } catch (error) {
            console.error(`Failed to save Retreat, please try again. ${error.message}`);
        }
    };

    return (
        <>
            {/* Pilgrim Retreat Card */}
            <div className="md:p-8 px-4 py-0 mx-auto">
                <h2 className="sm:text-2xl font-bold text-[#2F6288] text-xl mb-0">
                    Pilgrim Retreat Card
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
                        {formData?.pilgrimRetreatCard?.image ? (
                            <img
                                src={formData.pilgrimRetreatCard.image}
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
                    value={formData?.pilgrimRetreatCard?.title}
                    onChange={(e) => handleFieldChange("pilgrimRetreatCard", "title", e.target.value)}
                    className="text-sm w-full border p-3 rounded-lg mb-3"
                />

                {/* Category Selection - Updated to match LiveSessions.jsx */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Category</label>
                    <div className="flex flex-wrap gap-3 mb-3">
                        {[...(formData && formData.pilgrimRetreatCard && Array.isArray(formData.pilgrimRetreatCard.categories) ? formData.pilgrimRetreatCard.categories : []), "Cultural and Heritage immersion", "Spiritual and wellness immersion"]
                            .filter((cat, index, arr) => arr.indexOf(cat) === index) // remove duplicates
                            .map((cat, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleCategorySelect(cat)}
                                    className={`px-4 py-2 rounded-full border transition-colors 
                                        ${formData?.pilgrimRetreatCard?.category === cat
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

                {/* Location */}
                <h3 className="block text-md font-semibold text-gray-700 mb-2">Location</h3>
                <input
                    type="text"
                    placeholder="Enter Location"
                    value={formData?.pilgrimRetreatCard?.location}
                    onChange={(e) => handleFieldChange("pilgrimRetreatCard", "location", e.target.value)}
                    className="text-sm w-full border p-3 rounded-lg mb-3"
                />

                {/* Price */}
                <h3 className="block text-md font-semibold text-gray-700 mb-2">Price</h3>
                <input
                    type="number"
                    placeholder="Enter Price"
                    value={formData?.pilgrimRetreatCard?.price}
                    onChange={(e) => handleFieldChange("pilgrimRetreatCard", "price", e.target.value)}
                    className="text-sm w-full border p-3 rounded-lg mb-3"
                />
            </div>

            {/* Monthly Subscription */}
            <div className="md:p-8 px-4 py-0 mx-auto">
                <h2 className="sm:text-2xl font-bold text-[#2F6288] text-xl mb-6">
                    Monthly Subscription <span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
                </h2>

                <h3 className="block text-md font-semibold text-gray-700 mb-2">Subscription Price</h3>
                <input
                    type="number"
                    placeholder="Enter Price"
                    value={formData?.monthlySubscription?.price}
                    onChange={(e) => handleFieldChange("monthlySubscription", "price", e.target.value)}
                    className="text-sm w-full border p-3 rounded-lg mb-3"
                />

                <h3 className="block text-md font-semibold text-gray-700 mb-2">Discount</h3>
                <input
                    type="number"
                    placeholder="Enter percentage"
                    value={formData?.monthlySubscription?.discount}
                    onChange={(e) => handleFieldChange("monthlySubscription", "discount", e.target.value)}
                    className="text-sm w-full border p-3 rounded-lg mb-3"
                />

                <h3 className="block text-md font-semibold text-gray-700 mb-2">Description</h3>
                <textarea
                    placeholder="Enter description"
                    value={formData?.monthlySubscription?.description}
                    onChange={(e) => handleFieldChange("monthlySubscription", "description", e.target.value)}
                    className="text-sm w-full border p-3 rounded-lg mb-3"
                    rows={3}
                />
            </div>

            {/* One Time Purchase */}
            <div className="md:p-8 px-4 py-0 mx-auto">
                <h2 className="sm:text-2xl font-bold text-[#2F6288] text-xl mb-6">
                    One Time Purchase<span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
                </h2>

                <label className="block font-semibold mb-1">Per Month Price</label>
                <input
                    type="number"
                    placeholder="Enter Price"
                    value={formData?.oneTimePurchase?.price}
                    onChange={(e) => handleFieldChange("oneTimePurchase", "price", e.target.value)}
                    className="text-sm w-full border p-3 rounded-lg mb-6"
                />

                <label className="block font-semibold mb-2">Add Images ( Maximum 5 Images )</label>
                <div className="mb-6">
                    {formData?.oneTimePurchase?.images && formData?.oneTimePurchase?.images.length < 5 && (
                        <label className="w-56 h-40 border-2 border-dashed border-gray-300 rounded flex flex-col 
                        items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50">
                            <img src="/assets/admin/upload.svg" alt="Upload Icon" className="w-10 h-10 mb-2" />
                            <span>Click to upload image<br />Size: (1126×626)px</span>
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
                        {formData?.oneTimePurchase?.images && formData?.oneTimePurchase?.images.map((img, index) => (
                            <div key={index} className="relative w-40 h-28">
                                <img src={img} alt={`img-${index}`} className="w-full h-full object-cover rounded shadow" />
                                <button
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 bg-white border border-gray-300 rounded-full p-1 
                                    hover:bg-gray-200"
                                >
                                    <FaTimes size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <label className="block font-semibold mb-2">Add Videos ( Maximum 6 Videos )</label>
                <div className="mb-4">
                    {formData?.oneTimePurchase?.videos && formData?.oneTimePurchase?.videos.length < 6 && (
                        <label className="w-56 h-40 border-2 border-dashed border-gray-300 rounded flex flex-col 
                        items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50">
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
                        {formData?.oneTimePurchase?.videos && formData?.oneTimePurchase?.videos.map((vid, index) => (
                            <div key={index} className="relative w-40 h-28 bg-black">
                                <video src={vid} controls className="w-full h-full rounded shadow object-cover" />
                                <button
                                    onClick={() => removeVideo(index)}
                                    className="absolute top-1 right-1 bg-white border border-gray-300 
                                    rounded-full p-1 hover:bg-gray-200"
                                >
                                    <FaTimes size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Session */}
            <div className="md:p-8 px-4 py-0 mx-auto">
                <h2 className="sm:text-2xl font-bold text-[#2F6288] text-xl mb-6">
                    Session <span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
                </h2>

                {/* Title */}
                <h3 className="block text-md font-semibold text-gray-700 mb-2">Title</h3>
                <input
                    type="text"
                    placeholder="Enter Title"
                    value={formData?.session?.title}
                    onChange={(e) => handleFieldChange("session", "title", e.target.value)}
                    className="text-sm w-full border p-3 rounded-lg mb-3"
                />

                {/* Session Description 1 */}
                <label className="block text-md font-semibold text-gray-700 mb-2">Session Description 1</label>
                <textarea
                    placeholder="Enter Description"
                    rows="4"
                    value={formData?.session?.description1}
                    onChange={(e) => handleFieldChange("session", "description1", e.target.value)}
                    className="text-sm w-full border p-3 rounded-lg mb-4"
                />

                {/* Session Description 2 */}
                <label className="block text-md font-semibold text-gray-700 mb-2">Session Description 2</label>
                <textarea
                    placeholder="Enter Description"
                    rows="4"
                    value={formData?.session?.description2}
                    onChange={(e) => handleFieldChange("session", "description2", e.target.value)}
                    className="text-sm w-full border p-3 rounded-lg mb-4"
                />

                {/* Session Description 3 */}
                <label className="block text-md font-semibold text-gray-700 mb-2">Session Description 3</label>
                <textarea
                    placeholder="Enter Description"
                    rows="4"
                    value={formData?.session?.description3}
                    onChange={(e) => handleFieldChange("session", "description3", e.target.value)}
                    className="text-sm w-full border p-3 rounded-lg mb-4"
                />

                {/* Date Option */}
                <label className="block text-md font-semibold text-gray-700 mb-2">Date Option</label>
                {formData?.session?.dateOptions.map((option, index) => (
                    <div key={index} className="flex gap-2 mb-2 items-center">
                        <input
                            type="date"
                            value={option?.start}
                            onChange={(e) => updateDateOption(index, "start", e.target.value)}
                            className="text-sm w-full border p-3 rounded-lg"
                        />
                        <input
                            type="date"
                            value={option?.end}
                            onChange={(e) => updateDateOption(index, "end", e.target.value)}
                            className="text-sm w-full border p-3 rounded-lg"
                        />
                        {index === formData?.session?.dateOptions.length - 1 ? (
                            <button
                                onClick={addDateOption}
                                type="button"
                                className="border border-dashed px-2 py-1 rounded text-xl"
                            >
                                +
                            </button>
                        ) : (
                            <button
                                onClick={() => removeDateOption(index)}
                                type="button"
                                className="border border-dashed px-2 py-1 rounded text-xl"
                            >-</button>
                        )}
                    </div>
                ))}
                
                <label className="block text-md font-semibold text-gray-700 mb-2 mt-4">Occupancy</label>
                {formData?.session?.occupancies.map((occ, index) => (
                    <div key={index} className="flex gap-2 mb-2 items-center">
                        <input
                            type="text"
                            value={occ}
                            placeholder="Enter Occupancy"
                            onChange={(e) => updateOccupancy(index, e.target.value)}
                            className="text-sm w-full border p-3 rounded-lg"
                        />
                        {index === formData?.session?.occupancies.length - 1 ? (
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
                ))}

                <div className="flex items-center gap-2 mt-2">
                    <input
                        type="checkbox"
                        id="showOccupancy"
                        checked={formData?.session?.showOccupancyInRetreat}
                        onChange={() => handleFieldChange("session", "showOccupancyInRetreat", !formData?.session?.showOccupancyInRetreat)}
                        className="w-4 h-4"
                    />
                    <label htmlFor="showOccupancy" className="text-sm text-gray-600">
                        *Tick it to Show Occupancy in Pilgrim Retreat
                    </label>
                </div>
            </div>

            {/* features */}
            <div className="md:p-8 px-4 py-0 mx-auto">
                <h2 className="sm:text-2xl font-bold text-[#2F6288] text-xl mb-6">
                    Features<span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
                </h2>

                <div className="space-y-6">
                    {formData?.features && formData?.features.map((feature, index) => (
                        <div key={index} className="p-6 bg-gray-50 rounded-lg border border-gray-200 relative">
                            <button
                                onClick={() => removeFeature(index)}
                                className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-1"
                                title="Delete Feature"
                            >
                                <FaTrash className="w-4 h-4" />
                            </button>

                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Feature Icon</label>
                                {feature.image ? (
                                    <div className="relative inline-block mb-4">
                                        <img
                                            src={feature?.image}
                                            alt="Preview"
                                            className="w-32 h-32 object-contain rounded"
                                        />
                                        <button
                                            onClick={() => handleFeatureChange(index, "image", null)}
                                            className="absolute top-1 right-1 bg-white border border-gray-300 
                                            rounded-full p-1 hover:bg-gray-200"
                                        >
                                            <FaTimes size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mb-4">
                                        <label
                                            htmlFor={`feature-upload-${index}`}
                                            className="w-full h-40 border-2 border-dashed border-gray-300 rounded flex 
                                            flex-col items-center justify-center text-gray-500 cursor-pointer 
                                            hover:bg-gray-50"
                                        >
                                            <img
                                                src="/assets/admin/upload.svg"
                                                alt="Upload Icon"
                                                className="w-12 h-12 mb-2"
                                            />
                                            <span>Click to upload feature icon</span>
                                            <input
                                                id={`feature-upload-${index}`}
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFeatureImageChange(index, e.target.files[0])}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={feature?.title}
                                    placeholder="Enter title"
                                    onChange={(e) => handleFeatureChange(index, "title", e.target.value)}
                                    className="w-full border border-gray-300 p-3 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <textarea
                                    rows={3}
                                    value={feature?.shortdescription}
                                    placeholder="Enter short description"
                                    onChange={(e) => handleFeatureChange(index, "shortdescription", e.target.value)}
                                    className="w-full border border-gray-300 p-3 rounded-lg"
                                />
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={addFeature}
                        className="w-full px-4 py-3 bg-[#2F6288] text-white rounded-lg 
                        transition-colors flex items-center justify-center gap-2"
                    >
                        <FaPlus className="w-5 h-5" />
                        Add Feature
                    </button>
                </div>
            </div>

            {/* Location */}
            <div className="md:p-8 px-4 py-0 mx-auto">
                <h2 className="sm:text-2xl font-bold text-[#2F6288] text-xl mb-6">
                    Location <span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
                </h2>
                <input
                    type="text"
                    value={formData?.location}
                    placeholder="Enter location"
                    onChange={(e) => setFormData(prev => ({
                        ...prev,
                        location: e.target.value
                    }))}
                    className="w-full border rounded p-2 mb-4"
                />

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

            {/* Retreat Description */}
            <div className="md:p-8 px-4 py-0 mx-auto">
                <h2 className="sm:text-2xl font-bold text-[#2F6288] text-xl mb-6">
                    Retreat Description<span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
                </h2>

                <div className="space-y-6">
                    {formData?.retreatDescription && formData?.retreatDescription.map((point, index) => (
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
            <div className="px-8 text-left">
                <button
                    onClick={handleSubmitRetreatCard}
                    className="p-4 bg-gradient-to-b from-[#C5703F] to-[#C16A00] text-white px-8 py-3 
                    rounded-md text-lg font-semibold hover:bg-[#224b66] transition-colors"
                >
                    {editingIndex !== null ? 'Update Retreat Card' : 'Add Retreat Card'}
                </button>
            </div>

            {/* Current Retreats */}
            <div className="p-8">
                <h3 className="text-lg font-bold mt-6 mb-3">Current Retreat Items</h3>
                <DndProvider backend={HTML5Backend}>
                    {items && items.map((item, index) => (
                        <SlideItem
                            key={index}
                            index={index}
                            slide={item}
                            moveSlide={moveItem}
                            onEdit={(i) => editItem(i)}
                            onDelete={deleteItem}
                            onToggle={toggleItem}
                        />
                    ))}
                </DndProvider>
            </div>
        </>
    );
}