import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertTriangle, KeyRound, Save, UserRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { changePassword, deleteAccount, updateProfile } from "../../api/users.api.js";
import { clearAccessToken } from "../../api/axios.js";
import { getErrorMessage } from "../../utils/errors.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import Button from "../../components/common/Button.jsx";
import Modal from "../../components/common/Modal.jsx";
import { getInitials } from "../../utils/format.js";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function SettingsPage() {
  const { t } = useLanguage();
  const { user, refreshUser, signOut } = useAuth();
  const [profile, setProfile] = useState({ firstName: user?.firstName || "", lastName: user?.lastName || "", email: user?.email || "" });
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  async function saveProfile(event) {
    event.preventDefault();
    if (!profile.firstName.trim() || !profile.lastName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) return toast.error(t("Enter a first name, last name, and valid email."));
    setSavingProfile(true);
    try {
      await updateProfile({ firstName: profile.firstName.trim(), lastName: profile.lastName.trim(), email: profile.email.trim() });
      await refreshUser();
      toast.success(t("Profile updated"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("Could not update your profile.")));
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(event) {
    event.preventDefault();
    if (!password.currentPassword || password.newPassword.length < 8) return toast.error(t("Enter your current password and a new password of at least 8 characters."));
    setSavingPassword(true);
    try {
      await changePassword(password);
      toast.success(t("Password changed. Please sign in again."));
      clearAccessToken();
      await signOut().catch(() => {});
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, t("Could not change your password.")));
    } finally {
      setSavingPassword(false);
    }
  }

  async function removeAccount() {
    setDeleting(true);
    try {
      await deleteAccount();
      clearAccessToken();
      await signOut().catch(() => {});
      toast.success(t("Your account has been deleted"));
      setShowDelete(false);
      navigate("/register", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, t("Could not delete your account.")));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="page-wrap">
      <PageHeader eyebrow="PREFERENCES" title="Settings" description="Manage your account details and security." />
      <div className="settings-layout">
        <aside className="settings-profile">
          <span className="avatar avatar-large">{getInitials(user) || "N"}</span>
          <div className="settings-profile-copy">
            <h3 dir="auto">{user?.firstName} {user?.lastName}</h3>
            <p className="muted" dir="ltr">{user?.email}</p>
          </div>
          <span className="role-badge">{t(user?.role === "admin" ? "Administrator" : "User")}</span>
        </aside>
        <div className="settings-sections">
          <section className="settings-card">
            <div className="settings-card-title"><span className="settings-icon"><UserRound size={18} /></span><div><h2>{t("Profile information")}</h2><p className="muted">{t("Update the details associated with your account.")}</p></div></div>
            <form className="settings-form" onSubmit={saveProfile}>
              <div className="form-row">
                  <label className="field-label">{t("First name")}<input dir="auto" value={profile.firstName} onChange={(event) => setProfile({ ...profile, firstName: event.target.value })} required /></label>
                  <label className="field-label">{t("Last name")}<input dir="auto" value={profile.lastName} onChange={(event) => setProfile({ ...profile, lastName: event.target.value })} required /></label>
              </div>
                <label className="field-label">{t("Email address")}<input type="email" dir="ltr" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} required /></label>
                <div className="form-actions"><Button type="submit" loading={savingProfile} loadingLabel="Saving..."><Save size={15} /> {t("Save changes")}</Button></div>
            </form>
          </section>

          <section className="settings-card">
            <div className="settings-card-title"><span className="settings-icon"><KeyRound size={18} /></span><div><h2>{t("Password & security")}</h2><p className="muted">{t("Changing your password signs out all active sessions.")}</p></div></div>
            <form className="settings-form" onSubmit={savePassword}>
              <label className="field-label">{t("Current password")}<input type="password" dir="ltr" autoComplete="current-password" value={password.currentPassword} onChange={(event) => setPassword({ ...password, currentPassword: event.target.value })} required /></label>
              <label className="field-label">{t("New password")}<input type="password" dir="ltr" autoComplete="new-password" minLength="8" value={password.newPassword} onChange={(event) => setPassword({ ...password, newPassword: event.target.value })} required /></label>
              <div className="form-actions"><Button type="submit" variant="secondary" loading={savingPassword} loadingLabel="Updating...">{t("Update password")}</Button></div>
            </form>
          </section>

          <section className="settings-card danger-zone">
            <div className="settings-card-title"><span className="settings-icon danger"><AlertTriangle size={18} /></span><div><h2>{t("Delete account")}</h2><p className="muted">{t("Permanently remove your account and all of your notes.")}</p></div></div>
            <div className="danger-row"><span>{t("This action cannot be undone.")}</span><Button variant="danger-outline" onClick={() => setShowDelete(true)}>{t("Delete account")}</Button></div>
          </section>
        </div>
      </div>
      <Modal open={showDelete} title="Delete your account?" description="Your account, notes, and sessions will be permanently deleted. This cannot be undone." onClose={() => !deleting && setShowDelete(false)} onConfirm={removeAccount} confirmLabel="Delete my account" danger busy={deleting} busyLabel="Deleting..." />
    </div>
  );
}
