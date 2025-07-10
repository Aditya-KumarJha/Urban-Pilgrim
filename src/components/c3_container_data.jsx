import React from "react";
import { motion } from "framer-motion";

function C3ContainerData({ img, heading, content }) {
  return (
    <div>
      <motion.div
        className="relative inline-flex sm:items-center items-start gap-5 sm:p-5 max-h-[100%] w-auto"
      >
        <img
          src={img}
          alt=""
          className="sm:max-h-[50px] sm:max-w-[40px] max-h-[40px] max-w-[30px] object-contain"
        />

         <div className="flex flex-col gap-2 flex-nowrap text-white">
          <div className="text-[16px]">
            <strong>{heading}</strong>
          </div>
          <div className="text-[16px] leading-none">{content}</div>
        </div>
      </motion.div>
    </div>
  );
}

export default C3ContainerData;
