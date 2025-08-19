import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaTimes } from "react-icons/fa";
import { fetchSectionFour, saveSectionFour } from "../../../services/home_service/sectionFourServices";
import { setLoading, setSectionFour } from "../../../features/home_slices/sectionFourSlice";
import { useDispatch } from "react-redux";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../../../services/firebase";
import { v4 as uuidv4 } from "uuid";

function SectionFour() {
    const [image, setImage] = useState(null);

    const [features, setFeatures] = useState([]);

    const dispatch = useDispatch();
    const uid = "your-unique-id";

    useEffect(() => {
        const loadData = async () => {
            dispatch(setLoading(true));
            const data = await fetchSectionFour(uid);
            console.log("data from section 4: ", data);
            dispatch(setSectionFour(data?.sectionFour));
            setFeatures(data?.sectionFour?.features || []);
            setImage(data?.sectionFour?.image || null);
            dispatch(setLoading(false));
        };
        loadData();
    }, [uid, dispatch]);

    const handleAddFeature = () => {
        setFeatures((prev) => [...prev, { title: "", shorttitle: "", image: null }]);
    };

    const handleFeatureTitleChange = (index, value) => {
        const updated = [...features];
        updated[index].title = value;
        setFeatures(updated);
    };

    const handleFeatureShortTitleChange = (index, value) => {
        const updated = [...features];
        updated[index].shorttitle = value;
        setFeatures(updated);
    };

    // Remove feature image (from state + storage)
    const handleFeatureImageRemove = async (index) => {
        try {
            const updated = [...features];
            const imageUrl = updated[index].image;

            if (imageUrl) {
                // Create reference from URL
                const storageRef = ref(storage, imageUrl);

                // Delete from Firebase Storage
                await deleteObject(storageRef);
                console.log("Feature image deleted from storage:", imageUrl);
            }

            // Remove from local state
            updated[index].image = null;
            setFeatures(updated);
        } catch (error) {
            console.error("Error removing feature image:", error);
        }
    };

    // Upload new image for a feature
    const handleFeatureImageChange = async (index, file) => {
        try {
            // Create a unique storage path for each feature image
            const storageRef = ref(storage, `slides/sesctionFour/${uuidv4()}-${file.name}`);

            // Upload file
            await uploadBytes(storageRef, file);

            // Get download URL
            const downloadURL = await getDownloadURL(storageRef);

            // Update local state with download URL
            const updated = [...features];
            updated[index].image = downloadURL;
            setFeatures(updated);

            console.log("Feature image uploaded:", downloadURL);
        } catch (error) {
            console.error("Error uploading feature image:", error);
        }
    };

    const handleDiscard = async () => {
        setImage(null);
        setFeatures([]);
        dispatch(setSectionFour({ image: null, features: [] }));
        await saveSectionFour(uid, { image: null, features: [] });
    };

    const handleSave = async () => {
        console.log({
            image,
            features,
        });
        dispatch(setSectionFour({ image, features })); // update store
        await saveSectionFour(uid, { image, features }); // update Firestore
        console.log("Section 4 data saved successfully", { image, features });
    };

    const handleDeleteFeature = async (index) => {
        const updated = [...features];
        updated.splice(index, 1);
        dispatch(setSectionFour({ image, features: updated })); // update store
        await saveSectionFour(uid, { image, features: updated }); // update Firestore
        setFeatures(updated);
        console.log("Feature deleted successfully", { features: updated });
    };

    const onDrop = async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        try {
            // Create a unique path for the file
            const storageRef = ref(storage, `slides/sesctionFour/features/${uuidv4()}-${file.name}`);

            // Upload file
            await uploadBytes(storageRef, file);

            // Get downloadable URL
            const downloadURL = await getDownloadURL(storageRef);

            // Store only the URL in state (not base64)
            setImage(downloadURL);
            console.log("Uploaded file URL:", downloadURL);
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const handleRemoveImage = () => setImage(null);

    return (
        <>
            <h3 className="text-lg font-bold mb-2">Section 4</h3>
            <label className="block font-semibold mb-1">Image</label>

            {image ? (
                <div className="relative inline-block mb-4">
                    <img src={image} alt="Preview" className="w-64 h-auto object-cover rounded shadow" />
                    <button
                        onClick={handleRemoveImage}
                        className="absolute top-0 right-0 bg-white border border-gray-300 rounded-full p-1 transform translate-x-1/2 -translate-y-1/2 hover:bg-gray-200"
                    >
                        <FaTimes size={14} />
                    </button>
                </div>
            ) : (
                <div
                    {...getRootProps()}
                    className="w-full h-40 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-500 cursor-pointer mb-4 hover:bg-gray-50 flex-col"
                >
                    <input {...getInputProps()} />
                    <img src="/assets/admin/upload.svg" alt="Upload Icon" className="w-12 h-12 mb-2" />
                    {isDragActive ? "Drop the image here..." : "Click to upload or drag and drop"}
                </div>
            )}

            {features.map((feature, index) => (
                <div key={index} className="mb-6 pt-4 relative">
                    <button
                        onClick={() => handleDeleteFeature(index)}
                        className="absolute top-2 right-2 text-red-600 hover:text-red-800 font-semibold text-sm"
                    >
                        Delete
                    </button>

                    <label className="block font-semibold mb-1">Title {index + 1}</label>
                    <input
                        type="text"
                        value={feature.title}
                        placeholder="Enter feature title"
                        onChange={(e) => handleFeatureTitleChange(index, e.target.value)}
                        className="w-full border rounded p-2 mb-4"
                    />

                    <label className="block font-semibold mb-1">Short Text {index + 1}</label>

                    <input
                        type="text"
                        value={feature.shorttitle}
                        placeholder="Enter feature short title"
                        onChange={(e) => handleFeatureShortTitleChange(index, e.target.value)}
                        className="w-full border rounded p-2 mb-4"
                    />

                    <label className="block font-semibold mb-1">Add Icon {index + 1}</label>
                    {feature.image ? (
                        <div className="relative inline-block mb-4">
                            <img
                                src={feature.image}
                                alt="Preview"
                                className="w-64 h-auto object-contain rounded shadow"
                            />
                            <button
                                onClick={() => handleFeatureImageRemove(index)}
                                className="absolute top-0 right-0 bg-white border border-gray-300 rounded-full p-1 transform translate-x-1/2 -translate-y-1/2 hover:bg-gray-200"
                            >
                                <FaTimes size={14} />
                            </button>
                        </div>
                    ) : (
                        <div className="mb-4">
                            <label
                                htmlFor={`feature-upload-${index}`}
                                className="w-full h-40 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50"
                            >
                                <img
                                    src="/assets/admin/upload.svg"
                                    alt="Upload Icon"
                                    className="w-12 h-12 mb-2"
                                />
                                <span>Click to upload</span>
                                <span>Size: 40 * 40 px</span>
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
            ))}



            <div
                onClick={handleAddFeature}
                className="w-full text-center my-4 bg-[#2F6288] text-white py-2 rounded-md cursor-pointer hover:bg-[#224b66]"
            >
                Add Feature
            </div>

            <div className="flex justify-end gap-3">
                <button
                    onClick={handleDiscard}
                    className="px-4 py-2 font-semibold border border-gray-800 rounded-md"
                >
                    Discard Changes
                </button>
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-gradient-to-b  from-[#C5703F] to-[#C16A00] text-white rounded-md hover:from-[#C16A00] hover:to-[#C5703F]"
                >
                    Save Changes
                </button>
            </div>
        </>
    )
}

export default SectionFour