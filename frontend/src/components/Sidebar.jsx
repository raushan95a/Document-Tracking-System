import React from "react";
import { MdAdminPanelSettings, MdDashboard, MdUploadFile } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();

  const links = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: MdDashboard,
      show: true,
    },
    {
      to: "/upload",
      label: "Upload Document",
      icon: MdUploadFile,
      show: true,
    },
    {
      to: "/admin",
      label: "Admin Panel",
      icon: MdAdminPanelSettings,
      show: user?.role === "admin",
    },
  ];

  return (
    <aside className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-56 bg-sage text-cream pt-4">
      <nav className="space-y-0.5">
        {links
          .filter((link) => link.show)
          .map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg mx-2 my-0.5 text-sm transition",
                    isActive ? "bg-dark text-cream" : "text-cream/80 hover:bg-dark/40",
                  ].join(" ")
                }
              >
                <Icon className="text-lg" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
      </nav>
    </aside>
  );
};

export default Sidebar;
