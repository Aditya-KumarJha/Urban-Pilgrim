import { useState, useEffect } from "react";

function Location({ onUpdateData, resetTrigger }) {
  const [location, setLocation] = useState("");

  // Reset form when resetTrigger changes
  useEffect(() => {
    if (resetTrigger) {
      setLocation("");
    }
  }, [resetTrigger]);

  useEffect(() => {
    if (location.trim()) {
      onUpdateData({
        type: "Location",
        location: location.trim(),
        isValid: true
      });
    } else {
      onUpdateData({
        type: "Location",
        location: "",
        isValid: false
      });
    }
  }, [location, onUpdateData]);

  return (
    <div className="p-8 mx-auto">
      <h2 className="text-3xl text-[#2F6288] font-bold mb-6">
        Location <span className="bg-[#2F6288] mt-4 max-w-xs h-1 block"></span>
      </h2>
      <input
        type="text"
        value={location}
        placeholder="Enter location"
        onChange={(e) => setLocation(e.target.value)}
        className="w-full border rounded p-2 mb-4"
      />
    </div>
  );
}

export default Location;
