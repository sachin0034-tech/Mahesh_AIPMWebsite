import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProjectUser } from "@/contexts/ProjectUserContext";
import { McBackground, Nav, ArrowRight } from "@/components/McShared";
import "./CohortProjects.css";
import "./Builder.css";

export const SignupPage = (): JSX.Element => {
  const { signup, isLoggedIn } = useProjectUser();
  const justSignedUp = React.useRef(false);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shown, setShown] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (isLoggedIn && !justSignedUp.current) navigate("/my-projects", { replace: true });
  }, [isLoggedIn]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const next: Record<string, string> = {};
    if (!/^[A-Za-z0-9._-]{3,40}$/.test(username.trim())) next.username = "3-40 characters: letters, numbers, . _ -";
    if (!/^[A-Za-z0-9._-]{3,40}$/.test(email.trim())) next.email = "3-40 characters: letters, numbers, . _ - (no @)";
    if (password.length < 8) next.password = "At least 8 characters";
    if (confirm !== password) next.confirm = "Passwords do not match";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      justSignedUp.current = true;
      await signup(username.trim(), `${email.trim().toLowerCase()}@myaicommunity.org`, password, website);
      navigate("/project-editor/new");
    } catch (err: any) {
      justSignedUp.current = false;
      if (err.field) setErrors({ [err.field]: err.message });
      else setFormError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const field = (
    key: string, label: string, value: string, set: (v: string) => void,
    props: React.InputHTMLAttributes<HTMLInputElement> = {}
  ) => {
    const isPw = props.type === "password";
    const showPw = !!shown[key];
    return (
    <label className="b-field">
      <span className="b-label">{label}</span>
      <div className={isPw ? "b-pw" : undefined}>
        <input
          className={`b-input ${errors[key] ? "is-bad" : ""}`} value={value} required
          onChange={(e) => set(e.target.value)} aria-invalid={!!errors[key]} {...props}
          type={isPw && showPw ? "text" : props.type}
        />
        {isPw && (
          <button type="button" className="b-pw-toggle" onClick={() => setShown((m) => ({ ...m, [key]: !m[key] }))}
            aria-label={showPw ? "Hide password" : "Show password"} aria-pressed={showPw}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {showPw ? (
                <>
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </>
              ) : (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              )}
            </svg>
          </button>
        )}
      </div>
      {errors[key] && <div className="b-err">{errors[key]}</div>}
    </label>
    );
  };

  return (
    <div className="mc">
      <McBackground />
      <Nav />
      <main className="b-main">
        <div className="wrap">
          <div className="b-narrow">
            <div className="b-card">
              <span className="eyebrow">Builders</span>
              <h1>Add your project</h1>
              <p className="b-sub">Create a free account, upload your project and preview how it will look before you publish.</p>

              {formError && <div className="b-alert" role="alert">{formError}</div>}

              <form onSubmit={submit} noValidate>
                {field("email", "Email", email, (v) => setEmail(v.replace(/[@\s]/g, "")), { autoComplete: "off", placeholder: "your-name" })}
                <p className="b-sub" style={{ marginTop: -8 }}>
                  Your email will be <strong>{(email.trim().toLowerCase() || "your-name")}@myaicommunity.org</strong>. Enter the name only (no @); it must be unique.
                </p>
                {field("username", "Username", username, setUsername, { autoComplete: "username", placeholder: "your-username" })}
                {field("password", "Password", password, setPassword, { type: "password", autoComplete: "new-password", placeholder: "At least 8 characters" })}
                {field("confirm", "Confirm password", confirm, setConfirm, { type: "password", autoComplete: "new-password" })}
                <div className="b-hp" aria-hidden="true">
                  <label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
                </div>
                <button type="submit" disabled={loading} className="btn btn-dark b-btn-full">
                  {loading ? "Creating account…" : <>Create account <ArrowRight /></>}
                </button>
              </form>

              <div className="b-foot">Already have an account? <Link to="/project-login">Sign in</Link></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
