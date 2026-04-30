import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  MdCheckCircle,
  MdDescription,
  MdApproval,
  MdManageHistory,
  MdSecurity,
  MdKeyboardArrowRight,
} from "react-icons/md";

/* ─── Tiny canvas for the star-field background ─── */
const StarField = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.2,
      alpha: Math.random(),
      speed: Math.random() * 0.004 + 0.001,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.alpha += s.speed;
        if (s.alpha > 1 || s.alpha < 0) s.speed *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(125,255,107,${s.alpha * 0.6})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
};

/* ─── Mock document-list card ─── */
const recentDocs = [
  { name: "Project Charter v3", dept: "Engineering", status: "Approved" },
  { name: "Q2 Budget Report", dept: "Finance", status: "In Review" },
  { name: "HR Policy Update", dept: "Human Resources", status: "Forwarded" },
  { name: "Vendor Contract 2026", dept: "Procurement", status: "Approved" },
  { name: "Security Audit Log", dept: "IT / Compliance", status: "Pending" },
  { name: "Marketing Brief", dept: "Marketing", status: "Approved" },
];

const statusColor = {
  Approved: "#7DFF6B",
  "In Review": "#facc15",
  Forwarded: "#60a5fa",
  Pending: "#f97316",
};

const DocMockup = () => (
  <div
    style={{
      background: "#181a17",
      borderRadius: 20,
      border: "1px solid rgba(125,255,107,0.18)",
      boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(125,255,107,0.08)",
      overflow: "hidden",
      width: "100%",
      maxWidth: 420,
    }}
  >
    {/* top bar */}
    <div
      style={{
        background: "#111210",
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        borderBottom: "1px solid rgba(125,255,107,0.1)",
      }}
    >
      <MdDescription style={{ color: "#7DFF6B", fontSize: 20 }} />
      <div>
        <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>Document Tracker</div>
        <div style={{ color: "#697565", fontSize: 11 }}>
          {recentDocs.length} documents active
        </div>
      </div>
    </div>

    {/* document rows */}
    <div style={{ padding: "8px 0" }}>
      {recentDocs.map((doc) => (
        <div
          key={doc.name}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 18px",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(125,255,107,0.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "rgba(125,255,107,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <MdDescription style={{ color: "#7DFF6B", fontSize: 16 }} />
            </div>
            <div>
              <div style={{ color: "#e8e8e4", fontSize: 13, fontWeight: 500 }}>{doc.name}</div>
              <div style={{ color: "#697565", fontSize: 11 }}>{doc.dept}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <MdCheckCircle
              style={{ color: statusColor[doc.status] || "#697565", fontSize: 14 }}
            />
            <span style={{ color: statusColor[doc.status] || "#697565", fontSize: 11, fontWeight: 500 }}>
              {doc.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ─── Feature pills ─── */
const features = [
  { icon: MdDescription, label: "Full Lifecycle Tracking" },
  { icon: MdApproval, label: "Multi-Stage Approvals" },
  { icon: MdManageHistory, label: "Audit-Ready History" },
  { icon: MdSecurity, label: "Role-Based Access" },
];

/* ─── Main Landing ─── */
const Landing = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0f0c",
        color: "#e8e8e4",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* animated star canvas */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <StarField />
      </div>

      {/* subtle radial glow */}


      {/* ── NAV ── */}
      <nav
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 40px",
          borderBottom: "1px solid rgba(125,255,107,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "#7DFF6B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MdDescription style={{ color: "#0d0f0c", fontSize: 18 }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>DocTrack</span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#7DFF6B",
              background: "rgba(125,255,107,0.12)",
              border: "1px solid rgba(125,255,107,0.3)",
              borderRadius: 20,
              padding: "2px 8px",
              letterSpacing: "0.05em",
            }}
          >
            v1.0
          </span>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Link
            to="/login"
            style={{
              color: "#a8b5a4",
              textDecoration: "none",
              fontSize: 14,
              padding: "8px 18px",
              borderRadius: 8,
              border: "1px solid rgba(125,255,107,0.2)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#7DFF6B";
              e.currentTarget.style.borderColor = "rgba(125,255,107,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#a8b5a4";
              e.currentTarget.style.borderColor = "rgba(125,255,107,0.2)";
            }}
          >
            Sign In
          </Link>
          <Link
            to="/register"
            style={{
              color: "#0d0f0c",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
              padding: "8px 18px",
              borderRadius: 8,
              background: "#7DFF6B",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#9bffaa")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#7DFF6B")}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 1200,
          margin: "0 auto",
          padding: "60px 40px 80px",
        }}
      >
        {/* badge */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "#7DFF6B",
              background: "rgba(125,255,107,0.1)",
              border: "1px solid rgba(125,255,107,0.25)",
              borderRadius: 20,
              padding: "5px 14px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Document Tracking System &nbsp;·&nbsp; Built for Teams
          </span>
        </div>

        {/* big headline */}
        <h1
          style={{
            textAlign: "center",
            fontSize: "clamp(52px, 9vw, 110px)",
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            color: "#7DFF6B",
            textShadow: "0 0 80px rgba(125,255,107,0.25)",
            marginBottom: 0,
          }}
        >
          Track every
        </h1>
        <h1
          style={{
            textAlign: "center",
            fontSize: "clamp(52px, 9vw, 110px)",
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            color: "#7DFF6B",
            textShadow: "0 0 80px rgba(125,255,107,0.25)",
            marginBottom: 24,
          }}
        >
          document.
        </h1>

        {/* sub taglines */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 60,
          }}
        >
          <p
            style={{
              color: "#7DFF6B",
              fontFamily: "'Courier New', monospace",
              fontSize: "clamp(13px, 1.8vw, 17px)",
              lineHeight: 1.5,
              maxWidth: 280,
            }}
          >
            From your office desk,<br />in a couple of clicks.
          </p>
          <p
            style={{
              color: "#697565",
              fontFamily: "'Courier New', monospace",
              fontSize: "clamp(12px, 1.5vw, 15px)",
              lineHeight: 1.6,
              maxWidth: 300,
              textAlign: "right",
            }}
          >
            A tool for organizations.<br />
            <span style={{ color: "#a8b5a4" }}>Simple. Transparent. Reliable.</span>
          </p>
        </div>

        {/* mockup + pricing row */}
        <div
          style={{
            display: "flex",
            gap: 32,
            alignItems: "flex-start",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {/* document mockup */}
          <div
            style={{
              flex: "1 1 380px",
              maxWidth: 440,
              animation: "floatY 4s ease-in-out infinite",
            }}
          >
            <DocMockup />
          </div>

          {/* right column: pricing + feature pills */}
          <div style={{ flex: "1 1 280px", maxWidth: 340, display: "flex", flexDirection: "column", gap: 24 }}>
            {/* pricing card */}
            <div
              style={{
                background: "#7DFF6B",
                borderRadius: 16,
                padding: "24px 24px 20px",
                color: "#0d0f0c",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: 14,
                  marginBottom: 14,
                  borderBottom: "1px dashed rgba(0,0,0,0.2)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Employee Access</div>
                  <div style={{ fontSize: 11, opacity: 0.65 }}>Full workflow visibility</div>
                </div>
                <span style={{ fontWeight: 800, fontSize: 16 }}>Free</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 18,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Admin / Manager</div>
                  <div style={{ fontSize: 11, opacity: 0.65 }}>Full control, audit logs</div>
                </div>
                <span style={{ fontWeight: 800, fontSize: 16 }}>Org Plan</span>
              </div>
              <Link
                to="/register"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  background: "#0d0f0c",
                  color: "#7DFF6B",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: 14,
                  borderRadius: 10,
                  padding: "11px 0",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#1a1c19")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#0d0f0c")}
              >
                Create Account <MdKeyboardArrowRight style={{ fontSize: 18 }} />
              </Link>
              <p style={{ textAlign: "center", fontSize: 10, opacity: 0.55, marginTop: 10 }}>
                Role is assigned by your organization admin
              </p>
            </div>

            {/* feature pills */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {features.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "rgba(125,255,107,0.06)",
                    border: "1px solid rgba(125,255,107,0.14)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    transition: "background 0.2s, border-color 0.2s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(125,255,107,0.12)";
                    e.currentTarget.style.borderColor = "rgba(125,255,107,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(125,255,107,0.06)";
                    e.currentTarget.style.borderColor = "rgba(125,255,107,0.14)";
                  }}
                >
                  <Icon style={{ color: "#7DFF6B", fontSize: 20, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#c8d4c4", fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* keyframes */}
      <style>{`
        @keyframes floatY {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
};

export default Landing;
