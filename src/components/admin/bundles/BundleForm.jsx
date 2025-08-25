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
        const total = variant?.programs?.reduce((total, program) => {
            const price = parseFloat(program?.price) || 0;
            return total + price;
        }, 0) || 0;
        return Math.round(total * 100) / 100; // Round to 2 decimal places
    };

    // Calculate discount amount
    const calculateDiscount = (originalPrice, discountPercent) => {
        const discount = parseFloat(discountPercent) || 0;
        const discountAmount = (originalPrice * discount) / 100;
        return Math.round(discountAmount * 100) / 100; // Round to 2 decimal places
    };

    // Calculate final price after discount
    const calculateFinalPrice = (originalPrice, discountPercent) => {
        const discount = calculateDiscount(originalPrice, discountPercent);
        const finalPrice = originalPrice - discount;
        return Math.round(finalPrice * 100) / 100; // Round to 2 decimal places
    };

    // Calculate discounted bundle price for a variant
    const calculateDiscountedBundlePrice = (variant) => {
        if (!variant.programs || variant.programs.length === 0) return 0;
        
        const originalTotal = calculateVariantTotal(variant);
        const discountPercent = parseFloat(bundleForm?.discount) || 0;
        
        if (discountPercent > 0) {
            return calculateFinalPrice(originalTotal, discountPercent);
        }
        
        return originalTotal;
    };

    // Auto-update bundle prices when discount changes
    const handleDiscountChange = (value) => {
        dispatch(updateBundleForm({ field: "discount", value }));
        
        // Auto-calculate discounted prices for both variants
        if (bundleForm?.variant1?.programs?.length > 0) {
            const discountedPrice1 = calculateDiscountedBundlePrice(bundleForm.variant1);
            dispatch(updateBundleForm({ field: "variant1.price", value: discountedPrice1.toFixed(2) }));
        }
        
        if (bundleForm?.variant2?.programs?.length > 0) {
            const discountedPrice2 = calculateDiscountedBundlePrice(bundleForm.variant2);
            dispatch(updateBundleForm({ field: "variant2.price", value: discountedPrice2.toFixed(2) }));
        }
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
        const isAlreadySelected = bundleForm[variant].programs.some(p => p.id === program.id);
        if (isAlreadySelected) {
            return;
        }

        // Check if variant has reached its limit
        if (bundleForm[variant].programs.length >= bundleForm[variant].maxPrograms) {
            alert(`You can only select up to ${bundleForm[variant].maxPrograms} programs for this variant.`);
            return;
        }

        dispatch(addProgramToVariant({ variant, program }));
        
        // Auto-calculate and update bundle price after adding program
        setTimeout(() => {
            const discountedPrice = calculateDiscountedBundlePrice(bundleForm[variant]);
            dispatch(updateBundleForm({ field: `${variant}.price`, value: discountedPrice.toFixed(2) }));
        }, 100);
    };

    // Handle program removal
    const handleProgramRemove = (variant, programId) => {
        dispatch(removeProgramFromVariant({ variant, programId }));
        
        // Auto-calculate and update bundle price after removing program
        setTimeout(() => {
            const discountedPrice = calculateDiscountedBundlePrice(bundleForm[variant]);
            dispatch(updateBundleForm({ field: `${variant}.price`, value: discountedPrice.toFixed(2) }));
        }, 100);
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

        // Check if at least one variant is configured
        const hasVariant1 = bundleForm?.variant1?.price && parseFloat(bundleForm?.variant1?.price) > 0 && bundleForm?.variant1?.programs?.length > 0;
        const hasVariant2 = bundleForm?.variant2?.price && parseFloat(bundleForm?.variant2?.price) > 0 && bundleForm?.variant2?.programs?.length > 0;

        if (!hasVariant1 && !hasVariant2) {
            newErrors.general = "Please configure at least one bundle variant (3 programs or 5 programs)";
        }

        // Validate variant 1 if it has data
        if (bundleForm?.variant1?.price || bundleForm?.variant1?.programs?.length > 0) {
            if (!bundleForm?.variant1?.price || parseFloat(bundleForm?.variant1?.price) <= 0) {
                newErrors.variant1Price = "Valid price is required for 3 programs bundle";
            }
            if (bundleForm?.variant1?.programs?.length === 0) {
                newErrors.variant1Programs = "Please select at least one program for 3 programs bundle";
            }
        }

        // Validate variant 2 if it has data
        if (bundleForm?.variant2?.price || bundleForm?.variant2?.programs?.length > 0) {
            if (!bundleForm?.variant2?.price || parseFloat(bundleForm?.variant2?.price) <= 0) {
                newErrors.variant2Price = "Valid price is required for 5 programs bundle";
            }
            if (bundleForm?.variant2?.programs?.length === 0) {
                newErrors.variant2Programs = "Please select at least one program for 5 programs bundle";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Determine which variants are active
            const hasVariant1 = bundleForm?.variant1?.price && parseFloat(bundleForm?.variant1?.price) > 0 && bundleForm?.variant1?.programs?.length > 0;
            const hasVariant2 = bundleForm?.variant2?.price && parseFloat(bundleForm?.variant2?.price) > 0 && bundleForm?.variant2?.programs?.length > 0;

            const bundleData = {
                ...bundleForm,
                // Only include active variants
                variant1: hasVariant1 ? {
                    ...bundleForm.variant1,
                    totalPrice: calculateVariantTotal(bundleForm.variant1)
                } : null,
                variant2: hasVariant2 ? {
                    ...bundleForm.variant2,
                    totalPrice: calculateVariantTotal(bundleForm.variant2)
                } : null,
                // Calculate total price based on active variants
                totalPrice: calculateFinalPrice(
                    Math.max(
                        hasVariant1 ? calculateVariantTotal(bundleForm.variant1) : 0,
                        hasVariant2 ? calculateVariantTotal(bundleForm.variant2) : 0
                    ),
                    bundleForm?.discount
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

    // Auto-calculate bundle prices when programs change
    useEffect(() => {
        if (isOpen && bundleForm) {
            // Auto-calculate prices for both variants if they have programs
            if (bundleForm?.variant1?.programs?.length > 0) {
                const discountedPrice1 = calculateDiscountedBundlePrice(bundleForm.variant1);
                if (Math.abs(parseFloat(bundleForm.variant1.price || 0) - discountedPrice1) > 0.01) {
                    dispatch(updateBundleForm({ field: "variant1.price", value: discountedPrice1.toFixed(2) }));
                }
            }
            
            if (bundleForm?.variant2?.programs?.length > 0) {
                const discountedPrice2 = calculateDiscountedBundlePrice(bundleForm.variant2);
                if (Math.abs(parseFloat(bundleForm.variant2.price || 0) - discountedPrice2) > 0.01) {
                    dispatch(updateBundleForm({ field: "variant2.price", value: discountedPrice2.toFixed(2) }));
                }
            }
        }
    }, [bundleForm?.variant1?.programs, bundleForm?.variant2?.programs, bundleForm?.discount, isOpen]);

    // Manual price calculation function
    const calculateAllPrices = () => {
        if (bundleForm?.variant1?.programs?.length > 0) {
            const discountedPrice1 = calculateDiscountedBundlePrice(bundleForm.variant1);
            dispatch(updateBundleForm({ field: "variant1.price", value: discountedPrice1.toFixed(2) }));
        }
        
        if (bundleForm?.variant2?.programs?.length > 0) {
            const discountedPrice2 = calculateDiscountedBundlePrice(bundleForm.variant2);
            dispatch(updateBundleForm({ field: "variant2.price", value: discountedPrice2.toFixed(2) }));
        }
    };

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

                    {/* Instructions */}
                    <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                                <span className="text-blue-600 text-xs font-bold">i</span>
                            </div>
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Flexible Bundle Creation</p>
                                <p>You can create either a 3-program bundle, a 5-program bundle, or both simultaneously. Each variant is optional and independent.</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        {/* General Error Display */}
                        {errors.general && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">{errors.general}</p>
                            </div>
                        )}
                        
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
                                                value={bundleForm?.description}
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
                                            <div className="space-y-2">
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={bundleForm?.discount}
                                                        onChange={(e) => handleDiscountChange(e.target.value)}
                                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F6288] focus:border-transparent"
                                                        placeholder="0"
                                                        min="0"
                                                        max="100"
                                                    />
                                                    <Percent className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={calculateAllPrices}
                                                    className="w-full px-3 py-2 bg-green-100 text-green-700 border border-green-300 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                                                >
                                                    🔄 Auto-Calculate Bundle Prices
                                                </button>
                                                <p className="text-xs text-gray-500">
                                                    Prices will automatically update when you change the discount or add/remove programs
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Variant 1 - 3 Programs */}
                                <div className={`border-2 rounded-lg p-4 transition-all ${
                                    bundleForm?.variant1?.price || bundleForm?.variant1?.programs?.length > 0 
                                        ? 'border-blue-200 bg-blue-50' 
                                        : 'border-gray-200 bg-gray-50'
                                }`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <DollarSign className="w-5 h-5 text-[#2F6288]" />
                                            3 Programs Bundle
                                        </h3>
                                        <div className={`px-2 py-1 text-xs rounded-full ${
                                            bundleForm?.variant1?.price && bundleForm?.variant1?.programs?.length > 0
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {bundleForm?.variant1?.price && bundleForm?.variant1?.programs?.length > 0 ? 'Active' : 'Optional'}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Bundle Price *
                                            </label>
                                            <input
                                                type="number"
                                                value={bundleForm?.variant1?.price}
                                                onChange={(e) => handleFieldChange("variant1.price", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F6288] focus:border-transparent"
                                                placeholder="Enter bundle price"
                                                min="0"
                                            />
                                            
                                            {/* Price Breakdown */}
                                            {bundleForm?.variant1?.programs?.length > 0 && (
                                                <div className="mt-2 p-2 bg-blue-50 rounded-lg text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Original Total:</span>
                                                        <span className="font-medium">₹{calculateVariantTotal(bundleForm.variant1).toFixed(2)}</span>
                                                    </div>
                                                    {bundleForm?.discount && bundleForm.discount > 0 && (
                                                        <>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Discount ({bundleForm.discount}%):</span>
                                                                <span className="text-red-600">-₹{calculateDiscount(calculateVariantTotal(bundleForm.variant1), bundleForm.discount).toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex justify-between border-t border-blue-200 pt-1 mt-1">
                                                                <span className="text-gray-700 font-medium">Bundle Price:</span>
                                                                <span className="text-blue-700 font-bold">₹{bundleForm.variant1.price}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {errors.variant1Price && (
                                                <p className="text-red-500 text-sm mt-1">{errors.variant1Price}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Selected Programs ({bundleForm?.variant1?.programs?.length}/3)
                                            </label>
                                            <div className="space-y-2">
                                                {bundleForm?.variant1?.programs?.map((program) => (
                                                    <div key={program.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            {program?.image && (
                                                                <img src={program?.image} alt={program?.title} className="w-10 h-10 rounded object-cover" />
                                                            )}
                                                            <div>
                                                                <p className="font-medium text-sm">{program?.title}</p>
                                                                <p className="text-xs text-gray-500">{program?.type}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleProgramRemove("variant1", program?.id)}
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
                                <div className={`border-2 rounded-lg p-4 transition-all ${
                                    bundleForm?.variant2?.price || bundleForm?.variant2?.programs?.length > 0 
                                        ? 'border-green-200 bg-green-50' 
                                        : 'border-gray-200 bg-gray-50'
                                }`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <DollarSign className="w-5 h-5 text-[#2F6288]" />
                                            5 Programs Bundle
                                        </h3>
                                        <div className={`px-2 py-1 text-xs rounded-full ${
                                            bundleForm?.variant2?.price && bundleForm?.variant2?.programs?.length > 0
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {bundleForm?.variant2?.price && bundleForm?.variant2?.programs?.length > 0 ? 'Active' : 'Optional'}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Bundle Price *
                                            </label>
                                            <input
                                                type="number"
                                                value={bundleForm?.variant2?.price}
                                                onChange={(e) => handleFieldChange("variant2.price", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F6288] focus:border-transparent"
                                                placeholder="Enter bundle price"
                                                min="0"
                                            />
                                            
                                            {/* Price Breakdown */}
                                            {bundleForm?.variant2?.programs?.length > 0 && (
                                                <div className="mt-2 p-2 bg-green-50 rounded-lg text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Original Total:</span>
                                                        <span className="font-medium">₹{calculateVariantTotal(bundleForm.variant2).toFixed(2)}</span>
                                                    </div>
                                                    {bundleForm?.discount && bundleForm.discount > 0 && (
                                                        <>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Discount ({bundleForm.discount}%):</span>
                                                                <span className="text-red-600">-₹{calculateDiscount(calculateVariantTotal(bundleForm.variant2), bundleForm.discount).toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex justify-between border-t border-green-200 pt-1 mt-1">
                                                                <span className="text-gray-700 font-medium">Bundle Price:</span>
                                                                <span className="text-green-700 font-bold">₹{bundleForm.variant2.price}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {errors.variant2Price && (
                                                <p className="text-red-500 text-sm mt-1">{errors.variant2Price}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Selected Programs ({bundleForm?.variant2?.programs?.length}/5)
                                            </label>
                                            <div className="space-y-2">
                                                {bundleForm?.variant2?.programs?.map((program) => (
                                                    <div key={program.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            {program?.image && (
                                                                <img src={program?.image} alt={program?.title} className="w-10 h-10 rounded object-cover" />
                                                            )}
                                                            <div>
                                                                <p className="font-medium text-sm">{program?.title}</p>
                                                                <p className="text-xs text-gray-500">{program?.type}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleProgramRemove("variant2", program?.id)}
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
                                            {programTypes && programTypes.map((type) => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Programs List */}
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {filteredPrograms && filteredPrograms.map((program) => (
                                            <div
                                                key={program.id}
                                                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                {program?.image && (
                                                    <img src={program?.image} alt={program?.title} className="w-12 h-12 rounded object-cover" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm text-gray-900 truncate">
                                                        {program?.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span>{program?.type}</span>
                                                        {program.category && (
                                                            <>
                                                                <span>•</span>
                                                                <span>{program?.category}</span>
                                                            </>
                                                        )}
                                                        {program?.price && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="text-green-600 font-medium">₹{program?.price}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            handleProgramSelect("variant1", program);
                                                        }}
                                                        disabled={bundleForm?.variant1?.programs?.length >= 3}
                                                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                                            bundleForm?.variant1?.programs?.length >= 3
                                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                        }`}
                                                    >
                                                        3-Pack ({bundleForm?.variant1?.programs?.length}/3)
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            handleProgramSelect("variant2", program);
                                                        }}
                                                        disabled={bundleForm?.variant2?.programs?.length >= 5}
                                                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                                            bundleForm?.variant2?.programs?.length >= 5
                                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                                : "bg-green-100 text-green-700 hover:bg-green-200"
                                                        }`}
                                                    >
                                                        5-Pack ({bundleForm?.variant2?.programs?.length}/5)
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {filteredPrograms && filteredPrograms.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>No programs available in this category</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bundle Summary */}
                        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Package className="w-5 h-5 text-[#2F6288]" />
                                Bundle Summary
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`p-3 rounded-lg ${
                                    bundleForm?.variant1?.price && bundleForm?.variant1?.programs?.length > 0
                                        ? 'bg-blue-50 border border-blue-200'
                                        : 'bg-gray-100 border border-gray-200'
                                }`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-sm">3 Programs Bundle</span>
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            bundleForm?.variant1?.price && bundleForm?.variant1?.programs?.length > 0
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-200 text-gray-500'
                                        }`}>
                                            {bundleForm?.variant1?.price && bundleForm?.variant1?.programs?.length > 0 ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    {bundleForm?.variant1?.price && bundleForm?.variant1?.programs?.length > 0 ? (
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p>Original Total: ₹{calculateVariantTotal(bundleForm.variant1).toFixed(2)}</p>
                                            <p>Bundle Price: ₹{bundleForm.variant1.price}</p>
                                            {bundleForm?.discount && bundleForm.discount > 0 && (
                                                <p className="text-green-600 font-medium">
                                                    Save ₹{Math.round((calculateVariantTotal(bundleForm.variant1) - parseFloat(bundleForm.variant1.price)) * 100) / 100} ({bundleForm.discount}% off)
                                                </p>
                                            )}
                                            <p>Programs: {bundleForm.variant1.programs.length}/3</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">Not configured</p>
                                    )}
                                </div>
                                
                                <div className={`p-3 rounded-lg ${
                                    bundleForm?.variant2?.price && bundleForm?.variant2?.programs?.length > 0
                                        ? 'bg-green-50 border border-green-200'
                                        : 'bg-gray-100 border border-gray-200'
                                }`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-sm">5 Programs Bundle</span>
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            bundleForm?.variant2?.price && bundleForm?.variant2?.programs?.length > 0
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-200 text-gray-500'
                                        }`}>
                                            {bundleForm?.variant2?.price && bundleForm?.variant2?.programs?.length > 0 ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    {bundleForm?.variant2?.price && bundleForm?.variant2?.programs?.length > 0 ? (
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p>Original Total: ₹{calculateVariantTotal(bundleForm.variant2).toFixed(2)}</p>
                                            <p>Bundle Price: ₹{bundleForm.variant2.price}</p>
                                            {bundleForm?.discount && bundleForm.discount > 0 && (
                                                <p className="text-green-600 font-medium">
                                                    Save ₹{Math.round((calculateVariantTotal(bundleForm.variant2) - parseFloat(bundleForm.variant2.price)) * 100) / 100} ({bundleForm.discount}% off)
                                                </p>
                                            )}
                                            <p>Programs: {bundleForm.variant2.programs.length}/5</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">Not configured</p>
                                    )}
                                </div>
                            </div>
                            
                            {bundleForm?.discount && bundleForm?.discount > 0 && (
                                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Discount Applied:</strong> {bundleForm.discount}% off all bundle variants
                                    </p>
                                </div>
                            )}
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
