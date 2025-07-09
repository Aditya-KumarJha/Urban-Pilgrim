import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const steps = [
  { title: "Step 1", content: "Create your account and set up your details." },
  { title: "Step 2", content: "Verify your email address for security." },
  { title: "Step 3", content: "Start your journey with curated experiences." },
];

export default function Stepper() {
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
      className="flex flex-col justify-between h-full p-6 rounded-xl"
      initial="hidden"
      whileInView="visible"
      onViewportEnter={handleInView}
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="flex flex-col items-start space-y-8">
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
            <div className="flex flex-col items-center">
              {/* Dot */}
              <motion.div
                className={`w-5 h-5 rounded-full ${
                  idx < current ? "bg-[#8B4513]" : "bg-gray-300"
                } z-10`}
                initial={{ scale: 0 }}
                animate={idx < current ? { scale: 1 } : { scale: 0 }}
                transition={{ duration: 0.3 }}
              />

              {/* Line */}
              {idx < steps.length - 1 && (
                <motion.div
                  className="w-0.5 bg-[#8B4513]"
                  initial={{ height: 0, opacity: 0 }}
                  animate={
                    idx < current - 1
                      ? { height: "80px", opacity: 1 }
                      : { height: 0, opacity: 0 }
                  }
                  transition={{ duration: 0.4 }}
                />
              )}
            </div>

            {/* Text */}
            <div className="ml-4">
              {idx < current && (
                <>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-800">
                    {step.title}
                  </h3>
                  <p className="text-gray-700 mt-2">{step.content}</p>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
