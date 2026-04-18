import React, { useState } from "react";
import { MdUploadFile } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";

const UploadDocument = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("department", department);
      formData.append("file", file);

      await api.post("/documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Document uploaded successfully");
      navigate("/dashboard");
    } catch (error) {
      const message = error?.response?.data?.message || "Upload failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream min-h-full p-6">
      <h1 className="text-darkest text-xl font-semibold mb-6">Upload Document</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-cream border border-sage/20 rounded-lg p-6 shadow-sm max-w-xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-dark font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full bg-cream border border-sage rounded px-3 py-2 text-darkest focus:outline-none focus:ring-2 focus:ring-dark text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-dark font-medium mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full bg-cream border border-sage rounded px-3 py-2 text-darkest focus:outline-none focus:ring-2 focus:ring-dark text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-dark font-medium mb-1">Department</label>
            <input
              type="text"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              className="w-full bg-cream border border-sage rounded px-3 py-2 text-darkest focus:outline-none focus:ring-2 focus:ring-dark text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-dark font-medium mb-2">File</label>
            <label
              htmlFor="file-upload"
              className="border-2 border-dashed border-sage/40 rounded-lg p-6 text-center cursor-pointer hover:border-sage block"
            >
              <MdUploadFile className="text-3xl text-sage mb-2 mx-auto" />
              <p className="text-sage text-sm">Click to upload or drag and drop</p>
              <p className="text-sage/60 text-xs mt-1">PDF, DOC, DOCX, PNG, JPG (max 5MB)</p>
              {file && <p className="text-dark text-sm mt-3">{file.name}</p>}
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-dark text-cream px-6 py-2 rounded hover:bg-darkest text-sm disabled:opacity-70"
          >
            {loading ? "Loading..." : "Submit"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="border border-sage text-sage px-6 py-2 rounded hover:bg-sage hover:text-cream text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadDocument;
