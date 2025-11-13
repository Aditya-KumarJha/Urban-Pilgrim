import { useEffect, useState } from "react";
import { FaQuoteLeft } from "react-icons/fa";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useDispatch } from "react-redux";
import { setTestimonials } from "../features/home_slices/testimonials";

import OptimizedImage from '../components/ui/OptimizedImage';
export default function Testimonials() {

    const [TestimonialList, setTestimonialList] = useState([]);
    const dispatch = useDispatch();

    const uid = "your-unique-id"

    useEffect(() => {
        const fetchData = async () => {
            try {
                const slidesRef = doc(db, `homepage/${uid}/testimonials/testimonial`);
                const snapshot = await getDoc(slidesRef);

                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setTestimonialList(data?.testimonial || []);
                    dispatch(setTestimonials(data?.testimonial || []));
                } else {
                    console.log("No testimonials found in Firestore");
                }
            } catch (error) {
                console.error("Error fetching testimonials from Firestore:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="mx-auto px-4 sm:px-6 bg-[#F0F5FA] pb-8 sm:pb-10 overflow-hidden">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold py-6 sm:py-10">Testimonials</h2>

            <div className="flex gap-4 sm:gap-6 w-max animate-infinite-scroll">
                {[...TestimonialList, ...TestimonialList, ...TestimonialList].map((t, index) => (
                    <div key={index} className="bg-white rounded-lg flex flex-col justify-between shadow-md py-4 sm:py-6 w-64 sm:w-80 flex-shrink-0">
                        {/* Quotation Icon */}
                        <div className="text-[#2F6288] text-2xl sm:text-3xl mb-2 sm:mb-3 px-3 sm:px-4">
                            <FaQuoteLeft />
                        </div>
                        {/* Quote */}
                        <p className="text-gray-700 text-base sm:text-lg mb-4 sm:mb-6 px-3 sm:px-4">{t?.quotedText}</p>
                        {/* Author Section */}
                        <div className="flex items-center gap-3 border-t">
                            <OptimizedImage                                 src={t?.image}
                                alt={t?.name}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover m-3 sm:m-4"
                            />
                            <div className="px-3 sm:px-4">
                                <p className="font-semibold text-gray-900 text-sm sm:text-base">{t?.name}</p>
                                <p className="text-xs sm:text-sm text-gray-500">{t?.shortdesignation}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
