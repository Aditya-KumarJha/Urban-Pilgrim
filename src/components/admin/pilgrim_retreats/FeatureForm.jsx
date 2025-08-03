import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

function FeatureForm({ onUpdateData, resetTrigger }) {
  const [features, setFeatures] = useState([]);
  
  useEffect(() => {
    const storedFeatures = localStorage.getItem('pilgrimFeatures');
    if (storedFeatures && !resetTrigger) {
      setFeatures(JSON.parse(storedFeatures));
    } else if (resetTrigger) {
      setFeatures([]);
      localStorage.removeItem('pilgrimFeatures');
    }
  }, [resetTrigger]);

  const saveToLocalStorage = (updatedFeatures) => {
    localStorage.setItem('pilgrimFeatures', JSON.stringify(updatedFeatures));
  };

  const handleAddFeature = () => {
    const newFeatures = [...features, { id: Date.now(), title: "", shortdescription: "", image: null}];
    setFeatures(newFeatures);
    saveToLocalStorage(newFeatures);
  };

  const handleFeatureTitleChange = (index, value) => {
    const updated = [...features];
    updated[index].title = value;
    setFeatures(updated);
    saveToLocalStorage(updated);
  };

  const handleFeatureShortDescriptionChange = (index, value) => {
    const updated = [...features];
    updated[index].shortdescription = value;
    setFeatures(updated);
    saveToLocalStorage(updated);
  };

  const handleFeatureImageChange = (index, file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const updated = [...features];
      updated[index].image = reader.result;
      setFeatures(updated);
      saveToLocalStorage(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleFeatureImageRemove = (index) => {
    const updated = [...features];
    updated[index].image = null;
    setFeatures(updated);
    saveToLocalStorage(updated);
  };

  const handleDeleteFeature = (index) => {
    const updated = [...features];
    updated.splice(index, 1);
    setFeatures(updated);
    saveToLocalStorage(updated);
  };

  useEffect(() => {
    const validFeatures = features.filter(
      (feature) =>
        feature.title.trim() &&
        feature.shortdescription.trim() &&
        feature.image
    );

    if (validFeatures.length > 0) {
      onUpdateData({
        type: "FeatureForm",
        features: validFeatures,
        isValid: true
      });
    } else {
      onUpdateData({
        type: "FeatureForm",
        features: [],
        isValid: false
      });
    }
  }, [features, onUpdateData]);

  return (
    <div className="p-8 mx-auto">
      <h2 className="text-3xl text-[#2F6288] font-bold mb-6">
        Features<span className="bg-[#2F6288] mt-4 max-w-xs h-1 block"></span>
      </h2>

      {features.map((feature, index) => (
        <div key={index} className="mb-6 pt-4 relative">
          <button
            onClick={() => handleDeleteFeature(index)}
            className="absolute top-2 right-2 text-red-600 hover:text-red-800 font-semibold text-sm"
          >
            Delete
          </button>

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

          <label className="block font-semibold mb-1">Title</label>
          <input
            type="text"
            value={feature.title}
            placeholder="Enter title"
            onChange={(e) => handleFeatureTitleChange(index, e.target.value)}
            className="w-full border rounded p-2 mb-4"
          />

          <label className="block font-semibold mb-1">Short description</label>
          <input
            type="text"
            value={feature.shortdescription}
            placeholder="Enter description"
            onChange={(e) => handleFeatureShortDescriptionChange(index, e.target.value)}
            className="w-full border rounded p-2 mb-4"
          />
        </div>
      ))}

      <div
        onClick={handleAddFeature}
        className="w-full text-center my-4 bg-[#2F6288] text-white py-2 rounded-md cursor-pointer hover:bg-[#224b66]"
      >
        Add Feature
      </div>
    </div>
  );
}

export default FeatureForm;
