import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminRoute() {
  const { isAdmin, isAuthenticated, loading, status } = useAuth();
  if (loading || status === "restoring") return null;
  return isAuthenticated && isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}
