import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { MdArrowBack } from "react-icons/md";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import api, { getServerBaseUrl } from "../services/api";
import { getSocket } from "../services/socket";
import { DEPARTMENT_OPTIONS } from "../constants/departments";

const formatDate = (s) =>
  new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const inp = {
  width: "100%", background: "#181a17", border: "1px solid rgba(125,255,107,0.15)",
  borderRadius: 8, padding: "9px 12px", color: "#e8e8e4", fontSize: 13,
  outline: "none", boxSizing: "border-box", appearance: "none", transition: "border-color 0.2s",
};
const lbl = { color: "#a8b5a4", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" };
const card = { background: "#111210", border: "1px solid rgba(125,255,107,0.1)", borderRadius: 12, padding: 24, marginBottom: 20 };
const fi = (e) => (e.target.style.borderColor = "rgba(125,255,107,0.45)");
const fo = (e) => (e.target.style.borderColor = "rgba(125,255,107,0.15)");

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

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

  useEffect(() => {
    if (!token) return undefined;
    const socket = getSocket(token);
    if (!socket) return undefined;
    socket.emit("document:subscribe", id);
    const handler = (payload) => { if (payload?.documentId !== id) return; fetchDocument(); fetchLogs(); };
    socket.on("document:updated", handler);
    return () => { socket.emit("document:unsubscribe", id); socket.off("document:updated", handler); };
  }, [fetchDocument, fetchLogs, id, token]);

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
      <div style={{ width: 22, height: 22, border: "2px solid rgba(125,255,107,0.2)", borderTopColor: "#7DFF6B", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    </div>
  );

  if (loadingDocument) return <div style={{ minHeight: "100%", padding: 24 }}>{spinner}</div>;
  if (!document) return <div style={{ minHeight: "100%", padding: 24, color: "#697565", fontSize: 14 }}>Unable to load document.</div>;

  return (
    <div style={{ minHeight: "100%", padding: 24 }}>
      <button type="button" onClick={() => navigate("/dashboard")} style={{ display: "flex", alignItems: "center", gap: 6, color: "#697565", background: "transparent", border: "none", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0, transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#7DFF6B")} onMouseLeave={(e) => (e.currentTarget.style.color = "#697565")}>
        <MdArrowBack style={{ fontSize: 16 }} /> Back to Dashboard
      </button>

      {/* info card */}
      <div style={card}>
        <h1 style={{ color: "#e8e8e4", fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{document.title}</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 16 }}>
          {[
            { label: "Department", value: document.department || "—" },
            { label: "Assigned To", value: assigneeDisplay },
            { label: "Uploaded By", value: document.uploadedBy?.name || "—" },
            { label: "Date", value: formatDate(document.createdAt) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ color: "#697565", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</p>
              <p style={{ color: "#a8b5a4", fontSize: 13 }}>{value}</p>
            </div>
          ))}
          <div>
            <p style={{ color: "#697565", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Status</p>
            <StatusBadge status={document.workflow?.currentStage || document.status || "Submitted"} />
          </div>
          {document.fileUrl && (
            <div>
              <p style={{ color: "#697565", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>File</p>
              <a href={document.fileUrl.startsWith("http") ? document.fileUrl : `${getServerBaseUrl()}${document.fileUrl}`} target="_blank" rel="noreferrer" style={{ color: "#7DFF6B", fontSize: 13, textDecoration: "underline" }}>View File</a>
            </div>
          )}
        </div>
      </div>

      {/* metadata edit */}
      {canEditMetadata && (
        <form onSubmit={handleMetadataUpdate} style={card}>
          <h2 style={{ color: "#e8e8e4", fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Update Document Details</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={lbl}>Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} style={inp} required onFocus={fi} onBlur={fo} />
            </div>
            <div>
              <label style={lbl}>Department</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} disabled={!(user?.role === "admin" || user?.role === "manager")} style={{ ...inp, opacity: !(user?.role === "admin" || user?.role === "manager") ? 0.5 : 1 }} onFocus={fi} onBlur={fo}>
                <option value="" style={{ background: "#181a17" }}>Select Department</option>
                {DEPARTMENT_OPTIONS.map((d) => <option key={d} value={d} style={{ background: "#181a17" }}>{d}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Description</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inp, resize: "none" }} onFocus={fi} onBlur={fo} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Remarks</label>
            <textarea rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} style={{ ...inp, resize: "none" }} onFocus={fi} onBlur={fo} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={lbl}>Replace File (Optional)</label>
            <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={(e) => setNewFile(e.target.files?.[0] || null)} style={{ ...inp, padding: "8px 12px" }} />
            {newFile && <p style={{ color: "#7DFF6B", fontSize: 12, marginTop: 4 }}>Replacing with: {newFile.name}</p>}
          </div>
          <button type="submit" disabled={savingMetadata} style={{ background: savingMetadata ? "rgba(125,255,107,0.5)" : "#7DFF6B", color: "#0d0f0c", fontWeight: 700, fontSize: 13, border: "none", borderRadius: 8, padding: "9px 22px", cursor: savingMetadata ? "not-allowed" : "pointer" }}>
            {savingMetadata ? "Saving…" : "Save Details"}
          </button>
        </form>
      )}

      {/* workflow */}
      {canAccessActions && (
        <form onSubmit={handleWorkflowSubmit} style={card}>
          <h2 style={{ color: "#e8e8e4", fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Workflow Action</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14, marginBottom: 18 }}>
            <div>
              <label style={lbl}>Action</label>
              <select value={action} onChange={(e) => setAction(e.target.value)} style={inp} onFocus={fi} onBlur={fo}>
                <option value="Approve" style={{ background: "#181a17" }}>Approve</option>
                <option value="Reject" style={{ background: "#181a17" }}>Reject</option>
                <option value="Forward" style={{ background: "#181a17" }}>Forward</option>
              </select>
            </div>
            {action === "Forward" && (
              <>
                <div>
                  <label style={lbl}>Assign To</label>
                  {loadingUsers ? spinner : (
                    <select value={assignedTo} onChange={(e) => { const v = e.target.value; setAssignedTo(v); const u = users.find((x) => x._id === v); setTargetDepartment(u?.department || ""); }} style={inp} required onFocus={fi} onBlur={fo}>
                      <option value="" style={{ background: "#181a17" }}>Select Assignee</option>
                      {users.map((u) => <option key={u._id} value={u._id} style={{ background: "#181a17" }}>{u.name} ({u.role}){u.department ? ` — ${u.department}` : ""}</option>)}
                    </select>
                  )}
                </div>
                <div>
                  <label style={lbl}>Target Department</label>
                  <input type="text" value={targetDepartment} readOnly placeholder="Select assignee first" style={{ ...inp, opacity: 0.6, cursor: "not-allowed" }} required />
                </div>
              </>
            )}
          </div>
          <button type="submit" disabled={submittingWorkflow} style={{ background: submittingWorkflow ? "rgba(125,255,107,0.5)" : "#7DFF6B", color: "#0d0f0c", fontWeight: 700, fontSize: 13, border: "none", borderRadius: 8, padding: "9px 22px", cursor: submittingWorkflow ? "not-allowed" : "pointer" }}>
            {submittingWorkflow ? "Submitting…" : `Submit ${action}`}
          </button>
        </form>
      )}

      {/* history */}
      <section>
        <h2 style={{ color: "#e8e8e4", fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Document History</h2>
        <div style={{ background: "#111210", border: "1px solid rgba(125,255,107,0.1)", borderRadius: 12, overflow: "hidden" }}>
          {loadingLogs ? spinner : logs.length === 0 ? (
            <p style={{ color: "#697565", fontSize: 13, textAlign: "center", padding: 32 }}>No history available</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(125,255,107,0.1)" }}>
                  {["Action", "Updated By", "Timestamp"].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", color: "#697565", fontSize: 11, fontWeight: 700, textAlign: "left", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log._id} style={{ borderTop: i > 0 ? "1px solid rgba(125,255,107,0.06)" : "none" }}>
                    <td style={{ padding: "11px 16px", color: "#e8e8e4", fontSize: 13 }}>{log.action}</td>
                    <td style={{ padding: "11px 16px", color: "#a8b5a4", fontSize: 13 }}>{log.updatedBy?.name || "—"}</td>
                    <td style={{ padding: "11px 16px", color: "#697565", fontSize: 12 }}>{formatDate(log.timestamp)}</td>
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
