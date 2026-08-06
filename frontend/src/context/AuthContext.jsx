import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import { decodeToken } from "../utils/jwt";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));
  const [user, setUser] = useState(() => decodeToken(localStorage.getItem("access_token")));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If any request comes back 401, the axios interceptor fires this event.
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const login = useCallback(async (employeeId, password) => {
    setLoading(true);
    setError(null);
    try {
      // OAuth2PasswordRequestForm on the backend expects form-urlencoded
      // data with a `username` field carrying the employee_id.
      const form = new URLSearchParams();
      form.append("username", employeeId);
      form.append("password", password);

      const { data } = await api.post("/auth/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      console.log("LOGIN RESPONSE:", data);

      const decoded = decodeToken(data.access_token);
      if (!decoded) {
        throw new Error("Received an invalid token from the server.");
      }

      localStorage.setItem("access_token", data.access_token);
      setToken(data.access_token);
      setUser(decoded);
      return decoded;
    } catch (err) {
      const message =
        err.response?.data?.detail || "Incorrect employee ID or password.";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    token,
    user, // { employeeId, role, userId, exp } or null
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "ADMIN",
    loading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
