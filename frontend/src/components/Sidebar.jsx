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
        width: 220,
        background: "#ffffff",
        borderRight: "1px solid #e5e7eb",
        paddingTop: 16,
        fontFamily: "'Inter', sans-serif",
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
                padding: "9px 14px",
                margin: "2px 10px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                textDecoration: "none",
                transition: "background 0.15s, color 0.15s",
                background: isActive ? "#f5f5f5" : "transparent",
                color: isActive ? "#111111" : "#6b7280",
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon style={{ fontSize: 18, color: isActive ? "#111111" : "#6b7280", flexShrink: 0 }} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
      </nav>

      {/* Bottom divider */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: "1px solid #e5e7eb",
          padding: "14px 20px",
        }}
      >
        <div style={{ fontSize: 11, color: "#898989", letterSpacing: "0.02em" }}>DocTrack v1.0</div>
      </div>
    </aside>
  );
};

export default Sidebar;
