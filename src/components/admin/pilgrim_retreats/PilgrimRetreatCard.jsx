import { useDropzone } from "react-dropzone";
import { useState } from "react";

export default function PilgrimRetreatCard() {
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [customCategory, setCustomCategory] = useState("");



  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(acceptedFiles[0]);
    },
  });

  const defaultCategories = [
    "Cultural and Heritage immersion",
    "Spiritual and wellness immersion",
  ];

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="p-8 mx-auto">
      <h2 className="text-3xl text-[#2F6288] font-bold mb-6">
        Pilgrim Retreat Card<span className="bg-[#2F6288] mt-4 max-w-xs h-1 block"></span>
      </h2>

      {/* Thumbnail Uploader */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-3">Add Thumbnail</h3>
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-300 h-52 w-full rounded-md flex items-center justify-center cursor-pointer text-center text-sm text-gray-500"
        >
          <input {...getInputProps()} />
          {image ? (
            <img src={image} alt="Uploaded" className="h-full object-conatin rounded-md" />
          ) : (
            <div className="text-center text-gray-500 flex flex-col items-center">
              <img src="/assets/admin/upload.svg" alt="Upload Icon" className="w-12 h-12 mb-2" />
              <p>{isDragActive ? "Drop here..." : "Click to upload or drag and drop"}</p>
              <p>Size: (1126×826)px</p>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold mb-3">Title</h3>
      <input
        type="text"
        placeholder="Enter Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border p-2 rounded mb-3"
      />

      {/* Category Selector */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold mb-3">Select Category</h4>
        <div className="flex flex-wrap gap-2 mb-2">
          {defaultCategories.map((cat, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-1 text-sm rounded-full border ${
                selectedCategories.includes(cat) ? "bg-blue-100 text-blue-700" : "bg-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New Category"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
          <button
            type="button"
            className="text-sm border px-2 rounded"
            onClick={() => {
              if (customCategory.trim()) {
                toggleCategory(customCategory.trim());
                setCustomCategory("");
              }
            }}
          >
            + Add New Category
          </button>
        </div>
      </div>

      {/* Location */}
      <h3 className="text-lg font-semibold mb-3">Location</h3>
      <input
        type="text"
        placeholder="Enter Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="w-full border p-2 rounded mb-3"
      />

      {/* Price */}
      <h3 className="text-lg font-semibold mb-3">Price</h3>
      <input
        type="number"
        placeholder="Enter Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full border p-2 rounded mb-3"
      />

    </div>
  );
}
