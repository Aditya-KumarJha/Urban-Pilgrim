export default function CategorySelector() {
  return (
    <div className="bg-white rounded-xl shadow px-6 py-4 mb-8 overflow-x-scroll">
      <div className="flex space-x-4 items-center">
        <span className="font-semibold text-gray-700">Category:</span>
        <button className="bg-white px-4 py-1 rounded-full sm:text-sm text-xs">
          All
        </button>
        <button className="bg-white border border-gray-300 text-black px-4 py-1 rounded-full sm:text-sm text-xs">
          Yoga Guides
        </button>
        <button className="bg-white border border-gray-300 text-black px-4 py-1 rounded-full sm:text-sm text-xs">
          Meditation Guides
        </button>
        <button className="bg-white border border-gray-300 text-black px-4 py-1 rounded-full sm:text-sm text-xs">
          Mental Wellness
        </button>
        <button className="bg-white border border-gray-300 text-black px-4 py-1 rounded-full sm:text-sm text-xs">
          Nutrition Experts
        </button>
        <button className="bg-white border border-gray-300 text-black px-4 py-1 rounded-full sm:text-sm text-xs">
          Ritual Pandits
        </button>
      </div>
    </div>
  );
}
