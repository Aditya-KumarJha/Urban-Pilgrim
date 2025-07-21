import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Loader({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Start transition animation
          setIsTransitioning(true);
          // Call onFinish after transition completes
          setTimeout(() => onFinish(), 1200);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-[#ffffff4d] bg-opacity-90 flex flex-col justify-center items-center z-[9999]"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, delay: isTransitioning ? 0.8 : 0 }}
      >
        {/* Logo with transition animation */}
        <motion.img
          src="/assets/urban_pilgrim_logo.png"
          alt="Logo"
          className="w-36 h-36 mb-6"
          initial={{ scale: 1 }}
          animate={
            isTransitioning
              ? {
                  scale: 0.6,
                  x: -window.innerWidth * 0.38, // Move to left side
                  y: -window.innerHeight * 0.35, // Move to top
                  transition: { duration: 1, ease: "easeInOut" }
                }
              : { scale: [1, 1.1, 1] }
          }
          transition={
            isTransitioning
              ? { duration: 1, ease: "easeInOut" }
              : { repeat: Infinity, duration: 1 }
          }
        />

        {/* Loading Bar - fade out during transition */}
        <motion.div
          className="w-64 h-2 bg-gray-300 rounded overflow-hidden"
          animate={
            isTransitioning
              ? { opacity: 0, y: 20 }
              : { opacity: 1, y: 0 }
          }
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="h-full bg-[#79534E]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
        </motion.div>

        {/* Loading Text - fade out during transition */}
        <motion.p
          className="mt-4 text-sm text-gray-600"
          animate={
            isTransitioning
              ? { opacity: 0, y: 20 }
              : { opacity: 1, y: 0 }
          }
          transition={{ duration: 0.5 }}
        >
          {progress}%
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
