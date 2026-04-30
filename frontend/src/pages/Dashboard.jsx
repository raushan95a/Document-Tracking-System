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
  background: "#181a17",
  border: "1px solid rgba(125,255,107,0.15)",
  borderRadius: 8,
  padding: "8px 12px",
  color: "#e8e8e4",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  appearance: "none",
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
    <div style={{ minHeight: "100%", padding: 24 }}>
      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ color: "#e8e8e4", fontSize: 20, fontWeight: 700 }}>{title}</h1>
        <button
          type="button"
          onClick={() => navigate("/upload")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#7DFF6B",
            color: "#0d0f0c",
            fontWeight: 700,
            fontSize: 13,
            border: "none",
            borderRadius: 8,
            padding: "8px 16px",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#9bffaa")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#7DFF6B")}
        >
          <MdUploadFile style={{ fontSize: 16 }} />
          Upload Document
        </button>
      </div>

      {/* filters */}
      <div
        style={{
          background: "#111210",
          border: "1px solid rgba(125,255,107,0.1)",
          borderRadius: 10,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 10 }}>
          <input
            type="text"
            value={filters.search}
            placeholder="Search title / description…"
            onChange={(e) => dispatch(setDashboardFilters({ search: e.target.value }))}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "rgba(125,255,107,0.4)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(125,255,107,0.15)")}
          />
          <select
            value={filters.status}
            onChange={(e) => dispatch(setDashboardFilters({ status: e.target.value }))}
            style={inputStyle}
          >
            <option value="" style={{ background: "#181a17" }}>All Statuses</option>
            {["Submitted", "Under Review", "Approved", "Rejected"].map((s) => (
              <option key={s} value={s} style={{ background: "#181a17" }}>{s}</option>
            ))}
          </select>
          <select
            value={filters.department}
            disabled={user?.role === "manager"}
            onChange={(e) => dispatch(setDashboardFilters({ department: e.target.value }))}
            style={{ ...inputStyle, opacity: user?.role === "manager" ? 0.5 : 1 }}
          >
            <option value="" style={{ background: "#181a17" }}>All Departments</option>
            {DEPARTMENT_OPTIONS.map((d) => (
              <option key={d} value={d} style={{ background: "#181a17" }}>{d}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => dispatch(resetDashboardFilters())}
            style={{
              background: "transparent",
              border: "1px solid rgba(125,255,107,0.2)",
              color: "#7DFF6B",
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(125,255,107,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Clear
          </button>
        </div>
      </div>

      {/* table */}
      <div
        style={{
          background: "#111210",
          border: "1px solid rgba(125,255,107,0.1)",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ padding: 48, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: 22,
                height: 22,
                border: "2px solid rgba(125,255,107,0.2)",
                borderTopColor: "#7DFF6B",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }}
            />
          </div>
        ) : documents.length === 0 ? (
          <div style={{ padding: 52, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "#697565" }}>
            <MdInbox style={{ fontSize: 36 }} />
            <span style={{ fontSize: 14 }}>No documents found</span>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(125,255,107,0.1)" }}>
                {["Title", "Department", "Status", "Uploaded By", "Date", ""].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      color: "#697565",
                      fontSize: 11,
                      fontWeight: 700,
                      textAlign: "left",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
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
                    borderTop: i > 0 ? "1px solid rgba(125,255,107,0.06)" : "none",
                    transition: "background 0.15s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(125,255,107,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "12px 16px", color: "#e8e8e4", fontSize: 13 }}>{doc.title}</td>
                  <td style={{ padding: "12px 16px", color: "#a8b5a4", fontSize: 13 }}>{doc.department || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <StatusBadge status={doc.workflow?.currentStage || doc.status || "Submitted"} />
                  </td>
                  <td style={{ padding: "12px 16px", color: "#a8b5a4", fontSize: 13 }}>{doc.uploadedBy?.name || "—"}</td>
                  <td style={{ padding: "12px 16px", color: "#697565", fontSize: 12 }}>{formatDate(doc.createdAt)}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      type="button"
                      onClick={() => navigate(`/documents/${doc._id}`)}
                      style={{
                        color: "#7DFF6B",
                        background: "transparent",
                        border: "1px solid rgba(125,255,107,0.25)",
                        borderRadius: 6,
                        padding: "4px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(125,255,107,0.08)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
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
