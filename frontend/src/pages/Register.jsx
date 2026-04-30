import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MdDescription } from "react-icons/md";
import api from "../services/api";
import { DEPARTMENT_OPTIONS } from "../constants/departments";

const inputStyle = {
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
  fontFamily: "'Inter', sans-serif",
  appearance: "none",
};

const labelStyle = {
  color: "#374151",
  fontSize: 13,
  fontWeight: 600,
  display: "block",
  marginBottom: 6,
};

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    role: "employee",
    department: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/register", formData);
      toast.success("Account created successfully");
      navigate("/login");
    } catch (error) {
      const message = error?.response?.data?.message || "Registration failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fi = (e) => (e.target.style.borderColor = "#111111");
  const fo = (e) => (e.target.style.borderColor = "#e5e7eb");

  const fields = [
    { label: "Username", name: "username", type: "text", placeholder: "john_doe" },
    { label: "Full Name", name: "name", type: "text", placeholder: "John Doe" },
    { label: "Email", name: "email", type: "email", placeholder: "you@example.com" },
    { label: "Password", name: "password", type: "password", placeholder: "••••••••" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f9fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, justifyContent: "center" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: "#111111",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MdDescription style={{ color: "#ffffff", fontSize: 18 }} />
          </div>
          <span style={{ color: "#111111", fontWeight: 600, fontSize: 18, letterSpacing: "-0.3px" }}>DocTrack</span>
        </div>

        {/* Card */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: "32px 28px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          <h1 style={{ color: "#111111", fontSize: 22, fontWeight: 600, letterSpacing: "-0.3px", marginBottom: 6 }}>
            Create Account
          </h1>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>
            Join DocTrack to manage your documents
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              {fields.map(({ label, name, type, placeholder }) => (
                <div key={name}>
                  <label style={labelStyle}>{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    style={inputStyle}
                    placeholder={placeholder}
                    required
                    onFocus={fi}
                    onBlur={fo}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  style={inputStyle}
                  onFocus={fi}
                  onBlur={fo}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                  onFocus={fi}
                  onBlur={fo}
                >
                  <option value="">Select…</option>
                  {DEPARTMENT_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "#e5e7eb" : "#111111",
                color: loading ? "#9ca3af" : "#ffffff",
                fontWeight: 600,
                fontSize: 14,
                border: "none",
                borderRadius: 8,
                padding: "11px 0",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.15s",
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#242424"; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#111111"; }}
            >
              {loading ? "Creating…" : "Create Account"}
            </button>
          </form>

          <p style={{ color: "#6b7280", fontSize: 14, marginTop: 22, textAlign: "center" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#111111", textDecoration: "none", fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
