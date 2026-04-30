import React from "react";
import { MdDescription, MdQrCode } from "react-icons/md";
import { useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showQR, setShowQR] = React.useState(false);

  const isDocDetail = location.pathname.startsWith("/documents/");
  const docId = isDocDetail ? location.pathname.split("/").pop() : null;
  const currentUrl = window.location.href;

  const downloadQR = () => {
    const canvas = document.getElementById("qr-canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `document-qr-${docId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const roleColors = {
    admin: { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
    manager: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
    employee: { color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
  };
  const badge = roleColors[user?.role] || roleColors.employee;

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        background: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        zIndex: 50,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: "#111111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MdDescription style={{ color: "#fff", fontSize: 14 }} />
        </div>
        <span style={{ color: "#111111", fontWeight: 600, fontSize: 15, letterSpacing: "-0.3px" }}>DocTrack</span>
      </div>

      {/* right cluster */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "#6b7280", fontSize: 13, fontWeight: 500 }}>{user?.name || "User"}</span>

        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: badge.color,
            background: badge.bg,
            borderRadius: 9999,
            padding: "3px 10px",
            textTransform: "capitalize",
          }}
        >
          {user?.role || "employee"}
        </span>

        {isDocDetail && (
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowQR(!showQR)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "#374151",
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "5px 12px",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#111111")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
            >
              <MdQrCode style={{ fontSize: 15 }} />
              QR Code
            </button>

            {showQR && (
              <div
                style={{
                  position: "absolute",
                  top: 44,
                  right: 0,
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 20,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  zIndex: 100,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 14,
                  width: 200,
                }}
              >
                <div style={{ background: "#f5f5f5", padding: 10, borderRadius: 8 }}>
                  <QRCodeCanvas
                    id="qr-canvas"
                    value={currentUrl}
                    size={160}
                    level={"H"}
                    includeMargin={false}
                  />
                </div>
                <button
                  onClick={downloadQR}
                  style={{
                    width: "100%",
                    background: "#111111",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 8,
                    padding: "9px 0",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#242424")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#111111")}
                >
                  Download PNG
                </button>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={logout}
          style={{
            color: "#374151",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "5px 14px",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#111111";
            e.currentTarget.style.color = "#111111";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.color = "#374151";
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
