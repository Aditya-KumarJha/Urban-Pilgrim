export default function CategorySelector() {
  return (
    <div className="bg-white rounded-xl shadow px-6 py-4 mb-8">
      <div className="flex space-x-4 items-center">
        <span className="font-semibold text-gray-700">Category:</span>
        <button className="bg-black text-white px-4 py-1 rounded-full text-sm">
          Cultural and Heritage immersion
        </button>
        <button className="bg-white border border-gray-300 text-black px-4 py-1 rounded-full text-sm">
          Spiritual and wellness immersion
        </button>
      </div>
    </div>
  );
}
