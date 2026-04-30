import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MdDescription, MdLockOutline, MdMailOutline } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

/* shared input style */
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
        // Step 1: Initial Login
        const response = await api.post("/auth/login", { email, password });
        if (response.data.otpRequired) {
          setShowOTP(true);
          toast.success("OTP sent to your email!");
        } else {
          // Fallback if OTP is not enabled for some reason
          const { token, ...userData } = response.data;
          login(userData, token);
          navigate("/dashboard");
        }
      } else {
        // Step 2: OTP Verification
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
        background: "#0d0f0c",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div style={{ width: "100%", maxWidth: 380 }}>
        {/* logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, justifyContent: "center" }}>
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

        {/* card */}
        <div
          style={{
            background: "#111210",
            border: "1px solid rgba(125,255,107,0.12)",
            borderRadius: 14,
            padding: "32px 28px",
          }}
        >
          <h1 style={{ color: "#e8e8e4", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
            Welcome back
          </h1>
          <p style={{ color: "#697565", fontSize: 13, marginBottom: 28 }}>
            {showOTP ? "Please enter the 6-digit code sent to your email" : "Sign in to your DocTrack account"}
          </p>

          <form onSubmit={handleSubmit}>
            {!showOTP ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ color: "#a8b5a4", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>
                    EMAIL
                  </label>
                  <div style={{ position: "relative" }}>
                    <MdMailOutline
                      style={{
                        position: "absolute",
                        left: 11,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#697565",
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
                      onFocus={(e) => (e.target.style.borderColor = "rgba(125,255,107,0.45)")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(125,255,107,0.15)")}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ color: "#a8b5a4", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>
                    PASSWORD
                  </label>
                  <div style={{ position: "relative" }}>
                    <MdLockOutline
                      style={{
                        position: "absolute",
                        left: 11,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#697565",
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
                      onFocus={(e) => (e.target.style.borderColor = "rgba(125,255,107,0.45)")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(125,255,107,0.15)")}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div style={{ marginBottom: 24 }}>
                <label style={{ color: "#a8b5a4", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>
                  VERIFICATION CODE
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
                  onFocus={(e) => (e.target.style.borderColor = "rgba(125,255,107,0.45)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(125,255,107,0.15)")}
                />
                <button
                  type="button"
                  onClick={() => setShowOTP(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#697565",
                    fontSize: 12,
                    marginTop: 10,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Back to login
                </button>
              </div>
            )}

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
              {loading ? (showOTP ? "Verifying…" : "Signing in…") : (showOTP ? "Verify OTP" : "Sign In")}
            </button>
          </form>

          <p style={{ color: "#697565", fontSize: 13, marginTop: 22, textAlign: "center" }}>
            Don&apos;t have an account?{" "}
            <Link to="/register" style={{ color: "#7DFF6B", textDecoration: "none", fontWeight: 600 }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
