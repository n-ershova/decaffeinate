"use client";

import SafetyNotice from "@/components/SafetyNotice";
import SettingsForm from "@/components/SettingsForm";
import { getUser, revalidate, useApi, useUserId } from "@/lib/api";

export default function Settings() {
  const userId = useUserId();
  const { data: user } = useApi(userId ? `/users/${userId}` : null, () => getUser(userId!));

  return (
    <div style={{ display: "grid", gap: 56, maxWidth: 480 }}>
      <h1 style={{ margin: 0 }}>Settings</h1>
      {user && <SettingsForm user={user} onSave={() => revalidate("/users")} />}
      <SafetyNotice />
    </div>
  );
}
