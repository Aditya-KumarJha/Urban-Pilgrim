import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Package, DollarSign, Percent, FileText } from "lucide-react";
import { updateBundleForm, addProgramToVariant, removeProgramFromVariant } from "../../../features/bundleSlice";

export default function BundleForm({ isOpen, onClose, onSave, isEditing, allPrograms }) {
    const dispatch = useDispatch();
    const bundleForm = useSelector((state) => state.bundles.bundleForm);
    const [errors, setErrors] = useState({});
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Calculate total price for each variant
    const calculateVariantTotal = (variant) => {
        return variant.programs.reduce((total, program) => {
            const price = parseFloat(program.price) || 0;
            return total + price;
        }, 0);
    };

    // Calculate discount amount
    const calculateDiscount = (originalPrice, discountPercent) => {
        const discount = parseFloat(discountPercent) || 0;
        return (originalPrice * discount) / 100;
    };

    // Calculate final price after discount
    const calculateFinalPrice = (originalPrice, discountPercent) => {
        const discount = calculateDiscount(originalPrice, discountPercent);
        return originalPrice - discount;
    };

    // Filter programs by category
    const getFilteredPrograms = () => {
        const allProgramsArray = Object.values(allPrograms).flat();
        if (selectedCategory === "all") return allProgramsArray;
        return allProgramsArray.filter(program => program.type === selectedCategory);
    };

    // Get unique program types for filter
    const getProgramTypes = () => {
        const types = new Set();
        Object.values(allPrograms).forEach(programs => {
            programs.forEach(program => types.add(program.type));
        });
        return Array.from(types);
    };

    // Handle form field changes
    const handleFieldChange = (field, value) => {
        dispatch(updateBundleForm({ field, value }));
        // Clear error when field is updated
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    // Handle program selection
    const handleProgramSelect = (variant, program) => {
        // Check if program is already in the variant
        const isAlreadySelected = variant.programs.some(p => p.id === program.id);
        if (isAlreadySelected) return;

        // Check if variant has reached its limit
        if (variant.programs.length >= variant.maxPrograms) {
            alert(`You can only select up to ${variant.maxPrograms} programs for this variant.`);
            return;
        }

        dispatch(addProgramToVariant({ variant, program }));
    };

    // Handle program removal
    const handleProgramRemove = (variant, programId) => {
        dispatch(removeProgramFromVariant({ variant, programId }));
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!bundleForm.name.trim()) {
            newErrors.name = "Bundle name is required";
        }

        if (!bundleForm.description.trim()) {
            newErrors.description = "Bundle description is required";
        }

        if (!bundleForm.variant1.price || parseFloat(bundleForm.variant1.price) <= 0) {
            newErrors.variant1Price = "Valid price is required for 3 programs bundle";
        }

        if (!bundleForm.variant2.price || parseFloat(bundleForm.variant2.price) <= 0) {
            newErrors.variant2Price = "Valid price is required for 5 programs bundle";
        }

        if (bundleForm.variant1.programs.length === 0) {
            newErrors.variant1Programs = "Please select at least one program for 3 programs bundle";
        }

        if (bundleForm.variant2.programs.length === 0) {
            newErrors.variant2Programs = "Please select at least one program for 5 programs bundle";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const bundleData = {
                ...bundleForm,
                variant1: {
                    ...bundleForm.variant1,
                    totalPrice: calculateVariantTotal(bundleForm.variant1)
                },
                variant2: {
                    ...bundleForm.variant2,
                    totalPrice: calculateVariantTotal(bundleForm.variant2)
                },
                totalPrice: calculateFinalPrice(
                    Math.max(
                        calculateVariantTotal(bundleForm.variant1),
                        calculateVariantTotal(bundleForm.variant2)
                    ),
                    bundleForm.discount
                )
            };
            onSave(bundleData);
        }
    };

    // Reset form when component unmounts or editing changes
    useEffect(() => {
        if (!isOpen) {
            setErrors({});
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const programTypes = getProgramTypes();
    const filteredPrograms = getFilteredPrograms();

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <Package className="w-6 h-6 text-[#2F6288]" />
                            <h2 className="text-2xl font-bold text-gray-900">
                                {isEditing ? "Edit Bundle" : "Create New Bundle"}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column - Bundle Details */}
                            <div className="space-y-6">
                                {/* Basic Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Package className="w-5 h-5 text-[#2F6288]" />
                                        Basic Information
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Bundle Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={bundleForm.name}
                                                onChange={(e) => handleFieldChange("name", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F6288] focus:border-transparent"
                                                placeholder="Enter bundle name"
                                            />
                                            {errors.name && (
                                                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Description *
                                            </label>
                                            <textarea
                                                value={bundleForm.description}
                                                onChange={(e) => handleFieldChange("description", e.target.value)}
                                                rows={4}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F6288] focus:border-transparent"
                                                placeholder="Describe what this bundle offers"
                                            />
                                            {errors.description && (
                                                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Discount Percentage
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={bundleForm.discount}
                                                    onChange={(e) => handleFieldChange("discount", e.target.value)}
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F6288] focus:border-transparent"
                                                    placeholder="0"
                                                    min="0"
                                                    max="100"
                                                />
                                                <Percent className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Variant 1 - 3 Programs */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-[#2F6288]" />
                                        3 Programs Bundle
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Bundle Price *
                                            </label>
                                            <input
                                                type="number"
                                                value={bundleForm.variant1.price}
                                                onChange={(e) => handleFieldChange("variant1.price", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F6288] focus:border-transparent"
                                                placeholder="Enter bundle price"
                                                min="0"
                                            />
                                            {errors.variant1Price && (
                                                <p className="text-red-500 text-sm mt-1">{errors.variant1Price}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Selected Programs ({bundleForm.variant1.programs.length}/3)
                                            </label>
                                            <div className="space-y-2">
                                                {bundleForm.variant1.programs.map((program) => (
                                                    <div key={program.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            {program.image && (
                                                                <img src={program.image} alt={program.title} className="w-10 h-10 rounded object-cover" />
                                                            )}
                                                            <div>
                                                                <p className="font-medium text-sm">{program.title}</p>
                                                                <p className="text-xs text-gray-500">{program.type}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleProgramRemove("variant1", program.id)}
                                                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            {errors.variant1Programs && (
                                                <p className="text-red-500 text-sm mt-1">{errors.variant1Programs}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Variant 2 - 5 Programs */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-[#2F6288]" />
                                        5 Programs Bundle
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Bundle Price *
                                            </label>
                                            <input
                                                type="number"
                                                value={bundleForm.variant2.price}
                                                onChange={(e) => handleFieldChange("variant2.price", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F6288] focus:border-transparent"
                                                placeholder="Enter bundle price"
                                                min="0"
                                            />
                                            {errors.variant2Price && (
                                                <p className="text-red-500 text-sm mt-1">{errors.variant2Price}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Selected Programs ({bundleForm.variant2.programs.length}/5)
                                            </label>
                                            <div className="space-y-2">
                                                {bundleForm.variant2.programs.map((program) => (
                                                    <div key={program.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            {program.image && (
                                                                <img src={program.image} alt={program.title} className="w-10 h-10 rounded object-cover" />
                                                            )}
                                                            <div>
                                                                <p className="font-medium text-sm">{program.title}</p>
                                                                <p className="text-xs text-gray-500">{program.type}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleProgramRemove("variant2", program.id)}
                                                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            {errors.variant2Programs && (
                                                <p className="text-red-500 text-sm mt-1">{errors.variant2Programs}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Program Selection */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-[#2F6288]" />
                                        Available Programs
                                    </h3>

                                    {/* Category Filter */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Filter by Type
                                        </label>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F6288] focus:border-transparent"
                                        >
                                            <option value="all">All Types</option>
                                            {programTypes.map((type) => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Programs List */}
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {filteredPrograms.map((program) => (
                                            <div
                                                key={program.id}
                                                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                {program.image && (
                                                    <img src={program.image} alt={program.title} className="w-12 h-12 rounded object-cover" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm text-gray-900 truncate">
                                                        {program.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span>{program.type}</span>
                                                        {program.category && (
                                                            <>
                                                                <span>•</span>
                                                                <span>{program.category}</span>
                                                            </>
                                                        )}
                                                        {program.price && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="text-green-600 font-medium">₹{program.price}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleProgramSelect("variant1", program)}
                                                        disabled={bundleForm.variant1.programs.length >= 3}
                                                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                                            bundleForm.variant1.programs.length >= 3
                                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                        }`}
                                                    >
                                                        3-Pack
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleProgramSelect("variant2", program)}
                                                        disabled={bundleForm.variant2.programs.length >= 5}
                                                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                                            bundleForm.variant2.programs.length >= 5
                                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                                : "bg-green-100 text-green-700 hover:bg-green-200"
                                                        }`}
                                                    >
                                                        5-Pack
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {filteredPrograms.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>No programs available in this category</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-[#2F6288] text-white rounded-lg hover:bg-[#1e4a6b] transition-colors"
                            >
                                {isEditing ? "Update Bundle" : "Create Bundle"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
