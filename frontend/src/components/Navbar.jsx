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

        {isDocDetail && (
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowQR(!showQR)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "#7DFF6B",
                background: "rgba(125,255,107,0.1)",
                border: "1px solid rgba(125,255,107,0.3)",
                borderRadius: 7,
                padding: "5px 12px",
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(125,255,107,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(125,255,107,0.1)";
              }}
            >
              <MdQrCode style={{ fontSize: 16 }} />
              QR Code
            </button>

            {showQR && (
              <div
                style={{
                  position: "absolute",
                  top: 45,
                  right: 0,
                  background: "#111210",
                  border: "1px solid rgba(125,255,107,0.2)",
                  borderRadius: 12,
                  padding: 20,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                  zIndex: 100,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 15,
                  width: 200,
                }}
              >
                <div style={{ background: "white", padding: 10, borderRadius: 8 }}>
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
                    background: "#7DFF6B",
                    color: "#0d0f0c",
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 0",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
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
