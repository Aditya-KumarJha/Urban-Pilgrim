import { FiTrash2 } from "react-icons/fi";

export default function CartItem({ item }) {
  return (
    <div className="grid grid-cols-1 items-start justify-between p-4 border-b last:border-none w-full">
      <div className="flex gap-4 w-full">
        <img src={item.img} alt={item.title} className="w-20 h-full rounded-md object-cover" />
        <div className="flex flex-col justify-between">
            <div>
            <p className="font-semibold text-sm md:text-base">{item.title}</p>
            <p className="text-xs text-gray-500 mt-1">{item.meta}</p>
            <p className="text-xs text-gray-500">{item.submeta}</p>
            </div>
          <p className="font-bold mt-2 text-sm md:text-base">₹ {item.price.toLocaleString()}</p>
        </div>
        <div className="flex flex-col justify-between items-end gap-2">
            <FiTrash2 className="text-red-500 cursor-pointer" />
            <div className="flex items-center gap-2 text-sm py-1 rounded-full">
                <button className="text-4xl text-gray-500">+</button>
                <span className="text-xl font-medium">1</span>
                <button className="text-4xl text-gray-500">-</button>
            </div>
        </div>
      </div>

    </div>
  );
}
