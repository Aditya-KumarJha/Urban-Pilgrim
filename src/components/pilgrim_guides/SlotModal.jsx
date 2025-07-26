import { useState } from "react";
import Calendar from "react-calendar";
import { FiX } from "react-icons/fi";
import "react-calendar/dist/Calendar.css";

export default function SlotModal({ onClose }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlots, setSelectedSlots] = useState([]);

  const slots = [
    "2:30 PM – 5:30 PM",
    "6:30 PM – 9:30 PM",
    "10:30 PM – 1:30 AM",
  ];

  const toggleSlot = (slot) => {
    setSelectedSlots((prev) =>
      prev.includes(slot)
        ? prev.filter((s) => s !== slot)
        : [...prev, slot]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[99] flex items-center justify-center">
      <div className="bg-white rounded-xl w-full max-w-3xl p-6 relative grid grid-cols-1 md:grid-cols-2 gap-6">
        <button onClick={onClose} className="absolute top-4 right-4">
          <FiX size={20} />
        </button>

        {/* Left: Slot Selection */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Available Slots</h2>
          <p className="text-sm text-gray-500 mb-4">
            Tip: You can select multiple slots and add them to your cart in one go!
          </p>
          <div className="space-y-3">
            {slots.map((slot) => (
              <label key={slot} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="accent-blue-600"
                  checked={selectedSlots.includes(slot)}
                  onChange={() => toggleSlot(slot)}
                />
                <span>{slot}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Right: Calendar */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Choose Date</h2>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            className="border-none w-full"
            minDate={new Date()}
            tileClassName={({ date, view }) =>
              view === "month" &&
              date.toDateString() === selectedDate.toDateString()
                ? "bg-blue-500 text-white rounded-full"
                : "rounded-full"
            }
          />
          <div className="mt-4 text-xs text-gray-500">India: GMT+05:30</div>
        </div>

        {/* Continue Button */}
        <div className="col-span-full mt-2">
          <button className="w-full bg-[#2F6288] text-white py-2 rounded hover:bg-[#2F6288]/90">
            Continue Booking
          </button>
        </div>
      </div>
    </div>
  );
}
