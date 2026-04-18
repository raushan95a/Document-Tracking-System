import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { disconnectSocket } from "../services/socket";

export const AuthContext = createContext(null);

const getStoredUser = () => {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    localStorage.removeItem("user");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [isAuthLoading, setIsAuthLoading] = useState(!!localStorage.getItem("token"));
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      if (!token) {
        if (isMounted) {
          setIsAuthLoading(false);
        }
        return;
      }

      try {
        const response = await api.get("/auth/profile");

        if (!isMounted) {
          return;
        }

        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setUser(null);
        setToken("");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        disconnectSocket();
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    validateSession();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setIsAuthLoading(false);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", authToken);
  };

  const logout = () => {
    setUser(null);
    setToken("");
    setIsAuthLoading(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    disconnectSocket();
    navigate("/login");
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthLoading,
      login,
      logout,
      isAuthenticated: !!token && !!user,
    }),
    [isAuthLoading, user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
