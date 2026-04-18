import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, ...userData } = response.data;

      login(userData, token);
      navigate("/dashboard");
    } catch (error) {
      const message = error?.response?.data?.message || "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="bg-cream border border-sage/30 rounded-lg shadow-sm p-8 w-full max-w-sm">
        <h1 className="text-darkest text-2xl font-semibold">Welcome Back</h1>
        <p className="text-sage text-sm mt-1 mb-6">Sign in to DocTrack</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-dark font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full bg-cream border border-sage rounded px-3 py-2 text-darkest focus:outline-none focus:ring-2 focus:ring-dark text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-dark font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full bg-cream border border-sage rounded px-3 py-2 text-darkest focus:outline-none focus:ring-2 focus:ring-dark text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-dark text-cream py-2 rounded hover:bg-darkest font-medium text-sm mt-4 disabled:opacity-70"
          >
            {loading ? "Loading..." : "Sign In"}
          </button>
        </form>

        <p className="text-sage text-sm mt-6">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-dark underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
