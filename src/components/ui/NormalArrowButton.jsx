import { useState } from "react";
import { motion } from "framer-motion";

export default function NormalArrowButton({ onClick, icon: Icon, dir }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="lg:p-2 lg:mt-0 p-1 -mt-1 text-sm rounded-full border-2 border-white hover:bg-white/20 transition overflow-hidden"
        >
            <motion.div
                animate={isHovered ? { opacity: [0, 0, 1], x: [0, dir * 30, 0], color: "#fff" } : { opacity: 1, x: 0, color: "#fff" }}
                transition={{ duration: 0.4, times: [0, 0.5, 1] }}
            >
                <Icon />
            </motion.div>
        </button>
    );
}
