import React from "react";
import { motion } from "framer-motion";
import OptimizedImage from '../components/ui/OptimizedImage';

function C3ContainerData({ img, heading, content, imageCss }) {
    return (
        <div>
            <motion.div
                className="relative inline-flex sm:items-center items-start sm:gap-5 gap-3 sm:p-5 max-h-[100%] w-auto"
            >
                <OptimizedImage
                    src={img}
                    alt=""
                    className={`${imageCss} object-contain`}
                />

                <div className="flex flex-col gap-2 flex-nowrap text-white">
                    <div className="md:text-base text-sm">
                        <strong>{heading}</strong>
                    </div>
                    <div className="md:text-sm text-xs leading-relaxed">{content}</div>
                </div>
            </motion.div>
        </div>
    );
}

export default C3ContainerData;
