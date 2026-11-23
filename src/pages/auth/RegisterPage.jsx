import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, FileText, LockKeyhole, Mail, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { register } from "../../api/auth.api.js";
import { getErrorMessage } from "../../utils/errors.js";
import Button from "../../components/common/Button.jsx";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    if (Object.values(form).some((value) => !value.trim())) return toast.error("Complete every field to continue.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast.error("Enter a valid email address.");
    if (form.password.length < 8) return toast.error("Password must be at least 8 characters.");
    setBusy(true);
    try {
      await register({ ...form, email: form.email.trim() });
      toast.success("Account created. Sign in to get started.");
      navigate("/login");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to create your account."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-brand"><span className="brand-mark"><FileText size={19} /></span><span>notely<span className="brand-dot">.</span></span></div>
      <section className="auth-card">
        <span className="auth-kicker">A CLEARER HEADSPACE</span>
        <h1>Make room for ideas</h1>
        <p className="muted">Create your account and keep every thought close.</p>
        <form className="form-stack auth-form" onSubmit={submit} noValidate>
          <div className="form-row">
            <label className="field-label">First name<span className="input-wrap"><UserRound size={17} /><input autoComplete="given-name" placeholder="Mina" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} /></span></label>
            <label className="field-label">Last name<span className="input-wrap"><UserRound size={17} /><input autoComplete="family-name" placeholder="Hany" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} /></span></label>
          </div>
          <label className="field-label">Email address<span className="input-wrap"><Mail size={17} /><input type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></span></label>
          <label className="field-label">Password<span className="input-wrap"><LockKeyhole size={17} /><input type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="At least 8 characters" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /><button type="button" className="input-action" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
          <Button type="submit" className="auth-submit" size="lg" loading={busy} loadingLabel="Creating account...">Create account <span>→</span></Button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </section>
      <div className="auth-footnote">A little more clarity, every day.</div>
    </div>
  );
}
