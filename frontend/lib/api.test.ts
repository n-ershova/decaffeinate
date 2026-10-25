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

describe("model fallback without NEXT_PUBLIC_MOCK_MODEL", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_MOCK", "0");
    vi.stubEnv("NEXT_PUBLIC_MOCK_MODEL", "0");
    vi.stubGlobal("localStorage", { getItem: () => "7" });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  const backend = (stateStatus: number, detail: string) => vi.fn(async (url: string) => {
    const path = new URL(url).pathname;
    if (path === "/state") return Response.json({ detail }, { status: stateStatus });
    if (path === "/drinks") return Response.json([]);
    if (path === "/users/7") return Response.json({ id: 7, name: "A", bedtime: "22:00:00", smoker: false, hormonal_bc: false, tolerance_min: 10, is_simulated: false });
    if (path === "/curve") return Response.json({ now_mg: 0, h: 5, curve: [{ t: new Date().toISOString(), mg: 0 }] });
    return Response.json({}, { status: 404 });
  });

  it("uses stand-in numbers when the backend says the model isn't built", async () => {
    vi.stubGlobal("fetch", backend(503, "Required model tickets are not installed yet"));
    const { getState } = await import("./api");
    const s = await getState(7);
    expect(s.bedtime).toBe("22:00");
    expect(s.headline).toMatch(/^Last coffee today by|No more caffeine today/);
  });

  it("still reports other server errors", async () => {
    vi.stubGlobal("fetch", backend(503, "Presage is down"));
    const { getState } = await import("./api");
    await expect(getState(7)).rejects.toMatchObject({ status: 503, detail: "Presage is down" });
  });
});
