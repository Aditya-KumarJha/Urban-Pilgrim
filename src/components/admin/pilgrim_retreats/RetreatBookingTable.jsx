import { useState } from "react";
import { motion } from "framer-motion";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const initialData = [
  {
    id: "#PR-1001",
    email: "user1@example.com",
    retreat: "Rejuvenate in the Himalayas",
    occupancy: "Twin",
    persons: 1,
    date: "2023-11-15",
  },
  {
    id: "#PR-1001",
    email: "user1@example.com",
    retreat: "Reflect & Reboot by the Ganges",
    occupancy: "Single",
    persons: 2,
    date: "2023-11-15",
  },
  {
    id: "#PR-1001",
    email: "user1@example.com",
    retreat: "Reflect & Reboot by the Ganges",
    occupancy: "Twin",
    persons: 6,
    date: "2023-11-15",
  },
  {
    id: "#PR-1001",
    email: "user2@example.com",
    retreat: "Reflect & Reboot by the Ganges",
    occupancy: "Single",
    persons: 9,
    date: "2023-11-15",
  },
  {
    id: "#PR-1001",
    email: "user1@example.com",
    retreat: "Reflect & Reboot by the Ganges",
    occupancy: "Single",
    persons: 1,
    date: "2023-11-15",
  },
];

export default function RetreatBookingTable() {
  const [filter, setFilter] = useState("All Bookings");
  const [occupancyFilter, setOccupancyFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bookings, setBookings] = useState(initialData);

  const filtered = bookings.filter((b) => {
    const matchesSearch = b.email.toLowerCase().includes(search.toLowerCase());
    const matchesOccupancy = occupancyFilter === "All" || b.occupancy === occupancyFilter;

    const bookingTime = new Date(b.date).getTime();
    const now = Date.now();

    let matchesFilter = true;
    if (filter === "Upcoming") {
      matchesFilter = bookingTime >= now;
    } else if (filter === "Past") {
      matchesFilter = bookingTime < now;
    }

    let matchesDateRange = true;
    if (startDate) {
      const startTime = new Date(startDate).getTime();
      matchesDateRange = matchesDateRange && bookingTime >= startTime;
    }
    if (endDate) {
      const endTime = new Date(endDate).getTime();
      matchesDateRange = matchesDateRange && bookingTime <= endTime;
    }

    return matchesSearch && matchesOccupancy && matchesFilter && matchesDateRange;
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-blue-900 mb-4">Pilgrim Retreats Bookings</h2>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          className="border p-2 rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option>All Bookings</option>
          <option>Upcoming</option>
          <option>Past</option>
        </select>

        <label className="text-sm">
          Occupancy:
          <select
            className="ml-2 border p-1 rounded"
            value={occupancyFilter}
            onChange={(e) => setOccupancyFilter(e.target.value)}
          >
            <option>All</option>
            <option>Single</option>
            <option>Twin</option>
          </select>
        </label>

        <input
          type="date"
          className="border p-2 rounded"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <span>to</span>
        <input
          type="date"
          className="border p-2 rounded"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <input
          type="text"
          placeholder="Search by email or name..."
          className="border p-2 flex-1 min-w-[220px] rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border rounded overflow-hidden">
          <thead className="bg-blue-100 text-blue-800 text-left">
            <tr>
              <th className="p-2">Booking ID</th>
              <th className="p-2">User Email</th>
              <th className="p-2">Retreat</th>
              <th className="p-2">Occupancy</th>
              <th className="p-2">Persons per Sessions</th>
              <th className="p-2">Booking Date</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((booking, idx) => (
              <motion.tr
                key={idx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className="even:bg-gray-50"
              >
                <td className="p-2">{booking.id}</td>
                <td className="p-2">{booking.email}</td>
                <td className="p-2">{booking.retreat}</td>
                <td className="p-2">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      booking.occupancy === "Twin"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {booking.occupancy}
                  </span>
                </td>
                <td className="p-2">{booking.persons}</td>
                <td className="p-2">{booking.date}</td>
                <td className="p-2 flex items-center gap-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    <FaEye />
                  </button>
                  <button className="text-green-600 hover:text-green-800">
                    <FaEdit />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => {
                      const updated = bookings.filter((_, i) => i !== idx);
                      setBookings(updated);
                    }}
                  >
                    <FaTrash />
                  </button>
                </td>
              </motion.tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
