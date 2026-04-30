import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AdminPanel from "./pages/AdminPanel";
import Dashboard from "./pages/Dashboard";
import DocumentDetail from "./pages/DocumentDetail";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UploadDocument from "./pages/UploadDocument";
import Chatbot from "./components/Chatbot";


const Layout = ({ children }) => {
  return (
    <div style={{ display: "flex", height: "100vh", background: "#0d0f0c" }}>
      <Sidebar />
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <Navbar />
        <main style={{ background: "#0d0f0c", overflowY: "auto", paddingTop: 56, paddingLeft: 224, minHeight: "100vh" }}>{children}</main>
        <Chatbot />
      </div>

    </div>
  );
};

const AppRoutes = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d0f0c", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 24, height: 24, border: "2px solid rgba(125,255,107,0.2)", borderTopColor: "#7DFF6B", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />}
      />

      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/upload"
        element={
          <ProtectedRoute allowedRoles={["employee", "admin", "manager"]}>
            <Layout>
              <UploadDocument />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/documents/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <DocumentDetail />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <AdminPanel />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer position="bottom-right" theme="light" />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
