import React, { useEffect, useState } from "react";
import { MdInbox } from "react-icons/md";
import { useNavigate } from "react-router-dom";
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

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);

      try {
        const response = await api.get("/documents");
        setDocuments(response.data || []);
      } catch (error) {
        const message = error?.response?.data?.message || "Failed to fetch documents";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const title = user?.role === "employee" ? "My Documents" : "All Documents";

  return (
    <div className="bg-cream min-h-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-darkest text-xl font-semibold">{title}</h1>
        <button
          type="button"
          onClick={() => navigate("/upload")}
          className="bg-dark text-cream px-4 py-2 rounded hover:bg-darkest text-sm"
        >
          Upload Document
        </button>
      </div>

      <div className="bg-cream border border-sage/20 rounded-lg overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-10">
            <div className="animate-spin border-2 border-dark border-t-transparent rounded-full w-5 h-5 mx-auto" />
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-sage text-sm">
            <MdInbox className="text-4xl mb-2" />
            <span>No documents found</span>
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
    </div>
  );
};

export default Dashboard;
