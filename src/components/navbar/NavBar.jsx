import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./NavBar.css";
import { CiSearch } from "react-icons/ci";
import { FaRegUser } from "react-icons/fa";
import { FiShoppingCart, FiGift } from "react-icons/fi";
import { useSelector } from "react-redux";
import SignIn from "../SignIn";
import SearchBar from "../SearchBar";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
// import { auth, db } from "../../services/firebase";
// import { doc, getDoc } from "firebase/firestore";

const NavBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showSignIn, setShowSignIn] = useState(false);
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const [navbarData, setNavbarData] = useState([]);

    const cartItems = useSelector((state) => state.cart.items);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const uid = "your-unique-id"

    // const [userData, setUserData] = useState(null);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const currentUser = auth.currentUser; // logged-in Firebase user
    //             if (!currentUser) return;

    //             // reference to user document
    //             const userRef = doc(db, "users", currentUser.uid);
    //             const userSnap = await getDoc(userRef);

    //             if (userSnap.exists()) {
    //                 setUserData(userSnap.data());
    //                 console.log("User data:", userSnap.data());
    //             } else {
    //                 console.log("No such user document!");
    //             }
    //         } catch (error) {
    //             console.log("Error fetching user data:", error);
    //         }
    //     };

    //     fetchData();
    // }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const slidesRef = doc(db, `homepage/${uid}/navbar/links`);
                const snapshot = await getDoc(slidesRef);

                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setNavbarData(data?.links || []);
                } else {
                    console.log("No navbar links found in Firestore");
                }
            } catch (error) {
                console.error("Error fetching navbar links from Firestore:", error);
            }
        };

        fetchData();
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);
    const toggleSearch = () => setShowSearch(true);
    // console.log("userData in NavBar:", userData);

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <img
                    onClick={() => navigate("/")}
                    className="logo cursor-pointer"
                    src="https://www.urbanpilgrim.in/cdn/shop/files/logo.jpg?v=1744941617&width=600"
                    alt="Urban Pilgrim"
                />
            </div>

            {/* Navbar Links */}
            <motion.div
                className={`nav-links ${isOpen ? "open" : ""}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
                <Link to="/pilgrim_retreats" onClick={() => setIsOpen(false)}>Pilgrim Retreats</Link>
                <Link to="/pilgrim_sessions" onClick={() => setIsOpen(false)}>Pilgrim Sessions</Link>
                <Link to="/pilgrim_guides" onClick={() => setIsOpen(false)}>Pilgrim Guides</Link>
                <Link to="/contact" onClick={() => setIsOpen(false)}>Contact</Link> */}

                {
                    navbarData.map((link, index) => (
                        <span 
                            key={index} 
                            onClick={() => {
                                setIsOpen(false);
                                navigate(`/${link?.linkUrl}`);
                            }}
                            className="font-semibold cursor-pointer text-sm"
                        >
                            {link?.title.toUpperCase()}
                        </span>
                    ))
                }
            </motion.div>

            {/* Right Side Icons */}
            <div className="navbar-right">
                {/* 🔍 Search */}
                <CiSearch
                    className="search-icon cursor-pointer"
                    onClick={toggleSearch}
                />

                {/* 👤 User Icon or Profile */}
                {user ? (
                    <img
                        src={user.photoURL || "https://i.pravatar.cc/40"} // fallback avatar
                        alt="Profile"
                        className="profile-icon cursor-pointer"
                        onClick={() => navigate("/userdashboard")}
                        style={{ width: 20, height: 20, borderRadius: "50%" }}
                    />
                ) : (
                    <FaRegUser
                        className="user-icon cursor-pointer"
                        onClick={() => setShowSignIn(true)}
                    />
                )}

                {/* 🎁 Gift Card */}
                <FiGift
                    className="user-icon cursor-pointer"
                    onClick={() => navigate("/gift-cards")}
                    title="Gift Cards"
                />

                {/* 🛒 Cart */}
                <div className="relative">
                    <FiShoppingCart
                        className="user-icon cursor-pointer"
                        onClick={() => navigate("/cart")}
                    />
                    {itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs animate-bounce p-1 size-3 flex items-center justify-center rounded-full">
                            {itemCount}
                        </span>
                    )}
                </div>

                {/* ☰ Mobile Menu */}
                <motion.div
                    className="menu-icon"
                    onClick={toggleMenu}
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {isOpen ? '✖' : '☰'}
                </motion.div>
            </div>

            {/* 🔍 Search Modal */}
            <AnimatePresence>
                {showSearch && (
                    <SearchBar onClose={() => setShowSearch(false)} />
                )}
            </AnimatePresence>

            {/* 🔑 Sign In Modal */}
            {showSignIn && !user && (
                <SignIn onClose={() => setShowSignIn(false)} />
            )}
        </nav>
    );
};

export default NavBar;
