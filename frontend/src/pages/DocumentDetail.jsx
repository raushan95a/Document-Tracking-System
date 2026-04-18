import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [document, setDocument] = useState(null);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);

  const [loadingDocument, setLoadingDocument] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  const [status, setStatus] = useState("Submitted");
  const [remarks, setRemarks] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const canUpdate = user?.role === "admin" || user?.role === "manager";

  const fetchDocument = async () => {
    setLoadingDocument(true);

    try {
      const response = await api.get(`/documents/${id}`);
      const data = response.data;

      setDocument(data);
      setStatus(data.workflow?.currentStage || data.status || "Submitted");
      setRemarks(data.remarks || "");

      const assignedValue = data.workflow?.assignedTo;
      setAssignedTo(
        assignedValue
          ? typeof assignedValue === "string"
            ? assignedValue
            : assignedValue._id
          : ""
      );
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to fetch document";
      toast.error(message);
    } finally {
      setLoadingDocument(false);
    }
  };

  const fetchLogs = async () => {
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
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);

    try {
      const response = await api.get("/auth/users");
      setUsers(response.data || []);
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to fetch users";
      toast.error(message);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchDocument();
    fetchLogs();

    if (canUpdate) {
      fetchUsers();
    }
  }, [id, canUpdate]);

  const handleUpdate = async (event) => {
    event.preventDefault();
    setSubmittingUpdate(true);

    try {
      await api.put(`/documents/${id}`, {
        status,
        remarks,
        assignedTo: assignedTo || null,
      });

      toast.success("Document updated successfully");
      await Promise.all([fetchDocument(), fetchLogs()]);
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to update document";
      toast.error(message);
    } finally {
      setSubmittingUpdate(false);
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
            <p className="text-sage text-xs mb-1">Uploaded By</p>
            <p className="text-dark text-sm">{document.uploadedBy?.name || "-"}</p>
          </div>
          <div>
            <p className="text-sage text-xs mb-1">Date</p>
            <p className="text-dark text-sm">{formatDate(document.createdAt)}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sage text-xs mb-1">Description</p>
          <p className="text-dark text-sm">{document.description || "No description"}</p>
        </div>

        {document.fileUrl && (
          <div>
            <p className="text-sage text-xs mb-1">File</p>
            <a
              href={`http://localhost:5000${document.fileUrl}`}
              target="_blank"
              rel="noreferrer"
              className="text-dark underline text-sm"
            >
              View File
            </a>
          </div>
        )}
      </div>

      {canUpdate && (
        <form
          onSubmit={handleUpdate}
          className="mt-6 bg-cream border border-sage/20 rounded-lg p-6 shadow-sm"
        >
          <h2 className="text-darkest font-semibold mb-4">Update Document</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-dark font-medium mb-1">Status</label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full appearance-none bg-cream border border-sage rounded px-3 py-2 text-darkest focus:outline-none focus:ring-2 focus:ring-dark text-sm"
              >
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-dark font-medium mb-1">Assign To</label>
              <select
                value={assignedTo}
                onChange={(event) => setAssignedTo(event.target.value)}
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

          <button
            type="submit"
            disabled={submittingUpdate}
            className="mt-4 bg-dark text-cream px-4 py-2 rounded hover:bg-darkest text-sm disabled:opacity-70"
          >
            {submittingUpdate ? "Loading..." : "Update"}
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
