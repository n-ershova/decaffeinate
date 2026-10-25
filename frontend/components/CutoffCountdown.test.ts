import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import CutoffCountdown, { cutoffDeadline } from "./CutoffCountdown";

const date = (hour: number, minute = 0, second = 0) => new Date(2026, 9, 25, hour, minute, second);
const render = (deadline: number, now: number) => renderToStaticMarkup(createElement(CutoffCountdown, { deadline, now }));

describe("caffeine cutoff countdown", () => {
  it("resolves the cutoff on the current local calendar day", () => {
    expect(cutoffDeadline("14:10", date(9))).toBe(date(14, 10).getTime());
  });

  it("omits missing or invalid cutoff times", () => {
    for (const cutoff of [null, "", "25:00", "12:60", "bad"]) expect(cutoffDeadline(cutoff, date(9))).toBeNull();
  });

  it("shows hours, minutes and seconds without an urgent warning when time remains", () => {
    const html = render(date(14, 10).getTime(), date(12, 5, 8).getTime());
    expect(html).toContain("02:04:52");
    expect(html).toContain('role="timer"');
    expect(html).toContain('aria-live="off"');
    expect(html).not.toContain("var(--red)");
    expect(html).not.toContain("Your cutoff is approaching");
  });

  it("turns red exactly 30 minutes before the deadline", () => {
    const deadline = date(14, 10).getTime();
    expect(render(deadline, date(13, 39, 59).getTime())).not.toContain("var(--red)");
    const html = render(deadline, date(13, 40).getTime());
    expect(html).toContain("00:30:00");
    expect(html).toContain("var(--red)");
    expect(html).toContain("Your cutoff is approaching");
  });

  it("stops at the deadline instead of displaying negative time", () => {
    const deadline = date(14, 10).getTime();
    expect(render(deadline, deadline - 1000)).toContain("00:00:01");
    for (const now of [deadline, deadline + 1000]) {
      const html = render(deadline, now);
      expect(html).toContain("Cutoff reached");
      expect(html).not.toContain('role="timer"');
    }
  });

  it("does not silently restart an expired countdown after midnight", () => {
    const deadline = cutoffDeadline("23:59", date(23, 58))!;
    const tomorrow = new Date(2026, 9, 26, 0, 1).getTime();
    expect(render(deadline, tomorrow)).toContain("Cutoff reached");
  });
});
