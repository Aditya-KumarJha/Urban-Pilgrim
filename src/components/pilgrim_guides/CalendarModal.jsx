import { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight, FiX, FiArrowLeft } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { addToCart } from "../../features/cartSlice.js";
import { showSuccess } from "../../utils/toast.js";

export default function CalendarModal({ 
    isOpen, 
    onClose, 
    sessionData, 
    selectedPlan, 
    mode,
    availableSlots = []
}) {
    console.log("sessionData", sessionData);
    console.log("selectedPlan", selectedPlan);
    console.log("availableSlots", availableSlots);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [localSlots, setLocalSlots] = useState([]);
    const [view, setView] = useState('monthly'); // 'monthly', 'daily', 'confirmation'
    const [loading, setLoading] = useState(false);
    
    const dispatch = useDispatch();

    useEffect(() => {
        if (isOpen) {
            fetchAvailableSlots();
        }
    }, [isOpen, availableSlots, mode, selectedPlan]);

    const fetchAvailableSlots = async () => {
        // Use slots passed from parent component instead of fetching
        if (availableSlots.length > 0) {
            console.log("Using slots from parent:", availableSlots);
            // Process parent slots to ensure they have the available property
            const processedParentSlots = availableSlots.map((slot, index) => ({
                id: slot.id || `parent-${slot.date}-${slot.time || slot.startTime}-${index}`,
                date: slot.date,
                time: slot.time || slot.startTime,
                endTime: slot.endTime,
                location: slot.location,
                available: true, // All slots are available since booking tracking is not implemented
                duration: slot.duration || 60,
                ...slot
            }));
            setLocalSlots(processedParentSlots);
            setLoading(false);
            return;
        }
        
        setLoading(true);
        try {
            // Fallback: Get slots from session data if no slots passed from parent
            const modeKey = mode === 'Online' ? 'onlineSlots' : 'offlineSlots';
            const slots = sessionData?.session?.[modeKey] || [];
            console.log("slots from session:", slots);
                
            // Process slots into the expected format
            const processedSlots = slots.map((slot, index) => ({
                id: `data-${slot.date}-${slot.startTime}-${index}`,
                date: slot.date,
                time: slot.startTime || slot.time,
                endTime: slot.endTime,
                location: slot.location,
                available: true, // All slots are available since booking tracking is not implemented
                duration: slot.duration || 60,
                ...slot
            }));
            
            console.log("Processed slots:", processedSlots);
            setLocalSlots(processedSlots);
        } catch (error) {
            console.error('Error fetching slots:', error);
            setLocalSlots([]);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }
        
        return days;
    };

    const hasAvailableSlots = (day) => {
        if (!day) return false;
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return localSlots.some(slot => slot.date === dateStr && slot.available);
    };

    const getNextAvailableSlot = () => {
        const availableSlot = localSlots.find(slot => slot.available);
        if (availableSlot) {
            const date = new Date(availableSlot.date);
            return {
                date: date.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                }),
                time: availableSlot.time
            };
        }
        return null;
    };

    const getSlotsForDate = (dateStr) => {
        return localSlots.filter(slot => slot.date === dateStr);
    };

    const handleDateClick = (day) => {
        if (!day || !hasAvailableSlots(day)) return;
        
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(dateStr);
        setView('daily');
    };

    const handleSlotSelect = (slot) => {
        setSelectedSlot(slot);
        setView('confirmation');
    };

    const handleAddToCart = () => {
        if (!sessionData || !selectedSlot) {
            console.log("Missing session data or selected slot");
            return;
        }

        // Get the price based on mode and subscription type
        const modeKey = mode?.toLowerCase(); // "online" or "offline"
        const subscriptionKey = selectedPlan; // "monthly", "quarterly", "oneTime"
        const price = sessionData[modeKey]?.[subscriptionKey]?.price;

        const cartItem = {
            id: `${sessionData?.guideCard?.title}-${selectedSlot.id}`, // unique id
            title: sessionData?.guideCard?.title,
            price: price,
            persons: 1, // default to 1 person
            image: sessionData?.guideCard?.thumbnail,
            quantity: 1,
            type: "guide",
            mode: mode,
            subscriptionType: selectedPlan,
            organizer: sessionData?.organizer,
            slot: selectedSlot,
            date: selectedDate,
            timestamp: new Date().toISOString()
        };

        console.log("Adding to cart:", cartItem);
        dispatch(addToCart(cartItem));
        showSuccess("Added to cart!");
        
        onClose();
        resetModal();
    };

    const resetModal = () => {
        setView('monthly');
        setSelectedDate(null);
        setSelectedSlot(null);
    };

    const navigateMonth = (direction) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
    };

    if (!isOpen) return null;

    const nextSlot = getNextAvailableSlot();
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {sessionData?.session?.title || 'Book Your Session'}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {mode} - {selectedPlan === 'monthly' ? 'Monthly' : selectedPlan === 'quarterly' ? 'Quarterly' : 'One Time'} Plan
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F6288]"></div>
                        </div>
                    ) : (
                        <>
                            {/* Monthly View */}
                            {view === 'monthly' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Calendar */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <button
                                                onClick={() => navigateMonth(-1)}
                                                className="p-2 hover:bg-gray-100 rounded-full"
                                            >
                                                <FiChevronLeft className="w-5 h-5" />
                                            </button>
                                            <h3 className="text-lg font-semibold">{monthName}</h3>
                                            <button
                                                onClick={() => navigateMonth(1)}
                                                className="p-2 hover:bg-gray-100 rounded-full"
                                            >
                                                <FiChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-7 gap-1 mb-2">
                                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                                                    {day}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-7 gap-1">
                                            {getDaysInMonth(currentDate).map((day, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleDateClick(day)}
                                                    disabled={!day || !hasAvailableSlots(day)}
                                                    className={`p-2 text-center text-sm rounded transition-colors ${
                                                        !day 
                                                            ? 'invisible' 
                                                            : hasAvailableSlots(day)
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer'
                                                                : 'text-gray-300 cursor-not-allowed'
                                                    }`}
                                                >
                                                    {day}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Info Panel */}
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm text-blue-800 mb-2">
                                                📅 All slots are currently available. Booking will be confirmed after purchase.
                                            </p>
                                        </div>

                                        {nextSlot && (
                                            <div className="bg-green-50 p-4 rounded-lg">
                                                <p className="text-sm font-medium text-green-800 mb-2">
                                                    Next Available Slot:
                                                </p>
                                                <p className="text-green-700">
                                                    {nextSlot.date} at {nextSlot.time}
                                                </p>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <h4 className="font-medium text-gray-800">Available Slots</h4>
                                            <p className="text-sm text-gray-600">
                                                Tip: You can select multiple slots and add them to your cart in one go!
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-600">Please choose a date</p>
                                            <div className="flex items-center gap-4 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-green-100 rounded"></div>
                                                    <span>Available</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-gray-200 rounded"></div>
                                                    <span>Unavailable</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Daily View */}
                            {view === 'daily' && (
                                <div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <button
                                            onClick={() => setView('monthly')}
                                            className="flex items-center gap-2 text-[#2F6288] hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                                        >
                                            <FiArrowLeft className="w-4 h-4" />
                                            Back to Calendar
                                        </button>
                                        <h3 className="text-lg font-semibold">
                                            {new Date(selectedDate).toLocaleDateString('en-US', { 
                                                weekday: 'long', 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {getSlotsForDate(selectedDate).map(slot => (
                                            <button
                                                key={slot.id}
                                                onClick={() => handleSlotSelect(slot)}
                                                className="p-4 rounded-lg border-2 transition-all border-green-300 bg-green-50 hover:border-green-500 hover:bg-green-100"
                                            >
                                                <div className="text-left">
                                                    <p className="font-semibold text-green-800">{slot.time}</p>
                                                    <p className="text-sm text-gray-600">{slot.duration} minutes</p>
                                                    <p className="text-xs text-green-600 mt-1">Available</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Confirmation View */}
                            {view === 'confirmation' && selectedSlot && (
                                <div className="max-w-md mx-auto">
                                    <div className="text-center mb-6">
                                        <h3 className="text-lg font-semibold mb-2">Confirm Your Booking</h3>
                                        <p className="text-gray-600">Please review your selection</p>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-green-600">🟢</span>
                                                <span className="font-medium">{mode} - {selectedSlot.duration} minutes</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>📅</span>
                                                <span>
                                                    {new Date(selectedDate).toLocaleDateString('en-US', { 
                                                        weekday: 'long', 
                                                        month: 'short', 
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>🕐</span>
                                                <span>{selectedSlot.time}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>🌏</span>
                                                <span>Asia/Calcutta</span>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm text-blue-800">
                                                📞 All slots are available. Booking will be confirmed after purchase.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setView('daily')}
                                            className="flex-1 px-4 py-3 border-2 border-[#2F6288] text-[#2F6288] rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleAddToCart}
                                            className="flex-1 px-4 py-3 bg-[#2F6288] text-white rounded-lg hover:bg-[#2F6288]/90 transition-colors font-semibold"
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
