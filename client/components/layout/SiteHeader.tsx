import React from "react";
import { NavLink } from "react-router-dom";
import Logo from "@/components/Logo";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/journal", label: "Journal" },
  { to: "/community", label: "Community" },
  { to: "/support", label: "Support" },
  { to: "/profile", label: "Profile" },
];

export default function SiteHeader() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-transparent">
      <div className="mx-auto w-full max-w-7xl px-6 py-6 flex items-center justify-between ">
        <Logo />
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
