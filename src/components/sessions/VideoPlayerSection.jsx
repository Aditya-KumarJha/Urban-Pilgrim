import { useState } from "react";
import { motion } from "framer-motion";
import { FiPlay } from "react-icons/fi";
import ReactPlayer from "react-player";

import OptimizedImage from '../../components/ui/OptimizedImage';
export default function YouTubeVideoPlaylist({ videos = [], programData = null }) {
    const [currentVideo, setCurrentVideo] = useState(videos[0] || null);

    if (!currentVideo || videos.length === 0) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-10 text-center">
                <div className="text-gray-400 text-lg mb-2">🎥</div>
                <p className="text-gray-600 text-lg font-medium">No videos available</p>
                <p className="text-gray-500 text-sm mt-1">Check back later for new content</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="aspect-video rounded-xl overflow-hidden">
                <ReactPlayer
                    src={currentVideo?.src || currentVideo?.url}
                    controls
                    width="100%"
                    height="100%"
                    className="rounded-xl"
                />
            </div>

            <h3 className="text-lg font-semibold mt-4">
                {currentVideo?.title}
            </h3>

            {programData?.oneTimeSubscription?.description && (
                <p className="text-gray-600 mt-2">
                    {programData.oneTimeSubscription.description}
                </p>
            )}

            <div className="mt-6 bg-white border rounded-xl p-4">
                <p className="text-sm font-medium mb-4">All Videos ({videos.length})</p>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {videos.map((video, index) => (
                        <motion.div
                            key={video.id || index}
                            whileHover={{ scale: 1 }}
                            onClick={() => setCurrentVideo(video)}
                            className={`flex items-center gap-4 cursor-pointer rounded-md p-2 hover:bg-gray-100 transition ${currentVideo?.id === video.id ? 'bg-blue-50 border border-blue-200' : ''
                                }`}
                        >
                            <div className="relative w-28 h-16 overflow-hidden rounded-md flex-shrink-0">
                                <OptimizedImage                                     src={video.thumbnail || video.image || `https://img.youtube.com/vi/${video.src?.split('v=')[1]}/hqdefault.jpg`}
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                />
                                <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <FiPlay className="text-white w-4 h-4" />
                                </span>
                            </div>
                            <p className="text-sm">{video.title}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
