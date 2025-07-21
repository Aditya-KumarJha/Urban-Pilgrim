import { FaCheckCircle } from "react-icons/fa";

export default function FeatureList({ features, textColor = "text-gray-700" }) {
  return (
    <ul className={`text-sm mt-6 space-y-2 text-left ${textColor}`}>
      {features.map((feature, idx) => (
        <li key={idx} className="flex gap-2 items-start">
          <FaCheckCircle className="h-4 w-4 flex-shrink-0 mt-[2px] text-[#BF7444]" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}
