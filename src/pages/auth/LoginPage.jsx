import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, FileText, LockKeyhole, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import { getErrorMessage } from "../../utils/errors.js";
import Button from "../../components/common/Button.jsx";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(event) {
    event.preventDefault();
    if (!form.email.trim() || !form.password) return toast.error("Enter your email and password.");
    setBusy(true);
    try {
      await signIn({ email: form.email.trim(), password: form.password });
      toast.success("Welcome back");
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to sign in."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-brand"><span className="brand-mark"><FileText size={19} /></span><span>notely<span className="brand-dot">.</span></span></div>
      <section className="auth-card">
        <span className="auth-kicker">YOUR SPACE, IN ORDER</span>
        <h1>Welcome back</h1>
        <p className="muted">Pick up right where your thoughts left off.</p>
        <form className="form-stack auth-form" onSubmit={submit} noValidate>
          <label className="field-label">Email address
            <span className="input-wrap"><Mail size={17} /><input type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></span>
          </label>
          <label className="field-label">Password
            <span className="input-wrap"><LockKeyhole size={17} /><input type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /><button type="button" className="input-action" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>
          </label>
          <Button type="submit" className="auth-submit" size="lg" loading={busy} loadingLabel="Signing in...">Sign in <span>→</span></Button>
        </form>
        <p className="auth-switch">New to Notely? <Link to="/register">Create an account</Link></p>
      </section>
      <div className="auth-footnote">A little more clarity, every day.</div>
    </div>
  );
}
