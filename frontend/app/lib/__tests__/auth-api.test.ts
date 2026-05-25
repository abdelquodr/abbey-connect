import { authApi, AuthApiError } from "../auth-api";
import { backendRequest, BackendApiError } from "../backend-api";
import { authSession } from "../auth-session";

describe("authApi request edge cases", () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    authSession.clearToken();
    authSession.clearEmail();
  });

  it("maps offline or bad-network errors to AuthApiError", async () => {
    jest
      .spyOn(global, "fetch")
      .mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(
      authApi.login({ email: "test@example.com", password: "secret" }),
    ).rejects.toMatchObject<AuthApiError>({
      name: "AuthApiError",
      status: 0,
      code: "NETWORK_ERROR",
      retriable: true,
      message:
        "Network error. Please check your internet connection and try again.",
    });
  });

  it("times out when server is not responsive", async () => {
    jest.useFakeTimers();

    jest.spyOn(global, "fetch").mockImplementation(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          const signal = init?.signal as AbortSignal | undefined;

          signal?.addEventListener("abort", () => {
            reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
          });
        }),
    );

    const pending = authApi.login({
      email: "test@example.com",
      password: "secret",
    });

    jest.advanceTimersByTime(30010);

    await expect(pending).rejects.toMatchObject<AuthApiError>({
      name: "AuthApiError",
      status: 408,
      code: "TIMEOUT_ERROR",
      retriable: true,
      message: "Request timed out. Please try again.",
    });
  });

  it("surfaces API status/message for server errors", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Internal error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      authApi.login({ email: "test@example.com", password: "secret" }),
    ).rejects.toMatchObject<AuthApiError>({
      name: "AuthApiError",
      status: 500,
      code: "HTTP_ERROR",
      message: "Internal error",
    });
  });

  it("refreshes an expired session once and retries the original request", async () => {
    authSession.setToken("expired-token");

    const fetchMock = jest.spyOn(global, "fetch");
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "Please authenticate" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access: { token: "fresh-token" },
            refresh: { token: "refresh-token" },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 1, email: "test@example.com" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    await expect(backendRequest("/v1/users/me")).resolves.toEqual({
      id: 1,
      email: "test@example.com",
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(authSession.getToken()).toBe("fresh-token");
  });

  it("clears the local session when refresh fails", async () => {
    authSession.setToken("expired-token");
    authSession.setEmail("test@example.com");

    jest.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Please authenticate" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      backendRequest("/v1/users/me"),
    ).rejects.toMatchObject<BackendApiError>({
      status: 401,
      message: "Please authenticate",
    });

    expect(authSession.getToken()).toBeNull();
    expect(authSession.getEmail()).toBeNull();
  });
});
