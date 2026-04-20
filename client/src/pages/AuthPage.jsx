import { useState } from "react";
import AuthForm from "../components/AuthForm";
import AuthHero from "../components/AuthHero";
import Toast from "../components/Toast";
import { useAuth } from "../state/AuthContext";
import { useTheme } from "../state/ThemeContext";
import { LogIn, UserPlus } from "lucide-react";

export default function AuthPage() {
  const { resendEmailVerification, signIn, signUp, verifyEmailToken } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mode, setMode] = useState("login");
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [feedback, setFeedback] = useState({ tone: "info", message: "" });

  const handleSubmit = async (payload) => {
    setBusy(true);
    setFeedback({ tone: "info", message: "" });

    try {
      if (mode === "login") {
        await signIn(payload);
      } else {
        const data = await signUp(payload);
        setPendingVerificationEmail(payload.email);
        setMode("login");
        setFeedback({
          tone: "success",
          message: data.message || "Check your email to verify your account.",
        });
      }
    } catch (error) {
      if (error.code === "EMAIL_NOT_VERIFIED" && payload.email) {
        setPendingVerificationEmail(payload.email);
      }
      setFeedback({ tone: "error", message: error.message });
    } finally {
      setBusy(false);
    }
  };

  const handleResendVerification = async () => {
    if (!pendingVerificationEmail) {
      return;
    }

    setResendBusy(true);
    setFeedback({ tone: "info", message: "" });

    try {
      const data = await resendEmailVerification(pendingVerificationEmail);
      setFeedback({ tone: "success", message: data.message });
    } catch (error) {
      setFeedback({ tone: "error", message: error.message });
    } finally {
      setResendBusy(false);
    }
  };

  const handleVerifyCode = async (event) => {
    event.preventDefault();

    if (!pendingVerificationEmail) {
      return;
    }

    setVerifyBusy(true);
    setFeedback({ tone: "info", message: "" });

    try {
      await verifyEmailToken({
        email: pendingVerificationEmail,
        code: verificationCode,
      });
      setFeedback({ tone: "success", message: "Email verified successfully." });
    } catch (error) {
      setFeedback({ tone: "error", message: error.message });
    } finally {
      setVerifyBusy(false);
    }
  };

  return (
    <div className="auth-screen">
      <nav className="app-navbar auth-navbar">
        <div className="navbar-brand">
          <span className="navbar-logo">
            <img src="/app-logo.png" alt="" />
          </span>
          <strong>Silent Connection</strong>
        </div>

        <div className="navbar-links">
          <button
            type="button"
            className={`navbar-link auth-nav-link ${mode === "login" ? "active" : ""}`}
            aria-label="Sign in"
            title="Sign in"
            onClick={() => setMode("login")}
          >
            <LogIn size={18} strokeWidth={2.3} />
            <span>Login</span>
          </button>
          <button
            type="button"
            className={`navbar-link auth-nav-link ${mode === "register" ? "active" : ""}`}
            aria-label="Create account"
            title="Create account"
            onClick={() => setMode("register")}
          >
            <UserPlus size={18} strokeWidth={2.3} />
            <span>Join</span>
          </button>

          <button
            type="button"
            className={`theme-switch-button ${isDark ? "is-on" : ""}`}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            aria-pressed={isDark}
            title={isDark ? "Dark mode on" : "Dark mode off"}
            onClick={toggleTheme}
          >
            <span className="theme-switch-track">
              <span className="theme-switch-knob" />
            </span>
          </button>
        </div>
      </nav>

      <div className="auth-layout">
        <AuthHero />

        <div className="auth-column">
          <Toast tone={feedback.tone} message={feedback.message} />
          {pendingVerificationEmail ? (
            <form className="panel verification-panel" onSubmit={handleVerifyCode}>
              <div className="panel-header">
                <h2>Verify your email</h2>
                <p>Enter the 6-digit code sent to {pendingVerificationEmail}.</p>
              </div>
              <label className="field">
                <span>Verification code</span>
                <input
                  inputMode="numeric"
                  maxLength="6"
                  pattern="[0-9]{6}"
                  value={verificationCode}
                  onChange={(event) =>
                    setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="123456"
                  required
                />
              </label>
              <div className="verification-actions">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={verifyBusy || verificationCode.length !== 6}
                >
                  {verifyBusy ? "Verifying..." : "Verify and continue"}
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={handleResendVerification}
                  disabled={resendBusy}
                >
                  {resendBusy ? "Sending..." : "Send code again"}
                </button>
              </div>
            </form>
          ) : null}
          <AuthForm key={mode} mode={mode} onSubmit={handleSubmit} busy={busy} />
        </div>
      </div>
    </div>
  );
}
