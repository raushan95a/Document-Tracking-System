import React from "react";

const statusStyles = {
  Submitted: { color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
  "Under Review": { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  Approved: { color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  Rejected: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  Forwarded: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
};

const StatusBadge = ({ status }) => {
  const s = statusStyles[status] || statusStyles.Submitted;
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 12,
        fontWeight: 600,
        color: s.color,
        background: s.bg,
        borderRadius: 9999,
        padding: "3px 10px",
        whiteSpace: "nowrap",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {status || "Submitted"}
    </span>
  );
};

export default StatusBadge;
