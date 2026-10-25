"use client";

import { useEffect, useState } from "react";
import { resetPassword } from "@/lib/auth";

export default function Reset() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("token");
    // Keep a token already read: dev Strict Mode runs this twice, after the URL is cleaned.
    setToken((prev) => prev || value);
    // Keep the token out of history and any Referer header from here on.
    if (value) window.history.replaceState(null, "", "/reset");
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    if (password !== data.get("confirm")) { setError("The passwords don't match."); return; }
    setBusy(true); setError(null);
    try {
      await resetPassword(token!, password);
      window.location.assign("/");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not reset your password."); setBusy(false); }
  }

  return (
    <section style={{ maxWidth: 420, margin: "8vh auto" }}>
      <meta name="referrer" content="no-referrer" />
      <p className="wordmark"><span className="wordmark-mark" aria-hidden />Decaffeinate</p>
      <h1 style={{ marginTop: 48 }}>Choose a new password</h1>
      {token === null ? (
        <p className="caption">This link is missing its reset code. Ask for a new link from the sign-in page.</p>
      ) : (
        <>
          <p className="caption">You&apos;ll be signed out on other devices.</p>
          <form onSubmit={submit} style={{ display: "grid", gap: 20, marginTop: 28 }}>
            <label>New password<input className="field" name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} />
              <span className="caption">Use at least 12 characters.</span>
            </label>
            <label>Confirm new password<input className="field" name="confirm" type="password" autoComplete="new-password" required minLength={12} maxLength={128} /></label>
            {error && <p role="alert" style={{ color: "var(--red)", margin: 0 }}>{error}</p>}
            <button className="btn" disabled={busy || !token}>{busy ? "Please wait…" : "Set new password"}</button>
          </form>
        </>
      )}
      <a className="link" href="/login" style={{ display: "inline-block", marginTop: 24 }}>Back to sign in</a>
    </section>
  );
}
