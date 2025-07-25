import WhyFeatureCard from "../ui/WhyFeatureCard";

const features = [
  {
    title: "Authentic, Indian-Rooted Wellness",
    description:
      "We bring you practices and experiences deeply grounded in India’s timeless wisdom—from yoga and Ayurveda to spiritual rituals and mindful travel.",
    imgSrc: "/assets/whyus/img1.png",
    highlighted: true,
  },
  {
    title: "Expert-Led & Curated with Care",
    description:
      "All our guides, retreats, and products are handpicked by our team of wellness and heritage experts.\nNo noise, no fluff—just substance and sincerity.",
    imgSrc: "/assets/whyus/img2.png",
  },
  {
    title: "Accessible from Anywhere",
    description:
      "Join a virtual session, book a retreat, or browse spiritual offerings—wherever you are in the world at your pace.",
    imgSrc: "/assets/whyus/img3.png",
    highlighted: true,
  },
  {
    title: "Experiences that Transform",
    description:
      "Our programs are not just about health—they’re about meaningful inner change. Short or long, every journey on Urban Pilgrim is designed to awaken, explore, and transform.",
    imgSrc: "/assets/whyus/img4.png",
  },
];

export default function FeatureSection() {
  return (
    <div>
      {features.map((item, index) => (
        <WhyFeatureCard
          key={index}
          {...item}
          reverse={index % 2 !== 0}
        />
      ))}
    </div>
  );
}
