import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { fetchAllEvents } from '../../utils/fetchEvents';

const Analysis = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('Last Year');
    const [allEvents, setAllEvents] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch events data on component mount
    useEffect(() => {
        const loadEvents = async () => {
            try {
                setLoading(true);
                const eventsData = await fetchAllEvents();
                setAllEvents(eventsData);
                setError(null);
            } catch (err) {
                console.error('Error loading events:', err);
                setError('Failed to load analytics data');
            } finally {
                setLoading(false);
            }
        };

        loadEvents();
    }, []);

    // Process events data into analytics format
    const processEventsData = () => {
        const eventsByType = {
            retreat: [],
            'live-session': [],
            'recorded-session': [],
            guide: []
        };

        // Group events by type
        Object.values(allEvents).forEach(event => {
            if (eventsByType[event.type]) {
                eventsByType[event.type].push(event);
            }
        });

        // Generate monthly data for each type
        const generateMonthlyData = (events, type) => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const currentYear = new Date().getFullYear();

            return months.map(month => {
                const monthIndex = months.indexOf(month);
                const monthEvents = events.filter(event => {
                    const eventDate = new Date(event.createdAt);
                    return eventDate.getMonth() === monthIndex && eventDate.getFullYear() === currentYear;
                });

                const revenue = monthEvents.reduce((sum, event) => {
                    // Try to get actual revenue from multiple possible sources
                    let price = 0;
                    console.log(event);
                    // Check for actual purchase/transaction data first
                    if (event.originalData?.purchasedUsers?.totalAmount) {
                        price = parseFloat(event.originalData.purchasedUsers.totalAmount);
                    } else if (event.originalData?.revenue) {
                        price = parseFloat(event.originalData.revenue);
                    } else if (event.originalData?.actualPrice) {
                        price = parseFloat(event.originalData.actualPrice);
                    } else if (event.upcomingSessionCard?.actualPrice) {
                        price = parseFloat(event.upcomingSessionCard.actualPrice);
                    } else if (event.upcomingSessionCard?.price) {
                        // Fallback to listed price, but multiply by estimated conversion rate
                        const listedPrice = parseFloat(event.upcomingSessionCard.price);
                        price = listedPrice * 0.7; // Assume 70% of listed price as actual revenue
                    }
                    
                    return sum + (isNaN(price) ? 0 : price);
                }, 0);

                return {
                    month,
                    revenue: Math.round(revenue),
                    users: monthEvents.length
                };
            });
        };

        return {
            retreat: generateMonthlyData(eventsByType.retreat, 'retreat'),
            liveSession: generateMonthlyData(eventsByType['live-session'], 'live-session'),
            recordedSession: generateMonthlyData(eventsByType['recorded-session'], 'recorded-session'),
            guide: generateMonthlyData(eventsByType.guide, 'guide')
        };
    };

    // Get processed data or fallback to sample data
    const processedData = Object.keys(allEvents).length > 0 ? processEventsData() : {
        retreat: [
            { month: 'Jan', revenue: 1200, users: 120 },
            { month: 'Feb', revenue: 1800, users: 180 },
            { month: 'Mar', revenue: 2200, users: 220 },
            { month: 'Apr', revenue: 1900, users: 190 },
            { month: 'May', revenue: 2800, users: 280 },
            { month: 'Jun', revenue: 3800, users: 380 },
            { month: 'Jul', revenue: 2400, users: 240 },
            { month: 'Aug', revenue: 2100, users: 210 },
            { month: 'Sep', revenue: 1800, users: 180 },
            { month: 'Oct', revenue: 2200, users: 220 },
            { month: 'Nov', revenue: 2600, users: 260 },
            { month: 'Dec', revenue: 3200, users: 320 }
        ],
        liveSession: [
            { month: 'Jan', revenue: 2400, users: 240 },
            { month: 'Feb', revenue: 2800, users: 280 },
            { month: 'Mar', revenue: 3200, users: 320 },
            { month: 'Apr', revenue: 2900, users: 290 },
            { month: 'May', revenue: 3800, users: 380 },
            { month: 'Jun', revenue: 4200, users: 420 },
            { month: 'Jul', revenue: 3600, users: 360 },
            { month: 'Aug', revenue: 3100, users: 310 },
            { month: 'Sep', revenue: 2800, users: 280 },
            { month: 'Oct', revenue: 3200, users: 320 },
            { month: 'Nov', revenue: 3600, users: 360 },
            { month: 'Dec', revenue: 4000, users: 400 }
        ],
        recordedSession: [
            { month: 'Jan', revenue: 1800, users: 180 },
            { month: 'Feb', revenue: 2200, users: 220 },
            { month: 'Mar', revenue: 2600, users: 260 },
            { month: 'Apr', revenue: 2300, users: 230 },
            { month: 'May', revenue: 3200, users: 320 },
            { month: 'Jun', revenue: 3600, users: 360 },
            { month: 'Jul', revenue: 2800, users: 280 },
            { month: 'Aug', revenue: 2500, users: 250 },
            { month: 'Sep', revenue: 2200, users: 220 },
            { month: 'Oct', revenue: 2600, users: 260 },
            { month: 'Nov', revenue: 3000, users: 300 },
            { month: 'Dec', revenue: 3400, users: 340 }
        ],
        guide: [
            { month: 'Jan', revenue: 800, users: 80 },
            { month: 'Feb', revenue: 1200, users: 120 },
            { month: 'Mar', revenue: 1600, users: 160 },
            { month: 'Apr', revenue: 1300, users: 130 },
            { month: 'May', revenue: 2000, users: 200 },
            { month: 'Jun', revenue: 2400, users: 240 },
            { month: 'Jul', revenue: 1800, users: 180 },
            { month: 'Aug', revenue: 1500, users: 150 },
            { month: 'Sep', revenue: 1200, users: 120 },
            { month: 'Oct', revenue: 1600, users: 160 },
            { month: 'Nov', revenue: 2000, users: 200 },
            { month: 'Dec', revenue: 2200, users: 220 }
        ]
    };

    const revenueData = processedData.retreat;
    const usersData = processedData.retreat;

    // Extract data for each section
    const liveSessionsRevenueData = processedData.liveSession;
    const liveSessionsUsersData = processedData.liveSession;
    const recordedSessionsRevenueData = processedData.recordedSession;
    const recordedSessionsUsersData = processedData.recordedSession;
    const guideRevenueData = processedData.guide;
    const guideUsersData = processedData.guide;

    // Calculate totals and growth
    const calculateGrowth = (data) => {
        if (data.length < 2) return 0;
        const lastMonth = data[data.length - 1];
        const prevMonth = data[data.length - 2];
        if (prevMonth.revenue === 0) return 0;
        return Math.round(((lastMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100);
    };

    const calculateUserGrowth = (data) => {
        if (data.length < 2) return 0;
        const lastMonth = data[data.length - 1];
        const prevMonth = data[data.length - 2];
        if (prevMonth.users === 0) return 0;
        return Math.round(((lastMonth.users - prevMonth.users) / prevMonth.users) * 100);
    };

    const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
    const totalUsers = usersData.reduce((sum, item) => sum + item.users, 0);
    const revenueGrowth = calculateGrowth(revenueData);
    const userGrowth = calculateUserGrowth(usersData);

    // Live Sessions totals
    const totalLiveSessionsRevenue = liveSessionsRevenueData.reduce((sum, item) => sum + item.revenue, 0);
    const totalLiveSessionsUsers = liveSessionsUsersData.reduce((sum, item) => sum + item.users, 0);
    const liveSessionsRevenueGrowth = calculateGrowth(liveSessionsRevenueData);
    const liveSessionsUserGrowth = calculateUserGrowth(liveSessionsUsersData);

    // Recorded Sessions totals
    const totalRecordedSessionsRevenue = recordedSessionsRevenueData.reduce((sum, item) => sum + item.revenue, 0);
    const totalRecordedSessionsUsers = recordedSessionsUsersData.reduce((sum, item) => sum + item.users, 0);
    const recordedSessionsRevenueGrowth = calculateGrowth(recordedSessionsRevenueData);
    const recordedSessionsUserGrowth = calculateUserGrowth(recordedSessionsUsersData);

    // Guide totals
    const totalGuideRevenue = guideRevenueData.reduce((sum, item) => sum + item.revenue, 0);
    const totalGuideUsers = guideUsersData.reduce((sum, item) => sum + item.users, 0);
    const guideRevenueGrowth = calculateGrowth(guideRevenueData);
    const guideUserGrowth = calculateUserGrowth(guideUsersData);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                    <p className="text-sm text-gray-600 mb-1">{`${label}`}</p>
                    <p className="text-base font-semibold text-gray-900 m-0">
                        {payload[0].dataKey === 'revenue' ? `$${payload[0].value}` : payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Show loading state
    if (loading) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen font-sans flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading analytics data...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen font-sans flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 m-0">Analytics</h1>
                {Object.keys(allEvents).length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">Showing data from {Object.keys(allEvents).length} events</p>
                )}
            </div>

            {/* Pilgrim Retreats Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6 pb-2 border-b-2 border-gray-200">Pilgrim Retreats</h2>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                    {/* Total Revenue Chart */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-start mb-6 gap-4">
                            <div className="flex items-center gap-4">
                                <h3 className="text-lg font-semibold text-gray-700 m-0">Total Revenue</h3>
                                <select
                                    className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm text-gray-600 cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                >
                                    <option value="Last Year">Last Year</option>
                                    <option value="Last 6 Months">Last 6 Months</option>
                                    <option value="Last 3 Months">Last 3 Months</option>
                                </select>
                            </div>
                            <div className="text-right xl:text-right flex flex-col items-end gap-2">
                                <div className="text-3xl font-bold text-gray-900 leading-none">${totalRevenue.toLocaleString()}</div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-semibold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">+{revenueGrowth}%</span>
                                    <span className="text-gray-500">vs previous 28 days</span>
                                </div>
                                <div className="mt-1">
                                    <svg width="60" height="20" viewBox="0 0 60 20">
                                        <path d="M0,15 Q15,10 30,8 T60,5" stroke="#10B981" strokeWidth="2" fill="none" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#666' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#666' }}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="revenue"
                                        fill="#E5E7EB"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="revenue"
                                        fill="#374151"
                                        radius={[4, 4, 0, 0]}
                                        data={[revenueData[5]]} // Highlight June
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Total Users Chart */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-start mb-6 gap-4">
                            <div className="flex items-center gap-4">
                                <h3 className="text-lg font-semibold text-gray-700 m-0">Total Users</h3>
                                <select
                                    className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm text-gray-600 cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                >
                                    <option value="Last Year">Last Year</option>
                                    <option value="Last 6 Months">Last 6 Months</option>
                                    <option value="Last 3 Months">Last 3 Months</option>
                                </select>
                            </div>
                            <div className="text-right xl:text-right flex flex-col items-end gap-2">
                                <div className="text-3xl font-bold text-gray-900 leading-none">{totalUsers.toLocaleString()}</div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-semibold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">+{userGrowth}%</span>
                                    <span className="text-gray-500">vs previous 28 days</span>
                                </div>
                                <div className="mt-1">
                                    <svg width="60" height="20" viewBox="0 0 60 20">
                                        <path d="M0,15 Q15,10 30,8 T60,5" stroke="#10B981" strokeWidth="2" fill="none" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={usersData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#666' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#666' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="users"
                                        fill="#E5E7EB"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="users"
                                        fill="#374151"
                                        radius={[4, 4, 0, 0]}
                                        data={[usersData[5]]} // Highlight June
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Sessions Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6 pb-2 border-b-2 border-gray-200">Live Sessions</h2>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                    {/* Total Revenue Chart */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-start mb-6 gap-4">
                            <div className="flex items-center gap-4">
                                <h3 className="text-lg font-semibold text-gray-700 m-0">Total Revenue</h3>
                                <select
                                    className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm text-gray-600 cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                >
                                    <option value="Last Year">Last Year</option>
                                    <option value="Last 6 Months">Last 6 Months</option>
                                    <option value="Last 3 Months">Last 3 Months</option>
                                </select>
                            </div>
                            <div className="text-right xl:text-right flex flex-col items-end gap-2">
                                <div className="text-3xl font-bold text-gray-900 leading-none">${totalLiveSessionsRevenue.toLocaleString()}</div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-semibold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">+{liveSessionsRevenueGrowth}%</span>
                                    <span className="text-gray-500">vs previous 28 days</span>
                                </div>
                                <div className="mt-1">
                                    <svg width="60" height="20" viewBox="0 0 60 20">
                                        <path d="M0,15 Q15,10 30,8 T60,5" stroke="#10B981" strokeWidth="2" fill="none" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={liveSessionsRevenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#666' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#666' }}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="revenue"
                                        fill="#E5E7EB"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="revenue"
                                        fill="#3B82F6"
                                        radius={[4, 4, 0, 0]}
                                        data={[liveSessionsRevenueData[5]]} // Highlight June
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Total Users Chart */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-start mb-6 gap-4">
                            <div className="flex items-center gap-4">
                                <h3 className="text-lg font-semibold text-gray-700 m-0">Total Users</h3>
                                <select
                                    className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm text-gray-600 cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                >
                                    <option value="Last Year">Last Year</option>
                                    <option value="Last 6 Months">Last 6 Months</option>
                                    <option value="Last 3 Months">Last 3 Months</option>
                                </select>
                            </div>
                            <div className="text-right xl:text-right flex flex-col items-end gap-2">
                                <div className="text-3xl font-bold text-gray-900 leading-none">{totalLiveSessionsUsers.toLocaleString()}</div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-semibold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">+{liveSessionsUserGrowth}%</span>
                                    <span className="text-gray-500">vs previous 28 days</span>
                                </div>
                                <div className="mt-1">
                                    <svg width="60" height="20" viewBox="0 0 60 20">
                                        <path d="M0,15 Q15,10 30,8 T60,5" stroke="#10B981" strokeWidth="2" fill="none" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={liveSessionsUsersData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#666' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#666' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="users"
                                        fill="#E5E7EB"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="users"
                                        fill="#3B82F6"
                                        radius={[4, 4, 0, 0]}
                                        data={[liveSessionsUsersData[5]]} // Highlight June
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recorded Sessions Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6 pb-2 border-b-2 border-gray-200">Recorded Sessions</h2>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                    {/* Total Revenue Chart */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-start mb-6 gap-4">
                            <div className="flex items-center gap-4">
                                <h3 className="text-lg font-semibold text-gray-700 m-0">Total Revenue</h3>
                                <select
                                    className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm text-gray-600 cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                >
                                    <option value="Last Year">Last Year</option>
                                    <option value="Last 6 Months">Last 6 Months</option>
                                    <option value="Last 3 Months">Last 3 Months</option>
                                </select>
                            </div>
                            <div className="text-right xl:text-right flex flex-col items-end gap-2">
                                <div className="text-3xl font-bold text-gray-900 leading-none">${totalRecordedSessionsRevenue.toLocaleString()}</div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-semibold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">+{recordedSessionsRevenueGrowth}%</span>
                                    <span className="text-gray-500">vs previous 28 days</span>
                                </div>
                                <div className="mt-1">
                                    <svg width="60" height="20" viewBox="0 0 60 20">
                                        <path d="M0,15 Q15,10 30,8 T60,5" stroke="#10B981" strokeWidth="2" fill="none" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={recordedSessionsRevenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#666' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#666' }}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="revenue"
                                        fill="#E5E7EB"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="revenue"
                                        fill="#8B5CF6"
                                        radius={[4, 4, 0, 0]}
                                        data={[recordedSessionsRevenueData[5]]} // Highlight June
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Total Users Chart */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-start mb-6 gap-4">
                            <div className="flex items-center gap-4">
                                <h3 className="text-lg font-semibold text-gray-700 m-0">Total Users</h3>
                                <select
                                    className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm text-gray-600 cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                >
                                    <option value="Last Year">Last Year</option>
                                    <option value="Last 6 Months">Last 6 Months</option>
                                    <option value="Last 3 Months">Last 3 Months</option>
                                </select>
                            </div>
                            <div className="text-right xl:text-right flex flex-col items-end gap-2">
                                <div className="text-3xl font-bold text-gray-900 leading-none">{totalRecordedSessionsUsers.toLocaleString()}</div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-semibold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">+{recordedSessionsUserGrowth}%</span>
                                    <span className="text-gray-500">vs previous 28 days</span>
                                </div>
                                <div className="mt-1">
                                    <svg width="60" height="20" viewBox="0 0 60 20">
                                        <path d="M0,15 Q15,10 30,8 T60,5" stroke="#10B981" strokeWidth="2" fill="none" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={recordedSessionsUsersData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#666' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#666' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="users"
                                        fill="#E5E7EB"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="users"
                                        fill="#8B5CF6"
                                        radius={[4, 4, 0, 0]}
                                        data={[recordedSessionsUsersData[5]]} // Highlight June
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Guide Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6 pb-2 border-b-2 border-gray-200">Guide</h2>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                    {/* Total Revenue Chart */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-start mb-6 gap-4">
                            <div className="flex items-center gap-4">
                                <h3 className="text-lg font-semibold text-gray-700 m-0">Total Revenue</h3>
                                <select
                                    className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm text-gray-600 cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                >
                                    <option value="Last Year">Last Year</option>
                                    <option value="Last 6 Months">Last 6 Months</option>
                                    <option value="Last 3 Months">Last 3 Months</option>
                                </select>
                            </div>
                            <div className="text-right xl:text-right flex flex-col items-end gap-2">
                                <div className="text-3xl font-bold text-gray-900 leading-none">${totalGuideRevenue.toLocaleString()}</div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-semibold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">+{guideRevenueGrowth}%</span>
                                    <span className="text-gray-500">vs previous 28 days</span>
                                </div>
                                <div className="mt-1">
                                    <svg width="60" height="20" viewBox="0 0 60 20">
                                        <path d="M0,15 Q15,10 30,8 T60,5" stroke="#10B981" strokeWidth="2" fill="none" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={guideRevenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#666' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#666' }}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="revenue"
                                        fill="#E5E7EB"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="revenue"
                                        fill="#F59E0B"
                                        radius={[4, 4, 0, 0]}
                                        data={[guideRevenueData[5]]} // Highlight June
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Total Users Chart */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-start mb-6 gap-4">
                            <div className="flex items-center gap-4">
                                <h3 className="text-lg font-semibold text-gray-700 m-0">Total Users</h3>
                                <select
                                    className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm text-gray-600 cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                >
                                    <option value="Last Year">Last Year</option>
                                    <option value="Last 6 Months">Last 6 Months</option>
                                    <option value="Last 3 Months">Last 3 Months</option>
                                </select>
                            </div>
                            <div className="text-right xl:text-right flex flex-col items-end gap-2">
                                <div className="text-3xl font-bold text-gray-900 leading-none">{totalGuideUsers.toLocaleString()}</div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-semibold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">+{guideUserGrowth}%</span>
                                    <span className="text-gray-500">vs previous 28 days</span>
                                </div>
                                <div className="mt-1">
                                    <svg width="60" height="20" viewBox="0 0 60 20">
                                        <path d="M0,15 Q15,10 30,8 T60,5" stroke="#10B981" strokeWidth="2" fill="none" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={guideUsersData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#666' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#666' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="users"
                                        fill="#E5E7EB"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="users"
                                        fill="#F59E0B"
                                        radius={[4, 4, 0, 0]}
                                        data={[guideUsersData[5]]} // Highlight June
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Analysis;