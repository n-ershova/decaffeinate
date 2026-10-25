import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("recognized drink ownership", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_MOCK", "0");
    vi.stubGlobal("localStorage", { getItem: () => "7" });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it.each(["text", "photo"] as const)("saves a %s drink to the profile whose history is read", async (source) => {
    const saved: { user_id: number; drink_key: string; mg: number }[] = [];
    vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
      if (init?.method === "POST") {
        const form = init.body as FormData;
        const drink = { user_id: Number(form.get("user_id")), drink_key: "espresso", mg: 63 };
        saved.push(drink);
        return Response.json({ logged: drink });
      }
      const userId = Number(new URL(url).searchParams.get("user_id"));
      return Response.json(saved.filter((d) => d.user_id === userId));
    }));
    const { identifyDrink, getDrinks } = await import("./api");

    await identifyDrink({ source, ...(source === "text" ? { text: "espresso" } : { image: new Blob(["photo"]) }) });

    expect(await getDrinks(7)).toEqual([{ user_id: 7, drink_key: "espresso", mg: 63 }]);
    expect(await getDrinks(1)).toEqual([]);
  });

  it.each([
    { stored: "7", explicit: 9, expected: "9" },
    { stored: null, explicit: undefined, expected: "1" },
  ])("uses explicit user $explicit or the default when no profile exists", async ({ stored, explicit, expected }) => {
    vi.stubGlobal("localStorage", { getItem: () => stored });
    const fetch = vi.fn(async () => Response.json({ logged: null }));
    vi.stubGlobal("fetch", fetch);
    const { identifyDrink } = await import("./api");

    await identifyDrink({ text: "espresso", source: "text", user_id: explicit });

    const form = (fetch.mock.calls[0] as unknown as [string, RequestInit])[1].body as FormData;
    expect(form.get("user_id")).toBe(expected);
  });
});
