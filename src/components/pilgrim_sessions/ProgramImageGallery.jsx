import { motion } from "framer-motion";

const images = [
  "/assets/program/main.png",
  "/assets/program/guide.png",
];

export default function ProgramImageGallery() {
  return (
    <div className="flex md:flex-row flex-col gap-4 max-w-7xl mx-auto">
      {/* Main Image */}
      <motion.img
        src={images[0]}
        alt="Main"
        className="w-full md:h-[60vh] h-auto object-cover object-center rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Thumbnail Column */}
      <div className="flex md:flex-col gap-3">
          <motion.img
            src={images[1]}
            alt={`guide-image`}
            className="w-full md:max-w-40 max-w-20 aspect-square object-cover rounded-xl"
            whileHover={{ scale: 1.05 }}
          />
      </div>
    </div>
  );
}
