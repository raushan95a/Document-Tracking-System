import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { MdArrowBack, MdOpenInNew } from "react-icons/md";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import api, { getServerBaseUrl } from "../services/api";
import { DEPARTMENT_OPTIONS } from "../constants/departments";

const formatDate = (s) =>
  new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const inp = {
  width: "100%",
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: "9px 12px",
  color: "#111111",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  appearance: "none",
  transition: "border-color 0.15s",
  fontFamily: "'Inter', sans-serif",
};
const lbl = { color: "#374151", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 };
const card = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 24,
  marginBottom: 20,
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
};
const fi = (e) => (e.target.style.borderColor = "#111111");
const fo = (e) => (e.target.style.borderColor = "#e5e7eb");

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [document, setDocument] = useState(null);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [remarks, setRemarks] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [action, setAction] = useState("Approve");
  const [assignedTo, setAssignedTo] = useState("");
  const [targetDepartment, setTargetDepartment] = useState("");
  const [loadingDocument, setLoadingDocument] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [savingMetadata, setSavingMetadata] = useState(false);
  const [submittingWorkflow, setSubmittingWorkflow] = useState(false);

  const isAssignedToMe = useMemo(() => {
    if (!document?.workflow?.assignedTo || !user?._id) return false;
    const id2 = typeof document.workflow.assignedTo === "string" ? document.workflow.assignedTo : document.workflow.assignedTo._id;
    return id2?.toString() === user._id?.toString();
  }, [document, user]);

  const isUploader = useMemo(() => {
    if (!document?.uploadedBy || !user?._id) return false;
    const uid = typeof document.uploadedBy === "string" ? document.uploadedBy : document.uploadedBy._id;
    return uid?.toString() === user._id?.toString();
  }, [document, user]);

  const canManageWorkflow = user?.role === "admin" || user?.role === "manager" || isAssignedToMe;
  const canAccessActions = canManageWorkflow && !isUploader;
  const canEditMetadata = canAccessActions;

  const assigneeDisplay = useMemo(() => {
    const a = document?.workflow?.assignedTo;
    if (!a) return "Unassigned";
    return `${a.name} (${a.role})`;
  }, [document?.workflow?.assignedTo]);

  const fetchDocument = useCallback(async () => {
    setLoadingDocument(true);
    try {
      const res = await api.get(`/documents/${id}`);
      const d = res.data;
      setDocument(d); setTitle(d.title || ""); setDescription(d.description || "");
      setDepartment(d.department || ""); setRemarks(d.remarks || "");
      const av = d.workflow?.assignedTo;
      setAssignedTo(av ? (typeof av === "string" ? av : av._id) : "");
      const adept = typeof av === "object" && av?.department ? av.department : "";
      setTargetDepartment(adept || d.department || "");
    } catch (err) { toast.error(err?.response?.data?.message || "Failed to fetch document"); }
    finally { setLoadingDocument(false); }
  }, [id]);

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try { const res = await api.get(`/documents/${id}/logs`); setLogs(res.data || []); }
    catch (err) { toast.error(err?.response?.data?.message || "Failed to fetch logs"); }
    finally { setLoadingLogs(false); }
  }, [id]);

  const fetchAssignableUsers = useCallback(async () => {
    if (!canManageWorkflow) return;
    setLoadingUsers(true);
    try { const res = await api.get("/users/assignable"); setUsers(res.data || []); }
    catch (err) { toast.error(err?.response?.data?.message || "Failed to fetch users"); }
    finally { setLoadingUsers(false); }
  }, [canManageWorkflow]);

  useEffect(() => { fetchDocument(); fetchLogs(); fetchAssignableUsers(); }, [fetchAssignableUsers, fetchDocument, fetchLogs]);

  const handleMetadataUpdate = async (e) => {
    e.preventDefault(); setSavingMetadata(true);
    try {
      const fd = new FormData();
      fd.append("title", title); fd.append("description", description); fd.append("remarks", remarks);
      if ((user?.role === "admin" || user?.role === "manager") && department) fd.append("department", department);
      if (newFile) fd.append("file", newFile);
      await api.put(`/documents/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setNewFile(null); toast.success("Document details updated");
      await Promise.all([fetchDocument(), fetchLogs()]);
    } catch (err) { toast.error(err?.response?.data?.message || "Failed to update"); }
    finally { setSavingMetadata(false); }
  };

  const handleWorkflowSubmit = async (e) => {
    e.preventDefault(); setSubmittingWorkflow(true);
    try {
      await api.put(`/workflow/${id}`, { action, assignedTo: action === "Forward" ? (assignedTo || null) : null, remarks, targetDepartment: action === "Forward" ? targetDepartment : undefined });
      toast.success(`Document ${action.toLowerCase()}d successfully`);
      await Promise.all([fetchDocument(), fetchLogs()]);
    } catch (err) { toast.error(err?.response?.data?.message || "Failed to update workflow"); }
    finally { setSubmittingWorkflow(false); }
  };

  const spinner = (
    <div style={{ padding: 48, display: "flex", justifyContent: "center" }}>
      <div style={{ width: 22, height: 22, border: "2px solid #e5e7eb", borderTopColor: "#111111", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    </div>
  );

  if (loadingDocument) return <div style={{ minHeight: "100%", padding: 28 }}>{spinner}</div>;
  if (!document) return <div style={{ minHeight: "100%", padding: 28, color: "#6b7280", fontSize: 14, fontFamily: "'Inter', sans-serif" }}>Unable to load document.</div>;

  return (
    <div style={{ minHeight: "100%", padding: 28, fontFamily: "'Inter', sans-serif" }}>

      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "#6b7280",
          background: "transparent",
          border: "none",
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
          marginBottom: 24,
          padding: 0,
          transition: "color 0.15s",
          fontFamily: "'Inter', sans-serif",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#111111")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
      >
        <MdArrowBack style={{ fontSize: 16 }} /> Back to Dashboard
      </button>

      {/* Document info card */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ color: "#111111", fontSize: 20, fontWeight: 600, letterSpacing: "-0.3px" }}>{document.title}</h1>
          <StatusBadge status={document.workflow?.currentStage || document.status || "Submitted"} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
          {[
            { label: "Department", value: document.department || "—" },
            { label: "Assigned To", value: assigneeDisplay },
            { label: "Uploaded By", value: document.uploadedBy?.name || "—" },
            { label: "Date", value: formatDate(document.createdAt) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</p>
              <p style={{ color: "#374151", fontSize: 14 }}>{value}</p>
            </div>
          ))}
          {document.fileUrl && (
            <div>
              <p style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>File</p>
              <a
                href={document.fileUrl.startsWith("http") ? document.fileUrl : `${getServerBaseUrl()}${document.fileUrl}`}
                target="_blank"
                rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#3b82f6", fontSize: 14, fontWeight: 500, textDecoration: "none" }}
              >
                View File <MdOpenInNew style={{ fontSize: 14 }} />
              </a>
            </div>
          )}
        </div>

        {document.description && (
          <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid #f3f4f6" }}>
            <p style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Description</p>
            <p style={{ color: "#374151", fontSize: 14, lineHeight: 1.6 }}>{document.description}</p>
          </div>
        )}
      </div>

      {/* Metadata edit */}
      {canEditMetadata && (
        <form onSubmit={handleMetadataUpdate} style={card}>
          <h2 style={{ color: "#111111", fontSize: 16, fontWeight: 600, letterSpacing: "-0.3px", marginBottom: 18 }}>Update Document Details</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={lbl}>Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} style={inp} required onFocus={fi} onBlur={fo} />
            </div>
            <div>
              <label style={lbl}>Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={!(user?.role === "admin" || user?.role === "manager")}
                style={{ ...inp, opacity: !(user?.role === "admin" || user?.role === "manager") ? 0.5 : 1 }}
                onFocus={fi}
                onBlur={fo}
              >
                <option value="">Select Department</option>
                {DEPARTMENT_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Description</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inp, resize: "none", lineHeight: 1.6 }} onFocus={fi} onBlur={fo} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Remarks</label>
            <textarea rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} style={{ ...inp, resize: "none", lineHeight: 1.6 }} onFocus={fi} onBlur={fo} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>Replace File (Optional)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={(e) => setNewFile(e.target.files?.[0] || null)}
              style={{ ...inp, padding: "8px 12px" }}
            />
            {newFile && <p style={{ color: "#10b981", fontSize: 13, marginTop: 4, fontWeight: 500 }}>Replacing with: {newFile.name}</p>}
          </div>
          <button
            type="submit"
            disabled={savingMetadata}
            style={{
              background: savingMetadata ? "#e5e7eb" : "#111111",
              color: savingMetadata ? "#9ca3af" : "#ffffff",
              fontWeight: 600,
              fontSize: 14,
              border: "none",
              borderRadius: 8,
              padding: "9px 22px",
              cursor: savingMetadata ? "not-allowed" : "pointer",
              transition: "background 0.15s",
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={(e) => { if (!savingMetadata) e.currentTarget.style.background = "#242424"; }}
            onMouseLeave={(e) => { if (!savingMetadata) e.currentTarget.style.background = "#111111"; }}
          >
            {savingMetadata ? "Saving…" : "Save Details"}
          </button>
        </form>
      )}

      {/* Workflow actions */}
      {canAccessActions && (
        <form onSubmit={handleWorkflowSubmit} style={card}>
          <h2 style={{ color: "#111111", fontSize: 16, fontWeight: 600, letterSpacing: "-0.3px", marginBottom: 18 }}>Workflow Action</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }}>
            <div>
              <label style={lbl}>Action</label>
              <select value={action} onChange={(e) => setAction(e.target.value)} style={inp} onFocus={fi} onBlur={fo}>
                <option value="Approve">Approve</option>
                <option value="Reject">Reject</option>
                <option value="Forward">Forward</option>
              </select>
            </div>
            {action === "Forward" && (
              <>
                <div>
                  <label style={lbl}>Assign To</label>
                  {loadingUsers ? spinner : (
                    <select
                      value={assignedTo}
                      onChange={(e) => {
                        const v = e.target.value;
                        setAssignedTo(v);
                        const u = users.find((x) => x._id === v);
                        setTargetDepartment(u?.department || "");
                      }}
                      style={inp}
                      required
                      onFocus={fi}
                      onBlur={fo}
                    >
                      <option value="">Select Assignee</option>
                      {users.map((u) => (
                        <option key={u._id} value={u._id}>{u.name} ({u.role}){u.department ? ` — ${u.department}` : ""}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label style={lbl}>Target Department</label>
                  <input
                    type="text"
                    value={targetDepartment}
                    readOnly
                    placeholder="Select assignee first"
                    style={{ ...inp, opacity: 0.6, cursor: "not-allowed" }}
                    required
                  />
                </div>
              </>
            )}
          </div>
          <button
            type="submit"
            disabled={submittingWorkflow}
            style={{
              background: submittingWorkflow ? "#e5e7eb" : "#111111",
              color: submittingWorkflow ? "#9ca3af" : "#ffffff",
              fontWeight: 600,
              fontSize: 14,
              border: "none",
              borderRadius: 8,
              padding: "9px 22px",
              cursor: submittingWorkflow ? "not-allowed" : "pointer",
              transition: "background 0.15s",
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={(e) => { if (!submittingWorkflow) e.currentTarget.style.background = "#242424"; }}
            onMouseLeave={(e) => { if (!submittingWorkflow) e.currentTarget.style.background = "#111111"; }}
          >
            {submittingWorkflow ? "Submitting…" : `Submit ${action}`}
          </button>
        </form>
      )}

      {/* Document History */}
      <section>
        <h2 style={{ color: "#111111", fontSize: 16, fontWeight: 600, letterSpacing: "-0.3px", marginBottom: 14 }}>Document History</h2>
        <div style={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
          {loadingLogs ? spinner : logs.length === 0 ? (
            <p style={{ color: "#9ca3af", fontSize: 14, textAlign: "center", padding: 32 }}>No history available</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#f8f9fa" }}>
                  {["Action", "Updated By", "Timestamp"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", color: "#6b7280", fontSize: 12, fontWeight: 600, textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log._id} style={{ borderTop: i > 0 ? "1px solid #f3f4f6" : "none", transition: "background 0.1s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f9fa")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 16px", color: "#111111", fontSize: 14, fontWeight: 500 }}>{log.action}</td>
                    <td style={{ padding: "12px 16px", color: "#374151", fontSize: 14 }}>{log.updatedBy?.name || "—"}</td>
                    <td style={{ padding: "12px 16px", color: "#9ca3af", fontSize: 13 }}>{formatDate(log.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default DocumentDetail;
