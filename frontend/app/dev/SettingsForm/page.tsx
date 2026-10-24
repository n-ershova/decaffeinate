"use client";

import { useState } from "react";
import SafetyNotice from "@/components/SafetyNotice";
import SettingsForm from "@/components/SettingsForm";
import { MOCK_USER } from "@/lib/fixtures";
import type { User } from "@/lib/types";

export default function Preview() {
  const [user, setUser] = useState<User>(MOCK_USER);
  return (
    <>
      <h1>SettingsForm + SafetyNotice</h1>
      <div style={{ display: "grid", gap: 56, maxWidth: 480, marginTop: 32 }}>
        <SettingsForm user={user} onSave={setUser} />
        <pre style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{JSON.stringify(user, null, 2)}</pre>
        <SafetyNotice />
      </div>
    </>
  );
}
