import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import api, { getServerBaseUrl } from "../services/api";
import { getSocket } from "../services/socket";
import { DEPARTMENT_OPTIONS } from "../constants/departments";

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

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

  const canReview = user?.role === "admin" || user?.role === "manager";
  const isOwner =
    user?.role === "employee" &&
    document?.uploadedBy &&
    document.uploadedBy._id?.toString() === user._id?.toString();
  const canEditMetadata = canReview || isOwner;

  const assigneeDisplay = useMemo(() => {
    const assignee = document?.workflow?.assignedTo;

    if (!assignee) {
      return "Unassigned";
    }

    return `${assignee.name} (${assignee.role})`;
  }, [document?.workflow?.assignedTo]);

  const fetchDocument = useCallback(async () => {
    setLoadingDocument(true);

    try {
      const response = await api.get(`/documents/${id}`);
      const data = response.data;

      setDocument(data);
      setTitle(data.title || "");
      setDescription(data.description || "");
      setDepartment(data.department || "");
      setRemarks(data.remarks || "");

      const assignedValue = data.workflow?.assignedTo;
      setAssignedTo(
        assignedValue
          ? typeof assignedValue === "string"
            ? assignedValue
            : assignedValue._id
          : ""
      );
      setTargetDepartment(data.department || "");
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to fetch document";
      toast.error(message);
    } finally {
      setLoadingDocument(false);
    }
  }, [id]);

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);

    try {
      const response = await api.get(`/documents/${id}/logs`);
      setLogs(response.data || []);
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to fetch document logs";
      toast.error(message);
    } finally {
      setLoadingLogs(false);
    }
  }, [id]);

  const fetchAssignableUsers = useCallback(async () => {
    if (!canReview) {
      return;
    }

    setLoadingUsers(true);

    try {
      const response = await api.get("/users/assignable");
      setUsers(response.data || []);
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to fetch users";
      toast.error(message);
    } finally {
      setLoadingUsers(false);
    }
  }, [canReview]);

  useEffect(() => {
    fetchDocument();
    fetchLogs();
    fetchAssignableUsers();
  }, [fetchAssignableUsers, fetchDocument, fetchLogs]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const socket = getSocket(token);

    if (!socket) {
      return undefined;
    }

    socket.emit("document:subscribe", id);

    const handleDocumentUpdated = (payload) => {
      if (payload?.documentId !== id) {
        return;
      }

      fetchDocument();
      fetchLogs();
    };

    socket.on("document:updated", handleDocumentUpdated);

    return () => {
      socket.emit("document:unsubscribe", id);
      socket.off("document:updated", handleDocumentUpdated);
    };
  }, [fetchDocument, fetchLogs, id, token]);

  const handleMetadataUpdate = async (event) => {
    event.preventDefault();
    setSavingMetadata(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("remarks", remarks);
      if (canReview && department) {
        formData.append("department", department);
      }
      if (newFile) {
        formData.append("file", newFile);
      }

      await api.put(`/documents/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setNewFile(null);
      toast.success("Document details updated");
      await Promise.all([fetchDocument(), fetchLogs()]);
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to update document details";
      toast.error(message);
    } finally {
      setSavingMetadata(false);
    }
  };

  const handleWorkflowSubmit = async (event) => {
    event.preventDefault();
    setSubmittingWorkflow(true);

    try {
      await api.put(`/workflow/${id}`, {
        action,
        assignedTo: action === "Forward" ? (assignedTo || null) : null,
        remarks,
        targetDepartment: action === "Forward" ? targetDepartment : undefined,
      });

      toast.success(`Document ${action.toLowerCase()}d successfully`);
      await Promise.all([fetchDocument(), fetchLogs()]);
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to update workflow";
      toast.error(message);
    } finally {
      setSubmittingWorkflow(false);
    }
  };

  if (loadingDocument) {
    return (
      <div className="bg-cream min-h-full p-6">
        <div className="animate-spin border-2 border-dark border-t-transparent rounded-full w-5 h-5 mx-auto mt-20" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="bg-cream min-h-full p-6 text-sage text-sm">
        Unable to load document details.
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-full p-6">
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="text-sage text-sm hover:text-dark mb-4 cursor-pointer"
      >
        {"<- Back to Dashboard"}
      </button>

      <div className="bg-cream border border-sage/20 rounded-lg p-6 shadow-sm">
        <h1 className="text-darkest text-xl font-semibold mb-4">{document.title}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sage text-xs mb-1">Department</p>
            <p className="text-dark text-sm">{document.department || "-"}</p>
          </div>
          <div>
            <p className="text-sage text-xs mb-1">Status</p>
            <StatusBadge status={document.workflow?.currentStage || document.status || "Submitted"} />
          </div>
          <div>
            <p className="text-sage text-xs mb-1">Assigned To</p>
            <p className="text-dark text-sm">{assigneeDisplay}</p>
          </div>
          <div>
            <p className="text-sage text-xs mb-1">Uploaded By</p>
            <p className="text-dark text-sm">{document.uploadedBy?.name || "-"}</p>
          </div>
          <div>
            <p className="text-sage text-xs mb-1">Date</p>
            <p className="text-dark text-sm">{formatDate(document.createdAt)}</p>
          </div>
        </div>

        {document.fileUrl && (
          <div>
            <p className="text-sage text-xs mb-1">File</p>
            <a
              href={`${getServerBaseUrl()}${document.fileUrl}`}
              target="_blank"
              rel="noreferrer"
              className="text-dark underline text-sm"
            >
              View File
            </a>
          </div>
        )}
      </div>

      {canEditMetadata && (
        <form
          onSubmit={handleMetadataUpdate}
          className="mt-6 bg-cream border border-sage/20 rounded-lg p-6 shadow-sm"
        >
          <h2 className="text-darkest font-semibold mb-4">Update Document Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-dark font-medium mb-1">Title</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full bg-cream border border-sage rounded px-3 py-2 text-darkest focus:outline-none focus:ring-2 focus:ring-dark text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-dark font-medium mb-1">Department</label>
              <select
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                disabled={!canReview}
                className="w-full appearance-none bg-cream border border-sage rounded px-3 py-2 text-darkest focus:outline-none focus:ring-2 focus:ring-dark text-sm disabled:opacity-70"
              >
                <option value="">Select Department</option>
                {DEPARTMENT_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-dark font-medium mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full bg-cream border border-sage rounded px-3 py-2 text-darkest focus:outline-none focus:ring-2 focus:ring-dark text-sm resize-none"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm text-dark font-medium mb-1">Remarks</label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              className="w-full bg-cream border border-sage rounded px-3 py-2 text-darkest focus:outline-none focus:ring-2 focus:ring-dark text-sm resize-none"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm text-dark font-medium mb-1">Update Document File (Optional)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={(event) => setNewFile(event.target.files?.[0] || null)}
              className="w-full bg-cream border border-sage rounded px-3 py-2 text-darkest focus:outline-none focus:ring-2 focus:ring-dark text-sm"
            />
            {newFile && <p className="text-dark text-xs mt-1">Replacing with: {newFile.name}</p>}
          </div>

          <button
            type="submit"
            disabled={savingMetadata}
            className="mt-4 bg-dark text-cream px-4 py-2 rounded hover:bg-darkest text-sm disabled:opacity-70"
          >
            {savingMetadata ? "Saving..." : "Save Details"}
          </button>
        </form>
      )}

      {canReview && (
        <form
          onSubmit={handleWorkflowSubmit}
          className="mt-6 bg-cream border border-sage/20 rounded-lg p-6 shadow-sm"
        >
          <h2 className="text-darkest font-semibold mb-4">Workflow Action</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-dark font-medium mb-1">Action</label>
              <select
                value={action}
                onChange={(event) => setAction(event.target.value)}
                className="w-full appearance-none bg-cream border border-sage rounded px-3 py-2 text-darkest focus:outline-none focus:ring-2 focus:ring-dark text-sm"
              >
                <option value="Approve">Approve</option>
                <option value="Reject">Reject</option>
                <option value="Forward">Forward</option>
              </select>
            </div>

            {action === "Forward" && (
              <div>
                <label className="block text-sm text-dark font-medium mb-1">Assign To</label>
                <select
                  value={assignedTo}
                  onChange={(event) => {
                    const val = event.target.value;
                    setAssignedTo(val);
                    
                    const selectedUser = users.find(u => u._id === val);
                    if (selectedUser && selectedUser.department) {
                      setTargetDepartment(selectedUser.department);
                    }
                  }}
                  className="w-full appearance-none bg-cream border border-sage rounded px-3 py-2 text-darkest focus:outline-none focus:ring-2 focus:ring-dark text-sm"
                >
                  <option value="">Unassigned</option>
                  {users.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name} ({item.role})
                    </option>
                  ))}
                </select>
                {loadingUsers && (
                  <div className="mt-2">
                    <div className="animate-spin border-2 border-dark border-t-transparent rounded-full w-5 h-5" />
                  </div>
                )}
              </div>
            )}

            {action === "Forward" && (
              <div>
                <label className="block text-sm text-dark font-medium mb-1">Target Department</label>
                <select
                  value={targetDepartment}
                  onChange={(event) => setTargetDepartment(event.target.value)}
                  className="w-full appearance-none bg-cream border border-sage rounded px-3 py-2 text-darkest focus:outline-none focus:ring-2 focus:ring-dark text-sm"
                  required
                >
                  <option value="">Select Target Department</option>
                  {DEPARTMENT_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submittingWorkflow}
            className="mt-4 bg-dark text-cream px-4 py-2 rounded hover:bg-darkest text-sm disabled:opacity-70"
          >
            {submittingWorkflow ? "Submitting..." : `Submit ${action}`}
          </button>
        </form>
      )}

      <section className="mt-6">
        <h2 className="text-darkest font-semibold mb-3">Document History</h2>
        <div className="bg-cream border border-sage/20 rounded-lg overflow-hidden shadow-sm">
          {loadingLogs ? (
            <div className="py-10">
              <div className="animate-spin border-2 border-dark border-t-transparent rounded-full w-5 h-5 mx-auto" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-sage text-sm text-center py-6">No history available</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-dark text-cream text-sm font-medium text-left">
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Updated By</th>
                  <th className="px-4 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className="bg-cream hover:bg-sage/10 text-sm text-dark divide-y divide-sage/20"
                  >
                    <td className="px-4 py-3">{log.action}</td>
                    <td className="px-4 py-3">{log.updatedBy?.name || "-"}</td>
                    <td className="px-4 py-3">{formatDate(log.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export default DocumentDetail;
