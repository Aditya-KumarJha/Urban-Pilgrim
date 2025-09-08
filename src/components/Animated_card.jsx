import React, { useState, useEffect } from 'react';
import "./Animated_card.css";
import { FaChevronRight } from 'react-icons/fa';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import NormalArrowButton from './ui/NormalArrowButton';

function Animated_card({ image, card_title }) {
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();

    // Handle navigation when arrow button is clicked
    const handleArrowClick = () => {
        if (card_title) {
            const formattedTitle = card_title.replace(/\s+/g, '_');
            if(formattedTitle === "Pilgrim_wellness_programs"){
                navigate("/pilgrim_sessions")
            }
            else navigate(`/${formattedTitle}`);
        }
    };

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
            className="animated-card sm:!max-w-[280px] !max-w-[140px] sm:!min-w-[250px] !min-w-[120px] !w-[80%] sm:!h-[380px] !h-[200px]"
            onMouseEnter={() => window.innerWidth >= 640 && setIsHovered(true)}
            onMouseLeave={() => window.innerWidth >= 640 && setIsHovered(false)}
        >
            <motion.div className="card_imgcontainer ">
                <motion.img
                    src={image}
                    alt="card visual"
                    animate={{ scale: isHovered ? 1.7 : 1 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className='sm:!h-[380px] !h-[200px] !w-full !object-cover'
                />
                <motion.div
                    className="img_overlay "
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
                    <div 
                        className="card_arrow" 
                        onClick={handleArrowClick}
                        style={{ 
                            pointerEvents: 'auto',
                            cursor: 'pointer',
                            zIndex: 10,
                            position: 'relative'
                        }}
                    >
                        <NormalArrowButton icon={FaChevronRight} dir={-1} />
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default Animated_card;
