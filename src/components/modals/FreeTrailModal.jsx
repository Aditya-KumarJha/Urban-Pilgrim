import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPlay, FaPause } from 'react-icons/fa';

const FreeTrailModal = ({ onClose, videoUrl, title }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const handleVideoPlay = () => {
        setIsPlaying(true);
    };

    const handleVideoPause = () => {
        setIsPlaying(false);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-gray-200">
                        <div>
                            <h2 className="text-2xl font-bold text-[#2F6288]">Free Trial</h2>
                            <p className="text-gray-600 mt-1">{title || 'Preview Content'}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <FaTimes className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Video Content */}
                    <div className="p-6">
                        <div className="relative bg-black rounded-lg overflow-hidden">
                            <video
                                src={videoUrl}
                                controls
                                className="w-full h-auto max-h-[60vh] object-contain"
                                onPlay={handleVideoPlay}
                                onPause={handleVideoPause}
                                poster="/assets/video-placeholder.jpg"
                            >
                                Your browser does not support the video tag.
                            </video>
                            
                            {/* Play/Pause Overlay */}
                            {!isPlaying && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                    <div className="bg-white bg-opacity-90 rounded-full p-4">
                                        <FaPlay className="w-8 h-8 text-[#2F6288] ml-1" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Trial Info */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-[#FAF4F0] to-white rounded-lg border border-[#D69A75]">
                            <h3 className="font-semibold text-[#2F6288] mb-2">🎯 Free Trial Access</h3>
                            <p className="text-sm text-gray-600 mb-3">
                                You're watching a preview of this content. To access the full program and all features:
                            </p>
                            <ul className="text-sm text-gray-600 space-y-1 mb-4">
                                <li>• Complete program access</li>
                                <li>• Interactive sessions</li>
                                <li>• Downloadable resources</li>
                                <li>• Community support</li>
                            </ul>
                            <div className="flex gap-3">
                                <button className="flex-1 bg-[#2F6288] text-white py-2 px-4 rounded-lg hover:bg-[#1e4a66] transition-colors font-semibold">
                                    Subscribe Now
                                </button>
                                <button 
                                    onClick={onClose}
                                    className="flex-1 border border-[#2F6288] text-[#2F6288] py-2 px-4 rounded-lg hover:bg-[#2F6288] hover:text-white transition-colors font-semibold"
                                >
                                    Continue Browsing
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default FreeTrailModal;
