import { useState } from 'react';

export default function SessionCard({ session }) {
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const handleImageError = () => {
        setImageLoaded(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 max-w-sm mx-auto">
            {/* Session Image */}
            <div className="relative h-48 bg-gray-200">
                {session.thumbnail && (
                    <img
                        src={session.thumbnail}
                        alt={session.title}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                    />
                )}
                {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                )}
                
                {/* Session Type Badge */}
                <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        session.type === 'live' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                    }`}>
                        {session.type === 'live' ? 'Live' : 'Recorded'}
                    </span>
                </div>

                {/* Price Badge */}
                {session.price && (
                    <div className="absolute top-3 right-3">
                        <span className="bg-white bg-opacity-90 text-gray-800 px-2 py-1 text-sm font-semibold rounded-full">
                            ₹{session.price}
                        </span>
                    </div>
                )}
            </div>

            {/* Session Content */}
            <div className="p-4">
                {/* Category */}
                {session.category && (
                    <div className="mb-2">
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                            {session.category}
                        </span>
                    </div>
                )}

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {session.title}
                </h3>

                {/* Session Details */}
                <div className="space-y-2 mb-4">
                    {session.days && (
                        <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {session.days} days
                        </div>
                    )}

                    {session.videos && (
                        <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            {session.videos} videos
                        </div>
                    )}

                    {session.duration && (
                        <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {session.duration}
                        </div>
                    )}
                </div>

                {/* Features/Tags */}
                {session.features && session.features.length > 0 && (
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                            {session.features.slice(0, 3).map((feature, index) => (
                                <span
                                    key={index}
                                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                                >
                                    {typeof feature === 'string' ? feature : feature.title}
                                </span>
                            ))}
                            {session.features.length > 3 && (
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                    +{session.features.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                    {session.type === 'live' ? 'Join Live Session' : 'Watch Now'}
                </button>
            </div>
        </div>
    );
}
