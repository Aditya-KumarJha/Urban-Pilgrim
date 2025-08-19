import { motion } from "framer-motion";

export default function ImageGallery({ images }) {
    return (
        <div className="flex flex-col md:flex-row gap-4 max-w-7xl mx-auto">
            {/* Main Image */}
            <motion.img
                src={images[0]}
                alt="Main"
                className="w-full md:w-4/5 xl:h-[59vh] lg:h-[65vh] md:h-[45vh] h-auto object-cover rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            />

            {/* Thumbnail Column */}
            <div className="flex md:flex-col flex-row md:w-1/5 gap-3">
                {images.slice(1, 3).map((img, idx) => (
                    <motion.img
                        key={idx}
                        src={img}
                        alt={`thumb-${idx}`}
                        className="w-1/3 md:w-full md:h-1/4 h-auto object-cover rounded-xl cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                    />
                ))}

                {/* Overlay Image */}
                <div className="relative w-1/2 md:w-full md:h-1/4 h-auto rounded-xl overflow-hidden cursor-pointer">
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
    );
}
