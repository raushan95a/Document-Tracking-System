import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MdDescription } from "react-icons/md";
import api from "../services/api";
import { DEPARTMENT_OPTIONS } from "../constants/departments";

const inputStyle = {
  width: "100%",
  background: "#181a17",
  border: "1px solid rgba(125,255,107,0.15)",
  borderRadius: 8,
  padding: "10px 12px",
  color: "#e8e8e4",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const labelStyle = {
  color: "#a8b5a4",
  fontSize: 12,
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

  const focusStyle = (e) => (e.target.style.borderColor = "rgba(125,255,107,0.45)");
  const blurStyle = (e) => (e.target.style.borderColor = "rgba(125,255,107,0.15)");

  const fields = [
    { label: "USERNAME", name: "username", type: "text", placeholder: "john_doe" },
    { label: "FULL NAME", name: "name", type: "text", placeholder: "John Doe" },
    { label: "EMAIL", name: "email", type: "email", placeholder: "you@example.com" },
    { label: "PASSWORD", name: "password", type: "password", placeholder: "••••••••" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0f0c",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, justifyContent: "center" }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: "#7DFF6B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MdDescription style={{ color: "#0d0f0c", fontSize: 20 }} />
          </div>
          <span style={{ color: "#e8e8e4", fontWeight: 700, fontSize: 18 }}>DocTrack</span>
        </div>

        <div
          style={{
            background: "#111210",
            border: "1px solid rgba(125,255,107,0.12)",
            borderRadius: 14,
            padding: "32px 28px",
          }}
        >
          <h1 style={{ color: "#e8e8e4", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
            Create Account
          </h1>
          <p style={{ color: "#697565", fontSize: 13, marginBottom: 24 }}>
            Join DocTrack to manage your documents
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              {fields.map(({ label, name, type, placeholder }) => (
                <div key={name} style={{ gridColumn: name === "email" || name === "password" ? "span 1" : "span 1" }}>
                  <label style={labelStyle}>{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    style={inputStyle}
                    placeholder={placeholder}
                    required
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>ROLE</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                >
                  <option value="employee" style={{ background: "#181a17" }}>Employee</option>
                  <option value="manager" style={{ background: "#181a17" }}>Manager</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>DEPARTMENT</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
                  required
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                >
                  <option value="" style={{ background: "#181a17" }}>Select…</option>
                  {DEPARTMENT_OPTIONS.map((d) => (
                    <option key={d} value={d} style={{ background: "#181a17" }}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "rgba(125,255,107,0.5)" : "#7DFF6B",
                color: "#0d0f0c",
                fontWeight: 700,
                fontSize: 14,
                border: "none",
                borderRadius: 9,
                padding: "11px 0",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#9bffaa"; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#7DFF6B"; }}
            >
              {loading ? "Creating…" : "Create Account"}
            </button>
          </form>

          <p style={{ color: "#697565", fontSize: 13, marginTop: 22, textAlign: "center" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#7DFF6B", textDecoration: "none", fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
