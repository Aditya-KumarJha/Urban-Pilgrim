import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Eye, Package, Users, Clock, MapPin } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { setBundles, addBundle, updateBundle, deleteBundle, resetBundleForm, setEditingBundle } from "../../features/bundleSlice";
import { fetchAllBundles, saveOrUpdateBundle, deleteBundle as deleteBundleService } from "../../services/bundleService";
import BundleForm from "../../components/admin/bundles/BundleForm";
import BundleCard from "../../components/admin/bundles/BundleCard";

export default function Bundles() {
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingBundleId, setEditingBundleId] = useState(null);
    const [allPrograms, setAllPrograms] = useState({
        liveSessions: [],
        recordedSessions: [],
        pilgrimGuides: [],
        pilgrimRetreats: [],
        upcomingEvents: []
    });

    const dispatch = useDispatch();
    const { bundles, loading } = useSelector((state) => state.bundles);

    // Fetch all programs from different sources
    useEffect(() => {
        const fetchAllPrograms = async () => {
            try {
                // Fetch Live Sessions
                const liveSessionsRef = doc(db, `pilgrim_sessions/pilgrim_sessions/sessions/liveSession`);
                const liveSessionsSnapshot = await getDoc(liveSessionsRef);
                if (liveSessionsSnapshot.exists()) {
                    const liveSessionsData = liveSessionsSnapshot.data();
                    const liveSessions = (liveSessionsData.slides || []).map((session, index) => ({
                        id: `live-${index}`,
                        title: session?.liveSessionCard?.title || '',
                        type: 'Live Session',
                        category: session?.liveSessionCard?.category || '',
                        price: session?.liveSessionCard?.price || '',
                        image: session?.liveSessionCard?.thumbnail || '',
                        source: 'liveSessions'
                    }));
                    setAllPrograms(prev => ({ ...prev, liveSessions }));
                }

                // Fetch Recorded Sessions
                const recordedSessionsRef = doc(db, `pilgrim_sessions/pilgrim_sessions/sessions/recordedSession`);
                const recordedSessionsSnapshot = await getDoc(recordedSessionsRef);
                if (recordedSessionsSnapshot.exists()) {
                    const recordedSessionsData = recordedSessionsSnapshot.data();
                    const recordedSessions = (recordedSessionsData.slides || []).map((session, index) => ({
                        id: `recorded-${index}`,
                        title: session?.recordedProgramCard?.title || '',
                        type: 'Recorded Session',
                        category: session?.recordedProgramCard?.category || '',
                        price: session?.recordedProgramCard?.price || '',
                        image: session?.recordedProgramCard?.thumbnail || '',
                        source: 'recordedSessions'
                    }));
                    setAllPrograms(prev => ({ ...prev, recordedSessions }));
                }

                // Fetch Pilgrim Guides
                const guidesRef = doc(db, `pilgrim_guides/pilgrim_guides/guides/data`);
                const guidesSnapshot = await getDoc(guidesRef);
                if (guidesSnapshot.exists()) {
                    const guidesData = guidesSnapshot.data();
                    const guides = (guidesData.slides || []).map((guide, index) => ({
                        id: `guide-${index}`,
                        title: guide?.guideCard?.title || '',
                        type: 'Pilgrim Guide',
                        category: guide?.guideCard?.category || '',
                        price: guide?.guideCard?.price || '',
                        image: guide?.guideCard?.thumbnail || '',
                        source: 'pilgrimGuides'
                    }));
                    setAllPrograms(prev => ({ ...prev, pilgrimGuides: guides }));
                }

                // Fetch Pilgrim Retreats
                const retreatsRef = doc(db, `pilgrim_retreat/user-uid/retreats/data`);
                const retreatsSnapshot = await getDoc(retreatsRef);
                if (retreatsSnapshot.exists()) {
                    const retreatsData = retreatsSnapshot.data();
                    const retreats = Object.keys(retreatsData).map((key) => ({
                        id: `retreat-${key}`,
                        title: retreatsData[key]?.pilgrimRetreatCard?.title || '',
                        type: 'Pilgrim Retreat',
                        category: retreatsData[key]?.pilgrimRetreatCard?.category || '',
                        price: retreatsData[key]?.pilgrimRetreatCard?.price || '',
                        image: retreatsData[key]?.pilgrimRetreatCard?.image || '',
                        location: retreatsData[key]?.pilgrimRetreatCard?.location || '',
                        source: 'pilgrimRetreats'
                    }));
                    setAllPrograms(prev => ({ ...prev, pilgrimRetreats: retreats }));
                }

                // Fetch Upcoming Events
                const eventsRef = doc(db, `upcoming_events/user-uid/events/data`);
                const eventsSnapshot = await getDoc(eventsRef);
                if (eventsSnapshot.exists()) {
                    const eventsData = eventsSnapshot.data();
                    const events = Object.keys(eventsData).map((key) => ({
                        id: `event-${key}`,
                        title: eventsData[key]?.upcomingSessionCard?.title || '',
                        type: 'Upcoming Event',
                        category: eventsData[key]?.upcomingSessionCard?.category || '',
                        price: eventsData[key]?.upcomingSessionCard?.price || '',
                        image: eventsData[key]?.upcomingSessionCard?.image || '',
                        location: eventsData[key]?.upcomingSessionCard?.location || '',
                        source: 'upcomingEvents'
                    }));
                    setAllPrograms(prev => ({ ...prev, upcomingEvents: events }));
                }
            } catch (error) {
                console.error("Error fetching programs:", error);
            }
        };

        fetchAllPrograms();
    }, []);

    // Fetch bundles on component mount
    useEffect(() => {
        const loadBundles = async () => {
            try {
                const bundlesData = await fetchAllBundles();
                dispatch(setBundles(bundlesData));
            } catch (error) {
                console.error("Error loading bundles:", error);
            }
        };

        loadBundles();
    }, [dispatch]);

    const handleCreateBundle = () => {
        setIsEditing(false);
        setEditingBundleId(null);
        dispatch(resetBundleForm());
        setShowForm(true);
    };

    const handleEditBundle = (bundle) => {
        setIsEditing(true);
        setEditingBundleId(bundle.id);
        dispatch(setEditingBundle(bundle));
        setShowForm(true);
    };

    const handleDeleteBundle = async (bundleId) => {
        if (window.confirm("Are you sure you want to delete this bundle?")) {
            try {
                await deleteBundleService(bundleId);
                dispatch(deleteBundle(bundleId));
            } catch (error) {
                console.error("Error deleting bundle:", error);
            }
        }
    };

    const handleSaveBundle = async (bundleData) => {
        try {
            if (isEditing) {
                const result = await saveOrUpdateBundle(bundleData, editingBundleId);
                dispatch(updateBundle({ id: editingBundleId, bundleData: result.data }));
            } else {
                const result = await saveOrUpdateBundle(bundleData);
                dispatch(addBundle(result.data));
            }
            setShowForm(false);
            setIsEditing(false);
            setEditingBundleId(null);
            dispatch(resetBundleForm());
        } catch (error) {
            console.error("Error saving bundle:", error);
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setIsEditing(false);
        setEditingBundleId(null);
        dispatch(resetBundleForm());
    };

    // Calculate total programs count
    const totalPrograms = Object.values(allPrograms).reduce((total, programs) => total + programs.length, 0);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#2F6288] mb-2">
                        Bundle Program Management
                    </h1>
                    <p className="text-gray-600">
                        Create and manage program bundles to offer customers multiple programs at discounted rates
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Bundles</p>
                                <p className="text-2xl font-bold text-[#2F6288]">{bundles.length}</p>
                            </div>
                            <Package className="w-8 h-8 text-[#2F6288]" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Programs</p>
                                <p className="text-2xl font-bold text-[#2F6288]">{totalPrograms}</p>
                            </div>
                            <Users className="w-8 h-8 text-[#2F6288]" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Live Sessions</p>
                                <p className="text-2xl font-bold text-[#2F6288]">{allPrograms.liveSessions.length}</p>
                            </div>
                            <Clock className="w-8 h-8 text-[#2F6288]" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Retreats</p>
                                <p className="text-2xl font-bold text-[#2F6288]">{allPrograms.pilgrimRetreats.length}</p>
                            </div>
                            <MapPin className="w-8 h-8 text-[#2F6288]" />
                        </div>
                    </motion.div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={handleCreateBundle}
                        className="bg-[#2F6288] text-white px-6 py-3 rounded-lg hover:bg-[#1e4a6b] transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Bundle
                    </button>
                </div>

                {/* Bundles Grid */}
                {bundles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bundles.map((bundle) => (
                            <BundleCard
                                key={bundle.id}
                                bundle={bundle}
                                onEdit={() => handleEditBundle(bundle)}
                                onDelete={() => handleDeleteBundle(bundle.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No bundles created yet</h3>
                        <p className="text-gray-500 mb-6">
                            Start creating bundles to offer multiple programs at discounted rates
                        </p>
                        <button
                            onClick={handleCreateBundle}
                            className="bg-[#2F6288] text-white px-6 py-3 rounded-lg hover:bg-[#1e4a6b] transition-colors"
                        >
                            Create Your First Bundle
                        </button>
                    </div>
                )}

                {/* Bundle Form Modal */}
                {showForm && (
                    <BundleForm
                        isOpen={showForm}
                        onClose={closeForm}
                        onSave={handleSaveBundle}
                        isEditing={isEditing}
                        allPrograms={allPrograms}
                    />
                )}
            </div>
        </div>
    );
}
