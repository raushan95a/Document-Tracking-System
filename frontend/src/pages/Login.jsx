import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MdDescription, MdLockOutline, MdMailOutline } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

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
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (!showOTP) {
        const response = await api.post("/auth/login", { email, password });
        if (response.data.otpRequired) {
          setShowOTP(true);
          toast.success("OTP sent to your email!");
        } else {
          const { token, ...userData } = response.data;
          login(userData, token);
          navigate("/dashboard");
        }
      } else {
        const response = await api.post("/auth/verify-otp", { email, otp });
        const { token, ...userData } = response.data;
        login(userData, token);
        toast.success("Login successful!");
        navigate("/dashboard");
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

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
      <div style={{ width: "100%", maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, justifyContent: "center" }}>
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
            Welcome back
          </h1>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 28 }}>
            {showOTP ? "Enter the 6-digit code sent to your email" : "Sign in to your DocTrack account"}
          </p>

          <form onSubmit={handleSubmit}>
            {!showOTP ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ color: "#374151", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>
                    Email
                  </label>
                  <div style={{ position: "relative" }}>
                    <MdMailOutline
                      style={{
                        position: "absolute",
                        left: 11,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#9ca3af",
                        fontSize: 16,
                        pointerEvents: "none",
                      }}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ ...inputStyle, paddingLeft: 34 }}
                      placeholder="you@example.com"
                      required
                      onFocus={(e) => (e.target.style.borderColor = "#111111")}
                      onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ color: "#374151", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>
                    Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <MdLockOutline
                      style={{
                        position: "absolute",
                        left: 11,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#9ca3af",
                        fontSize: 16,
                        pointerEvents: "none",
                      }}
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ ...inputStyle, paddingLeft: 34 }}
                      placeholder="••••••••"
                      required
                      onFocus={(e) => (e.target.style.borderColor = "#111111")}
                      onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div style={{ marginBottom: 24 }}>
                <label style={{ color: "#374151", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={{ ...inputStyle, textAlign: "center", fontSize: 24, letterSpacing: 8, fontWeight: 700 }}
                  placeholder="000000"
                  maxLength={6}
                  required
                  autoFocus
                  onFocus={(e) => (e.target.style.borderColor = "#111111")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
                <button
                  type="button"
                  onClick={() => setShowOTP(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6b7280",
                    fontSize: 13,
                    marginTop: 10,
                    cursor: "pointer",
                    fontFamily: "'Inter', sans-serif",
                    padding: 0,
                  }}
                >
                  ← Back to login
                </button>
              </div>
            )}

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
              {loading ? (showOTP ? "Verifying…" : "Signing in…") : (showOTP ? "Verify OTP" : "Sign in")}
            </button>
          </form>

          <p style={{ color: "#6b7280", fontSize: 14, marginTop: 22, textAlign: "center" }}>
            Don&apos;t have an account?{" "}
            <Link to="/register" style={{ color: "#111111", textDecoration: "none", fontWeight: 600 }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
