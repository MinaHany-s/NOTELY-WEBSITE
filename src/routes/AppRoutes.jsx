import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import AdminRoute from "./AdminRoute.jsx";
import AppLayout from "../components/layout/AppLayout.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";
import RegisterPage from "../pages/auth/RegisterPage.jsx";
import DashboardPage from "../pages/dashboard/DashboardPage.jsx";
import NotesPage from "../pages/notes/NotesPage.jsx";
import NoteEditorPage from "../pages/notes/NoteEditorPage.jsx";
import NoteDetailsPage from "../pages/notes/NoteDetailsPage.jsx";
import StatisticsPage from "../pages/notes/StatisticsPage.jsx";
import SettingsPage from "../pages/settings/SettingsPage.jsx";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage.jsx";
import UsersPage from "../pages/admin/UsersPage.jsx";
import UserDetailsPage from "../pages/admin/UserDetailsPage.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingScreen from "../components/common/LoadingScreen.jsx";

function PublicOnly({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen message="Checking your session..." />;
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="notes" element={<NotesPage view="all" />} />
          <Route path="pinned" element={<NotesPage view="pinned" />} />
          <Route path="archived" element={<NotesPage view="archived" />} />
          <Route path="trash" element={<NotesPage view="trash" />} />
          <Route path="notes/new" element={<NoteEditorPage />} />
          <Route path="notes/:id/edit" element={<NoteEditorPage />} />
          <Route path="notes/:id" element={<NoteDetailsPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route element={<AdminRoute />}>
            <Route path="admin" element={<AdminDashboardPage />} />
            <Route path="admin/users" element={<UsersPage />} />
            <Route path="admin/users/:id" element={<UserDetailsPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
