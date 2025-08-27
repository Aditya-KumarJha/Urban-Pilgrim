import { useSelector, useDispatch } from "react-redux";
import { clearCart, removeFromCart, updatePersons, updateQuantity } from "../../features/cartSlice";
import CartItem from "../../components/ui/CartItem";
import SEO from "../../components/SEO.jsx";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import CheckoutOverlay from "./CheckoutOverlay.jsx"
import { httpsCallable } from "firebase/functions";
import { functions } from "../../services/firebase.js";
import Loader2 from "../../components/Loader2.jsx";
import { addUserProgram } from "../../features/userProgramsSlice.js";

export default function CartPage() {
	const cartData = useSelector((state) => state.cart.items);
	console.log("cartData", cartData);
	const user = useSelector((state) => state.auth.user);
	const dispatch = useDispatch();
	const [showCheckout, setShowCheckout] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleRemoveItem = (id) => {
		dispatch(removeFromCart(id));
		toast.success("Item removed from cart");
	};

	const handleQuantityChange = (id, quantity) => {
		dispatch(updateQuantity({ id, quantity }));
	};

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	const handleCheckout = () => {
		setShowCheckout(true);
	};

	const subtotal = cartData.reduce(
		(sum, item) => sum + (item.price * (item.persons ?? 1) * (item.quantity ?? 1)),
		0
	);
	const discount = Math.round(subtotal * 0.2);
	const total = subtotal - discount;

	if (cartData.length === 0) {
		return (
			<div className="min-h-screen px-4 md:px-12 py-10 mt-[100px]">
				<SEO title="Your Cart | Urban Pilgrim" description="View and manage your cart." />
				<h2 className="text-3xl font-bold mb-8">Your Cart</h2>
				<div className="text-center py-12">
					<p className="text-gray-500 text-lg">Your cart is empty</p>
				</div>
			</div>
		);
	}

	const handleConfirmCheckout = async (formData) => {
		try {
			if (!user) {
				toast.error("Please login to continue");
				return;
			}

			// 1️⃣ Create Razorpay order
			const createOrder = httpsCallable(functions, "createOrder");
			const { data: order } = await createOrder({ amount: total });

			// 2️⃣ Open Razorpay popup
			const options = {
				key: "rzp_test_5Qxb0fQ1nBKqtZ",
				amount: order.amount,
				currency: order.currency,
				name: "Urban Pilgrim",
				description: "Program Purchase",
				order_id: order.id,
				handler: async function (response) {
					// 3️⃣ Confirm on server
					setLoading(true);
					const confirmPayment = httpsCallable(functions, "confirmPayment");

					const dataContent = await confirmPayment({
						userId: user.uid,
						email: user.email,
						name: `${formData.firstName} ${formData.lastName}`,
						cartData,
						total,
						paymentResponse: response,
						formData,
					});
					setLoading(false);
					console.log("data from confirmPayment: ", dataContent);

					// ✅ update Redux immediately
					cartData.forEach((program) => {
						dispatch(addUserProgram(program));
					});

					dispatch(clearCart());

					toast.success("Payment successful! Programs saved.");
				},
				prefill: {
					name: `${formData.firstName} ${formData.lastName}`,
					email: user.email,
					contact: formData.phone || "9999999999",
				},
				theme: { color: "#2F5D82" },
			};


			const rzp = new window.Razorpay(options);
			rzp.open();
		} catch (err) {
			console.error(err);
			toast.error("Checkout failed");
		}
	};

	const handlePersonsChange = (id, persons) => {
		dispatch(updatePersons({ id, persons }));
	};

	if (loading) {
		return <Loader2 />
	}

	return (
		<div className="min-h-screen px-4 md:px-12 py-10 mt-[100px]">
			<SEO title="Your Cart | Urban Pilgrim" description="View and manage your cart." />
			<h2 className="text-3xl font-bold mb-8">Your Cart</h2>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 border border-[#00000033] rounded-xl p-4">
					{cartData.map((item) => (
						<CartItem
							key={item.id}
							item={item}
							onRemove={handleRemoveItem}
							onQuantityChange={handleQuantityChange}
							onPersonsChange={handlePersonsChange}
						/>
					))}
				</div>

				<div className="lg:col-span-1 flex flex-col">
					<div className="border border-[#00000033] rounded-xl p-6">
						<h3 className="text-xl font-semibold mb-4">Order Summary</h3>
						<div className="flex justify-between text-sm mb-2">
							<span>Subtotal</span>
							<span>₹ {subtotal.toLocaleString()}</span>
						</div>
						<div className="flex justify-between text-sm mb-2">
							<span>Discount(-20%)</span>
							<span className="text-red-600">−₹ {discount.toLocaleString()}</span>
						</div>
						<div className="w-full h-[1px] bg-[#00000033] my-6"></div>
						<div className="flex justify-between font-bold text-lg mt-4 mb-6">
							<span>Total</span>
							<span>₹ {total.toLocaleString()}</span>
						</div>
						<button onClick={handleCheckout} className="w-full bg-gradient-to-r from-[#C5703F] to-[#C16A00] text-white py-2 rounded-full font-semibold hover:opacity-90 transition-opacity">
							Go to Checkout →
						</button>

						{showCheckout && (
							<CheckoutOverlay
								cartData={cartData}
								total={total}
								onClose={() => setShowCheckout(false)}
								onConfirm={handleConfirmCheckout}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
