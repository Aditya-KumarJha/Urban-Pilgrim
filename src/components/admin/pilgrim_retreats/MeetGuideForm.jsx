import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

function MeetGuideForm({ onUpdateData, resetTrigger }) {
  const [guide, setGuide] = useState({
    title: "",
    description: "",
    image: null
  });
  
  useEffect(() => {
    const storedGuide = localStorage.getItem('pilgrimGuide');
    if (storedGuide && !resetTrigger) {
      setGuide(JSON.parse(storedGuide));
    } else if (resetTrigger) {
      setGuide({
        title: "",
        description: "",
        image: null
      });
      localStorage.removeItem('pilgrimGuide');
    }
  }, [resetTrigger]);

  const saveToLocalStorage = (updatedGuide) => {
    localStorage.setItem('pilgrimGuide', JSON.stringify(updatedGuide));
  };

  const handleTitleChange = (value) => {
    const updatedGuide = { ...guide, title: value };
    setGuide(updatedGuide);
    saveToLocalStorage(updatedGuide);
  };

  const handleDescriptionChange = (value) => {
    const updatedGuide = { ...guide, description: value };
    setGuide(updatedGuide);
    saveToLocalStorage(updatedGuide);
  };

  const handleImageChange = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const updatedGuide = { ...guide, image: reader.result };
      setGuide(updatedGuide);
      saveToLocalStorage(updatedGuide);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    const updatedGuide = { ...guide, image: null };
    setGuide(updatedGuide);
    saveToLocalStorage(updatedGuide);
  };

  useEffect(() => {
    const { title, description, image } = guide;
    const isValid = title.trim() && description.trim() && image;

    onUpdateData({
      type: "MeetGuide",
      title: title.trim(),
      description: description.trim(),
      image,
      isValid: Boolean(isValid)
    });
  }, [guide]);

  return (
    <div className="p-8 mx-auto">
      <h2 className="text-3xl text-[#2F6288] font-bold mb-6">
        Meet Your Pilgrim Guide
        <span className="bg-[#2F6288] mt-4 max-w-xs h-1 block"></span>
      </h2>

      <div className="mb-6 pt-4 relative">
        <label className="block font-semibold mb-1">Add Icon</label>
        {guide.image ? (
          <div className="relative inline-block mb-4">
            <img
              src={guide.image}
              alt="Preview"
              className="w-64 h-auto object-contain rounded shadow"
            />
            <button
              onClick={handleImageRemove}
              className="absolute top-0 right-0 bg-white border border-gray-300 rounded-full p-1 transform translate-x-1/2 -translate-y-1/2 hover:bg-gray-200"
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
                onChange={(e) => handleImageChange(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>
        )}

        <label className="block font-semibold mb-1">Title</label>
        <input
          type="text"
          value={guide.title}
          placeholder="Enter title"
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full border rounded p-2 mb-4"
        />

        <label className="block font-semibold mb-1">Description</label>
        <input
          type="text"
          value={guide.description}
          placeholder="Enter description"
          onChange={(e) => handleDescriptionChange(e.target.value)}
          className="w-full border rounded p-2 mb-4"
        />
      </div>
    </div>
  );
}

export default MeetGuideForm;
