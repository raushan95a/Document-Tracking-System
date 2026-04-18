import React from "react";

const statusClasses = {
  Submitted: "bg-[#697565]/20 text-[#697565] border border-[#697565]/40",
  "Under Review": "bg-yellow-100 text-yellow-800 border border-yellow-300",
  Approved: "bg-green-100 text-green-800 border border-green-300",
  Rejected: "bg-red-100 text-red-800 border border-red-300",
};

const StatusBadge = ({ status }) => {
  const className = statusClasses[status] || statusClasses.Submitted;

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium inline-block ${className}`}>
      {status || "Submitted"}
    </span>
  );
};

export default StatusBadge;
