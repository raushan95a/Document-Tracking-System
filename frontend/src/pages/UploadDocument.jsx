import React, { useState } from "react";
import { MdUploadFile, MdInsertDriveFile } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import { DEPARTMENT_OPTIONS } from "../constants/departments";

const inp = {
  width: "100%", background: "#181a17", border: "1px solid rgba(125,255,107,0.15)",
  borderRadius: 8, padding: "10px 12px", color: "#e8e8e4", fontSize: 13,
  outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", appearance: "none",
};
const lbl = { color: "#a8b5a4", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" };
const fi = (e) => (e.target.style.borderColor = "rgba(125,255,107,0.45)");
const fo = (e) => (e.target.style.borderColor = "rgba(125,255,107,0.15)");

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
      fd.append("title", title); fd.append("description", description);
      fd.append("department", department); fd.append("file", file);
      await api.post("/documents", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Document uploaded successfully");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100%", padding: 24 }}>
      <h1 style={{ color: "#e8e8e4", fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Upload Document</h1>
      <form onSubmit={handleSubmit} style={{ background: "#111210", border: "1px solid rgba(125,255,107,0.1)", borderRadius: 12, padding: 28, maxWidth: 560 }}>
        <div style={{ marginBottom: 18 }}>
          <label style={lbl}>Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={inp} placeholder="Document title" required onFocus={fi} onBlur={fo} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={lbl}>Description</label>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inp, resize: "none" }} placeholder="Optional…" onFocus={fi} onBlur={fo} />
        </div>
        <div style={{ marginBottom: 22 }}>
          <label style={lbl}>Department</label>
          <select value={department} onChange={(e) => setDepartment(e.target.value)} style={inp} required onFocus={fi} onBlur={fo}>
            <option value="" style={{ background: "#181a17" }}>Select Department</option>
            {DEPARTMENT_OPTIONS.map((d) => <option key={d} value={d} style={{ background: "#181a17" }}>{d}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 28 }}>
          <label style={lbl}>File</label>
          <label htmlFor="file-upload" style={{ display: "block", border: `2px dashed ${file ? "rgba(125,255,107,0.5)" : "rgba(125,255,107,0.2)"}`, borderRadius: 10, padding: "32px 16px", textAlign: "center", cursor: "pointer", background: file ? "rgba(125,255,107,0.05)" : "transparent", transition: "all 0.2s" }}>
            {file ? (
              <>
                <MdInsertDriveFile style={{ fontSize: 32, color: "#7DFF6B", marginBottom: 8 }} />
                <p style={{ color: "#7DFF6B", fontSize: 13, fontWeight: 600 }}>{file.name}</p>
                <p style={{ color: "#697565", fontSize: 11, marginTop: 4 }}>Click to replace</p>
              </>
            ) : (
              <>
                <MdUploadFile style={{ fontSize: 32, color: "#697565", marginBottom: 8 }} />
                <p style={{ color: "#a8b5a4", fontSize: 13 }}>Click to upload or drag &amp; drop</p>
                <p style={{ color: "#697565", fontSize: 11, marginTop: 4 }}>PDF, DOC, DOCX, PNG, JPG (max 5 MB)</p>
              </>
            )}
          </label>
          <input id="file-upload" type="file" style={{ display: "none" }} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit" disabled={loading} style={{ background: loading ? "rgba(125,255,107,0.5)" : "#7DFF6B", color: "#0d0f0c", fontWeight: 700, fontSize: 13, border: "none", borderRadius: 8, padding: "10px 24px", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Uploading…" : "Submit"}
          </button>
          <button type="button" onClick={() => navigate("/dashboard")} style={{ background: "transparent", color: "#a8b5a4", border: "1px solid rgba(125,255,107,0.18)", borderRadius: 8, padding: "10px 24px", fontSize: 13, cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadDocument;
