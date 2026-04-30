import React from "react";

const statusStyles = {
  Submitted: { color: "#a8b5a4", bg: "rgba(105,117,101,0.18)", border: "rgba(105,117,101,0.35)" },
  "Under Review": { color: "#facc15", bg: "rgba(250,204,21,0.1)", border: "rgba(250,204,21,0.3)" },
  Approved: { color: "#7DFF6B", bg: "rgba(125,255,107,0.1)", border: "rgba(125,255,107,0.3)" },
  Rejected: { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.3)" },
  Forwarded: { color: "#60a5fa", bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.3)" },
};

const StatusBadge = ({ status }) => {
  const s = statusStyles[status] || statusStyles.Submitted;
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 600,
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 20,
        padding: "3px 10px",
        whiteSpace: "nowrap",
      }}
    >
      {status || "Submitted"}
    </span>
  );
};

export default StatusBadge;
