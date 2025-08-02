import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

function OneTimePurchase({ onUpdateData }) {
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const allowed = 5 - images.length;
    files.slice(0, allowed).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files);
    const allowed = 6 - videos.length;
    files.slice(0, allowed).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideos((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  const removeVideo = (index) => {
    const updated = [...videos];
    updated.splice(index, 1);
    setVideos(updated);
  };

  useEffect(() => {
    const isValid = price.trim() && images.length > 0 && videos.length > 0;

    onUpdateData({
      type: "OneTimePurchase",
      title: `₹${price} (one-time)`,
      image: images[0] || null,
      description: `${images.length} image(s), ${videos.length} video(s)`,
      data: {
        price,
        images,
        videos
      },
      isValid: Boolean(isValid)
    });
  }, [price, images, videos, onUpdateData]);

  return (
    <div className="p-8 mx-auto">
      <h2 className="text-3xl text-[#2F6288] font-bold mb-6">
        One Time Purchase<span className="bg-[#2F6288] mt-4 max-w-xs h-1 block"></span>
      </h2>

      <label className="block font-semibold mb-1">Per Month Price</label>
      <input
        type="text"
        placeholder="Enter Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full border p-2 rounded mb-6"
      />

      <label className="block font-semibold mb-2">Add Images ( Maximum 5 Images )</label>
      <div className="mb-6">
        {images.length < 5 && (
          <label className="w-56 h-40 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50">
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
          {images.map((img, index) => (
            <div key={index} className="relative w-40 h-28">
              <img src={img} alt={`img-${index}`} className="w-full h-full object-cover rounded shadow" />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-white border border-gray-300 rounded-full p-1 hover:bg-gray-200"
              >
                <FaTimes size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <label className="block font-semibold mb-2">Add Videos ( Maximum 6 Videos )</label>
      <div className="mb-4">
        {videos.length < 6 && (
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
          {videos.map((vid, index) => (
            <div key={index} className="relative w-40 h-28 bg-black">
              <video src={vid} controls className="w-full h-full rounded shadow object-cover" />
              <button
                onClick={() => removeVideo(index)}
                className="absolute top-1 right-1 bg-white border border-gray-300 rounded-full p-1 hover:bg-gray-200"
              >
                <FaTimes size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OneTimePurchase;
