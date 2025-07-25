export default function WhyFeatureCard({ title, description, imgSrc, reverse = false, highlighted = false }) {
  return (
    <div
      className={`flex flex-col md:flex-row ${reverse ? 'md:flex-row-reverse' : ''} items-center justify-between gap-4 p-4 md:p-6 rounded-xl shadow-sm border-t-4 border-[#C16A00] bg-white mb-6`}
    >
      <img
        src={imgSrc}
        alt={title}
        className="w-full md:w-1/3 rounded-lg object-cover h-58 md:h-50"
      />

      <div className="w-full md:w-2/3">
        <h3 className="text-lg md:text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-700 mt-1">{description}</p>
      </div>
    </div>
  );
}
