import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProgramSchedule( { programSchedules } ) {
    const [visibleDays, setVisibleDays] = useState(1);
    const [current, setCurrent] = useState(0);
    const [showActivities, setShowActivities] = useState(true);
    const [paused, setPaused] = useState(false);
    const length = programSchedules ? programSchedules.length : 0;

    // Main sequence
    useEffect(() => {
        if (!paused) {
            const timer = setTimeout(() => {
                if (showActivities) {
                    // Hide activities first
                    setShowActivities(false);
                } else {
                    if (current < length - 1) {
                        setCurrent((prev) => prev + 1);
                        setVisibleDays((prev) => prev + 1);
                        setShowActivities(true);
                    }
                }
            }, showActivities ? 3000 : 800); // show activities
            return () => clearTimeout(timer);
        }
    }, [showActivities, current, paused, length]);

    const toggleExpand = (idx) => {
        setPaused(true);
        if (current === idx && showActivities) {
            setShowActivities(false);
        } else {
            setCurrent(idx);
            setShowActivities(true);
        }
    };

    return (
        <motion.div
            className="flex flex-col justify-between h-full sm:p-6 py-6 rounded-xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
        >
            <div className="flex flex-col items-start">
                {programSchedules && programSchedules.map((program, idx) => (
                    <AnimatePresence key={idx}>
                        {idx < visibleDays && (
                            <motion.div
                                className="flex items-start relative mb-0"
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                {/* Timeline dots */}
                                <div className="flex flex-col items-center h-full">
                                    <motion.div
                                        className={`w-8 h-8 rounded-full border-2 border-[#8B4513] absolute -left-1 -top-1 z-0 ${idx === current ? "opacity-100" : "opacity-50"
                                            }`}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                    <motion.div
                                        className={`w-6 h-6 rounded-full ${idx === current ? "bg-[#8B4513]" : ""
                                            } z-10 relative`}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                    {idx < programSchedules.length - 1 && (
                                        <div className="w-0.5 my-1 flex-1 bg-[#8B4513] opacity-50" />
                                    )}
                                </div>

                                {/* Day titles */}
                                <div className="ml-4">

                                    {/* Heading */}
                                    <h3
                                        onClick={() => toggleExpand(idx)}
                                        className={`text-lg md:text-xl font-semibold cursor-pointer hover:underline ${idx === current ? "text-[#8B4513]" : "text-gray-800"
                                            }`}
                                    >
                                        Day - {idx + 1} {program.title}
                                    </h3>

                                    {/* Activities */}
                                    <AnimatePresence>
                                        {idx === current && showActivities && (
                                            <motion.ul
                                                className="list-disc ml-5 text-gray-700 my-2"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.5 }}
                                            >
                                                {program?.points.map((act, i) => (
                                                    <li key={i}>
                                                        <strong>{act.title}:</strong>
                                                        {act.subpoints.length > 0 && (
                                                            <ul className="list-disc ml-5">
                                                                {act.subpoints.map((point, j) => (
                                                                    <li key={j}>{point}</li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </li>
                                                ))}
                                            </motion.ul>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                ))}
            </div>
        </motion.div>
    );
}
