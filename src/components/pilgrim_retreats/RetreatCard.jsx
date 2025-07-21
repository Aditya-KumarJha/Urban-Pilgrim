import { FaMapMarkerAlt, FaCheckCircle } from "react-icons/fa";

export default function RetreatCard({ title, location, price, image }) {
  return (
    <div className="rounded-xl bg-white overflow-hidden w-full max-w-sm shadow-[-16px_16px_18px_rgba(0,0,0,0.25)]">
      <img src={image} alt={title} className="h-52 w-full object-cover p-4" />
      <div className="p-4">
        <h3 className="font-semibold text-xl leading-tight">{title}</h3>
        <div className="text-sm text-gray-600 flex flex-col items-start mt-2 space-y-2">
          <span className="flex items-center gap-1">
            <FaMapMarkerAlt className="text-[#A0A3A2]" /> {location}
          </span>
          <span className="flex items-center gap-1">
            <FaCheckCircle className="text-[#A0A3A2]" /> Available
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-semibold text-xs text-gray">From <span className="text-lg text-black">₹ {price}</span></span>
          <button className="bg-linear-to-b from-[#C5703F] to-[#C16A00] text-white px-4 py-2 rounded-full text-sm hover:bg-orange-600">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
