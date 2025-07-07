import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./NavBar.css";
import logo from "../assets/urban_pilgrim_logo.png";


const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img
          className="logo"
          src={logo}
          alt="Urban Pilgrim"
        />
      </div>

      <motion.div
        className={`nav-links ${isOpen ? "open" : ""}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
        <Link to="/Pilgrim_Experiences" onClick={() => setIsOpen(false)}>Pilgrim Experiences</Link>
        <Link to="/Pilgrim_Sessions" onClick={() => setIsOpen(false)}>Pilgrim Sessions</Link>
        <Link to="/Wellness_Program" onClick={() => setIsOpen(false)}>Wellness Program</Link>
        <Link to="/Wellness_Guide" onClick={() => setIsOpen(false)}>Wellness Guide</Link>
        <Link to="/contact" onClick={() => setIsOpen(false)}>Contact</Link>
      </motion.div>

      <motion.div
        className="menu-icon"
        onClick={toggleMenu}
        initial={{ opacity: 0, rotate: -90 }}
        animate={{ opacity: 1, rotate: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        {isOpen ? '✖' : '☰'}
      </motion.div>
    </nav>
  );
};

export default NavBar;
