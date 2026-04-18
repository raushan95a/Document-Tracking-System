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
  const [userEdits, setUserEdits] = useState({});
  const [savingUserId, setSavingUserId] = useState("");
  const [deletingUserId, setDeletingUserId] = useState("");
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.documentFilters.admin);
  const { token } = useAuth();
  const navigate = useNavigate();

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.search) {
      params.set("search", filters.search);
    }

    if (filters.status) {
      params.set("status", filters.status);
    }

    if (filters.department) {
      params.set("department", filters.department);
    }

    return params.toString();
  }, [filters.department, filters.search, filters.status]);

  const fetchDocuments = useCallback(
    async (showLoader = true) => {
      if (showLoader) {
        setLoadingDocuments(true);
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
          setLoadingDocuments(false);
        }
      }
    },
    [queryString]
  );

  const fetchUsers = async () => {
    setLoadingUsers(true);

    try {
      const response = await api.get("/users");
      const userData = response.data || [];
      setUsers(userData);
      setUserEdits(
        userData.reduce((acc, user) => {
          acc[user._id] = {
            role: user.role,
            department: user.department || "",
          };
          return acc;
        }, {})
      );
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
  }, [activeTab, fetchDocuments]);

  useEffect(() => {
    if (!token || activeTab !== "documents") {
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
  }, [activeTab, fetchDocuments, token]);

  const handleUserFieldChange = (userId, key, value) => {
    setUserEdits((prev) => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || {}),
        [key]: value,
      },
    }));
  };

  const handleSaveUser = async (userId) => {
    const payload = userEdits[userId];

    if (!payload) {
      return;
    }

    setSavingUserId(userId);

    try {
      await api.put(`/users/${userId}`, {
        role: payload.role,
        department: payload.department,
      });
      toast.success("User updated successfully");
      await fetchUsers();
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to update user";
      toast.error(message);
    } finally {
      setSavingUserId("");
    }
  };

  const handleDeleteUser = async (userId) => {
    setDeletingUserId(userId);

    try {
      await api.delete(`/users/${userId}`);
      toast.success("User deleted successfully");
      await fetchUsers();
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to delete user";
      toast.error(message);
    } finally {
      setDeletingUserId("");
    }
  };

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
        <div>
          <div className="bg-cream border border-sage/20 rounded-lg p-4 shadow-sm mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                value={filters.search}
                placeholder="Search title/description"
                onChange={(event) =>
                  dispatch(
                    setAdminFilters({
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
                    setAdminFilters({
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

              <select
                value={filters.department}
                onChange={(event) =>
                  dispatch(
                    setAdminFilters({
                      department: event.target.value,
                    })
                  )
                }
                className="w-full appearance-none bg-cream border border-sage rounded px-3 py-2 text-darkest focus:outline-none focus:ring-2 focus:ring-dark text-sm"
              >
                <option value="">All Departments</option>
                {DEPARTMENT_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => dispatch(resetAdminFilters())}
                className="border border-sage text-sage px-4 py-2 rounded hover:bg-sage hover:text-cream text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>

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
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr
                    key={item._id}
                    className="bg-cream hover:bg-sage/10 text-sm text-dark divide-y divide-sage/20"
                  >
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3">{item.username}</td>
                    <td className="px-4 py-3">{item.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={userEdits[item._id]?.role || item.role}
                        onChange={(event) =>
                          handleUserFieldChange(item._id, "role", event.target.value)
                        }
                        className="appearance-none bg-cream border border-sage rounded px-2 py-1 text-darkest text-xs"
                      >
                        <option value="employee">employee</option>
                        <option value="manager">manager</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={userEdits[item._id]?.department || ""}
                        onChange={(event) =>
                          handleUserFieldChange(item._id, "department", event.target.value)
                        }
                        className="appearance-none bg-cream border border-sage rounded px-2 py-1 text-darkest text-xs w-full"
                      >
                        <option value="">Select Department</option>
                        {DEPARTMENT_OPTIONS.map((department) => (
                          <option key={department} value={department}>
                            {department}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveUser(item._id)}
                          disabled={savingUserId === item._id}
                          className="bg-dark text-cream px-2 py-1 rounded text-xs disabled:opacity-70"
                        >
                          {savingUserId === item._id ? "Saving" : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(item._id)}
                          disabled={deletingUserId === item._id}
                          className="border border-red-400 text-red-500 px-2 py-1 rounded text-xs disabled:opacity-70"
                        >
                          {deletingUserId === item._id ? "Deleting" : "Delete"}
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
    </div>
  );
};

export default AdminPanel;
