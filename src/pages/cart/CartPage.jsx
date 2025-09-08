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
import { addUserPrograms } from "../../features/userProgramsSlice.js";
import { prepareCheckoutData, prepareUserProgramsData } from "../../utils/cartUtils.js";
import { validateCoupon } from "../../utils/couponUtils.js";

export default function CartPage() {
	const cartData = useSelector((state) => state.cart.items);
	console.log("cartData", cartData);
	const user = useSelector((state) => state.auth.user);
	const dispatch = useDispatch();
	const [showCheckout, setShowCheckout] = useState(false);
	const [loading, setLoading] = useState(false);
	const [couponCode, setCouponCode] = useState('');
	const [appliedCoupon, setAppliedCoupon] = useState(null);
	const [couponLoading, setCouponLoading] = useState(false);

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
		(sum, item) => sum + (item.price * (item.persons ?? 1) * (item.quantity ?? 1) * (item.duration ?? 1)),
		0
	);
	const baseDiscount = Math.round(subtotal * 0.2);
	const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
	const totalDiscount = baseDiscount + couponDiscount;
	const total = subtotal - totalDiscount;

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

			// Prepare checkout data with expanded bundles and coupon info
			const checkoutData = prepareCheckoutData(cartData, formData, user);
			if (appliedCoupon) {
				checkoutData.coupon = appliedCoupon;
			}
			console.log("Checkout data with expanded bundles:", checkoutData);

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
					// 3️⃣ Confirm on server with expanded cart data
					setLoading(true);
					const confirmPayment = httpsCallable(functions, "confirmPayment");

					const dataContent = await confirmPayment({
						...checkoutData,
						total,
						paymentResponse: response,
						// Send both original and expanded cart data
						cartData: checkoutData.expandedCartData, // Individual items for processing
						originalCartData: checkoutData.originalCartData // Original bundles for reference
					});
					setLoading(false);
					console.log("data from confirmPayment: ", dataContent);

					// Add programs to user's purchased programs in Redux with expiration data
					const userPrograms = prepareUserProgramsData(checkoutData.expandedCartData);
					dispatch(addUserPrograms(userPrograms));

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

	const handleApplyCoupon = async () => {
		if (!couponCode.trim()) {
			toast.error('Please enter a coupon code');
			return;
		}

		setCouponLoading(true);
		try {
			const result = await validateCoupon(couponCode, cartData);
			
			if (result.valid) {
				setAppliedCoupon({
					code: result.coupon.code,
					discount: result.discount,
					discountType: result.coupon.discountType,
					discountValue: result.coupon.discountValue,
					programType: result.coupon.programType
				});
				toast.success(`Coupon applied! You saved ₹${result.discount}`);
			} else {
				toast.error(result.error);
			}
		} catch (error) {
			console.error('Error applying coupon:', error);
			toast.error('Failed to apply coupon');
		} finally {
			setCouponLoading(false);
		}
	};

	const handleRemoveCoupon = () => {
		setAppliedCoupon(null);
		setCouponCode('');
		toast.success('Coupon removed');
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
							<span className="text-red-600">−₹ {baseDiscount.toLocaleString()}</span>
						</div>
						
						{/* Coupon Section */}
						<div className="mt-4 mb-4">
							{!appliedCoupon ? (
								<div className="space-y-2">
									<label className="block text-sm font-medium text-gray-700">
										Have a coupon code?
									</label>
									<div className="flex gap-2">
										<input
											type="text"
											value={couponCode}
											onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
											placeholder="Enter coupon code"
											className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0c3c60]"
										/>
										<button
											onClick={handleApplyCoupon}
											disabled={couponLoading}
											className="px-4 py-2 bg-[#0c3c60] text-white rounded-md text-sm hover:bg-[#0a2d47] disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{couponLoading ? 'Applying...' : 'Apply'}
										</button>
									</div>
								</div>
							) : (
								<div className="bg-green-50 border border-green-200 rounded-md p-3">
									<div className="flex justify-between items-center">
										<div>
											<div className="text-sm font-medium text-green-800">
												Coupon Applied: {appliedCoupon.code}
											</div>
											<div className="text-xs text-green-600">
												{appliedCoupon.discountType === 'percentage' 
													? `${appliedCoupon.discountValue}% off` 
													: `₹${appliedCoupon.discountValue} off`}
											</div>
										</div>
										<button
											onClick={handleRemoveCoupon}
											className="text-red-600 hover:text-red-800 text-sm"
										>
											Remove
										</button>
									</div>
									<div className="flex justify-between text-sm mt-2">
										<span>Coupon Discount</span>
										<span className="text-green-600">−₹ {couponDiscount.toLocaleString()}</span>
									</div>
								</div>
							)}
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
