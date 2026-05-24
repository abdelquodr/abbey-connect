import { authApi, AuthApiError } from "../auth-api";

describe("authApi request edge cases", () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
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
});
