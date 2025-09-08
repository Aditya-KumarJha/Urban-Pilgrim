
import { useEffect, useState, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ProgramCard from "./Animated_card";
import ArrowButton from "./ui/ArrowButton";

export default function ProgramExplorer() {
    const [activeIndex, setActiveIndex] = useState(0);
    const sliderRef = useRef(null);
    const dotRefs = useRef([]);
    const [programItems, setProgramItems] = useState([]);
    const totalSteps = programItems?.programs?.length || 0;

    const uid = "your-unique-id";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const slidesRef = doc(db, `homepage/${uid}/title_description/sectionThree`);
                const snapshot = await getDoc(slidesRef);

                if (snapshot.exists()) {
                    const data = snapshot.data();
                    console.log("data: ", data)
                    setProgramItems(data.sectionThree || []);
                } else {
                    console.log("No slides found in Firestore");
                }
            } catch (error) {
                console.error("Error fetching images from Firestore:", error);
            }
        };

        fetchData();
    }, []);

    const scrollToCard = (index) => {
        setActiveIndex(index);
        if (sliderRef.current) {
            const isMobile = window.innerWidth < 640;
            const cardWidth = isMobile ? 140 : 280;
            const gap = isMobile ? 16 : 24;
            const containerPadding = 8;
            const scrollPosition = (index * (cardWidth + gap)) - containerPadding;
            
            sliderRef.current.scrollTo({
                left: Math.max(0, scrollPosition),
                behavior: "smooth",
            });
        }
    };

    const nextSlide = () => {
        if (sliderRef.current && activeIndex < totalSteps - 1) {
            const newIndex = activeIndex + 1;
            setActiveIndex(newIndex);
            scrollToCard(newIndex);
        }
    };

    const prevSlide = () => {
        if (sliderRef.current && activeIndex > 0) {
            const newIndex = activeIndex - 1;
            setActiveIndex(newIndex);
            scrollToCard(newIndex);
        }
    };

    // console.log("programItems: ", programItems);

    return (
        <motion.div
            className="md:grid md:grid-cols-2 flex flex-col w-full bg-[#f4ede9]"
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
        >
            {/* Left Panel */}
            <div className="relative p-8 flex flex-col justify-center md:items-center bg-white overflow-hidden w-full h-full ">
                <motion.img
                    src="/assets/golden-mandala.svg"
                    alt="Mandala"
                    className="absolute top-1/2 md:left-1/2 left-[37%] md:w-[400px] w-[300px] max-w-[80%] -translate-x-1/2 -translate-y-1/2"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                />

                <div className="z-10 space-y-6 w-full max-w-md">
                    <h2 className="text-xl sm:text-3xl font-bold md:text-center text-black">
                        {programItems?.title}
                    </h2>

                    <div className="flex gap-6 items-start">
                        {/* Vertical Line */}
                        <div className="flex flex-col mt-4 items-center bg-[#744C44]/30 h-[150px] w-[2px] rounded-lg">
                            {programItems?.programs && programItems?.programs.map((_, i) => (
                                <div
                                    key={i}
                                    ref={(el) => (dotRefs.current[i] = el)}
                                    className={`w-[2px] h-10 rounded-full transition-all duration-300  
                                        ${i === activeIndex ? "bg-[#4d3c2c] " : ""} 
                                        ${i === activeIndex && i === programItems.length - 1 ? " " : ""} `}
                                />
                            ))}
                        </div>

                        {/* Titles */}
                        <ul className="flex flex-col gap-4 text-base py-4">
                            {programItems?.programs && programItems.programs.map((item, i) => (
                                <li
                                    key={i}
                                    onClick={() => scrollToCard(i)}
                                    className={`cursor-pointer transition-all duration-300 ${i === activeIndex
                                        ? "text-black font-semibold"
                                        : "text-gray-500"
                                        }`}
                                >
                                    {item?.title}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Right Slider */}
            <div className="flex flex-col gap-3 bg-[#f9f3ef] items-center justify-center px-4 sm:px-6 py-8 w-full h-full">
                <div
                    ref={sliderRef}
                    className="flex gap-3 sm:gap-6 bg-none rounded-xl p-2 overflow-x-scroll no-scrollbar scroll-smooth items-center w-full"
                    style={{ scrollBehavior: "smooth", overflowY: "hidden", WebkitOverflowScrolling: "touch" }}
                >
                    {programItems?.programs && programItems?.programs.map((item, i) => (
                        <div key={i} className="">
                            <ProgramCard
                                image={item?.image}
                                card_title={item?.title}
                            />
                        </div>
                    ))}
                </div>

                {/* Arrows + Progress */}
                <div className="flex gap-2 sm:gap-3 items-center justify-center sm:justify-end w-full px-2">
                    <ArrowButton onClick={prevSlide} icon={FaChevronLeft} dir={1} />
                    <div className="relative h-1 w-32 sm:w-80 bg-[#744C44]/30 rounded overflow-hidden">
                        <div
                            className="absolute top-0 h-1 bg-[#744C44] transition-all duration-300"
                            style={{
                                width: `${100 / totalSteps}%`,
                                left: `${(activeIndex / totalSteps) * 100}%`,
                            }}
                        />
                    </div>
                    <ArrowButton onClick={nextSlide} icon={FaChevronRight} dir={-1} />
                </div>

            </div>
        </motion.div>
    );
}
