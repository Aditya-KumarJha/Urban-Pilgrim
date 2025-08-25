import { motion } from "framer-motion";
import { Edit2, Trash2, Package, DollarSign, Percent, Users, Calendar } from "lucide-react";

export default function BundleCard({ bundle, onEdit, onDelete }) {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const calculateSavings = (originalPrice, bundlePrice) => {
        if (!originalPrice || !bundlePrice) return 0;
        const savings = originalPrice - bundlePrice;
        const percentage = (savings / originalPrice) * 100;
        return { amount: savings, percentage: Math.round(percentage) };
    };

    const getVariant1Savings = () => {
        if (bundle.variant1?.totalPrice && bundle.variant1?.price) {
            return calculateSavings(bundle.variant1.totalPrice, bundle.variant1.price);
        }
        return { amount: 0, percentage: 0 };
    };

    const getVariant2Savings = () => {
        if (bundle.variant2?.totalPrice && bundle.variant2?.price) {
            return calculateSavings(bundle.variant2.totalPrice, bundle.variant2.price);
        }
        return { amount: 0, percentage: 0 };
    };

    const variant1Savings = getVariant1Savings();
    const variant2Savings = getVariant2Savings();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2F6288] to-[#1e4a6b] p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <Package className="w-6 h-6" />
                        <h3 className="text-xl font-bold">{bundle.name}</h3>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onEdit}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                            title="Edit Bundle"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                            title="Delete Bundle"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <p className="text-white/90 text-sm line-clamp-2">{bundle.description}</p>
            </div>

            {/* Bundle Variants */}
            <div className="p-6 space-y-6">
                {/* Variant 1 - 3 Programs */}
                {bundle.variant1 && bundle.variant1.programs && bundle.variant1.programs.length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Users className="w-4 h-4 text-[#2F6288]" />
                                3 Programs Bundle
                            </h4>
                            <span className="text-sm text-gray-500">
                                {bundle.variant1.programs.length}/3 programs
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="text-center">
                                <p className="text-sm text-gray-600">Original Price</p>
                                <p className="text-lg font-bold text-gray-900">
                                    ₹{bundle.variant1.totalPrice || 0}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-600">Bundle Price</p>
                                <p className="text-lg font-bold text-[#2F6288]">
                                    ₹{bundle.variant1.price || 0}
                                </p>
                            </div>
                        </div>
                        
                        {variant1Savings.percentage > 0 && (
                            <div className="text-center p-2 bg-green-50 rounded-lg">
                                <p className="text-sm text-green-700">
                                    Save ₹{variant1Savings.amount} ({variant1Savings.percentage}% off)
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Variant 2 - 5 Programs */}
                {bundle.variant2 && bundle.variant2.programs && bundle.variant2.programs.length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Users className="w-4 h-4 text-[#2F6288]" />
                                5 Programs Bundle
                            </h4>
                            <span className="text-sm text-gray-500">
                                {bundle.variant2.programs.length}/5 programs
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="text-center">
                                <p className="text-sm text-gray-600">Original Price</p>
                                <p className="text-lg font-bold text-gray-900">
                                    ₹{bundle.variant2.totalPrice || 0}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-600">Bundle Price</p>
                                <p className="text-lg font-bold text-[#2F6288]">
                                    ₹{bundle.variant2.price || 0}
                                </p>
                            </div>
                        </div>
                        
                        {variant2Savings.percentage > 0 && (
                            <div className="text-center p-2 bg-green-50 rounded-lg">
                                <p className="text-sm text-green-700">
                                    Save ₹{variant2Savings.amount} ({variant2Savings.percentage}% off)
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* No Variants Message */}
                {(!bundle.variant1 || !bundle.variant1.programs || bundle.variant1.programs.length === 0) && 
                 (!bundle.variant2 || !bundle.variant2.programs || bundle.variant2.programs.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No bundle variants configured</p>
                    </div>
                )}

                {/* Bundle Details */}
                <div className="space-y-3">
                    {bundle.discount && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Percent className="w-4 h-4 text-green-600" />
                            <span>Additional {bundle.discount}% discount available</span>
                        </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Created: {formatDate(bundle.createdAt)}</span>
                    </div>
                    
                    {bundle.updatedAt && bundle.updatedAt !== bundle.createdAt && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>Updated: {formatDate(bundle.updatedAt)}</span>
                        </div>
                    )}
                </div>

                {/* Program List Preview */}
                <div className="border-t border-gray-200 pt-4">
                    <h5 className="font-medium text-gray-900 mb-3">Included Programs:</h5>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {bundle.variant1?.programs?.map((program, index) => (
                            <div key={`v1-${index}`} className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-gray-700">{program.title}</span>
                                <span className="text-xs text-gray-500">({program.type})</span>
                            </div>
                        ))}
                        {bundle.variant2?.programs?.map((program, index) => (
                            <div key={`v2-${index}`} className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-gray-700">{program.title}</span>
                                <span className="text-xs text-gray-500">({program.type})</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Status Badge */}
            <div className="px-6 pb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    bundle.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                }`}>
                    {bundle.isActive ? 'Active' : 'Inactive'}
                </span>
            </div>
        </motion.div>
    );
}
