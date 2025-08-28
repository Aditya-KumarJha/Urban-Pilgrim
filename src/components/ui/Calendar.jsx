import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar = ({ eventDates = [], onDateSelect, selectedDate }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Get first day of month and number of days
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const firstDayWeekday = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Create calendar grid
    const calendarDays = useMemo(() => {
        const days = [];
        
        // Add empty cells for days before month starts
        for (let i = 0; i < firstDayWeekday; i++) {
            days.push(null);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }
        
        return days;
    }, [firstDayWeekday, daysInMonth]);
    
    // Check if a date has events
    const hasEvents = (day) => {
        if (!day) return false;
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return eventDates.includes(dateStr);
    };
    
    // Check if date is selected
    const isSelected = (day) => {
        if (!day || !selectedDate) return false;
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return selectedDate === dateStr;
    };
    
    const navigateMonth = (direction) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
    };
    
    const handleDateClick = (day) => {
        if (!day) return;
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onDateSelect(dateStr);
    };
    
    const isToday = (day) => {
        if (!day) return false;
        const today = new Date();
        return day === today.getDate() && 
               currentMonth === today.getMonth() && 
               currentYear === today.getFullYear();
    };
    
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => navigateMonth(-1)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                
                <h3 className="text-lg font-semibold text-gray-800">
                    {monthNames[currentMonth]} {currentYear}
                </h3>
                
                <button
                    onClick={() => navigateMonth(1)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
            </div>
            
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                        {day}
                    </div>
                ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                    <button
                        key={index}
                        onClick={() => handleDateClick(day)}
                        disabled={!day}
                        className={`
                            h-8 w-8 text-sm rounded-full flex items-center justify-center
                            ${!day ? 'invisible' : ''}
                            ${isToday(day) ? 'bg-blue-100 text-blue-800 font-semibold' : ''}
                            ${isSelected(day) ? 'bg-blue-600 text-white font-semibold' : ''}
                            ${hasEvents(day) && !isSelected(day) ? 'bg-green-100 text-green-800 font-medium' : ''}
                            ${!hasEvents(day) && !isToday(day) && !isSelected(day) ? 'text-gray-700 hover:bg-gray-100' : ''}
                            ${day ? 'cursor-pointer' : ''}
                        `}
                    >
                        {day}
                    </button>
                ))}
            </div>
            
            {/* Legend */}
            <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-green-100 rounded-full"></div>
                        <span className="text-gray-600">Has Events</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-blue-100 rounded-full"></div>
                        <span className="text-gray-600">Today</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calendar;
