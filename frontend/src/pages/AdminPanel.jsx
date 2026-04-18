import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("documents");
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const navigate = useNavigate();

  const fetchDocuments = async () => {
    setLoadingDocuments(true);

    try {
      const response = await api.get("/documents");
      setDocuments(response.data || []);
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to fetch documents";
      toast.error(message);
    } finally {
      setLoadingDocuments(false);
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
    if (activeTab === "documents") {
      fetchDocuments();
    } else {
      fetchUsers();
    }
  }, [activeTab]);

  const roleClassName = (role) => {
    if (role === "admin") {
      return "bg-dark text-cream rounded-full px-2 py-0.5 text-xs";
    }

    if (role === "manager") {
      return "bg-sage text-cream rounded-full px-2 py-0.5 text-xs";
    }

    return "border border-sage text-sage rounded-full px-2 py-0.5 text-xs";
  };

  return (
    <div className="bg-cream min-h-full p-6">
      <h1 className="text-darkest text-xl font-semibold mb-6">Admin Panel</h1>

      <div className="flex gap-1 mb-6 border-b border-sage/20">
        <button
          type="button"
          onClick={() => setActiveTab("documents")}
          className={
            activeTab === "documents"
              ? "bg-dark text-cream px-4 py-2 rounded-t text-sm font-medium"
              : "text-sage hover:text-dark px-4 py-2 text-sm cursor-pointer"
          }
        >
          Documents
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={
            activeTab === "users"
              ? "bg-dark text-cream px-4 py-2 rounded-t text-sm font-medium"
              : "text-sage hover:text-dark px-4 py-2 text-sm cursor-pointer"
          }
        >
          Users
        </button>
      </div>

      {activeTab === "documents" ? (
        <div className="bg-cream border border-sage/20 rounded-lg overflow-hidden shadow-sm">
          {loadingDocuments ? (
            <div className="py-10">
              <div className="animate-spin border-2 border-dark border-t-transparent rounded-full w-5 h-5 mx-auto" />
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-dark text-cream text-sm font-medium text-left">
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Uploaded By</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((document) => (
                  <tr
                    key={document._id}
                    className="bg-cream hover:bg-sage/10 text-sm text-dark divide-y divide-sage/20"
                  >
                    <td className="px-4 py-3">{document.title}</td>
                    <td className="px-4 py-3">{document.department || "-"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={document.workflow?.currentStage || document.status || "Submitted"}
                      />
                    </td>
                    <td className="px-4 py-3">{document.uploadedBy?.name || "-"}</td>
                    <td className="px-4 py-3">{formatDate(document.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/documents/${document._id}`)}
                        className="text-dark underline hover:text-darkest text-sm"
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
      ) : (
        <div className="bg-cream border border-sage/20 rounded-lg overflow-hidden shadow-sm">
          {loadingUsers ? (
            <div className="py-10">
              <div className="animate-spin border-2 border-dark border-t-transparent rounded-full w-5 h-5 mx-auto" />
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-dark text-cream text-sm font-medium text-left">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr
                    key={item._id}
                    className="bg-cream hover:bg-sage/10 text-sm text-dark divide-y divide-sage/20"
                  >
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3">{item.email}</td>
                    <td className="px-4 py-3">
                      <span className={roleClassName(item.role)}>{item.role}</span>
                    </td>
                    <td className="px-4 py-3">{item.department || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
