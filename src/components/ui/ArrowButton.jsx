import { useState } from "react";
import { motion } from "framer-motion";

export default function ArrowButton({ onClick, icon: Icon, dir }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="p-3 rounded-full border-2 border-[#79534E] hover:bg-[#79534E] transition"
    >
      <motion.div
        animate={isHovered ? { opacity: [0, 0, 1], x: [0, dir*30, 0], color: "#fff" } : { opacity: 1, x: 0, color: "#79534E" }}
        transition={{ duration: 0.4, times: [0, 0.8, 1] }}
      >
        <Icon />
      </motion.div>
    </button>
  );
}
