import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
export default function EventCard({ data }) {
    const navigate = useNavigate();

    return (
        <motion.div
            className="max-w-sm rounded-2xl overflow-hidden lg:shadow-[-21px_21px_25.7px_0_rgba(0,0,0,0.25)] bg-gradient-to-b from-[#FDF6F2] to-[#FCEFE6]"
            initial={{ y: 100, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.1 }}
        >
            <img
                src={data.image}
                alt={data.title}
                className="w-full h-60 aspect-square object-cover rounded-t-xl"
            />

            <div className="space-y-2 p-4 bg-[url('/assets/eventbg.svg')] bg-cover bg-bottom rounded-b-2xl">
                <div className="flex gap-2 flex-wrap">
                    {data.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="bg-[#F6E5D8] text-[#A27056] text-sm font-medium px-3 py-1 mb-4 rounded-full"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                <h3
                    onClick={() => {
                        const slug = data.title.toLowerCase().replace(/\s+/g, "-");
                        const eventId = data.id;
                        
                        // Navigate based on event ID prefix
                        if (eventId.startsWith('retreat-')) {
                            navigate(`/pilgrim_retreats/${slug}`);
                        } else if (eventId.startsWith('guide-')) {
                            navigate(`/guide/${slug}`);
                        } else if (eventId.startsWith('live-')) {
                            navigate(`/session/${slug}/details`);
                        } else if (eventId.startsWith('recorded-')) {
                            navigate(`/program/${slug}/details`);
                        } else {
                            // Fallback to original route
                            navigate(`/event/${slug}`);
                        }
                    }}
                    className="md:text-lg text-sm cursor-pointer font-semibold text-[#1A1A1A]"
                >
                    {data.title}
                </h3>

                <p className="text-gray-500 text-sm">
                    From{" "}
                    <span className="text-black font-semibold">Rs. {data.price}</span>
                </p>
            </div>
        </motion.div>
    );
}
