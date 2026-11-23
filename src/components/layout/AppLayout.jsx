import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Archive, BarChart3, FileText, LayoutDashboard, LogOut,
  Menu, Moon, Pin, Plus, Search, Settings, Shield, Sun, Trash2, Users, X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import { getInitials } from "../../utils/format.js";
import Button from "../common/Button.jsx";
import ButtonLoader from "../common/ButtonLoader.jsx";
import LanguageSwitcher from "../common/LanguageSwitcher.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

const primaryLinks = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/notes", label: "All notes", icon: FileText },
  { to: "/pinned", label: "Pinned", icon: Pin },
  { to: "/archived", label: "Archived", icon: Archive },
  { to: "/trash", label: "Trash", icon: Trash2 },
  { to: "/statistics", label: "Statistics", icon: BarChart3 },
];

function getActiveSection(pathname) {
  if (pathname.startsWith("/admin/users")) return "Manage users";
  if (pathname === "/admin") return "Admin dashboard";
  if (pathname === "/settings") return "Settings";
  if (pathname === "/notes/new") return "New note";
  if (pathname.endsWith("/edit")) return "Edit note";
  if (/^\/notes\/[^/]+$/.test(pathname)) return "Note details";
  return primaryLinks.find((link) =>
    link.to === "/" ? pathname === "/" : pathname.startsWith(link.to),
  )?.label || "Your workspace";
}

export default function AppLayout() {
  const { user, isAdmin, signOut } = useAuth();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dark, setDark] = useState(() => localStorage.getItem("notely-theme") === "dark");
  const [loggingOut, setLoggingOut] = useState(false);
  const searchInput = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  useEffect(() => {
    function handleShortcut(event) {
      if (event.key === "Escape") setSidebarOpen(false);
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInput.current?.focus();
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("notely-theme", next ? "dark" : "light");
  }

  function submitSearch(event) {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/notes?search=${encodeURIComponent(query)}` : "/notes");
    setSidebarOpen(false);
  }

  async function handleSignOut() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await signOut();
      toast.success(t("You’re signed out"));
      navigate("/login");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoggingOut(false);
    }
  }

  const activeSection = getActiveSection(location.pathname);

  return (
    <div className="app-shell">
      {sidebarOpen && <button className="mobile-backdrop" aria-label={t("Close menu")} onClick={() => setSidebarOpen(false)} />}
      <aside id="primary-navigation" className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <span className="brand-mark"><FileText size={19} /></span>
          <span className="brand-name">notely<span className="brand-dot">.</span></span>
          <button className="icon-button sidebar-close" aria-label={t("Close menu")} onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>
        <div className="workspace-switch">
          <span className="workspace-avatar">N</span>
          <span className="workspace-copy"><strong>{t("Personal space")}</strong><small>{t("Free workspace")}</small></span>
        </div>

        <div className="nav-caption">{t("Workspace")}</div>
        <nav className="sidebar-nav" aria-label={t("Main navigation")}>
          {primaryLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <Icon size={17} strokeWidth={1.8} /><span>{t(label)}</span>
            </NavLink>
          ))}
        </nav>

        {isAdmin && (
          <>
            <div className="nav-caption admin-caption">{t("Administration")}</div>
            <nav className="sidebar-nav">
              <NavLink to="/admin" end onClick={() => setSidebarOpen(false)} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}><Shield size={17} /><span>{t("Admin dashboard")}</span></NavLink>
              <NavLink to="/admin/users" onClick={() => setSidebarOpen(false)} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}><Users size={17} /><span>{t("Manage users")}</span></NavLink>
            </nav>
          </>
        )}

        <div className="sidebar-spacer" />
        <div className="sidebar-bottom">
          <LanguageSwitcher className="sidebar-language" />
          <NavLink to="/settings" onClick={() => setSidebarOpen(false)} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}><Settings size={17} /><span>{t("Settings")}</span></NavLink>
          <div className="sidebar-user">
            <span className="avatar">{getInitials(user) || "N"}</span>
            <span className="sidebar-user-copy"><strong dir="auto">{user?.firstName} {user?.lastName}</strong><small dir="ltr">{user?.email}</small></span>
            <button className="icon-button" aria-label={t(loggingOut ? "Signing out..." : "Sign out")} aria-busy={loggingOut || undefined} title={t(loggingOut ? "Signing out..." : "Sign out")} disabled={loggingOut} onClick={handleSignOut}>{loggingOut ? <ButtonLoader /> : <LogOut size={16} />}</button>
          </div>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label={t("Open menu")} aria-controls="primary-navigation" aria-expanded={sidebarOpen} onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div className="breadcrumb"><span>{t("Workspace")}</span><span className="breadcrumb-slash">/</span><strong>{t(activeSection)}</strong></div>
          <div className="topbar-actions">
            <form className="search-field" onSubmit={submitSearch}>
              <Search size={16} />
              <input ref={searchInput} aria-label={t("Search notes")} placeholder={t("Search notes...")} value={search} onChange={(event) => setSearch(event.target.value)} />
              <kbd>⌘ K</kbd>
            </form>
            <button className="icon-button theme-toggle" aria-label={t(dark ? "Switch to light mode" : "Switch to dark mode")} onClick={toggleTheme}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <Button size="sm" onClick={() => navigate("/notes/new")}><Plus size={16} /> {t("New note")}</Button>
          </div>
        </header>
        <main className="main-content"><Outlet /></main>
      </div>
    </div>
  );
}
