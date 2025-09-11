
import { NavLink } from "react-router-dom";
import Logo from "@/components/Logo";
import React, { useState, useEffect } from 'react';
import Link from "react-router-dom";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/journal", label: "Journal" },
  { to: "/community", label: "Community" },
  { to: "/smallapps", label: "Small Apps" },
  { to: "/support", label: "Support" },
  { to: "/profile", label: "Profile" },
];

export default function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeItem, setActiveItem] = useState('Home');

  useEffect(() => {
    // Handler function to check the scroll position
    const handleScroll = () => {
      // Set isScrolled to true if the scroll position is greater than 50px
      // This is the threshold to trigger the navbar change
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Add the event listener when the component mounts
    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const headerClasses = isScrolled
  ? 'bg-grey/90 backdrop-blur-md shadow-lg text-gray-800' // Classes for scrolled state
  : 'bg-transparent text-white drop-shadow'; // Classes for initial transparent state

// Conditional classes for the NavLinks based on the scroll state
const navLinkClasses = isScrolled
  ? 'uppercase text-sm tracking-widest font-semibold transition-colors text-gray-800 hover:text-purple-600'
  : 'uppercase text-sm tracking-widest font-semibold transition-colors text-white/90 hover:text-white';

  

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${headerClasses}`}>
      <div className="mx-auto w-full max-w-7xl px-6 py-6 flex items-center justify-between ">
        <NavLink to="/">
        <Logo />
        </NavLink>
        <nav className="hidden md:flex items-center gap-8 ">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "uppercase text-sm tracking-widest font-semibold drop-shadow transition-colors",
                  isActive ? "text-white" : "text-white/90 hover:text-white",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
