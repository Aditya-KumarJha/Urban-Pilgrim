import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaEye, FaEdit, FaTrash, FaSpinner } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { showSuccess, showError } from "../../../utils/toast";
import { fetchRetreatData } from "../../../services/pilgrim_retreat/retreatService";

// Dynamic booking management component

// Stable empty array reference to prevent unnecessary re-renders
const EMPTY_RETREATS = [];

export default function RetreatBookingTable() {
    const [filter, setFilter] = useState("All Bookings");
    const [occupancyFilter, setOccupancyFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({});

    const dispatch = useDispatch();
    const retreats = useSelector(state => state.pilgrimRetreat?.retreats || EMPTY_RETREATS);
    const uid = "user-uid"; // You might want to get this from auth context

    // Fetch retreat data and extract bookings from purchasedUsers
    useEffect(() => {
        fetchBookingsFromRetreats();
    }, [retreats]);

    const fetchBookingsFromRetreats = async () => {
        try {
            // setLoading(true);

            // If no retreats in Redux, fetch from Firestore
            let retreatData = retreats;
            if (!retreatData.length) {
                const fetchedData = await fetchRetreatData(uid);
                if (fetchedData) {
                    retreatData = Object.values(fetchedData).filter(item => typeof item === 'object' && item.pilgrimRetreatCard);
                }
            }

            const bookingsData = [];

            retreatData.forEach((retreat, retreatIndex) => {
                if (retreat.purchasedUsers && Array.isArray(retreat.purchasedUsers)) {
                    retreat.purchasedUsers.forEach((user, userIndex) => {
                        bookingsData.push({
                            id: `${retreat.id || retreatIndex}-${userIndex}`,
                            bookingId: `#PR-${String(retreatIndex + 1).padStart(3, '0')}-${String(userIndex + 1).padStart(3, '0')}`,
                            email: user.email || user.userEmail || '',
                            retreat: retreat.pilgrimRetreatCard?.title || 'Unknown Retreat',
                            occupancy: user.occupancy || user.roomType || 'Single',
                            persons: user.persons || user.numberOfPersons || 1,
                            retreatDate: user.retreatDate || user.bookingDate || new Date(),
                            bookingDate: user.bookingDate || user.createdAt || new Date(),
                            status: user.status || 'confirmed',
                            price: user.price || retreat.pilgrimRetreatCard?.price || 0,
                            retreatIndex,
                            userIndex,
                            originalRetreat: retreat
                        });
                    });
                }
            });

            setBookings(bookingsData);
        } catch (error) {
            console.error("Error fetching bookings from retreats:", error);
            showError("Failed to fetch booking data");
        } finally {
            setLoading(false);
        }
    };

    const handleView = (booking) => {
        setSelectedBooking(booking);
        setShowViewModal(true);
    };

    const handleEdit = (booking) => {
        setSelectedBooking(booking);
        setEditFormData({
            email: booking.email || '',
            retreat: booking.retreat || '',
            occupancy: booking.occupancy || 'Single',
            persons: booking.persons || 1,
            retreatDate: booking.retreatDate ? booking.retreatDate.toISOString().split('T')[0] : '',
            status: booking.status || 'confirmed'
        });
        setShowEditModal(true);
    };

    const handleUpdate = async () => {
        try {
            const { retreatIndex, userIndex } = selectedBooking;
            const retreatDocRef = doc(db, `pilgrim_retreat/${uid}/retreats/data`);

            // Get current retreat data
            const retreatData = await fetchRetreatData(uid);
            const updatedData = { ...retreatData };

            // Update the specific user in purchasedUsers array
            if (updatedData[retreatIndex + 1] && updatedData[retreatIndex + 1].purchasedUsers) {
                updatedData[retreatIndex + 1].purchasedUsers[userIndex] = {
                    ...updatedData[retreatIndex + 1].purchasedUsers[userIndex],
                    ...editFormData,
                    retreatDate: new Date(editFormData.retreatDate),
                    updatedAt: new Date()
                };

                await updateDoc(retreatDocRef, updatedData);
                showSuccess("Booking updated successfully");
                setShowEditModal(false);
                fetchBookingsFromRetreats(); // Refresh data
            }
        } catch (error) {
            console.error("Error updating booking:", error);
            showError("Failed to update booking");
        }
    };

    const handleDelete = async (booking) => {
        if (!window.confirm("Are you sure you want to delete this booking?")) {
            return;
        }

        try {
            const { retreatIndex, userIndex } = booking;
            const retreatDocRef = doc(db, `pilgrim_retreat/${uid}/retreats/data`);

            // Get current retreat data
            const retreatData = await fetchRetreatData(uid);
            const updatedData = { ...retreatData };

            // Remove the specific user from purchasedUsers array
            if (updatedData[retreatIndex + 1] && updatedData[retreatIndex + 1].purchasedUsers) {
                updatedData[retreatIndex + 1].purchasedUsers.splice(userIndex, 1);

                await updateDoc(retreatDocRef, updatedData);
                showSuccess("Booking deleted successfully");
                fetchBookingsFromRetreats(); // Refresh data
            }
        } catch (error) {
            console.error("Error deleting booking:", error);
            showError("Failed to delete booking");
        }
    };

    const filtered = bookings.filter((b) => {
        const matchesSearch = (b.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (b.retreat?.toLowerCase() || '').includes(search.toLowerCase());
        const matchesOccupancy = occupancyFilter === "All" || b.occupancy === occupancyFilter;

        const retreatTime = b.retreatDate ? new Date(b.retreatDate).getTime() : 0;
        const now = Date.now();

        let matchesFilter = true;
        if (filter === "Upcoming") {
            matchesFilter = retreatTime >= now;
        } else if (filter === "Past") {
            matchesFilter = retreatTime < now;
        }

        let matchesDateRange = true;
        if (startDate) {
            const startTime = new Date(startDate).getTime();
            matchesDateRange = matchesDateRange && retreatTime >= startTime;
        }
        if (endDate) {
            const endTime = new Date(endDate).getTime();
            matchesDateRange = matchesDateRange && retreatTime <= endTime;
        }

        return matchesSearch && matchesOccupancy && matchesFilter && matchesDateRange;
    });

    return (
        <div className="p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold text-[#2F6288] mb-4">
                Pilgrim Retreats Bookings <span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
            </h2>

            {/* Filters */}
            {/* <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <label className="text-nowrap text-sm flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
          Filter by:
          <select
            className="border p-2 rounded w-full md:w-auto"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All Bookings</option>
            <option>Upcoming</option>
            <option>Past</option>
          </select>
        </label>

        <label className="text-nowrap text-sm flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
          Occupancy:
          <select
            className="border p-2 rounded w-full md:w-auto"
            value={occupancyFilter}
            onChange={(e) => setOccupancyFilter(e.target.value)}
          >
            <option>All</option>
            <option>Single</option>
            <option>Twin</option>
          </select>
        </label>

        <label className="text-nowrap text-sm flex flex-col md:flex-row md:items-center gap-2 w-full">
          Date range:
          <div className="flex flex-wrap gap-2">
            <input
              type="date"
              className="border p-2 rounded flex-1 min-w-[140px]"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="self-center">to</span>
            <input
              type="date"
              className="border p-2 rounded flex-1 min-w-[140px]"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </label>

        <input
          type="text"
          placeholder="Search by email or name..."
          className="border p-2 rounded flex-1 min-w-[220px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div> */}

            <div className="flex flex-col xl:flex-row gap-3 mb-4">
                <div className="flex flex-col md:flex-row gap-3 flex-shrink-0">
                    <label className="text-sm flex flex-col md:flex-row md:items-center gap-2 text-nowrap">
                        Filter by:
                        <select
                            className="border p-2 rounded w-full md:w-auto"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option>All Bookings</option>
                            <option>Upcoming</option>
                            <option>Past</option>
                        </select>
                    </label>

                    <label className="text-sm flex flex-col md:flex-row md:items-center gap-2 text-nowrap">
                        Occupancy:
                        <select
                            className="border p-2 rounded w-full md:w-auto"
                            value={occupancyFilter}
                            onChange={(e) => setOccupancyFilter(e.target.value)}
                        >
                            <option>All</option>
                            <option>Single</option>
                            <option>Twin</option>
                        </select>
                    </label>

                    <label className="text-sm flex flex-col md:flex-row md:items-center gap-2 text-nowrap">
                        Date range:
                        <div className="flex flex-wrap gap-2">
                            <input
                                type="date"
                                className="border p-2 rounded"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <span className="self-center">to</span>
                            <input
                                type="date"
                                className="border p-2 rounded"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </label>
                </div>
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search by email or name..."
                        className="border p-2 rounded w-full"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>


            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-8">
                    <FaSpinner className="animate-spin text-2xl text-[#2F6288]" />
                    <span className="ml-2 text-gray-600">Loading bookings...</span>
                </div>
            )}

            {/* Table for desktop */}
            {!loading && (
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm border rounded overflow-hidden">
                        <thead className="bg-[#E8F0F6] text-[#2F6288] border-b text-left">
                            <tr>
                                <th className="p-2">Booking ID</th>
                                <th className="p-2">User Email</th>
                                <th className="p-2">Retreat</th>
                                <th className="p-2">Occupancy</th>
                                <th className="p-2">Persons</th>
                                <th className="p-2">Retreat Date</th>
                                <th className="p-2">Status</th>
                                <th className="p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((booking, idx) => (
                                <motion.tr
                                    key={booking.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                                    className="bg-gray-50 border-b hover:bg-gray-100"
                                >
                                    <td className="p-2 font-mono text-xs">{booking.bookingId}</td>
                                    <td className="p-2">{booking.email}</td>
                                    <td className="p-2 max-w-xs truncate" title={booking.retreat}>{booking.retreat}</td>
                                    <td className="p-2">
                                        <span
                                            className={`text-xs font-medium px-2 py-1 rounded ${booking.occupancy === "Twin"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-blue-100 text-blue-700"
                                                }`}
                                        >
                                            {booking.occupancy}
                                        </span>
                                    </td>
                                    <td className="p-2">{booking.persons}</td>
                                    <td className="p-2">{new Date(booking.retreatDate).toLocaleDateString()}</td>
                                    <td className="p-2">
                                        <span
                                            className={`text-xs font-medium px-2 py-1 rounded ${booking.status === "confirmed"
                                                    ? "bg-green-100 text-green-700"
                                                    : booking.status === "pending"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="p-2 flex items-center gap-2">
                                        <button
                                            className="text-blue-600 hover:text-blue-800"
                                            onClick={() => handleView(booking)}
                                            title="View Details"
                                        >
                                            <FaEye />
                                        </button>
                                        <button
                                            className="text-green-600 hover:text-green-800"
                                            onClick={() => handleEdit(booking)}
                                            title="Edit Booking"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            className="text-red-600 hover:text-red-800"
                                            onClick={() => handleDelete(booking)}
                                            title="Delete Booking"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                            {filtered.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="8" className="text-center p-4 text-gray-500">
                                        No bookings found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {/* Mobile view */}
            {!loading && (
                <div className="md:hidden space-y-4">
                    {filtered.map((booking, idx) => (
                        <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: idx * 0.05 }}
                            className="border rounded-lg p-4 shadow-sm"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-sm font-mono">{booking.bookingId}</p>
                                    <p className="text-sm text-gray-600">{booking.email}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span
                                        className={`text-xs font-medium px-2 py-1 rounded ${booking.occupancy === "Twin"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-blue-100 text-blue-700"
                                            }`}
                                    >
                                        {booking.occupancy}
                                    </span>
                                    <span
                                        className={`text-xs font-medium px-2 py-1 rounded ${booking.status === "confirmed"
                                                ? "bg-green-100 text-green-700"
                                                : booking.status === "pending"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {booking.status}
                                    </span>
                                </div>
                            </div>
                            <p className="mt-2 text-sm font-medium">{booking.retreat}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {booking.persons} persons | {new Date(booking.retreatDate).toLocaleDateString()}
                            </p>
                            <div className="flex gap-3 mt-3">
                                <button
                                    className="text-blue-600 hover:text-blue-800"
                                    onClick={() => handleView(booking)}
                                >
                                    <FaEye />
                                </button>
                                <button
                                    className="text-green-600 hover:text-green-800"
                                    onClick={() => handleEdit(booking)}
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    className="text-red-600 hover:text-red-800"
                                    onClick={() => handleDelete(booking)}
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                    {filtered.length === 0 && !loading && (
                        <p className="text-center text-gray-500">No bookings found.</p>
                    )}
                </div>
            )}

            {/* View Modal */}
            {showViewModal && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold mb-4">Booking Details</h3>
                        <div className="space-y-2">
                            <p><strong>Booking ID:</strong> {selectedBooking.bookingId}</p>
                            <p><strong>Email:</strong> {selectedBooking.email}</p>
                            <p><strong>Retreat:</strong> {selectedBooking.retreat}</p>
                            <p><strong>Occupancy:</strong> {selectedBooking.occupancy}</p>
                            <p><strong>Persons:</strong> {selectedBooking.persons}</p>
                            <p><strong>Retreat Date:</strong> {new Date(selectedBooking.retreatDate).toLocaleDateString()}</p>
                            <p><strong>Status:</strong> {selectedBooking.status}</p>
                            <p><strong>Price:</strong> ₹{selectedBooking.price}</p>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold mb-4">Edit Booking</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editFormData.email}
                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Occupancy</label>
                                <select
                                    value={editFormData.occupancy}
                                    onChange={(e) => setEditFormData({ ...editFormData, occupancy: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="Single">Single</option>
                                    <option value="Twin">Twin</option>
                                    <option value="Triple">Triple</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Persons</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={editFormData.persons}
                                    onChange={(e) => setEditFormData({ ...editFormData, persons: parseInt(e.target.value) })}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Retreat Date</label>
                                <input
                                    type="date"
                                    value={editFormData.retreatDate}
                                    onChange={(e) => setEditFormData({ ...editFormData, retreatDate: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select
                                    value={editFormData.status}
                                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="confirmed">Confirmed</option>
                                    <option value="pending">Pending</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="px-4 py-2 bg-[#2F6288] text-white rounded hover:bg-[#2F6288]/80"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
