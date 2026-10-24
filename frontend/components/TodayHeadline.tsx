import type { Led } from "@/lib/types";

interface Props {
  headline: string;
  cutoff: string | null; // "HH:MM"; already part of the headline text
  led: Led;
}

export default function TodayHeadline({ headline, led }: Props) {
  return (
    <h2
      style={{
        margin: 0, fontSize: "clamp(1.75rem, 5vw, 2.5rem)", lineHeight: 1.15,
        fontWeight: 500, letterSpacing: "-0.025em", color: `var(--${led})`,
      }}
    >
      {headline}
    </h2>
  );
}
