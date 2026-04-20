import { useMemo, useState } from "react";

const registerState = { name: "", email: "", password: "" };
const loginState = { email: "", password: "" };

export default function AuthForm({ mode, onSubmit, busy }) {
  const isRegister = mode === "register";
  const [form, setForm] = useState(isRegister ? registerState : loginState);

  const title = useMemo(
    () => (isRegister ? "Start your private journal" : "Continue your story"),
    [isRegister],
  );

  return (
    <form
      className="panel auth-panel"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(form);
      }}
    >
      <div className="panel-header">
        <h2>{title}</h2>
        <p>
          {isRegister
            ? "Create your account, then connect with your partner using an invite code."
            : "Sign in to open your couple snapshots."}
        </p>
      </div>

      {isRegister ? (
        <label className="field">
          <span>Name</span>
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Your name"
            required
          />
        </label>
      ) : null}

      <label className="field">
        <span>Email</span>
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          placeholder="name@example.com"
          required
        />
      </label>

      <label className="field">
        <span>Password</span>
        <input
          type="password"
          value={form.password}
          onChange={(event) =>
            setForm((current) => ({ ...current, password: event.target.value }))
          }
          placeholder="At least 8 characters"
          required
        />
      </label>

      <button type="submit" className="primary-button" disabled={busy}>
        {busy ? "Please wait..." : isRegister ? "Create journal" : "Open snapshots"}
      </button>
    </form>
  );
}
