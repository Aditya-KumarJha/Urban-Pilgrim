export default function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="bg-white shadow-[-20px_26px_25.7px_rgba(0,0,0,0.25)] rounded-xl p-5 flex flex-col gap-3 items-start text-left">
      <div className="text-[#2F6288] mt-1">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-semibold text-md text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
