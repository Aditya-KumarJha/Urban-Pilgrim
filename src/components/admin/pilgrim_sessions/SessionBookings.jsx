import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FaEye, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import { fetchLiveSessionData, saveOrUpdateLiveSessionData } from "../../../services/pilgrim_session/liveSessionService";
import { fetchRecordedSessionData, saveOrUpdateRecordedSessionData } from "../../../services/pilgrim_session/recordedSessionService";
import { showSuccess, showError } from "../../../utils/toast";
import { auth } from "../../../services/firebase";

// Stable empty array references to prevent unnecessary re-renders
const EMPTY_LIVE_SESSIONS = [];
const EMPTY_RECORDED_SESSIONS = [];

export default function SessionBookingsTable() {
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

    // Get session data from Redux
    const liveSessions = useSelector(state => state.pilgrimLiveSession?.LiveSession || EMPTY_LIVE_SESSIONS);
    const recordedSessions = useSelector(state => state.pilgrimRecordedSession?.recordedSessions || EMPTY_RECORDED_SESSIONS);

    const uid = "pilgrim_sessions"; // Replace with actual user ID from auth context

    // Fetch bookings from sessions on component mount
    useEffect(() => {
        fetchBookingsFromSessions();
    }, [liveSessions, recordedSessions]);

    const fetchBookingsFromSessions = async () => {
        try {
            let liveSessionData = liveSessions;
            let recordedSessionData = recordedSessions;
            setLoading(true);
            // Fallback to Firestore if Redux is empty
            if (!liveSessionData.length) {
                const fetchedLiveData = await fetchLiveSessionData(uid);
                if (fetchedLiveData && fetchedLiveData.slides) {
                    liveSessionData = Array.isArray(fetchedLiveData.slides)
                        ? fetchedLiveData.slides
                        : Object.values(fetchedLiveData.slides).filter(item => typeof item === 'object');
                }
            }

            if (!recordedSessionData.length) {
                const fetchedRecordedData = await fetchRecordedSessionData(uid);
                if (fetchedRecordedData && fetchedRecordedData.slides) {
                    recordedSessionData = Array.isArray(fetchedRecordedData.slides)
                        ? fetchedRecordedData.slides
                        : Object.values(fetchedRecordedData.slides).filter(item => typeof item === 'object');
                }
            }

            const bookingsData = [];

            // Extract bookings from live sessions
            liveSessionData.forEach((session, sessionIndex) => {
                if (session.purchasedUsers && Array.isArray(session.purchasedUsers)) {
                    session.purchasedUsers.forEach((user, userIndex) => {
                        bookingsData.push({
                            id: `#PS-L${String(sessionIndex + 1).padStart(3, '0')}-${String(userIndex + 1).padStart(3, '0')}`,
                            bookingId: `#PS-L${String(sessionIndex + 1).padStart(3, '0')}-${String(userIndex + 1).padStart(3, '0')}`,
                            email: user.email || user.userEmail || '',
                            programName: session.title || 'Unknown Live Session',
                            programType: 'Live',
                            persons: user.persons || user.numberOfPersons || 1,
                            date: user.bookingDate || user.createdAt || new Date(),
                            bookingDate: user.bookingDate || user.createdAt || new Date(),
                            status: user.status || 'confirmed',
                            price: user.price || session.price || 0,
                            sessionIndex,
                            userIndex,
                            sessionType: 'live',
                            originalSession: session
                        });
                    });
                }
            });

            // Extract bookings from recorded sessions
            recordedSessionData.forEach((session, sessionIndex) => {
                if (session.purchasedUsers && Array.isArray(session.purchasedUsers)) {
                    session.purchasedUsers.forEach((user, userIndex) => {
                        bookingsData.push({
                            id: `#PS-R${String(sessionIndex + 1).padStart(3, '0')}-${String(userIndex + 1).padStart(3, '0')}`,
                            bookingId: `#PS-R${String(sessionIndex + 1).padStart(3, '0')}-${String(userIndex + 1).padStart(3, '0')}`,
                            email: user.email || user.userEmail || '',
                            programName: session.title || 'Unknown Recorded Session',
                            programType: 'Recorded',
                            persons: user.persons || user.numberOfPersons || 1,
                            date: user.bookingDate || user.createdAt || new Date(),
                            bookingDate: user.bookingDate || user.createdAt || new Date(),
                            status: user.status || 'confirmed',
                            price: user.price || session.price || 0,
                            sessionIndex,
                            userIndex,
                            sessionType: 'recorded',
                            originalSession: session
                        });
                    });
                }
            });

            setBookings(bookingsData);
        } catch (error) {
            console.error("Error fetching bookings from sessions:", error);
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
            status: booking.status,
            bookingDate: new Date(booking.bookingDate).toISOString().split('T')[0]
        });
        setShowEditModal(true);
    };

    const handleUpdateBooking = async () => {
        try {
            const { sessionIndex, userIndex, sessionType } = selectedBooking;

            // Update the user data in the session's purchasedUsers array
            const updatedUser = {
                ...selectedBooking.originalSession.purchasedUsers[userIndex],
                email: editForm.email,
                persons: parseInt(editForm.persons),
                status: editForm.status,
                bookingDate: editForm.bookingDate
            };

            // Create updated session with modified purchasedUsers
            const updatedSession = {
                ...selectedBooking.originalSession,
                purchasedUsers: selectedBooking.originalSession.purchasedUsers.map((user, idx) =>
                    idx === userIndex ? updatedUser : user
                )
            };

            // Update in Firestore based on session type
            if (sessionType === 'live') {
                const updatedSessions = liveSessions.map((session, idx) =>
                    idx === sessionIndex ? updatedSession : session
                );
                await saveOrUpdateLiveSessionData(uid, 'slides', updatedSessions);
            } else {
                const updatedSessions = recordedSessions.map((session, idx) =>
                    idx === sessionIndex ? updatedSession : session
                );
                await saveOrUpdateRecordedSessionData(uid, 'slides', updatedSessions);
            }

            showSuccess("Booking updated successfully");
            setShowEditModal(false);
            fetchBookingsFromSessions(); // Refresh data
        } catch (error) {
            console.error("Error updating booking:", error);
            showError("Failed to update booking");
        }
    };

    const handleDeleteBooking = async (booking) => {
        if (!window.confirm('Are you sure you want to delete this booking?')) return;

        try {
            const { sessionIndex, userIndex, sessionType } = booking;

            // Remove user from session's purchasedUsers array
            const updatedSession = {
                ...booking.originalSession,
                purchasedUsers: booking.originalSession.purchasedUsers.filter((_, idx) => idx !== userIndex)
            };

            // Update in Firestore based on session type
            if (sessionType === 'live') {
                const updatedSessions = liveSessions.map((session, idx) =>
                    idx === sessionIndex ? updatedSession : session
                );
                await saveOrUpdateLiveSessionData(uid, 'slides', updatedSessions);
            } else {
                const updatedSessions = recordedSessions.map((session, idx) =>
                    idx === sessionIndex ? updatedSession : session
                );
                await saveOrUpdateRecordedSessionData(uid, 'slides', updatedSessions);
            }

            showSuccess("Booking deleted successfully");
            fetchBookingsFromSessions(); // Refresh data
        } catch (error) {
            console.error("Error deleting booking:", error);
            showError("Failed to delete booking");
        }
    };

    const filtered = bookings.filter((b) => {
        const matchesSearch = b.email.toLowerCase().includes(search.toLowerCase()) ||
            b.programName.toLowerCase().includes(search.toLowerCase());
        const matchesProgramType = filter === "All" || b.programType === filter;

        const bookingTime = new Date(b.date).getTime();
        let matchesDateRange = true;
        if (startDate) {
            const startTime = new Date(startDate).getTime();
            matchesDateRange = matchesDateRange && bookingTime >= startTime;
        }
        if (endDate) {
            const endTime = new Date(endDate).getTime();
            matchesDateRange = matchesDateRange && bookingTime <= endTime;
        }

        return matchesSearch && matchesProgramType && matchesDateRange;
    });

    if (loading) {
        return (
            <div className="p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold text-[#2F6288] mb-4">
                    Pilgrim Session Bookings <span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
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
                Pilgrim Session Bookings <span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
            </h2>

            {/* Filters */}
            <div className="flex flex-col xl:flex-row gap-3 mb-4">
                <div className="flex flex-col md:flex-row gap-3 flex-shrink-0">
                    <label className="text-sm flex flex-col md:flex-row md:items-center gap-2 text-nowrap">
                        Program Type:
                        <select
                            className="border p-2 rounded w-full md:w-auto"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option>All</option>
                            <option>Live</option>
                            <option>Recorded</option>
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
                            <th className="p-2">Program Type</th>
                            <th className="p-2">Persons per Session</th>
                            <th className="p-2">Booking Date</th>
                            <th className="p-2">Program Name</th>
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
                                        className={`text-xs font-medium px-2 py-1 rounded ${booking.programType === "Live"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-gray-300 text-gray-800"
                                            }`}
                                    >
                                        {booking.programType}
                                    </span>
                                </td>
                                <td className="p-2">{booking.persons}</td>
                                <td className="p-2">{booking.date}</td>
                                <td className="p-2">{booking.programName}</td>
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
                                className={`text-xs font-medium px-2 py-1 rounded ${booking.programType === "Live"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-gray-300 text-gray-800"
                                    }`}
                            >
                                {booking.programType}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600">{booking.email}</p>
                        <p className="mt-1 text-sm">{booking.programName}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {booking.persons} persons | {booking.date}
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
                                    <label className="block text-sm font-medium text-gray-700">Program Name</label>
                                    <p className="text-sm text-gray-900">{selectedBooking.programName}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Program Type</label>
                                    <span className={`inline-block text-xs font-medium px-2 py-1 rounded ${selectedBooking.programType === 'Live'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-gray-300 text-gray-800'
                                        }`}>
                                        {selectedBooking.programType}
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
