import { afterEach, describe, expect, it, vi } from "vitest";
import { sessionUser, signIn, signOut } from "./auth";

afterEach(() => vi.unstubAllGlobals());

describe("account session requests", () => {
  it("checks the server session with credentials and without caching", async () => {
    const fetch = vi.fn(async () => Response.json({ id: 7, name: "Alice" }));
    vi.stubGlobal("fetch", fetch);
    expect(await sessionUser()).toEqual({ id: 7, name: "Alice" });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/auth/me"), { credentials: "include", cache: "no-store" });
  });

  it("treats an expired session as signed out", async () => {
    vi.stubGlobal("fetch", async () => new Response(null, { status: 401 }));
    expect(await sessionUser()).toBeNull();
  });

  it("takes the profile ID from the authenticated server response", async () => {
    const setItem = vi.fn();
    vi.stubGlobal("localStorage", { setItem });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    const fetch = vi.fn(async () => Response.json({ id: 7, name: "Alice" }));
    vi.stubGlobal("fetch", fetch);
    await signIn("login", { email: "alice@example.test", password: "test-password-123!" });
    expect(setItem).toHaveBeenCalledWith("user_id", "7");
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/auth/login"), expect.objectContaining({ credentials: "include", method: "POST" }));
  });

  it("shows the server's incorrect-password error", async () => {
    vi.stubGlobal("fetch", async () => Response.json({ detail: "Email or password is incorrect" }, { status: 401 }));
    await expect(signIn("login", {})).rejects.toThrow("Email or password is incorrect");
  });

  it("revokes the session before clearing local state and returning to login", async () => {
    const removeItem = vi.fn();
    const assign = vi.fn();
    vi.stubGlobal("localStorage", { removeItem });
    vi.stubGlobal("window", { dispatchEvent: vi.fn(), location: { assign } });
    const fetch = vi.fn(async () => Response.json({ ok: true }));
    vi.stubGlobal("fetch", fetch);
    await signOut();
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/auth/logout"), { method: "POST", credentials: "include" });
    expect(removeItem).toHaveBeenCalledWith("user_id");
    expect(assign).toHaveBeenCalledWith("/login");
  });
});
