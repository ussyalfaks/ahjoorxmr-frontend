import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  authRequiredEventName,
  clearAuthToken,
  getAuthToken,
  storeAuthToken,
} from "../authToken";
import { httpAdapter } from "../httpAdapter";

describe("SEP-10 session token", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    window.sessionStorage.clear();
    window.localStorage.clear();
    clearAuthToken();
    vi.useRealTimers();
  });

  it("persists tokens in sessionStorage and restores them", () => {
    storeAuthToken("session-token", undefined, 60);

    expect(window.sessionStorage.getItem("ahjoor_sep10_session")).toContain("session-token");
    expect(window.localStorage.getItem("ahjoor_sep10_session")).toBeNull();
    expect(getAuthToken()).toBe("session-token");
  });

  it("attaches the session as a bearer token to API requests", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } })
    );
    vi.stubGlobal("fetch", fetchMock);
    storeAuthToken("session-token");

    await httpAdapter.getNotifications();

    const requestHeaders = new Headers(fetchMock.mock.calls[0][1]?.headers);
    expect(requestHeaders.get("Authorization")).toBe("Bearer session-token");
  });

  it("does not attach a prior token to SEP-10 challenge or exchange requests", async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ transaction: "challenge-xdr" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ token: "new-session-token" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );
    vi.stubGlobal("fetch", fetchMock);
    storeAuthToken("prior-session-token");

    await httpAdapter.getAuthChallenge("GABC");
    await httpAdapter.exchangeAuthChallenge("signed-challenge-xdr");

    for (const [, init] of fetchMock.mock.calls) {
      expect(new Headers(init?.headers).get("Authorization")).toBeNull();
    }
  });

  it("clears an invalid token and prompts for re-signing after an API 401", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 401 }));
    vi.stubGlobal("fetch", fetchMock);
    storeAuthToken("invalid-token");
    const onAuthenticationRequired = vi.fn();
    window.addEventListener(authRequiredEventName, onAuthenticationRequired);

    await expect(httpAdapter.getNotifications()).rejects.toThrow("API error 401");
    expect(getAuthToken()).toBeNull();
    expect(onAuthenticationRequired).toHaveBeenCalledOnce();

    window.removeEventListener(authRequiredEventName, onAuthenticationRequired);
  });

  it("clears expired tokens and signals that wallet authentication is required", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    storeAuthToken("expired-token", undefined, 1);
    const onAuthenticationRequired = vi.fn();
    window.addEventListener(authRequiredEventName, onAuthenticationRequired);

    vi.advanceTimersByTime(1000);
    expect(getAuthToken()).toBeNull();
    expect(window.sessionStorage.getItem("ahjoor_sep10_session")).toBeNull();
    expect(onAuthenticationRequired).toHaveBeenCalledOnce();

    window.removeEventListener(authRequiredEventName, onAuthenticationRequired);
  });

  it("reports when the browser cannot store a session token", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage disabled");
    });

    expect(() => storeAuthToken("session-token")).toThrow(
      "Unable to securely store the sign-in session"
    );
  });

});
