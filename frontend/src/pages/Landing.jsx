import React from "react";
import { Link } from "react-router-dom";
import {
  MdCheckCircle,
  MdDescription,
  MdApproval,
  MdManageHistory,
  MdSecurity,
  MdArrowForward,
} from "react-icons/md";

/* ─── Mock document-list card (product UI fragment) ─── */
const recentDocs = [
  { name: "Project Charter v3", dept: "Engineering", status: "Approved" },
  { name: "Q2 Budget Report", dept: "Finance", status: "In Review" },
  { name: "HR Policy Update", dept: "Human Resources", status: "Forwarded" },
  { name: "Vendor Contract 2026", dept: "Procurement", status: "Approved" },
  { name: "Security Audit Log", dept: "IT / Compliance", status: "Pending" },
];

const statusConfig = {
  Approved: { color: "#10b981", bg: "rgba(16,185,129,0.1)", label: "Approved" },
  "In Review": { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "In Review" },
  Forwarded: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)", label: "Forwarded" },
  Pending: { color: "#6b7280", bg: "rgba(107,114,128,0.1)", label: "Pending" },
};

const DocMockup = () => (
  <div
    style={{
      background: "#ffffff",
      borderRadius: 16,
      border: "1px solid #e5e7eb",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      overflow: "hidden",
      width: "100%",
      animation: "floatY 5s ease-in-out infinite",
    }}
  >
    {/* mockup top bar */}
    <div
      style={{
        background: "#f5f5f5",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: "#111111",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <MdDescription style={{ color: "#fff", fontSize: 16 }} />
      </div>
      <div>
        <div style={{ color: "#111111", fontSize: 13, fontWeight: 600 }}>Document Tracker</div>
        <div style={{ color: "#6b7280", fontSize: 11 }}>{recentDocs.length} active documents</div>
      </div>
    </div>

    {/* column headers */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        padding: "8px 20px",
        borderBottom: "1px solid #f3f4f6",
      }}
    >
      <span style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>Document</span>
      <span style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</span>
    </div>

    {/* document rows */}
    <div>
      {recentDocs.map((doc) => {
        const st = statusConfig[doc.status] || statusConfig.Pending;
        return (
          <div
            key={doc.name}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "11px 20px",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <MdDescription style={{ color: "#6b7280", fontSize: 15 }} />
              </div>
              <div>
                <div style={{ color: "#111111", fontSize: 13, fontWeight: 500 }}>{doc.name}</div>
                <div style={{ color: "#6b7280", fontSize: 11 }}>{doc.dept}</div>
              </div>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: st.color,
                background: st.bg,
                borderRadius: 9999,
                padding: "3px 10px",
              }}
            >
              {st.label}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

/* ─── Feature cards data ─── */
const features = [
  {
    icon: MdDescription,
    title: "Full Lifecycle Tracking",
    desc: "Monitor every document from submission to final approval with complete visibility at every step.",
  },
  {
    icon: MdApproval,
    title: "Multi-Stage Approvals",
    desc: "Route documents through managers and reviewers with automated notifications at each stage.",
  },
  {
    icon: MdManageHistory,
    title: "Audit-Ready History",
    desc: "Every action is logged with timestamps and user attribution for compliance and accountability.",
  },
  {
    icon: MdSecurity,
    title: "Role-Based Access",
    desc: "Fine-grained permissions ensure employees, managers, and admins only see what they need.",
  },
];

/* ─── Landing ─── */
const Landing = () => {
  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "#374151", fontFamily: "'Inter', sans-serif" }}>

      {/* ── TOP NAV ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
        }}
      >
        {/* wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "#111111",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MdDescription style={{ color: "#fff", fontSize: 16 }} />
          </div>
          <span style={{ fontWeight: 600, fontSize: 16, color: "#111111", letterSpacing: "-0.3px" }}>DocTrack</span>
        </div>

        {/* nav actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            to="/login"
            style={{
              color: "#374151",
              fontSize: 14,
              fontWeight: 500,
              padding: "8px 14px",
              borderRadius: 8,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#111111")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#374151")}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            style={{
              color: "#ffffff",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
              padding: "8px 20px",
              borderRadius: 8,
              background: "#111111",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#242424")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#111111")}
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "96px 40px",
          display: "grid",
          gridTemplateColumns: "7fr 5fr",
          gap: 48,
          alignItems: "center",
        }}
      >
        {/* left: headline + CTA */}
        <div>
          {/* badge */}
          <span
            style={{
              display: "inline-block",
              fontSize: 13,
              fontWeight: 500,
              color: "#111111",
              background: "#f5f5f5",
              borderRadius: 9999,
              padding: "4px 14px",
              marginBottom: 28,
            }}
          >
            Document Tracking System · Built for Teams
          </span>

          <h1
            style={{
              fontSize: "clamp(40px, 5.5vw, 64px)",
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "-2px",
              color: "#111111",
              marginBottom: 24,
            }}
          >
            The smarter way to track every document.
          </h1>

          <p
            style={{
              fontSize: 18,
              lineHeight: 1.6,
              color: "#374151",
              maxWidth: 480,
              marginBottom: 40,
            }}
          >
            From submission to final approval — DocTrack gives your organization complete visibility,
            accountability, and control over every document in flight.
          </p>

          {/* feature pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 40 }}>
            {["Full lifecycle tracking", "Multi-stage approvals", "Audit-ready history", "Role-based access"].map((f) => (
              <span
                key={f}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#374151",
                  background: "#f5f5f5",
                  borderRadius: 9999,
                  padding: "6px 14px",
                }}
              >
                <MdCheckCircle style={{ color: "#10b981", fontSize: 14 }} />
                {f}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12 }}>
            <Link
              to="/register"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "#ffffff",
                background: "#111111",
                fontSize: 14,
                fontWeight: 600,
                padding: "12px 24px",
                borderRadius: 8,
                textDecoration: "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#242424")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#111111")}
            >
              Get started free <MdArrowForward />
            </Link>
            <Link
              to="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                color: "#111111",
                background: "#ffffff",
                fontSize: 14,
                fontWeight: 600,
                padding: "12px 24px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                textDecoration: "none",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#111111")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* right: product mockup card */}
        <div style={{ width: "100%" }}>
          <DocMockup />
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section style={{ background: "#f8f9fa", padding: "96px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                fontWeight: 600,
                lineHeight: 1.1,
                letterSpacing: "-1.5px",
                color: "#111111",
                marginBottom: 16,
              }}
            >
              Everything your team needs
            </h2>
            <p style={{ fontSize: 16, color: "#6b7280", maxWidth: 480, margin: "0 auto" }}>
              A purpose-built platform for document workflows — simple enough for any team, powerful enough for enterprise compliance.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 24,
            }}
          >
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                style={{
                  background: "#f5f5f5",
                  borderRadius: 12,
                  padding: 32,
                  transition: "box-shadow 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "#111111",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <Icon style={{ color: "#fff", fontSize: 20 }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: "#111111", marginBottom: 10, letterSpacing: "-0.3px" }}>
                  {title}
                </h3>
                <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "96px 40px", background: "#ffffff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                fontWeight: 600,
                lineHeight: 1.1,
                letterSpacing: "-1.5px",
                color: "#111111",
                marginBottom: 16,
              }}
            >
              Works in three simple steps
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {[
              { step: "01", title: "Upload", desc: "Upload documents with a title, description, and department. Files go straight into your organization's queue." },
              { step: "02", title: "Review & Route", desc: "Managers receive notifications and review documents. Approve, forward, or request changes — all with full context." },
              { step: "03", title: "Track & Audit", desc: "Every action is logged. Employees always know where their document stands. Admins get a bird's-eye view." },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 32, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#6b7280", letterSpacing: "0.06em", marginBottom: 16 }}>STEP {step}</div>
                <h3 style={{ fontSize: 22, fontWeight: 600, color: "#111111", marginBottom: 12, letterSpacing: "-0.3px" }}>{title}</h3>
                <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ACCESS TIERS ── */}
      <section style={{ padding: "96px 40px", background: "#f5f5f5" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                fontWeight: 600,
                lineHeight: 1.1,
                letterSpacing: "-1.5px",
                color: "#111111",
                marginBottom: 16,
              }}
            >
              Access levels for every role
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
            {[
              {
                name: "Employee",
                desc: "Upload documents and track their status through the approval pipeline.",
                features: ["Upload documents", "Track document status", "View document history", "AI-powered assistant"],
                featured: false,
              },
              {
                name: "Manager",
                desc: "Review, approve, forward or reject documents from your department queue.",
                features: ["All Employee features", "Review document queue", "Approve & forward docs", "Email notifications"],
                featured: true,
              },
              {
                name: "Admin",
                desc: "Full organizational oversight, user management, and audit controls.",
                features: ["All Manager features", "Manage all users", "Access all documents", "Audit logs & reports"],
                featured: false,
              },
            ].map(({ name, desc, features: tierFeatures, featured }) => (
              <div
                key={name}
                style={{
                  background: featured ? "#101010" : "#ffffff",
                  borderRadius: 12,
                  padding: 32,
                  border: featured ? "none" : "1px solid #e5e7eb",
                  boxShadow: featured ? "0 4px 12px rgba(0,0,0,0.12)" : "0 1px 2px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 600, color: featured ? "#ffffff" : "#111111", letterSpacing: "-0.3px", marginBottom: 10 }}>{name}</div>
                <p style={{ fontSize: 14, color: featured ? "#a1a1aa" : "#6b7280", lineHeight: 1.6, marginBottom: 24 }}>{desc}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                  {tierFeatures.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <MdCheckCircle style={{ color: featured ? "#34d399" : "#10b981", fontSize: 16, flexShrink: 0 }} />
                      <span style={{ fontSize: 14, color: featured ? "#a1a1aa" : "#374151" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link
                  to="/register"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    padding: "11px 0",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: "none",
                    background: featured ? "#ffffff" : "#111111",
                    color: featured ? "#111111" : "#ffffff",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section style={{ padding: "96px 40px", background: "#ffffff" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              background: "#f5f5f5",
              borderRadius: 12,
              padding: 48,
            }}
          >
            <h2
              style={{
                fontSize: "clamp(24px, 3vw, 36px)",
                fontWeight: 600,
                lineHeight: 1.15,
                letterSpacing: "-1px",
                color: "#111111",
                marginBottom: 14,
              }}
            >
              Ready to streamline your document workflows?
            </h2>
            <p style={{ fontSize: 16, color: "#6b7280", marginBottom: 28 }}>
              Join your team on DocTrack today. No credit card required.
            </p>
            <Link
              to="/register"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "#ffffff",
                background: "#111111",
                fontSize: 14,
                fontWeight: 600,
                padding: "12px 28px",
                borderRadius: 8,
                textDecoration: "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#242424")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#111111")}
            >
              Create free account <MdArrowForward />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          background: "#101010",
          padding: "64px 40px",
          color: "#a1a1aa",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 32, marginBottom: 48 }}>
            {/* brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MdDescription style={{ color: "#111111", fontSize: 15 }} />
                </div>
                <span style={{ fontWeight: 600, fontSize: 15, color: "#ffffff", letterSpacing: "-0.3px" }}>DocTrack</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "#a1a1aa", maxWidth: 200 }}>
                Document tracking made simple for modern teams.
              </p>
            </div>

            {/* product */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", marginBottom: 14 }}>Product</div>
              {["Dashboard", "Upload Document", "Document History"].map((l) => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <Link to="/dashboard" style={{ fontSize: 14, color: "#a1a1aa", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#a1a1aa")}
                  >{l}</Link>
                </div>
              ))}
            </div>

            {/* access */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", marginBottom: 14 }}>Access</div>
              {["Employee Portal", "Manager Review", "Admin Panel"].map((l) => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 14, color: "#a1a1aa" }}>{l}</span>
                </div>
              ))}
            </div>

            {/* company */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", marginBottom: 14 }}>Account</div>
              {[{ label: "Sign in", to: "/login" }, { label: "Register", to: "/register" }].map(({ label, to }) => (
                <div key={label} style={{ marginBottom: 10 }}>
                  <Link to={to} style={{ fontSize: 14, color: "#a1a1aa", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#a1a1aa")}
                  >{label}</Link>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontSize: 13, color: "#898989" }}>© 2026 DocTrack. All rights reserved.</span>
            <span style={{ fontSize: 13, color: "#898989" }}>Built for organizations that value clarity.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
