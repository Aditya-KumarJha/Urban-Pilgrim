import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FaEye, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import { fetchGuideData, saveOrUpdateGuideData } from "../../../services/pilgrim_guide/guideService";
import { showSuccess, showError } from "../../../utils/toast";
import { auth } from "../../../services/firebase";

// Stable empty array reference to prevent unnecessary re-renders
const EMPTY_GUIDES = [];

export default function GuideBookingsTable() {
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [editForm, setEditForm] = useState({});

    const uid = "pilgrim_guides";

    // Get guide data from Redux
    const guides = useSelector(state => state.pilgrimGuide?.guides || EMPTY_GUIDES);

    // Fetch bookings from guides on component mount
    useEffect(() => {
        fetchBookingsFromGuides();
    }, [guides]);

    const fetchBookingsFromGuides = async () => {
        try {
            let guideData = guides;
            setLoading(true);
            // Fallback to Firestore if Redux is empty
            if (!guideData.length) {
                const fetchedGuideData = await fetchGuideData(uid);
                if (fetchedGuideData && fetchedGuideData.slides) {
                    guideData = Array.isArray(fetchedGuideData.slides)
                        ? fetchedGuideData.slides
                        : Object.values(fetchedGuideData.slides).filter(item => typeof item === 'object');
                }
            }

            const bookingsData = [];

            // Extract bookings from guides
            guideData.forEach((guide, guideIndex) => {
                if (guide.purchasedUsers && Array.isArray(guide.purchasedUsers)) {
                    guide.purchasedUsers.forEach((user, userIndex) => {
                        bookingsData.push({
                            id: `#PG-${String(guideIndex + 1).padStart(3, '0')}-${String(userIndex + 1).padStart(3, '0')}`,
                            bookingId: `#PG-${String(guideIndex + 1).padStart(3, '0')}-${String(userIndex + 1).padStart(3, '0')}`,
                            email: user.email || user.userEmail || '',
                            guideName: guide.title || 'Unknown Guide',
                            mode: user.mode || guide.mode || 'Online',
                            persons: user.persons || user.numberOfPersons || 1,
                            date: user.bookingDate || user.createdAt || new Date(),
                            bookingDate: user.bookingDate || user.createdAt || new Date(),
                            location: user.mode === 'Offline' ? (user.location || guide.location || 'Location TBD') : '-',
                            status: user.status || 'confirmed',
                            price: user.price || guide.price || 0,
                            guideIndex,
                            userIndex,
                            originalGuide: guide
                        });
                    });
                }
            });

            setBookings(bookingsData);
        } catch (error) {
            console.error("Error fetching bookings from guides:", error);
            showError("Failed to fetch booking data");
        } finally {
            setLoading(false);
        }
    };

    const handleViewBooking = (booking) => {
        setSelectedBooking(booking);
        setShowViewModal(true);
    };

    const handleEditBooking = (booking) => {
        setSelectedBooking(booking);
        setEditForm({
            email: booking.email,
            persons: booking.persons,
            mode: booking.mode,
            location: booking.location,
            status: booking.status,
            bookingDate: new Date(booking.bookingDate).toISOString().split('T')[0]
        });
        setShowEditModal(true);
    };

    const handleUpdateBooking = async () => {
        try {
            const { guideIndex, userIndex } = selectedBooking;

            // Update the user data in the guide's purchasedUsers array
            const updatedUser = {
                ...selectedBooking.originalGuide.purchasedUsers[userIndex],
                email: editForm.email,
                persons: parseInt(editForm.persons),
                mode: editForm.mode,
                location: editForm.location,
                status: editForm.status,
                bookingDate: editForm.bookingDate
            };

            // Create updated guide with modified purchasedUsers
            const updatedGuide = {
                ...selectedBooking.originalGuide,
                purchasedUsers: selectedBooking.originalGuide.purchasedUsers.map((user, idx) =>
                    idx === userIndex ? updatedUser : user
                )
            };

            // Update in Firestore
            const updatedGuides = guides.map((guide, idx) =>
                idx === guideIndex ? updatedGuide : guide
            );
            await saveOrUpdateGuideData(uid, 'slides', updatedGuides);

            showSuccess("Booking updated successfully");
            setShowEditModal(false);
            fetchBookingsFromGuides(); // Refresh data
        } catch (error) {
            console.error("Error updating booking:", error);
            showError("Failed to update booking");
        }
    };

    const handleDeleteBooking = async (booking) => {
        if (!window.confirm('Are you sure you want to delete this booking?')) return;

        try {
            const { guideIndex, userIndex } = booking;

            // Remove user from guide's purchasedUsers array
            const updatedGuide = {
                ...booking.originalGuide,
                purchasedUsers: booking.originalGuide.purchasedUsers.filter((_, idx) => idx !== userIndex)
            };

            // Update in Firestore
            const updatedGuides = guides.map((guide, idx) =>
                idx === guideIndex ? updatedGuide : guide
            );
            await saveOrUpdateGuideData(uid, 'slides', updatedGuides);

            showSuccess("Booking deleted successfully");
            fetchBookingsFromGuides(); // Refresh data
        } catch (error) {
            console.error("Error deleting booking:", error);
            showError("Failed to delete booking");
        }
    };

    const filtered = bookings.filter((b) => {
        const matchesSearch = b.email.toLowerCase().includes(search.toLowerCase()) ||
            b.guideName.toLowerCase().includes(search.toLowerCase());
        const matchesMode = filter === "All" || b.mode === filter;

        const bookingTime = new Date(b.date).getTime();
        let matchesDateRange = true;
        if (startDate) matchesDateRange = matchesDateRange && bookingTime >= new Date(startDate).getTime();
        if (endDate) matchesDateRange = matchesDateRange && bookingTime <= new Date(endDate).getTime();

        return matchesSearch && matchesMode && matchesDateRange;
    });

    if (loading) {
        return (
            <div className="p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold text-[#2F6288] mb-4">
                    Pilgrim Guide Bookings <span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
                </h2>
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F6288]"></div>
                    <span className="ml-2 text-gray-600">Loading bookings...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold text-[#2F6288] mb-4">
                Pilgrim Guide Bookings <span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
            </h2>

            {/* Filters */}
            <div className="flex flex-col xl:flex-row gap-3 mb-4">
                <div className="flex flex-col md:flex-row gap-3 flex-shrink-0">
                    <label className="text-sm flex flex-col md:flex-row md:items-center gap-2 text-nowrap">
                        Mode:
                        <select
                            className="border p-2 rounded w-full md:w-auto"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option>All</option>
                            <option>Online</option>
                            <option>Offline</option>
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

            {/* Table for desktop */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm border rounded overflow-hidden">
                    <thead className="bg-[#E8F0F6] text-[#2F6288] text-left">
                        <tr>
                            <th className="p-2">Booking ID</th>
                            <th className="p-2">User Email</th>
                            <th className="p-2">Mode</th>
                            <th className="p-2">Persons per Session</th>
                            <th className="p-2">Booking Date</th>
                            <th className="p-2">Location Details</th>
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
                                className="bg-gray-50 border-b"
                            >
                                <td className="p-2">{booking.id}</td>
                                <td className="p-2">{booking.email}</td>
                                <td className="p-2">
                                    <span
                                        className={`text-xs font-medium px-2 py-1 rounded ${booking.mode === "Online"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-blue-100 text-blue-700"
                                            }`}
                                    >
                                        {booking.mode}
                                    </span>
                                </td>
                                <td className="p-2">{booking.persons}</td>
                                <td className="p-2">{new Date(booking.date).toLocaleDateString()}</td>
                                <td className="p-2">{booking.location}</td>
                                <td className="p-2 flex items-center gap-2">
                                    <button
                                        className="text-blue-600 hover:text-blue-800"
                                        onClick={() => handleViewBooking(booking)}
                                        title="View Details"
                                    >
                                        <FaEye />
                                    </button>
                                    <button
                                        className="text-green-600 hover:text-green-800"
                                        onClick={() => handleEditBooking(booking)}
                                        title="Edit Booking"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="text-red-600 hover:text-red-800"
                                        onClick={() => handleDeleteBooking(booking)}
                                        title="Delete Booking"
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

            {/* Card view for mobile */}
            <div className="md:hidden space-y-4">
                {filtered.map((booking, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                        className="border rounded-lg p-4 shadow-sm"
                    >
                        <div className="flex justify-between">
                            <p className="font-semibold">{booking.id}</p>
                            <span
                                className={`text-xs font-medium px-2 py-1 rounded ${booking.mode === "Online"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-blue-100 text-blue-700"
                                    }`}
                            >
                                {booking.mode}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600">{booking.email}</p>
                        <p className="mt-1 text-sm">{booking.location}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {booking.persons} persons | {new Date(booking.date).toLocaleDateString()}
                        </p>
                        <div className="flex gap-3 mt-3">
                            <button
                                className="text-blue-600 hover:text-blue-800"
                                onClick={() => handleViewBooking(booking)}
                                title="View Details"
                            >
                                <FaEye />
                            </button>
                            <button
                                className="text-green-600 hover:text-green-800"
                                onClick={() => handleEditBooking(booking)}
                                title="Edit Booking"
                            >
                                <FaEdit />
                            </button>
                            <button
                                className="text-red-600 hover:text-red-800"
                                onClick={() => handleDeleteBooking(booking)}
                                title="Delete Booking"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </motion.div>
                ))}
                {filtered.length === 0 && (
                    <p className="text-center text-gray-500">No bookings found.</p>
                )}
            </div>

            {/* View Booking Modal */}
            {showViewModal && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-[#2F6288]">Booking Details</h3>
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Booking ID</label>
                                    <p className="text-sm text-gray-900">{selectedBooking.bookingId}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <p className="text-sm text-gray-900">{selectedBooking.email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Guide Name</label>
                                    <p className="text-sm text-gray-900">{selectedBooking.guideName}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mode</label>
                                    <span className={`inline-block text-xs font-medium px-2 py-1 rounded ${selectedBooking.mode === 'Online'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {selectedBooking.mode}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Persons</label>
                                    <p className="text-sm text-gray-900">{selectedBooking.persons}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Booking Date</label>
                                    <p className="text-sm text-gray-900">{new Date(selectedBooking.bookingDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Location</label>
                                    <p className="text-sm text-gray-900">{selectedBooking.location}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <p className="text-sm text-gray-900 capitalize">{selectedBooking.status}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Price</label>
                                    <p className="text-sm text-gray-900">${selectedBooking.price}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Booking Modal */}
            {showEditModal && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-[#2F6288]">Edit Booking</h3>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2F6288]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Persons</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={editForm.persons}
                                        onChange={(e) => setEditForm({ ...editForm, persons: e.target.value })}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2F6288]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                                    <select
                                        value={editForm.mode}
                                        onChange={(e) => setEditForm({ ...editForm, mode: e.target.value })}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2F6288]"
                                    >
                                        <option value="Online">Online</option>
                                        <option value="Offline">Offline</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input
                                        type="text"
                                        value={editForm.location}
                                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2F6288]"
                                        placeholder="Location details (for offline bookings)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2F6288]"
                                    >
                                        <option value="confirmed">Confirmed</option>
                                        <option value="pending">Pending</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Booking Date</label>
                                    <input
                                        type="date"
                                        value={editForm.bookingDate}
                                        onChange={(e) => setEditForm({ ...editForm, bookingDate: e.target.value })}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2F6288]"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateBooking}
                                    className="flex-1 px-4 py-2 bg-[#2F6288] text-white rounded-md hover:bg-[#1e4a6b]"
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
