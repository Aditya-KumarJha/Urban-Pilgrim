import { useState, useEffect } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";

function RetreatDescription({ onUpdateData, resetTrigger }) {
  const [points, setPoints] = useState([]);
  
  useEffect(() => {
    const storedDescription = localStorage.getItem('pilgrimRetreatDescription');
    if (storedDescription && !resetTrigger) {
      setPoints(JSON.parse(storedDescription));
    } else if (resetTrigger) {
      setPoints([]);
      localStorage.removeItem('pilgrimRetreatDescription');
    }
  }, [resetTrigger]);

  const saveToLocalStorage = (updatedPoints) => {
    localStorage.setItem('pilgrimRetreatDescription', JSON.stringify(updatedPoints));
  };

  const handleAddPoint = () => {
    const newPoints = [...points, { id: Date.now(), title: "", subpoints: [""] }];
    setPoints(newPoints);
    saveToLocalStorage(newPoints);
  };

  const handleTitleChange = (index, value) => {
    const updated = [...points];
    updated[index].title = value;
    setPoints(updated);
    saveToLocalStorage(updated);
  };

  const handleSubPointChange = (pointIndex, subIndex, value) => {
    const updated = [...points];
    updated[pointIndex].subpoints[subIndex] = value;
    setPoints(updated);
    saveToLocalStorage(updated);
  };

  const handleAddSubPoint = (index) => {
    const updated = [...points];
    updated[index].subpoints.push("");
    setPoints(updated);
    saveToLocalStorage(updated);
  };

  const handleDeletePoint = (index) => {
    const updated = [...points];
    updated.splice(index, 1);
    setPoints(updated);
    saveToLocalStorage(updated);
  };

  const handleDeleteSubPoint = (pointIndex, subIndex) => {
    const updated = [...points];
    updated[pointIndex].subpoints.splice(subIndex, 1);
    setPoints(updated);
    saveToLocalStorage(updated);
  };

  useEffect(() => {
    const valid = points
      .filter((point) => point.title.trim() && point.subpoints.some((s) => s.trim()))
      .map((point) => ({
        title: point.title.trim(),
        description: point.subpoints.filter((s) => s.trim()),
      }));

    if (valid.length > 0) {
      onUpdateData({
        type: "RetreatDescription",
        points: valid,
        isValid: true
      });
    } else {
      onUpdateData({
        type: "RetreatDescription",
        points: [],
        isValid: false
      });
    }
  }, [points]);

  return (
    <div className="p-8 mx-auto">
      <h2 className="text-3xl text-[#2F6288] font-bold mb-6">
        Retreat Description<span className="bg-[#2F6288] mt-4 max-w-xs h-1 block"></span>
      </h2>

      {points.map((point, index) => (
        <div key={index} className="mb-6 pt-4 relative">
          <button
            onClick={() => handleDeletePoint(index)}
            className="absolute top-2 right-2 text-red-600 hover:text-red-800 font-semibold text-sm"
          >
            Delete
          </button>

          <label className="block font-semibold mb-1">Point {index + 1}</label>
          <input
            type="text"
            value={point.title}
            placeholder="Title"
            onChange={(e) => handleTitleChange(index, e.target.value)}
            className="w-full border rounded p-2 mb-4"
          />

          <label className="block font-semibold mb-1">Sub Points</label>
          {point.subpoints.map((sub, subIndex) => (
            <div key={subIndex} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={sub}
                placeholder={`Sub Point ${subIndex + 1}`}
                onChange={(e) => handleSubPointChange(index, subIndex, e.target.value)}
                className="w-full border rounded p-2"
              />
              {point.subpoints.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteSubPoint(index, subIndex)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => handleAddSubPoint(index)}
            className="flex items-center gap-1 text-sm text-[#2F6288] font-semibold mt-2 hover:underline"
          >
            <FaPlus /> Add Sub Point
          </button>
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

export default RetreatDescription;
