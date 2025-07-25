import CartItem from "../../components/ui/CartItem";

const cartData = [
  {
    img: "https://picsum.photos/200/300",
    title: "Rejuvenate in the Himalayas – Immerse in...",
    meta: "Date Options: TBA",
    submeta: "Occupancy: Twin",
    price: 63996,
  },
  {
    img: "https://picsum.photos/200/300",
    title: "Discover your true self - A 28 day soul search...",
    meta: "Packages: 28 days",
    submeta: "",
    price: 14999,
  },
  {
    img: "https://picsum.photos/200/300",
    title: "Menopausal fitness - A 4 day regime curated...",
    meta: "Packages: 4 sessions",
    submeta: "",
    price: 4000,
  },
];

export default function CartPage() {
  const subtotal = cartData.reduce((sum, item) => sum + item.price, 0);
  const discount = Math.round(subtotal * 0.2);
  const total = subtotal - discount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f2f4fc] via-[#fdf7f1] to-[#fffaf6] px-4 md:px-12 py-10 mt-[100px]">
      <h2 className="text-3xl font-bold mb-8">Your Cart</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="md:col-span-2 border border-[#00000033] rounded-xl p-4">
          {cartData.map((item, index) => (
            <CartItem key={index} item={item} />
          ))}
        </div>

        {/* Order Summary */}
        <div className="flex flex-col">
            <div className="border border-[#00000033] rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
                <div className="flex justify-between text-sm mb-2">
                    <span>Subtotal</span>
                    <span>₹ {subtotal}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                    <span>Discount(-20%)</span>
                    <span className="text-red-600">−₹ {discount}</span>
                </div>
                <div className="w-full h-[1px] bg-[#00000033] my-6"></div>
                <div className="flex justify-between font-bold text-lg mt-4 mb-6">
                    <span>Total</span>
                    <span>₹ {total}</span>
                </div>
                <button className="w-full bg-gradient-to-r from-[#C5703F] to-[#C16A00] text-white py-2 rounded-full font-semibold">
                    Go to Checkout →
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
