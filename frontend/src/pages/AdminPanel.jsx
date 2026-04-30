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

const formatDate = (s) => new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const inp = {
  background: "#181a17", border: "1px solid rgba(125,255,107,0.15)",
  borderRadius: 7, padding: "7px 10px", color: "#e8e8e4", fontSize: 12,
  outline: "none", appearance: "none", boxSizing: "border-box", width: "100%",
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
    try { await api.put(`/users/${uid}`, { role: payload.role, department: payload.department }); toast.success("User updated"); await fetchUsers(); }
    catch (err) { toast.error(err?.response?.data?.message || "Failed to update user"); }
    finally { setSavingUserId(""); }
  };

  const handleDeleteUser = async (uid) => {
    setDeletingUserId(uid);
    try { await api.delete(`/users/${uid}`); toast.success("User deleted"); await fetchUsers(); }
    catch (err) { toast.error(err?.response?.data?.message || "Failed to delete user"); }
    finally { setDeletingUserId(""); }
  };

  const spinner = (
    <div style={{ padding: 48, display: "flex", justifyContent: "center" }}>
      <div style={{ width: 22, height: 22, border: "2px solid rgba(125,255,107,0.2)", borderTopColor: "#7DFF6B", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    </div>
  );

  const thStyle = { padding: "11px 14px", color: "#697565", fontSize: 11, fontWeight: 700, textAlign: "left", textTransform: "uppercase", letterSpacing: "0.06em" };
  const tdStyle = { padding: "11px 14px", color: "#a8b5a4", fontSize: 13 };

  return (
    <div style={{ minHeight: "100%", padding: 24 }}>
      <h1 style={{ color: "#e8e8e4", fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Admin Panel</h1>

      {/* tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid rgba(125,255,107,0.1)", paddingBottom: 0 }}>
        {["documents", "users"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? "rgba(125,255,107,0.1)" : "transparent",
              color: activeTab === tab ? "#7DFF6B" : "#697565",
              border: "none",
              borderBottom: activeTab === tab ? "2px solid #7DFF6B" : "2px solid transparent",
              padding: "9px 20px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              textTransform: "capitalize",
              transition: "all 0.15s",
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "documents" ? (
        <>
          {/* filters */}
          <div style={{ background: "#111210", border: "1px solid rgba(125,255,107,0.1)", borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 10 }}>
              <input type="text" value={filters.search} placeholder="Search title / description…" onChange={(e) => dispatch(setAdminFilters({ search: e.target.value }))} style={inp} onFocus={(e) => (e.target.style.borderColor = "rgba(125,255,107,0.4)")} onBlur={(e) => (e.target.style.borderColor = "rgba(125,255,107,0.15)")} />
              <select value={filters.status} onChange={(e) => dispatch(setAdminFilters({ status: e.target.value }))} style={inp}>
                <option value="" style={{ background: "#181a17" }}>All Statuses</option>
                {["Submitted", "Under Review", "Approved", "Rejected"].map((s) => <option key={s} value={s} style={{ background: "#181a17" }}>{s}</option>)}
              </select>
              <select value={filters.department} onChange={(e) => dispatch(setAdminFilters({ department: e.target.value }))} style={inp}>
                <option value="" style={{ background: "#181a17" }}>All Departments</option>
                {DEPARTMENT_OPTIONS.map((d) => <option key={d} value={d} style={{ background: "#181a17" }}>{d}</option>)}
              </select>
              <button type="button" onClick={() => dispatch(resetAdminFilters())} style={{ background: "transparent", border: "1px solid rgba(125,255,107,0.2)", color: "#7DFF6B", borderRadius: 7, padding: "7px 14px", fontSize: 12, cursor: "pointer" }}>Clear</button>
            </div>
          </div>

          {/* documents table */}
          <div style={{ background: "#111210", border: "1px solid rgba(125,255,107,0.1)", borderRadius: 10, overflow: "hidden" }}>
            {loadingDocuments ? spinner : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ borderBottom: "1px solid rgba(125,255,107,0.1)" }}>
                  {["Title", "Department", "Status", "Uploaded By", "Date", ""].map((h) => <th key={h} style={thStyle}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {documents.map((doc, i) => (
                    <tr key={doc._id} style={{ borderTop: i > 0 ? "1px solid rgba(125,255,107,0.06)" : "none", transition: "background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(125,255,107,0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ ...tdStyle, color: "#e8e8e4" }}>{doc.title}</td>
                      <td style={tdStyle}>{doc.department || "—"}</td>
                      <td style={tdStyle}><StatusBadge status={doc.workflow?.currentStage || doc.status || "Submitted"} /></td>
                      <td style={tdStyle}>{doc.uploadedBy?.name || "—"}</td>
                      <td style={{ ...tdStyle, color: "#697565", fontSize: 12 }}>{formatDate(doc.createdAt)}</td>
                      <td style={tdStyle}>
                        <button type="button" onClick={() => navigate(`/documents/${doc._id}`)} style={{ color: "#7DFF6B", background: "transparent", border: "1px solid rgba(125,255,107,0.25)", borderRadius: 6, padding: "3px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <div style={{ background: "#111210", border: "1px solid rgba(125,255,107,0.1)", borderRadius: 10, overflow: "hidden" }}>
          {loadingUsers ? spinner : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ borderBottom: "1px solid rgba(125,255,107,0.1)" }}>
                {["Name", "Username", "Email", "Role", "Department", "Actions"].map((h) => <th key={h} style={thStyle}>{h}</th>)}
              </tr></thead>
              <tbody>
                {users.map((item, i) => (
                  <tr key={item._id} style={{ borderTop: i > 0 ? "1px solid rgba(125,255,107,0.06)" : "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(125,255,107,0.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ ...tdStyle, color: "#e8e8e4" }}>{item.name}</td>
                    <td style={tdStyle}>{item.username}</td>
                    <td style={tdStyle}>{item.email}</td>
                    <td style={tdStyle}>
                      <select value={userEdits[item._id]?.role || item.role} onChange={(e) => handleUserFieldChange(item._id, "role", e.target.value)} style={{ ...inp, width: "auto" }}>
                        {["employee", "manager", "admin"].map((r) => <option key={r} value={r} style={{ background: "#181a17" }}>{r}</option>)}
                      </select>
                    </td>
                    <td style={tdStyle}>
                      <select value={userEdits[item._id]?.department || ""} onChange={(e) => handleUserFieldChange(item._id, "department", e.target.value)} style={inp}>
                        <option value="" style={{ background: "#181a17" }}>Select…</option>
                        {DEPARTMENT_OPTIONS.map((d) => <option key={d} value={d} style={{ background: "#181a17" }}>{d}</option>)}
                      </select>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button type="button" onClick={() => handleSaveUser(item._id)} disabled={savingUserId === item._id} style={{ background: "#7DFF6B", color: "#0d0f0c", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                          {savingUserId === item._id ? "…" : "Save"}
                        </button>
                        <button type="button" onClick={() => handleDeleteUser(item._id)} disabled={deletingUserId === item._id} style={{ background: "transparent", color: "#f87171", border: "1px solid rgba(248,113,113,0.35)", borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
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
