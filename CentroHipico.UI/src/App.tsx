import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProfesorDashboard from "./pages/ProfesorDashboard";
import JineteDashboard from "./pages/JineteDashboard";
import GuestPage from "./pages/GuestPage";
import Bienvenida from "./pages/Bienvenida";

import type { UserRole } from "./types";

function App() {
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole") as UserRole | null;
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  const handleLogin = (newRole: UserRole) => {
    localStorage.setItem("userRole", newRole);
    setRole(newRole);
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    setRole(null);
  };

  return (
    <Routes>
      <Route path="/" element={<Bienvenida />} />

      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

      <Route
        path="/admin"
        element={
          role === "admin" ? (
            <AdminDashboard onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/profesor"
        element={
          role === "profesor" ? (
            <ProfesorDashboard onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/jinete"
        element={
          role === "jinete" ? (
            <JineteDashboard onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/guest"
        element={<GuestPage onLogout={handleLogout} />}
      />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
