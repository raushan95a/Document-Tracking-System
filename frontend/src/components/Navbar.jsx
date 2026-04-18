import React from "react";
import { MdDescription } from "react-icons/md";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-dark text-cream z-10 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <MdDescription className="text-2xl" />
        <span className="text-cream font-bold text-xl">DocTrack</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-cream text-sm">{user?.name || "User"}</span>
        <span className="bg-sage text-cream rounded-full px-2 py-0.5 text-xs capitalize">
          {user?.role || "employee"}
        </span>
        <button
          type="button"
          onClick={logout}
          className="border border-cream/40 text-cream hover:bg-sage px-3 py-1 rounded text-sm"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
