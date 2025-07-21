import { FaUserCheck, FaCalendarAlt, FaGem, FaYinYang, FaMapMarkerAlt } from "react-icons/fa";
import FeatureCard from "./FeatureCard";

const features = [
  {
    icon: FaUserCheck,
    title: "Verified Experts",
    description: "Trusted professionals in yoga, meditation, mental wellness, nutrition, and rituals",
  },
  {
    icon: FaCalendarAlt,
    title: "Easy Booking",
    description: "Book 1:1 or group sessions directly through the platform",
  },
  {
    icon: FaGem,
    title: "Authentic Traditions",
    description: "Experts rooted in Indian traditions with deep personal practice and teaching experience",
  },
  {
    icon: FaYinYang,
    title: "Holistic Guidance",
    description: "Vedic scholars to body alignment coaches—find your guide for every dimension of well-being",
  },
  {
    icon: FaMapMarkerAlt,
    title: "Location-Agnostic",
    description: "Connect online or host sessions at your space (for eligible services)",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="px-6 py-12 text-gray-900">
      <div className="max-w-6xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </section>
  );
}
