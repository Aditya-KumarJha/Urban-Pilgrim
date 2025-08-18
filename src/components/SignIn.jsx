import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { signInWithCustomToken } from "firebase/auth";
import { auth, db, functions } from "../services/firebase";
import { useDispatch } from "react-redux";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { setUser } from "../features/authSlice";
import { showError, showSuccess } from "../utils/toast";
import store from "../redux/store";

export default function SignIn({ onClose }) {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1); // 1: enter email, 2: enter OTP
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    // b123076@iiit-bh.ac.in

    const sendOtp = async () => {
        if (!email) return alert("Enter email!");
        setLoading(true);
        try {
            const sendOtpFn = httpsCallable(functions, "sendOtp");
            const result = await sendOtpFn({ email });
            console.log("OTP function result:", result.data);
            setStep(2);
            showSuccess("OTP sent to your email!");
        } catch (err) {
            console.error(err);
            showError("Failed to send OTP");
        }
        setLoading(false);
    };

    const verifyOtp = async () => {
        if (!otp) return alert("Enter OTP!");
        setLoading(true);

        try {
            const verifyOtpFn = httpsCallable(functions, "verifyOtp");
            const res = await verifyOtpFn({ email, otp });
            console.log("OTP verification result:", res.data);

            // 🔑 Sign in using custom token
            const result = await signInWithCustomToken(auth, res.data.token);
            const user = result.user;
            console.log("Sign in result:", user);

            // 🔍 Check if user exists in Firestore
            const userRef = doc(db, "users", user.uid, "info", "details");
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                // 🆕 Create new user
                await setDoc(userRef, {
                    uid: user.uid,
                    email: user.email,
                    createdAt: new Date(),
                });
                console.log("New user created");
            } else {
                console.log("Existing user logged in");
            }

            dispatch(setUser({
                uid: user.uid,
                email: user.email,
            }));

            console.log("Redux state after setUser:", store.getState().auth.user);

            showSuccess("Signed in successfully!");
            onClose();
        } catch (err) {
            console.error(err);
            showError("Invalid OTP");
        }

        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

            <div className="relative z-10 rounded-2xl bg-white/50 shadow-lg w-full max-w-xl px-8 py-12 text-center">
                <button className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl" onClick={onClose}>&times;</button>

                <h2 className="text-3xl font-bold mb-3">Sign in</h2>
                <p className="text-gray-600 text-sm mb-6">
                    {step === 1
                        ? "Enter your email and we’ll send you a verification code"
                        : "Enter the OTP sent to your email"}
                </p>

                {step === 1 ? (
                    <input
                        type="email"
                        placeholder="Enter your email address..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                ) : (
                    <input
                        type="text"
                        placeholder="Enter OTP..."
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                )}

                <button
                    onClick={step === 1 ? sendOtp : verifyOtp}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#C5703F] to-[#C16A00] text-white font-semibold py-2 rounded-lg hover:from-[#C5703F]/90 hover:to-[#C16A00]/90 transition"
                >
                    {step === 1 ? "Continue →" : "Verify OTP →"}
                </button>

                <p className="text-xs text-left text-gray-500 mt-4 cursor-pointer hover:underline">
                    Privacy Policy
                </p>
            </div>
        </div>
    );
}
