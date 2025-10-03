import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { 
    setWorkshops, 
    setLoading, 
    setCurrentWorkshop, 
    deleteWorkshop as deleteWorkshopAction,
    setError 
} from "../../../features/workshopsSlice";
import { 
    getWorkshops, 
    deleteWorkshop as deleteWorkshopService 
} from "../../../services/workshopService";
import { showSuccess, showError } from "../../../utils/toast";

export default function WorkshopList() {
    const dispatch = useDispatch();
    const { workshops, loading, error } = useSelector((state) => state.workshops);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        loadWorkshops();
    }, []);

    const loadWorkshops = async () => {
        dispatch(setLoading(true));
        try {
            const workshopsData = await getWorkshops();
            dispatch(setWorkshops(workshopsData));
        } catch (error) {
            console.error("Error loading workshops:", error);
            dispatch(setError("Failed to load workshops"));
            showError("Failed to load workshops");
        }
    };

    const handleEdit = (workshop) => {
        dispatch(setCurrentWorkshop(workshop));
    };

    const handleDelete = async (workshopId) => {
        try {
            await deleteWorkshopService(workshopId);
            dispatch(deleteWorkshopAction(workshopId));
            showSuccess("Workshop deleted successfully!");
            setDeleteConfirm(null);
        } catch (error) {
            console.error("Error deleting workshop:", error);
            showError("Failed to delete workshop");
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(price);
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date.seconds ? date.seconds * 1000 : date).toLocaleDateString('en-IN');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="w-8 h-8 border-4 border-[#2F6288] border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">Loading workshops...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
                <button 
                    onClick={loadWorkshops}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#2F6288]">
                    Workshops Management
                    <span className="bg-[#2F6288] mt-1 w-20 h-1 block"></span>
                </h2>
                <div className="text-sm text-gray-600">
                    Total: {workshops.length} workshop{workshops.length !== 1 ? 's' : ''}
                </div>
            </div>

            {workshops.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No workshops yet</h3>
                    <p className="text-gray-500 mb-4">Create your first workshop to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workshops.map((workshop) => (
                        <div key={workshop.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            {/* Workshop Thumbnail */}
                            <div className="relative h-48 bg-gray-200">
                                {workshop.thumbnail ? (
                                    <img
                                        src={workshop.thumbnail}
                                        alt={workshop.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                                
                                {/* Action Buttons */}
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(workshop)}
                                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                        title="Edit Workshop"
                                    >
                                        <Edit size={14} />
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(workshop.id)}
                                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                        title="Delete Workshop"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Workshop Details */}
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                    {workshop.title || 'Untitled Workshop'}
                                </h3>
                                
                                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                                    {workshop.description || 'No description available'}
                                </p>

                                {/* Price and Variants */}
                                <div className="mb-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Base Price:</span>
                                        <span className="text-lg font-bold text-[#2F6288]">
                                            {workshop.price ? formatPrice(workshop.price) : 'Free'}
                                        </span>
                                    </div>
                                    
                                    {workshop.variants && workshop.variants.length > 1 && (
                                        <div className="text-xs text-gray-500">
                                            +{workshop.variants.length - 1} variant{workshop.variants.length > 2 ? 's' : ''}
                                        </div>
                                    )}
                                </div>

                                {/* Participants */}
                                <div className="flex items-center justify-between mb-3 text-sm">
                                    <span className="text-gray-600">Participants:</span>
                                    <span className="font-medium">
                                        {workshop.minPerson || 0} - {workshop.maxPerson || '∞'}
                                    </span>
                                </div>

                                {/* Media Count */}
                                <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                                    <span>📸 {workshop.images?.length || 0} images</span>
                                    <span>🎥 {workshop.videos?.length || 0} videos</span>
                                </div>

                                {/* Created Date */}
                                <div className="text-xs text-gray-400">
                                    Created: {formatDate(workshop.createdAt)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Delete Workshop
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this workshop? This action cannot be undone.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
