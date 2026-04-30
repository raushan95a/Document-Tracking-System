import React, { useState } from "react";
import { MdUploadFile, MdInsertDriveFile } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import { DEPARTMENT_OPTIONS } from "../constants/departments";

const inp = {
  width: "100%",
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: "10px 12px",
  color: "#111111",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
  appearance: "none",
  fontFamily: "'Inter', sans-serif",
};

const lbl = {
  color: "#374151",
  fontSize: 13,
  fontWeight: 600,
  display: "block",
  marginBottom: 6,
};

const fi = (e) => (e.target.style.borderColor = "#111111");
const fo = (e) => (e.target.style.borderColor = "#e5e7eb");

const UploadDocument = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error("Please select a file"); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      fd.append("department", department);
      fd.append("file", file);
      await api.post("/documents", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Document uploaded successfully");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100%", padding: 28, fontFamily: "'Inter', sans-serif" }}>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#111111", letterSpacing: "-0.3px", marginBottom: 4 }}>
          Upload Document
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280" }}>
          Submit a document for review and tracking.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 32,
          maxWidth: 580,
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inp}
            placeholder="Document title"
            required
            onFocus={fi}
            onBlur={fo}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...inp, resize: "none", lineHeight: 1.6 }}
            placeholder="Optional description…"
            onFocus={fi}
            onBlur={fo}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={lbl}>Department</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            style={inp}
            required
            onFocus={fi}
            onBlur={fo}
          >
            <option value="">Select Department</option>
            {DEPARTMENT_OPTIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* File drop zone */}
        <div style={{ marginBottom: 28 }}>
          <label style={lbl}>File</label>
          <label
            htmlFor="file-upload"
            style={{
              display: "block",
              border: `2px dashed ${file ? "#10b981" : "#e5e7eb"}`,
              borderRadius: 12,
              padding: "36px 20px",
              textAlign: "center",
              cursor: "pointer",
              background: file ? "rgba(16,185,129,0.04)" : "#f8f9fa",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!file) e.currentTarget.style.borderColor = "#111111";
            }}
            onMouseLeave={(e) => {
              if (!file) e.currentTarget.style.borderColor = "#e5e7eb";
            }}
          >
            {file ? (
              <>
                <MdInsertDriveFile style={{ fontSize: 32, color: "#10b981", marginBottom: 10, display: "block", margin: "0 auto 10px" }} />
                <p style={{ color: "#111111", fontSize: 14, fontWeight: 600 }}>{file.name}</p>
                <p style={{ color: "#6b7280", fontSize: 12, marginTop: 4 }}>Click to replace</p>
              </>
            ) : (
              <>
                <MdUploadFile style={{ fontSize: 32, color: "#9ca3af", display: "block", margin: "0 auto 10px" }} />
                <p style={{ color: "#374151", fontSize: 14, fontWeight: 500 }}>Click to upload or drag & drop</p>
                <p style={{ color: "#9ca3af", fontSize: 12, marginTop: 4 }}>PDF, DOC, DOCX, PNG, JPG (max 5 MB)</p>
              </>
            )}
          </label>
          <input
            id="file-upload"
            type="file"
            style={{ display: "none" }}
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "#e5e7eb" : "#111111",
              color: loading ? "#9ca3af" : "#ffffff",
              fontWeight: 600,
              fontSize: 14,
              border: "none",
              borderRadius: 8,
              padding: "10px 24px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.15s",
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#242424"; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#111111"; }}
          >
            {loading ? "Uploading…" : "Submit"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            style={{
              background: "#ffffff",
              color: "#374151",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              transition: "border-color 0.15s",
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#111111")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadDocument;
