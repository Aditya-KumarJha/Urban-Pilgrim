import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Steps({ steps }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let interval;
    if (current > 0 && current < steps.length) {
      interval = setInterval(() => {
        setCurrent((prev) => (prev < steps.length ? prev + 1 : prev));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [current]);

  const handleInView = () => {
    if (current === 0) setCurrent(1);
  };

  return (
    <motion.div
      className="flex flex-col justify-between h-full sm:p-6 rounded-xl"
      initial="hidden"
      whileInView="visible"
      onViewportEnter={handleInView}
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="flex flex-col items-start">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            className="flex items-start relative"
            initial={{ opacity: 0, x: -20 }}
            animate={idx < current ? "visible" : "hidden"}
            variants={{
              visible: { opacity: 1, x: 0 },
              hidden: { opacity: 0, x: -20 },
            }}
            transition={{ duration: 0.5 }}
          >
            {/* Left: Dot and Line */}
            <div className="flex flex-col items-center mr-4 min-h-full">
              {/* Animated Dot */}
              <div className="w-8 h-8 rounded-full border-2 border-[#2F6288] flex justify-center items-center relative z-10">
              <div className="w-6 h-6 rounded-full relative overflow-hidden z-10 flex justify-center items-center">
                {idx < current && (
                  <motion.div
                    className="absolute top-0 left-0 w-full h-full rounded-full bg-[#2F6288]"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{ zIndex: 0 }}
                  />
                )}

                <div
                  className={`w-full h-full rounded-full flex justify-center items-center ${
                    idx < current ? "text-white" : "text-[#2F6288]"
                  } z-10 text-sm font-medium`}
                >
                  {idx + 1}
                </div>
              </div>
              </div>

              {/* Vertical Line */}
              {idx < steps.length - 1 && (
                <motion.div
                  className="w-0.5 flex-1 bg-[#2F6288]"
                  initial={{ scaleY: 1 }}
                  animate={idx < current - 1 ? { scaleY: 1 } : { scaleY: 0 }}
                  transition={{ duration: 0.4 }}
                />
              )}
            </div>

            {/* Right: Text */}
            <div className="ml-2">
              {idx < current && (
                <>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-800">
                    {step.title}
                  </h3>
                  <p className="text-gray-700 mt-1">{step.content}</p>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
