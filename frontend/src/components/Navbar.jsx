import React from "react";
import { MdDescription } from "react-icons/md";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  const roleColor = {
    admin: { bg: "rgba(125,255,107,0.15)", color: "#7DFF6B", border: "rgba(125,255,107,0.3)" },
    manager: { bg: "rgba(96,165,250,0.12)", color: "#60a5fa", border: "rgba(96,165,250,0.3)" },
    employee: { bg: "rgba(105,117,101,0.2)", color: "#a8b5a4", border: "rgba(105,117,101,0.35)" },
  };
  const badge = roleColor[user?.role] || roleColor.employee;

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        background: "#111210",
        borderBottom: "1px solid rgba(125,255,107,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: "#7DFF6B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MdDescription style={{ color: "#0d0f0c", fontSize: 16 }} />
        </div>
        <span style={{ color: "#e8e8e4", fontWeight: 700, fontSize: 15 }}>DocTrack</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ color: "#a8b5a4", fontSize: 13 }}>{user?.name || "User"}</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: badge.color,
            background: badge.bg,
            border: `1px solid ${badge.border}`,
            borderRadius: 20,
            padding: "2px 10px",
            textTransform: "capitalize",
          }}
        >
          {user?.role || "employee"}
        </span>
        <button
          type="button"
          onClick={logout}
          style={{
            color: "#a8b5a4",
            background: "transparent",
            border: "1px solid rgba(125,255,107,0.2)",
            borderRadius: 7,
            padding: "5px 14px",
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#e8e8e4";
            e.currentTarget.style.borderColor = "rgba(125,255,107,0.45)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#a8b5a4";
            e.currentTarget.style.borderColor = "rgba(125,255,107,0.2)";
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
