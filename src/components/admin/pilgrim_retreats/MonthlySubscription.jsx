import { useState } from "react";

export default function MonthlySubscription() {
  const [subscriptionPrice, setSubscriptionPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [description, setDescription] = useState("");
  return (
    <div className="p-8 mx-auto">
        <h2 className="text-3xl text-[#2F6288] font-bold mb-6">
            Monthly Subscription <span className="bg-[#2F6288] mt-4 max-w-xs h-1 block"></span>
        </h2>

        <h3 className="text-lg font-semibold mb-3">Subscription Price</h3>
        <input
            type="number"
            placeholder="Enter Price"
            value={subscriptionPrice}
            onChange={(e) => setSubscriptionPrice(e.target.value)}
            className="w-full border p-2 rounded mb-3"
        />

        <h3 className="text-lg font-semibold mb-3">Discount</h3>

        <input
            type="number"
            placeholder="Enter percentage"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className="w-full border p-2 rounded mb-3"
        />


        <h3 className="text-lg font-semibold mb-3">Description</h3>
        <textarea
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded mb-3"
            rows={3}
        />
    </div>
  )
}
