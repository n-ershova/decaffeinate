"use client";

import { useState } from "react";
import { requestPasswordReset, signIn } from "@/lib/auth";

type Mode = "login" | "register" | "forgot";

const COPY: Record<Mode, { title: string; caption: string; button: string }> = {
  login: { title: "Welcome back", caption: "Sign in to see your drinks and history.", button: "Sign in" },
  register: {
    title: "Your own caffeine history",
    caption: "Create an account to keep your drinks, sleep and readings together.",
    button: "Create account",
  },
  forgot: {
    title: "Reset your password",
    caption: "Enter your account email and we'll send you a link to choose a new password.",
    button: "Send reset link",
  },
};

export default function Login() {
  const [mode, setMode] = useState<Mode>("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  function go(next: Mode) {
    setMode(next); setError(null); setSentTo(null);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true); setError(null);
    try {
      if (mode === "forgot") {
        const email = String(data.get("email"));
        await requestPasswordReset(email);
        setSentTo(email); setBusy(false);
        return;
      }
      const body: Record<string, unknown> = { email: data.get("email"), password: data.get("password") };
      if (mode === "register") body.name = data.get("name");
      await signIn(mode, body);
      // New accounts answer the onboarding questions next.
      window.location.assign(mode === "register" ? "/onboarding" : "/");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not sign in. Try again."); setBusy(false); }
  }

  const copy = COPY[mode];
  return (
    <section style={{ maxWidth: 420, margin: "8vh auto" }}>
      <p className="wordmark"><span className="wordmark-mark" aria-hidden />Decaffeinate</p>
      <h1 style={{ marginTop: 48 }}>{copy.title}</h1>
      <p className="caption">{copy.caption}</p>
      {sentTo ? (
        <p role="status" style={{ marginTop: 28 }}>
          If an account exists for <strong>{sentTo}</strong>, a reset link is on its way. It works for 30 minutes.
        </p>
      ) : (
        <form key={mode} onSubmit={submit} style={{ display: "grid", gap: 20, marginTop: 28 }}>
          {mode === "register" && <label>Your first name<input className="field" name="name" autoComplete="given-name" required maxLength={100} /></label>}
          <label>Email<input className="field" name="email" type="email" autoComplete="username" required maxLength={254} /></label>
          {mode !== "forgot" && (
            <label>Password<input className="field" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={12} maxLength={128} />
              {mode === "register" && <span className="caption">Use at least 12 characters.</span>}
            </label>
          )}
          {mode === "login" && (
            <button type="button" className="link" disabled={busy} style={{ justifySelf: "start", marginTop: -8 }} onClick={() => go("forgot")}>
              Forgot password?
            </button>
          )}
          {error && <p role="alert" style={{ color: "var(--red)", margin: 0 }}>{error}</p>}
          <button className="btn" disabled={busy}>{busy ? "Please wait…" : copy.button}</button>
        </form>
      )}
      <button className="link" disabled={busy} style={{ marginTop: 24 }} onClick={() => go(mode === "login" ? "register" : "login")}>
        {mode === "login" ? "New here? Create an account" : mode === "register" ? "Already have an account? Sign in" : "Back to sign in"}
      </button>
    </section>
  );
}
