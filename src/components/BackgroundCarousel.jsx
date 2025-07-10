import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import homepageImg from "../assets/image.png";
import medi from "../assets/meditationimg.jpg";

const images = [
  homepageImg,
  medi,
  homepageImg,
  medi,
  homepageImg,
  medi,
];

export default function VerticalCarousel() {
  const [current, setCurrent] = useState(0);
  const total = images.length;

  const nextSlide = () => setCurrent((prev) => (prev + 1) % total);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + total) % total);

  // Autoplay every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-black flex items-center justify-center mt-[100px]">
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={images[current]}
          alt={`Slide ${current + 1}`}
          className="absolute w-full h-full object-cover object-top"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.8, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {/* Overlay with Text */}
      <div className="absolute inset-0 bg-black/30">
        <div className="flex items-center justify-center h-full">
          <div className="banner-text text-white text-xl md:text-3xl font-semibold px-4">
            <motion.div
              className="banner-heading"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              Urban Wellness Rooted in Indian Wisdom
            </motion.div>
          </div>
        </div>
      </div>

      {/* Arrows + Slide Count (Right Side, Horizontal) */}
      <div className="absolute left-4 md:left-auto md:right-10 bottom-12 md:top-1/2 md:-translate-y-1/2 flex md:flex-col items-center gap-6 text-white z-10">
        <button
          onClick={prevSlide}
          className="p-3 rounded-full border-2 border-white hover:bg-white/20 transition"
        >
          <FaChevronLeft />
        </button>

        <span className="text-sm font-medium">{`${current + 1} / ${total}`}</span>

        <button
          onClick={nextSlide}
          className="p-3 rounded-full border-2 border-white hover:bg-white/20 transition"
        >
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
}
