import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingScreen from "../components/common/LoadingScreen.jsx";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingScreen message="Checking your session..." />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}
