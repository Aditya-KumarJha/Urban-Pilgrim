import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/urban_pilgrim_logo.png"; // replace with your logo path

export default function Loader({ onFinish }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onFinish(), 300); // trigger after load
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
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <motion.img
          src={logo}
          alt="Logo"
          className="w-24 h-24 mb-6"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />

        {/* Loading Bar */}
        <div className="w-64 h-2 bg-gray-300 rounded overflow-hidden">
          <motion.div
            className="h-full bg-[#2f6288]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
        </div>

        {/* Loading Text */}
        <p className="mt-4 text-sm text-gray-600">{progress}%</p>
      </motion.div>
    </AnimatePresence>
  );
}
