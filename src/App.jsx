import { AuthProvider } from "./context/AuthContext.jsx";
import { NotesProvider } from "./context/NotesContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotesProvider>
          <AppRoutes />
        </NotesProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
