import React from "react";
import { MdAdminPanelSettings, MdDashboard, MdUploadFile } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: MdDashboard, show: true },
    { to: "/upload", label: "Upload Document", icon: MdUploadFile, show: true },
    { to: "/admin", label: "Admin Panel", icon: MdAdminPanelSettings, show: user?.role === "admin" },
  ];

  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: 56,
        height: "calc(100vh - 56px)",
        width: 224,
        background: "#111210",
        borderRight: "1px solid rgba(125,255,107,0.1)",
        paddingTop: 16,
      }}
    >
      <nav>
        {links
          .filter((l) => l.show)
          .map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 16px",
                margin: "2px 10px",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 500,
                textDecoration: "none",
                transition: "all 0.15s",
                background: isActive ? "rgba(125,255,107,0.1)" : "transparent",
                color: isActive ? "#7DFF6B" : "#697565",
                border: isActive ? "1px solid rgba(125,255,107,0.2)" : "1px solid transparent",
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon style={{ fontSize: 18, color: isActive ? "#7DFF6B" : "#697565" }} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
