import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MdInbox } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getSocket } from "../services/socket";
import { resetDashboardFilters, setDashboardFilters } from "../store/documentFiltersSlice";

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
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.documentFilters.dashboard);
  const { user, token } = useAuth();

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.search) {
      params.set("search", filters.search);
    }

    if (filters.status) {
      params.set("status", filters.status);
    }

    if (filters.department && user?.role !== "manager") {
      params.set("department", filters.department);
    }

    return params.toString();
  }, [filters.department, filters.search, filters.status, user?.role]);

  useEffect(() => {
    if (user?.role === "manager") {
      dispatch(resetDashboardFilters());
    }
  }, [dispatch, user?.role]);

  const fetchDocuments = useCallback(
    async (showLoader = true) => {
      if (showLoader) {
        setLoading(true);
      }

      try {
        const endpoint = queryString ? `/documents?${queryString}` : "/documents";
        const response = await api.get(endpoint);
        setDocuments(response.data || []);
      } catch (error) {
        const message = error?.response?.data?.message || "Failed to fetch documents";
        toast.error(message);
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [queryString]
  );

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const socket = getSocket(token);

    if (!socket) {
      return undefined;
    }

    const handleDocumentsUpdated = () => {
      fetchDocuments(false);
    };

    socket.on("documents:updated", handleDocumentsUpdated);

    return () => {
      socket.off("documents:updated", handleDocumentsUpdated);
    };
  }, [fetchDocuments, token]);

  const titleMap = {
    employee: "My Documents",
    manager: "Pending Reviews",
    admin: "All Documents",
  };

  const title = titleMap[user?.role] || "Documents";

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

      <div className="bg-cream border border-sage/20 rounded-lg p-4 shadow-sm mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            value={filters.search}
            placeholder="Search title/description"
            onChange={(event) =>
              dispatch(
                setDashboardFilters({
                  search: event.target.value,
                })
              )
            }
            className="w-full bg-cream border border-sage rounded px-3 py-2 text-darkest focus:outline-none focus:ring-2 focus:ring-dark text-sm"
          />

          <select
            value={filters.status}
            onChange={(event) =>
              dispatch(
                setDashboardFilters({
                  status: event.target.value,
                })
              )
            }
            className="w-full appearance-none bg-cream border border-sage rounded px-3 py-2 text-darkest focus:outline-none focus:ring-2 focus:ring-dark text-sm"
          >
            <option value="">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <input
            type="text"
            value={filters.department}
            placeholder="Filter by department"
            disabled={user?.role === "manager"}
            onChange={(event) =>
              dispatch(
                setDashboardFilters({
                  department: event.target.value,
                })
              )
            }
            className="w-full bg-cream border border-sage rounded px-3 py-2 text-darkest focus:outline-none focus:ring-2 focus:ring-dark text-sm disabled:opacity-70"
          />

          <button
            type="button"
            onClick={() => dispatch(resetDashboardFilters())}
            className="border border-sage text-sage px-4 py-2 rounded hover:bg-sage hover:text-cream text-sm"
          >
            Clear Filters
          </button>
        </div>
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
