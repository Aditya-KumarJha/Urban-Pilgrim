import { useState, useEffect } from "react";

export default function SessionForm({ onUpdateData, resetTrigger }) {
  const [description, setDescription] = useState("");
  const [dateOptions, setDateOptions] = useState([{ start: "", end: "" }]);
  const [occupancies, setOccupancies] = useState(["Single"]);
  const [showOccupancyInRetreat, setShowOccupancyInRetreat] = useState(false);
  
  useEffect(() => {
    const storedSession = localStorage.getItem('pilgrimSession');
    if (storedSession && !resetTrigger) {
      const data = JSON.parse(storedSession);
      setDescription(data.description || "");
      setDateOptions(data.dateOptions || [{ start: "", end: "" }]);
      setOccupancies(data.occupancies || ["Single"]);
      setShowOccupancyInRetreat(data.showOccupancyInRetreat || false);
    } else if (resetTrigger) {
      setDescription("");
      setDateOptions([{ start: "", end: "" }]);
      setOccupancies(["Single"]);
      setShowOccupancyInRetreat(false);
      localStorage.removeItem('pilgrimSession');
    }
  }, [resetTrigger]);

  const saveToLocalStorage = () => {
    localStorage.setItem('pilgrimSession', JSON.stringify({
      description,
      dateOptions,
      occupancies,
      showOccupancyInRetreat
    }));
  };

  const addDateOption = () => {
    const newDateOptions = [...dateOptions, { start: "", end: "" }];
    setDateOptions(newDateOptions);
    localStorage.setItem('pilgrimSession', JSON.stringify({
      description,
      dateOptions: newDateOptions,
      occupancies,
      showOccupancyInRetreat
    }));
  };

  const updateDateOption = (index, field, value) => {
    const updated = [...dateOptions];
    updated[index][field] = value;
    setDateOptions(updated);
    localStorage.setItem('pilgrimSession', JSON.stringify({
      description,
      dateOptions: updated,
      occupancies,
      showOccupancyInRetreat
    }));
  };

  const addOccupancy = () => {
    const newOccupancies = [...occupancies, ""];
    setOccupancies(newOccupancies);
    localStorage.setItem('pilgrimSession', JSON.stringify({
      description,
      dateOptions,
      occupancies: newOccupancies,
      showOccupancyInRetreat
    }));
  };

  const updateOccupancy = (index, value) => {
    const updated = [...occupancies];
    updated[index] = value;
    setOccupancies(updated);
    localStorage.setItem('pilgrimSession', JSON.stringify({
      description,
      dateOptions,
      occupancies: updated,
      showOccupancyInRetreat
    }));
  };

  useEffect(() => {
    const validDates = dateOptions.filter((d) => d.start && d.end);
    const validOccupancies = occupancies.filter((o) => o.trim());

    const isValid = description.trim() && validDates.length > 0 && validOccupancies.length > 0;

    onUpdateData({
      type: "SessionForm",
      data: {
        description: description.trim(),
        dateOptions: validDates,
        occupancies: validOccupancies,
        showOccupancyInRetreat,
      },
      isValid
    });
  }, [description, dateOptions, occupancies, showOccupancyInRetreat]);

  return (
    <div className="p-8">
      <h2 className="text-3xl text-[#2F6288] font-bold mb-6">
        Session <span className="bg-[#2F6288] mt-4 max-w-xs h-1 block"></span>
      </h2>

      <label className="block text-lg font-semibold mb-3">Session Description</label>
      <textarea
        placeholder="Enter Description"
        rows="4"
        value={description}
        onChange={(e) => {
          setDescription(e.target.value);
          localStorage.setItem('pilgrimSession', JSON.stringify({
            description: e.target.value,
            dateOptions,
            occupancies,
            showOccupancyInRetreat
          }));
        }}
        className="w-full border p-2 rounded mb-4"
      />

      <label className="block text-lg font-semibold mb-3">Date Option</label>
      {dateOptions.map((option, index) => (
        <div key={index} className="flex gap-2 mb-2 items-center">
          <input
            type="date"
            value={option.start}
            onChange={(e) => updateDateOption(index, "start", e.target.value)}
            className="w-full border p-2 rounded"
          />
          <input
            type="date"
            value={option.end}
            onChange={(e) => updateDateOption(index, "end", e.target.value)}
            className="w-full border p-2 rounded"
          />
          {index === dateOptions.length - 1 ? (
            <button onClick={addDateOption} type="button" className="border border-dashed px-2 py-1 rounded text-xl">+</button>
          ) : (
            <button
              onClick={() => {
                const updated = [...dateOptions];
                updated.splice(index, 1);
                setDateOptions(updated);
                localStorage.setItem('pilgrimSession', JSON.stringify({
                  description,
                  dateOptions: updated,
                  occupancies,
                  showOccupancyInRetreat
                }));
              }}
              type="button"
              className="border border-dashed px-2 py-1 rounded text-xl"
            >-</button>
          )}
        </div>
      ))}

      <label className="block text-lg font-semibold mb-3 mt-4">Occupancy</label>
      {occupancies.map((occ, index) => (
        <div key={index} className="flex gap-2 mb-2 items-center">
          <input
            type="text"
            value={occ}
            placeholder="Enter Occupancy"
            onChange={(e) => updateOccupancy(index, e.target.value)}
            className="w-full border p-2 rounded"
          />
          {index === occupancies.length - 1 ? (
            <button onClick={addOccupancy} type="button" className="border border-dashed px-2 py-1 rounded text-xl">+</button>
          ) : (
            <button
              onClick={() => {
                const updated = [...occupancies];
                updated.splice(index, 1);
                setOccupancies(updated);
                localStorage.setItem('pilgrimSession', JSON.stringify({
                  description,
                  dateOptions,
                  occupancies: updated,
                  showOccupancyInRetreat
                }));
              }}
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
          checked={showOccupancyInRetreat}
          onChange={() => {
            const newValue = !showOccupancyInRetreat;
            setShowOccupancyInRetreat(newValue);
            localStorage.setItem('pilgrimSession', JSON.stringify({
              description,
              dateOptions,
              occupancies,
              showOccupancyInRetreat: newValue
            }));
          }}
          className="w-4 h-4"
        />
        <label htmlFor="showOccupancy" className="text-sm text-gray-600">
          *Tick it to Show Occupancy in Pilgrim Retreat
        </label>
      </div>
    </div>
  );
}
