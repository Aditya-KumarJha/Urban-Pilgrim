import { useState, useEffect } from "react";

function FAQForm({ onUpdateData, resetTrigger }) {
  const [faqs, setFaqs] = useState([]);

  // Reset form when resetTrigger changes
  useEffect(() => {
    if (resetTrigger) {
      setFaqs([]);
    }
  }, [resetTrigger]);

  const handleAddPoint = () => {
    setFaqs((prev) => [...prev, { title: "", description: ""}]);
  };

  const handleTitleChange = (index, value) => {
    const updated = [...faqs];
    updated[index].title = value;
    setFaqs(updated);
  };

  const handleDescriptionChange = (index, value) => {
    const updated = [...faqs];
    updated[index].description = value;
    setFaqs(updated);
  };

  const handleDeletePoint = (index) => {
    const updated = [...faqs];
    updated.splice(index, 1);
    setFaqs(updated);
  };

  useEffect(() => {
    const validFaqs = faqs.filter(faq => faq.title.trim() && faq.description.trim());
    if (validFaqs.length > 0) {
      onUpdateData({
        type: "FAQ",
        faqs: validFaqs
      });
    }
  }, [faqs, onUpdateData]);

  return (
    <div className="p-8 mx-auto">
      <h2 className="text-3xl text-[#2F6288] font-bold mb-6">
        FAQs<span className="bg-[#2F6288] mt-4 max-w-xs h-1 block"></span>
      </h2>

      {faqs.map((point, index) => (
        <div key={index} className="mb-6 pt-4 relative">
          <button
            onClick={() => handleDeletePoint(index)}
            className="absolute top-2 right-2 text-red-600 hover:text-red-800 font-semibold text-sm"
          >
            Delete
          </button>

          <label className="block font-semibold mb-1">Title</label>
          <input
            type="text"
            value={point.title}
            placeholder="Title"
            onChange={(e) => handleTitleChange(index, e.target.value)}
            className="w-full border rounded p-2 mb-4"
          />

          <label className="block font-semibold mb-1">Description</label>
          <textarea
            value={point.description}
            placeholder="Enter description"
            onChange={(e) => handleDescriptionChange(index, e.target.value)}
            className="w-full border rounded p-2 mb-4"
            rows={4}
          />
        </div>
      ))}

      <div
        onClick={handleAddPoint}
        className="w-full text-center my-4 bg-[#2F6288] text-white py-2 rounded-md cursor-pointer hover:bg-[#224b66]"
      >
        Add Description
      </div>
    </div>
  );
}

export default FAQForm;
