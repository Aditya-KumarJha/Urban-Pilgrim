import { useState } from "react";

export default function CheckoutOverlay({ cartData, total, onClose, onConfirm }) {
    const [formData, setFormData] = useState({
        country: "India",
        firstName: "",
        lastName: "",
        address: "",
        apartment: "",
        city: "",
        state: "",
        pin: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(formData); // Pass form data back to parent
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg relative">
                <button className="absolute top-3 right-3 text-gray-500" onClick={onClose}>✖</button>
                <h2 className="text-2xl font-bold mb-4">Billing address</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <select name="country" value={formData.country} onChange={handleChange} className="w-full border p-2 rounded">
                        <option value="India">India</option>
                        <option value="USA">USA</option>
                    </select>

                    <div className="flex gap-2">
                        <input name="firstName" placeholder="First name" value={formData.firstName} onChange={handleChange} className="flex-1 border p-2 rounded" />
                        <input name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleChange} className="flex-1 border p-2 rounded" />
                    </div>

                    <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} className="w-full border p-2 rounded" />
                    <input name="apartment" placeholder="Apartment, suite, etc. (optional)" value={formData.apartment} onChange={handleChange} className="w-full border p-2 rounded" />

                    <div className="flex flex-wrap gap-2">
                        <input name="city" placeholder="City" value={formData.city} onChange={handleChange} className="flex-1 border p-2 rounded" />
                        <input name="state" placeholder="State" value={formData.state} onChange={handleChange} className="flex-1 border p-2 rounded" />
                        <input name="pin" placeholder="PIN code" value={formData.pin} onChange={handleChange} className="flex-1 border p-2 rounded" />
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold">
                        Pay now
                    </button>
                </form>
            </div>
        </div>
    );
}
