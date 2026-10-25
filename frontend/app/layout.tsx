import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import AppShell from "@/components/AppShell";
import AuthGate from "@/components/AuthGate";
import "./globals.css";

export const metadata: Metadata = {
  title: "Decaffeinate",
  description: "Know your caffeine half-life. Know your cutoff.",
  manifest: "/manifest.json",
  icons: { icon: "/icons/icon.svg", apple: "/icons/icon-192.png" },
  appleWebApp: { capable: true, title: "Decaffeinate", statusBarStyle: "black-translucent" },
};
export const viewport: Viewport = { themeColor: "#F4F4F1", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body><AuthGate><AppShell>{children}</AppShell></AuthGate></body>
    </html>
  );
}
