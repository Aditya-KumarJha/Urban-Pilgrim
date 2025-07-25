import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./NavBar.css";
import { CiSearch } from "react-icons/ci";
import { FaRegUser } from "react-icons/fa";
import SignIn from "../SignIn";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSignIn, setShowSignIn] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleSearch = () => setShowSearch(!showSearch);
  const toggleSignIn = () => setShowSignIn(!showSignIn);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search submitted:", searchQuery);
    // Example: Navigate or fetch here
    setShowSearch(false); // optional: close after search
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img className="logo" src="/assets/urban_pilgrim_logo.png" alt="Urban Pilgrim" />
      </div>

      <motion.div
        className={`nav-links ${isOpen ? "open" : ""}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
        <Link to="/pilgrim_retreats" onClick={() => setIsOpen(false)}>Pilgrim Retreats</Link>
        <Link to="/pilgrim_sessions" onClick={() => setIsOpen(false)}>Pilgrim Sessions</Link>
        <Link to="/pilgrim_guides" onClick={() => setIsOpen(false)}>Pilgrim Guides</Link>
        <Link to="/Wellness_Guide" onClick={() => setIsOpen(false)}>Wellness Guide</Link>
        <Link to="/contact" onClick={() => setIsOpen(false)}>Contact</Link>
      </motion.div>

      <div className="navbar-right">
        <CiSearch
          className="search-icon"
          onClick={toggleSearch}
        />
        <FaRegUser
          className="user-icon"
          onClick={toggleSignIn}
        />
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

      {showSearch && (
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      )}

      {showSignIn && (
        <SignIn onClose={() => setShowSignIn(false)} />
      )}
    </nav>
  );
};

export default NavBar;
