import { AuthProvider } from "./context/AuthContext.jsx";
import { NotesProvider } from "./context/NotesContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

export default function App() {
  return (
    <AuthProvider>
      <NotesProvider>
        <AppRoutes />
      </NotesProvider>
    </AuthProvider>
  );
}
