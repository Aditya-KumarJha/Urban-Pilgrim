import { useEffect, useState } from "react";
import { FaQuoteLeft } from "react-icons/fa";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useDispatch } from "react-redux";
import { setTestimonials } from "../features/home_slices/testimonials";

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
        <div className="mx-auto p-6 bg-[#F0F5FA] py-10 overflow-hidden">
            <h2 className="text-4xl font-bold py-10">Testimonials</h2>

            <div className="flex gap-6 w-max animate-infinite-scroll">
                {[...TestimonialList, ...TestimonialList, ...TestimonialList].map((t, index) => (
                    <div key={index} className="bg-white rounded-lg flex flex-col justify-between shadow-md py-6 w-80 flex-shrink-0">
                        {/* Quotation Icon */}
                        <div className="text-[#2F6288] text-3xl mb-3 px-4">
                            <FaQuoteLeft />
                        </div>
                        {/* Quote */}
                        <p className="text-gray-700 text-lg mb-6 px-4">{t?.quotedText}</p>
                        {/* Author Section */}
                        <div className="flex items-center gap-3 border-t">
                            <img
                                src={t?.image}
                                alt={t?.name}
                                className="w-12 h-12 rounded-full object-cover m-4"
                            />
                            <div className="px-4">
                                <p className="font-semibold text-gray-900">{t?.name}</p>
                                <p className="text-sm text-gray-500">{t?.shortdesignation}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
