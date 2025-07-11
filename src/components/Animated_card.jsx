import React, { useState, useEffect } from 'react';
import "./Animated_card.css";
import { FaChevronRight } from 'react-icons/fa';
import { motion } from "framer-motion";

function Animated_card({ image, card_title }) {
  const [isHovered, setIsHovered] = useState(false);

  // Automatically enable hover for mobile screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 480) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize); // Listen for screen resize

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <motion.div 
      className="animated-card"
      onMouseEnter={() => window.innerWidth >= 480 && setIsHovered(true)}
      onMouseLeave={() => window.innerWidth >= 480 && setIsHovered(false)}
    >
      <motion.div className="card_imgcontainer">
        <motion.img 
          src={image} 
          alt="card visual" 
          animate={{ scale: isHovered ? 1.7 : 1 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
        <motion.div 
          className="img_overlay"
          animate={{ opacity: isHovered ? 0.5 : 0, scale: isHovered ? 1.7 : 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.div 
        className="card_datacontainer"
        animate={{ 
          top: isHovered ? "50%" : "85%",
          opacity: 1
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <div className="card_content_inner">
          <div className="card_title">{card_title}</div>
          <div className="card_arrow">
            <button
              className="p-1 rounded-full border-2 border-white hover:bg-white/20 transition"
            >
              <FaChevronRight color="white" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Animated_card;
