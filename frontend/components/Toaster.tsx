"use client";

import { useEffect, useRef, useState } from "react";
import { onToast } from "@/lib/toast";

const SHOW_MS = 2000;

export default function Toaster() {
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => onToast((m) => {
    if (timer.current) clearTimeout(timer.current);
    setMessage(m);
    setVisible(true);
    timer.current = setTimeout(() => setVisible(false), SHOW_MS);
  }), []);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <div role="status" aria-live="polite" className={`toast${visible ? " show" : ""}`}>
      {message}
    </div>
  );
}
