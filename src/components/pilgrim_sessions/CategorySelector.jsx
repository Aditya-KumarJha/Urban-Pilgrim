export default function CategorySelector() {
  return (
    <div className="bg-white rounded-xl shadow px-6 py-4 mb-8">
      <div className="flex space-x-4 items-center">
        <span className="font-semibold text-gray-700">Category:</span>
        <button className="bg-white px-4 py-1 rounded-full text-sm">
          All
        </button>
        <button className="bg-white border border-gray-300 text-black px-4 py-1 rounded-full text-sm">
          Yoga
        </button>
        <button className="bg-white border border-gray-300 text-black px-4 py-1 rounded-full text-sm">
          Meditation
        </button>
      </div>
    </div>
  );
}
