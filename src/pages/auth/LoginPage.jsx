import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, FileText, LockKeyhole, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import { getErrorMessage } from "../../utils/errors.js";
import Button from "../../components/common/Button.jsx";
import CaptchaChallenge from "../../components/auth/CaptchaChallenge.jsx";
import LanguageSwitcher from "../../components/common/LanguageSwitcher.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function LoginPage() {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [captcha, setCaptcha] = useState("");
  const [captchaRefreshKey, setCaptchaRefreshKey] = useState(0);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(event) {
    event.preventDefault();
    if (!form.email.trim() || !form.password) return toast.error(t("Enter your email and password."));
    if (!captcha.trim()) return toast.error(t("Enter the CAPTCHA text."));
    setBusy(true);
    try {
      await signIn({ email: form.email.trim(), password: form.password, captcha });
      toast.success(t("Welcome back"));
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (error) {
      setCaptcha("");
      setCaptchaRefreshKey((key) => key + 1);
      toast.error(getErrorMessage(error, t("Unable to sign in.")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-topline">
        <div className="auth-brand"><span className="brand-mark"><FileText size={19} /></span><span>notely<span className="brand-dot">.</span></span></div>
        <LanguageSwitcher />
      </div>
      <section className="auth-card">
        <span className="auth-kicker">{t("YOUR SPACE, IN ORDER")}</span>
        <h1>{t("Welcome back")}</h1>
        <p className="muted">{t("Pick up right where your thoughts left off.")}</p>
        <form className="form-stack auth-form" onSubmit={submit} noValidate>
          <label className="field-label">{t("Email address")}
            <span className="input-wrap"><Mail size={17} /><input type="email" autoComplete="email" dir="ltr" placeholder="you@example.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></span>
          </label>
          <label className="field-label">{t("Password")}
            <span className="input-wrap"><LockKeyhole size={17} /><input type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder={t("Enter your password")} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /><button type="button" className="input-action" onClick={() => setShowPassword(!showPassword)} aria-label={t(showPassword ? "Hide password" : "Show password")}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>
          </label>
          <CaptchaChallenge value={captcha} onChange={setCaptcha} refreshKey={captchaRefreshKey} />
          <Button type="submit" className="auth-submit" size="lg" loading={busy} loadingLabel="Signing in...">{t("Sign in")} <span>→</span></Button>
        </form>
        <p className="auth-switch">{t("New to Notely?")} <Link to="/register">{t("Create an account")}</Link></p>
      </section>
      <div className="auth-footnote">{t("A little more clarity, every day.")}</div>
    </div>
  );
}
