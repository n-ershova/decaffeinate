"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true); setError(null);
    try {
      const body: Record<string, unknown> = { email: data.get("email"), password: data.get("password") };
      if (mode === "register") Object.assign(body, {
        name: data.get("name"), bedtime: data.get("bedtime"),
        smoker: data.has("smoker"), hormonal_bc: data.has("hormonal_bc"),
      });
      await signIn(mode, body);
      window.location.assign("/");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not sign in. Try again."); setBusy(false); }
  }

  return (
    <section style={{ maxWidth: 420, margin: "8vh auto" }}>
      <p className="wordmark"><span className="wordmark-mark" aria-hidden />Decaffeinate</p>
      <h1 style={{ marginTop: 48 }}>{mode === "login" ? "Welcome back" : "Your own caffeine history"}</h1>
      <p className="caption">{mode === "login" ? "Sign in to see your drinks and history." : "Create an account to keep your drinks, sleep and readings together."}</p>
      <form key={mode} onSubmit={submit} style={{ display: "grid", gap: 20, marginTop: 28 }}>
        {mode === "register" && <label>Your name<input className="field" name="name" autoComplete="given-name" required maxLength={100} /></label>}
        <label>Email<input className="field" name="email" type="email" autoComplete="username" required maxLength={254} /></label>
        <label>Password<input className="field" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={12} maxLength={128} />
          {mode === "register" && <span className="caption">Use at least 12 characters.</span>}
        </label>
        {mode === "register" && <>
          <label>Usual bedtime<input className="field" name="bedtime" type="time" defaultValue="23:00" required /></label>
          <label><input type="checkbox" name="smoker" /> I smoke</label>
          <label><input type="checkbox" name="hormonal_bc" /> I use hormonal contraception</label>
          <label className="caption"><input type="checkbox" required /> I am 18 or older, am not pregnant or breastfeeding, and have no heart condition or medication that interacts with caffeine.</label>
          <p className="caption">If any of these apply, please follow your clinician’s advice instead.</p>
        </>}
        {error && <p role="alert" style={{ color: "var(--red)", margin: 0 }}>{error}</p>}
        <button className="btn" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
      </form>
      <button className="link" disabled={busy} style={{ marginTop: 24 }} onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); }}>
        {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>
    </section>
  );
}
