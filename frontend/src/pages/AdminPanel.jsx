import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getSocket } from "../services/socket";
import { resetAdminFilters, setAdminFilters } from "../store/documentFiltersSlice";
import { DEPARTMENT_OPTIONS } from "../constants/departments";

const formatDate = (s) =>
  new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const inp = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: "7px 10px",
  color: "#111111",
  fontSize: 13,
  outline: "none",
  appearance: "none",
  boxSizing: "border-box",
  width: "100%",
  fontFamily: "'Inter', sans-serif",
  transition: "border-color 0.15s",
};

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("documents");
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [userEdits, setUserEdits] = useState({});
  const [savingUserId, setSavingUserId] = useState("");
  const [deletingUserId, setDeletingUserId] = useState("");
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const dispatch = useDispatch();
  const filters = useSelector((s) => s.documentFilters.admin);
  const { token } = useAuth();
  const navigate = useNavigate();

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (filters.search) p.set("search", filters.search);
    if (filters.status) p.set("status", filters.status);
    if (filters.department) p.set("department", filters.department);
    return p.toString();
  }, [filters.department, filters.search, filters.status]);

  const fetchDocuments = useCallback(async (showLoader = true) => {
    if (showLoader) setLoadingDocuments(true);
    try {
      const res = await api.get(queryString ? `/documents?${queryString}` : "/documents");
      setDocuments(res.data || []);
    } catch (err) { toast.error(err?.response?.data?.message || "Failed to fetch documents"); }
    finally { if (showLoader) setLoadingDocuments(false); }
  }, [queryString]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get("/users");
      const data = res.data || [];
      setUsers(data);
      setUserEdits(data.reduce((a, u) => { a[u._id] = { role: u.role, department: u.department || "" }; return a; }, {}));
    } catch (err) { toast.error(err?.response?.data?.message || "Failed to fetch users"); }
    finally { setLoadingUsers(false); }
  };

  useEffect(() => { if (activeTab === "documents") fetchDocuments(); else fetchUsers(); }, [activeTab, fetchDocuments]);

  useEffect(() => {
    if (!token || activeTab !== "documents") return undefined;
    const socket = getSocket(token);
    if (!socket) return undefined;
    const h = () => fetchDocuments(false);
    socket.on("documents:updated", h);
    return () => socket.off("documents:updated", h);
  }, [activeTab, fetchDocuments, token]);

  const handleUserFieldChange = (uid, key, val) =>
    setUserEdits((p) => ({ ...p, [uid]: { ...(p[uid] || {}), [key]: val } }));

  const handleSaveUser = async (uid) => {
    const payload = userEdits[uid]; if (!payload) return;
    setSavingUserId(uid);
    try {
      await api.put(`/users/${uid}`, { role: payload.role, department: payload.department });
      toast.success("User updated");
      await fetchUsers();
    } catch (err) { toast.error(err?.response?.data?.message || "Failed to update user"); }
    finally { setSavingUserId(""); }
  };

  const handleDeleteUser = async (uid) => {
    setDeletingUserId(uid);
    try {
      await api.delete(`/users/${uid}`);
      toast.success("User deleted");
      await fetchUsers();
    } catch (err) { toast.error(err?.response?.data?.message || "Failed to delete user"); }
    finally { setDeletingUserId(""); }
  };

  const spinner = (
    <div style={{ padding: 52, display: "flex", justifyContent: "center" }}>
      <div style={{ width: 22, height: 22, border: "2px solid #e5e7eb", borderTopColor: "#111111", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    </div>
  );

  const thStyle = {
    padding: "10px 14px",
    color: "#6b7280",
    fontSize: 12,
    fontWeight: 600,
    textAlign: "left",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const tdStyle = { padding: "12px 14px", color: "#6b7280", fontSize: 14 };

  return (
    <div style={{ minHeight: "100%", padding: 28, fontFamily: "'Inter', sans-serif" }}>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#111111", letterSpacing: "-0.3px", marginBottom: 4 }}>
          Admin Panel
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280" }}>Manage documents and user accounts.</p>
      </div>

      {/* Tabs — nav-pill-group style */}
      <div
        style={{
          display: "inline-flex",
          background: "#f5f5f5",
          borderRadius: 9999,
          padding: 4,
          marginBottom: 24,
          gap: 2,
        }}
      >
        {["documents", "users"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? "#ffffff" : "transparent",
              color: activeTab === tab ? "#111111" : "#6b7280",
              border: "none",
              borderRadius: 9999,
              padding: "7px 18px",
              fontSize: 14,
              fontWeight: activeTab === tab ? 600 : 500,
              cursor: "pointer",
              transition: "all 0.15s",
              boxShadow: activeTab === tab ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "documents" ? (
        <>
          {/* Filters */}
          <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, marginBottom: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 10 }}>
              <input
                type="text"
                value={filters.search}
                placeholder="Search title / description…"
                onChange={(e) => dispatch(setAdminFilters({ search: e.target.value }))}
                style={inp}
                onFocus={(e) => (e.target.style.borderColor = "#111111")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
              <select
                value={filters.status}
                onChange={(e) => dispatch(setAdminFilters({ status: e.target.value }))}
                style={inp}
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
                onChange={(e) => dispatch(setAdminFilters({ department: e.target.value }))}
                style={inp}
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
                onClick={() => dispatch(resetAdminFilters())}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  color: "#374151",
                  borderRadius: 8,
                  padding: "7px 16px",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#111111")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Documents table */}
          <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
            {loadingDocuments ? spinner : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#f8f9fa" }}>
                    {["Title", "Department", "Status", "Uploaded By", "Date", ""].map((h) => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc, i) => (
                    <tr
                      key={doc._id}
                      style={{ borderTop: i > 0 ? "1px solid #f3f4f6" : "none", transition: "background 0.1s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f9fa")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ ...tdStyle, color: "#111111", fontWeight: 500 }}>{doc.title}</td>
                      <td style={tdStyle}>{doc.department || "—"}</td>
                      <td style={tdStyle}><StatusBadge status={doc.workflow?.currentStage || doc.status || "Submitted"} /></td>
                      <td style={tdStyle}>{doc.uploadedBy?.name || "—"}</td>
                      <td style={{ ...tdStyle, color: "#9ca3af", fontSize: 13 }}>{formatDate(doc.createdAt)}</td>
                      <td style={tdStyle}>
                        <button
                          type="button"
                          onClick={() => navigate(`/documents/${doc._id}`)}
                          style={{
                            color: "#111111",
                            background: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: 6,
                            padding: "4px 14px",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "'Inter', sans-serif",
                            transition: "border-color 0.15s",
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
        </>
      ) : (
        /* Users table */
        <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          {loadingUsers ? spinner : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#f8f9fa" }}>
                  {["Name", "Username", "Email", "Role", "Department", "Actions"].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((item, i) => (
                  <tr
                    key={item._id}
                    style={{ borderTop: i > 0 ? "1px solid #f3f4f6" : "none", transition: "background 0.1s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f9fa")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ ...tdStyle, color: "#111111", fontWeight: 500 }}>{item.name}</td>
                    <td style={tdStyle}>{item.username}</td>
                    <td style={tdStyle}>{item.email}</td>
                    <td style={tdStyle}>
                      <select
                        value={userEdits[item._id]?.role || item.role}
                        onChange={(e) => handleUserFieldChange(item._id, "role", e.target.value)}
                        style={{ ...inp, width: "auto" }}
                        onFocus={(e) => (e.target.style.borderColor = "#111111")}
                        onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                      >
                        {["employee", "manager", "admin"].map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td style={tdStyle}>
                      <select
                        value={userEdits[item._id]?.department || ""}
                        onChange={(e) => handleUserFieldChange(item._id, "department", e.target.value)}
                        style={inp}
                        onFocus={(e) => (e.target.style.borderColor = "#111111")}
                        onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                      >
                        <option value="">Select…</option>
                        {DEPARTMENT_OPTIONS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => handleSaveUser(item._id)}
                          disabled={savingUserId === item._id}
                          style={{
                            background: "#111111",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: 6,
                            padding: "5px 14px",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "'Inter', sans-serif",
                            opacity: savingUserId === item._id ? 0.6 : 1,
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => { if (savingUserId !== item._id) e.currentTarget.style.background = "#242424"; }}
                          onMouseLeave={(e) => { if (savingUserId !== item._id) e.currentTarget.style.background = "#111111"; }}
                        >
                          {savingUserId === item._id ? "…" : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(item._id)}
                          disabled={deletingUserId === item._id}
                          style={{
                            background: "#ffffff",
                            color: "#ef4444",
                            border: "1px solid #fecaca",
                            borderRadius: 6,
                            padding: "5px 14px",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "'Inter', sans-serif",
                            opacity: deletingUserId === item._id ? 0.6 : 1,
                            transition: "border-color 0.15s",
                          }}
                          onMouseEnter={(e) => { if (deletingUserId !== item._id) e.currentTarget.style.borderColor = "#ef4444"; }}
                          onMouseLeave={(e) => { if (deletingUserId !== item._id) e.currentTarget.style.borderColor = "#fecaca"; }}
                        >
                          {deletingUserId === item._id ? "…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AdminPanel;
