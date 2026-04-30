import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MdInbox, MdUploadFile } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getSocket } from "../services/socket";
import { resetDashboardFilters, setDashboardFilters } from "../store/documentFiltersSlice";
import { DEPARTMENT_OPTIONS } from "../constants/departments";

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const inputStyle = {
  width: "100%",
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: "8px 12px",
  color: "#111111",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  appearance: "none",
  fontFamily: "'Inter', sans-serif",
  transition: "border-color 0.15s",
};

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.documentFilters.dashboard);
  const { user, token } = useAuth();

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);
    if (filters.department && user?.role !== "manager") params.set("department", filters.department);
    return params.toString();
  }, [filters.department, filters.search, filters.status, user?.role]);

  useEffect(() => {
    if (user?.role === "manager") dispatch(resetDashboardFilters());
  }, [dispatch, user?.role]);

  const fetchDocuments = useCallback(
    async (showLoader = true) => {
      if (showLoader) setLoading(true);
      try {
        const endpoint = queryString ? `/documents?${queryString}` : "/documents";
        const response = await api.get(endpoint);
        setDocuments(response.data || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to fetch documents");
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [queryString]
  );

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  useEffect(() => {
    if (!token) return undefined;
    const socket = getSocket(token);
    if (!socket) return undefined;
    const handler = () => fetchDocuments(false);
    socket.on("documents:updated", handler);
    return () => socket.off("documents:updated", handler);
  }, [fetchDocuments, token]);

  const titleMap = { employee: "My Documents", manager: "Pending Reviews", admin: "All Documents" };
  const title = titleMap[user?.role] || "Documents";

  return (
    <div style={{ minHeight: "100%", padding: 28, fontFamily: "'Inter', sans-serif" }}>

      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "#111111", letterSpacing: "-0.3px", marginBottom: 2 }}>
            {title}
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280" }}>
            {documents.length} document{documents.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/upload")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            background: "#111111",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: 14,
            border: "none",
            borderRadius: 8,
            padding: "9px 18px",
            cursor: "pointer",
            transition: "background 0.15s",
            fontFamily: "'Inter', sans-serif",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#242424")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#111111")}
        >
          <MdUploadFile style={{ fontSize: 16 }} />
          Upload Document
        </button>
      </div>

      {/* Filters */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 10 }}>
          <input
            type="text"
            value={filters.search}
            placeholder="Search title / description…"
            onChange={(e) => dispatch(setDashboardFilters({ search: e.target.value }))}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#111111")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
          <select
            value={filters.status}
            onChange={(e) => dispatch(setDashboardFilters({ status: e.target.value }))}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#111111")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          >
            <option value="">All Statuses</option>
            {["Submitted", "Under Review", "Approved", "Rejected"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={filters.department}
            disabled={user?.role === "manager"}
            onChange={(e) => dispatch(setDashboardFilters({ department: e.target.value }))}
            style={{ ...inputStyle, opacity: user?.role === "manager" ? 0.5 : 1 }}
            onFocus={(e) => (e.target.style.borderColor = "#111111")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          >
            <option value="">All Departments</option>
            {DEPARTMENT_OPTIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => dispatch(resetDashboardFilters())}
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              color: "#374151",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "border-color 0.15s, color 0.15s",
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#111111"; e.currentTarget.style.color = "#111111"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#374151"; }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        {loading ? (
          <div style={{ padding: 52, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: 22,
                height: 22,
                border: "2px solid #e5e7eb",
                borderTopColor: "#111111",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }}
            />
          </div>
        ) : documents.length === 0 ? (
          <div style={{ padding: 52, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "#6b7280" }}>
            <MdInbox style={{ fontSize: 36, color: "#d1d5db" }} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>No documents found</span>
            <span style={{ fontSize: 13, color: "#9ca3af" }}>Try adjusting your filters or upload a new document.</span>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#f8f9fa" }}>
                {["Title", "Department", "Status", "Uploaded By", "Date", ""].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 16px",
                      color: "#6b7280",
                      fontSize: 12,
                      fontWeight: 600,
                      textAlign: "left",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, i) => (
                <tr
                  key={doc._id}
                  style={{
                    borderTop: i > 0 ? "1px solid #f3f4f6" : "none",
                    transition: "background 0.1s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f9fa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "13px 16px", color: "#111111", fontSize: 14, fontWeight: 500 }}>{doc.title}</td>
                  <td style={{ padding: "13px 16px", color: "#6b7280", fontSize: 14 }}>{doc.department || "—"}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <StatusBadge status={doc.workflow?.currentStage || doc.status || "Submitted"} />
                  </td>
                  <td style={{ padding: "13px 16px", color: "#6b7280", fontSize: 14 }}>{doc.uploadedBy?.name || "—"}</td>
                  <td style={{ padding: "13px 16px", color: "#9ca3af", fontSize: 13 }}>{formatDate(doc.createdAt)}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <button
                      type="button"
                      onClick={() => navigate(`/documents/${doc._id}`)}
                      style={{
                        color: "#111111",
                        background: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 6,
                        padding: "5px 14px",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "border-color 0.15s",
                        fontFamily: "'Inter', sans-serif",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#111111")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Dashboard;
