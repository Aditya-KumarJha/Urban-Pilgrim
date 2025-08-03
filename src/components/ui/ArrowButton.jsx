import { useState } from "react";
import { motion } from "framer-motion";

export default function ArrowButton({ onClick, icon: Icon, dir }) {
    const [isHovered, setIsHovered] = useState(false);

    // Optional: simulate hover on mobile
    const handleTouch = () => {
        setIsHovered(true);
        setTimeout(() => setIsHovered(false), 500);
    };

    const bgColor = isHovered ? "#79534E" : "transparent";
    const iconColor = isHovered ? "#fff" : "#79534E";

    return (
        <motion.button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouch}
            style={{ backgroundColor: bgColor }}
            className="p-3 rounded-full border-2 border-[#79534E] transition-colors duration-300"
        >
            <motion.div
                animate={{
                    opacity: isHovered ? [0, 0, 1] : 1,
                    x: isHovered ? [0, dir * 30, 0] : 0,
                    color: iconColor,
                }}
                transition={{ duration: 0.4, times: [0, 0.8, 1] }}
            >
                <Icon />
            </motion.div>
        </motion.button>
    );
}
