import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function SubscriptionCard({ title = "", price, handleClick = "", redirectToProgram="" }) {
    const userPrograms = useSelector((state) => state.userProgram);
    const navigate = useNavigate();

    // ✅ Check if program already purchased
    const alreadyPurchased = userPrograms?.some(
        (program) => program?.title === title
    );

    // ✅ Only show a simple "View Program" card
    if (alreadyPurchased) {
        return (
            <div onClick={redirectToProgram} className="flex justify-start items-start py-4">
                <motion.div
                    className="rounded-lg w-fit text-center"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate("/my-programs")} // 👈 redirect user to My Programs page
                        className="w-full bg-green-600 text-white font-semibold p-3 rounded-md hover:bg-green-700 transition-colors"
                    >
                        View Program
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    // ✅ Default Subscription Box if not purchased
    return (
        <div className="flex justify-start items-start py-4">
            <motion.div
                className="rounded-lg max-w-md w-full"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <h2 className="text-xl font-bold mb-4">Subscription</h2>

                {/* Price Box */}
                <div className="border rounded-lg p-4 mb-5 bg-white">
                    <p className="text-sm font-medium text-gray-700">One Time Purchase</p>
                    <p className="text-2xl font-bold text-[#1F4B6E] mt-1">
                        {price
                            ? new Intl.NumberFormat("en-IN", {
                                style: "currency",
                                currency: "INR",
                                maximumFractionDigits: 2,
                            }).format(price)
                            : "Price not available"}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">Total</p>
                </div>

                {/* Buttons */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClick}
                    className="w-full bg-[#2F5D82] text-white font-semibold py-3 rounded-md mb-3 hover:bg-[#244a67] transition-colors"
                >
                    Add to cart
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="w-full border border-[#2F5D82] text-[#2F5D82] font-semibold py-3 rounded-md hover:bg-[#e6edf3] transition-colors"
                >
                    Get a Free Trial
                </motion.button>
            </motion.div>
        </div>
    );
}
