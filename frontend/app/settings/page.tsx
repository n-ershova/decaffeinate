"use client";

import Link from "next/link";
import ResetData from "@/components/ResetData";
import SafetyNotice from "@/components/SafetyNotice";
import SettingsForm from "@/components/SettingsForm";
import { getUser, revalidate, useApi, useUserId } from "@/lib/api";

export default function Settings() {
  const userId = useUserId();
  const { data: user } = useApi(userId ? `/users/${userId}` : null, () => getUser(userId!));

  return (
    <div style={{ display: "grid", gap: 56, maxWidth: 480 }}>
      <header>
        <h1 style={{ margin: 0 }}>Settings</h1>
        <Link href="/about" className="link" style={{ display: "inline-block", marginTop: 12, textDecoration: "none" }}>How to use Decaffeinate →</Link>
      </header>
      {user && <SettingsForm user={user} onSave={() => revalidate("/users")} />}
      <SafetyNotice />
      <ResetData />
    </div>
  );
}
