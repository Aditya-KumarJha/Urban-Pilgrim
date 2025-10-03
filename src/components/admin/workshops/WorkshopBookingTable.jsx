import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaEye, FaSpinner } from "react-icons/fa";
import { useSelector } from "react-redux";
import { showError } from "../../../utils/toast";

// Dynamic booking management component for workshops

// Stable empty array reference to prevent unnecessary re-renders
const EMPTY_WORKSHOPS = [];

export default function WorkshopBookingTable() {
    const [filter, setFilter] = useState("All Bookings");
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    const workshops = useSelector(state => state.workshops?.workshops || EMPTY_WORKSHOPS);

    // Fetch workshop data and extract bookings from purchasedUsers
    useEffect(() => {
        fetchBookingsFromWorkshops();
    }, [workshops]);

    const fetchBookingsFromWorkshops = async () => {
        try {
            const bookingsData = [];

            workshops.forEach((workshop, workshopIndex) => {
                if (workshop.purchasedUsers && Array.isArray(workshop.purchasedUsers)) {
                    workshop.purchasedUsers.forEach((user, userIndex) => {
                        bookingsData.push({
                            id: `${workshop.id || workshopIndex}-${userIndex}`,
                            bookingId: `#WS-${String(workshopIndex + 1).padStart(3, '0')}-${String(userIndex + 1).padStart(3, '0')}`,
                            email: user.email || user.userEmail || '',
                            name: user.name || user.fullName || user.userName || '',
                            whatsapp: user.whatsapp || user.whatsApp || user.phone || user.contact || '',
                            workshop: workshop.title || 'Unknown Workshop',
                            variant: user.variant || 'Standard',
                            persons: user.persons || user.numberOfPersons || 1,
                            bookingDate: user.purchasedAt || user.bookingDate || user.createdAt,
                            status: user.status || 'confirmed',
                            price: user.price || workshop.price || 0,
                            workshopIndex,
                            userIndex,
                            originalWorkshop: workshop
                        });
                    });
                }
            });

            setBookings(bookingsData);
        } catch (error) {
            console.error("Error fetching bookings from workshops:", error);
            showError("Failed to fetch booking data");
        } finally {
            setLoading(false);
        }
    };

    const handleView = (booking) => {
        setSelectedBooking(booking);
        setShowViewModal(true);
    };

    const filtered = bookings.filter((b) => {
        const matchesSearch = (b.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (b.workshop?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (b.name?.toLowerCase() || '').includes(search.toLowerCase());

        const bookingTime = b.bookingDate ? new Date(b.bookingDate).getTime() : 0;
        const now = Date.now();

        let matchesFilter = true;
        if (filter === "Recent") {
            const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
            matchesFilter = bookingTime >= weekAgo;
        } else if (filter === "This Month") {
            const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
            matchesFilter = bookingTime >= monthStart;
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

        return matchesSearch && matchesFilter && matchesDateRange;
    });

    return (
        <div className="p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold text-[#2F6288] mb-4">
                Workshop Bookings <span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
            </h2>

            {/* Export */}
            <div className="flex justify-end mb-3">
                <button
                    onClick={() => {
                        try {
                            const rows = bookings.map(b => ({
                                BookingID: b.bookingId,
                                Email: b.email,
                                Name: b.name || '',
                                WhatsApp: b.whatsapp || '',
                                Workshop: b.workshop,
                                Variant: b.variant,
                                Persons: b.persons,
                                BookingDate: new Date(b.bookingDate).toLocaleDateString(),
                                Status: b.status,
                                Price: b.price,
                            }));
                            const headers = Object.keys(rows[0] || { BookingID:'',Email:'',Name:'',WhatsApp:'',Workshop:'',Variant:'',Persons:'',BookingDate:'',Status:'',Price:'' });
                            const csv = [headers.join(','), ...rows.map(r => headers.map(h => {
                                const val = (r[h] ?? '').toString().replace(/"/g, '""');
                                return `"${val}"`;
                            }).join(','))].join('\n');
                            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `workshop_bookings_${new Date().toISOString().slice(0,10)}.csv`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                        } catch (e) {
                            console.error('Export failed', e);
                        }
                    }}
                    className="px-3 py-2 text-sm bg-[#2F6288] text-white rounded hover:bg-[#1e4a6b]"
                >
                    Export to Excel
                </button>
            </div>

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
                            <option>Recent</option>
                            <option>This Month</option>
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
                        placeholder="Search by email, name, or workshop..."
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
                                <th className="p-2">Name</th>
                                <th className="p-2">Workshop</th>
                                <th className="p-2">Variant</th>
                                <th className="p-2">Price</th>
                                <th className="p-2">WhatsApp</th>
                                <th className="p-2">Persons</th>
                                <th className="p-2">Booking Date</th>
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
                                    <td className="p-2">{booking.name || '-'}</td>
                                    <td className="p-2 max-w-[200px] truncate" title={booking.workshop}>{booking.workshop}</td>
                                    <td className="p-2">
                                        <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-700">
                                            {booking.variant}
                                        </span>
                                    </td>
                                    <td className="p-2">₹{booking.price}</td>
                                    <td className="p-2">{booking.whatsapp || '-'}</td>
                                    <td className="p-2">{booking.persons}</td>
                                    <td className="p-2">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                                    <td className="p-2">
                                        <span
                                            className={`text-xs font-medium px-2 py-1 rounded ${
                                                booking.status === "confirmed"
                                                    ? "bg-green-100 text-green-700"
                                                    : booking.status === "pending"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-red-100 text-red-700"
                                            }`}
                                        >
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="p-2 flex items-center justify-center gap-2">
                                        <button
                                            className="text-blue-600 hover:text-blue-800"
                                            onClick={() => handleView(booking)}
                                            title="View Details"
                                        >
                                            <FaEye />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                            {filtered.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="11" className="text-center p-4 text-gray-500">
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
                                    {booking.name && <p className="text-sm text-gray-600">Name: {booking.name}</p>}
                                    {booking.whatsapp && <p className="text-sm text-gray-600">WhatsApp: {booking.whatsapp}</p>}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-700">
                                        {booking.variant}
                                    </span>
                                    <span
                                        className={`text-xs font-medium px-2 py-1 rounded ${
                                            booking.status === "confirmed"
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
                            <p className="mt-2 text-sm font-medium">{booking.workshop}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {booking.persons} persons | ₹{booking.price} | {new Date(booking.bookingDate).toLocaleDateString()}
                            </p>
                            <div className="flex gap-3 mt-3">
                                <button
                                    className="text-blue-600 hover:text-blue-800"
                                    onClick={() => handleView(booking)}
                                >
                                    <FaEye />
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
                <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold mb-4">Workshop Booking Details</h3>
                        <div className="space-y-2">
                            <p><strong>Booking ID:</strong> {selectedBooking.bookingId}</p>
                            <p><strong>User:</strong> {selectedBooking.name || '-'} ({selectedBooking.email})</p>
                            <p><strong>WhatsApp:</strong> {selectedBooking.whatsapp || '-'}</p>
                            <p><strong>Workshop:</strong> {selectedBooking.workshop}</p>
                            <p><strong>Variant:</strong> {selectedBooking.variant}</p>
                            <p><strong>Persons:</strong> {selectedBooking.persons}</p>
                            <p><strong>Booking Date:</strong> {new Date(selectedBooking.bookingDate).toLocaleDateString()}</p>
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
        </div>
    );
}
