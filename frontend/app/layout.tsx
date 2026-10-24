import type { ReactNode } from "react";
import "./globals.css";
export const metadata = { title: "Halflife", description: "Your personal caffeine rhythm" };
export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
