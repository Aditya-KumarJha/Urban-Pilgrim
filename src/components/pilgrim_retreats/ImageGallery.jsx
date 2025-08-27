import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ImageGallery({ images = [] }) {
    const [mainImage, setMainImage] = useState(images[0]);
    const [showAllImages, setShowAllImages] = useState(false);

    const handleImageClick = (clickedImage) => {
        setMainImage(clickedImage);
    };

    const handleShowAllImages = () => {
        setShowAllImages(true);
    };

    const handleCloseModal = () => {
        setShowAllImages(false);
    };
    useEffect(() => {
        if (images.length > 0) {
            setMainImage(images[0]);
        }
    }, [images]);

    return (
        <>
            <div className="flex flex-col md:flex-row gap-4 max-w-7xl mx-auto">
                {/* Main Image */}
                <motion.img
                    src={mainImage}
                    alt="Main"
                    className="w-full md:w-5/6 xl:h-[60vh] lg:h-[60vh] md:h-[60vh] h-auto object-cover rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    key={mainImage} // Add key to trigger animation on image change
                />

                {/* Thumbnail Column */}
                <div className="flex md:flex-col flex-row md:w-1/6 gap-3 md:h-[60vh]">
                    {images.slice(1, 3).map((img, idx) => (
                        <motion.img
                            key={idx}
                            src={img}
                            alt={`thumb-${idx}`}
                            className="w-1/3 md:w-full flex-1 md:h-[18vh] h-auto object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleImageClick(img)}
                        />
                    ))}

                    {/* Overlay Image */}
                    <div 
                        className="relative w-1/3 md:w-full flex-1 md:h-[18vh] h-auto rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={handleShowAllImages}
                    >
                        <img
                            src={images[3]}
                            alt="thumb-3"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-lg font-semibold">
                            +{images.length - 3}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for All Images */}
            {showAllImages && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-6xl max-h-[90vh] w-full overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-xl font-semibold">All Images</h3>
                            <button 
                                onClick={handleCloseModal}
                                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>
                        
                        {/* Scrollable Image Grid */}
                        <div className="p-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {images.map((img, idx) => (
                                    <motion.img
                                        key={idx}
                                        src={img}
                                        alt={`gallery-${idx}`}
                                        className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => {
                                            handleImageClick(img);
                                            handleCloseModal();
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
