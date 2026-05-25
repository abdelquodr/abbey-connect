import { authSession } from "./auth-session";

const DEFAULT_BACKEND_BASE_URL = "http://localhost:3000";
const DEFAULT_REQUEST_TIMEOUT_MS = 30000;
const AUTH_REFRESH_PATH = "/v1/auth/refresh-tokens";
const AUTH_UNAUTHORIZED_EVENT = "zojapay-auth-unauthorized";

const AUTH_PATH_PREFIXES = [
  "/v1/auth/login",
  "/v1/auth/logout",
  "/v1/auth/register",
  "/v1/auth/refresh-tokens",
  "/v1/auth/forgot-password",
  "/v1/auth/reset-password",
  "/v1/auth/send-verification-email",
  "/v1/auth/verify-email",
  "/v1/auth/resend-verification-email",
];

let authRefreshPromise: Promise<boolean> | null = null;

export const BACKEND_BASE_URL = DEFAULT_BACKEND_BASE_URL;

export const backendUrl = (path: string) => {
  const normalizedPath = path.replace(/^\/+/, "");
  return `${BACKEND_BASE_URL}/${normalizedPath}`;
};

type BackendRequestOptions = RequestInit & {
  timeoutMs?: number;
};

export class BackendApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "BackendApiError";
    this.status = status;
    this.details = details;
  }
}

const extractNestedToken = (value: unknown): string | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const directToken =
    typeof record.token === "string"
      ? record.token
      : typeof record.access_token === "string"
        ? record.access_token
        : typeof record.accessToken === "string"
          ? record.accessToken
          : null;

  if (directToken) {
    return directToken;
  }

  const tokenFromTokens = extractNestedToken(record.tokens);
  if (tokenFromTokens) {
    return tokenFromTokens;
  }

  const tokenFromData = extractNestedToken(record.data);
  if (tokenFromData) {
    return tokenFromData;
  }

  for (const valueEntry of Object.values(record)) {
    const nestedToken = extractNestedToken(valueEntry);
    if (nestedToken) {
      return nestedToken;
    }
  }

  return null;
};

const getRequestPath = (pathOrUrl: string) => {
  try {
    return new URL(pathOrUrl).pathname;
  } catch {
    return pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  }
};

const shouldSkipAuthRefresh = (path: string) =>
  AUTH_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));

const cloneHeaders = (headers?: HeadersInit, token?: string | null) => {
  const requestHeaders = new Headers(headers ?? {});
  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }
  return requestHeaders;
};

const readResponsePayload = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return await response.text();
    }
  }

  return response.text();
};

const parseBackendResponse = async <T>(response: Response): Promise<T> => {
  const data = await readResponsePayload(response);

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : ((data as { message?: string; error?: string }).message ??
          (data as { message?: string; error?: string }).error ??
          "Request failed");

    throw new BackendApiError(message, response.status, data);
  }

  return data as T;
};

const refreshAuthSession = async () => {
  if (!authRefreshPromise) {
    authRefreshPromise = (async () => {
      const response = await fetch(backendUrl(AUTH_REFRESH_PATH), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await readResponsePayload(response);
      const nextToken = extractNestedToken(data);
      if (nextToken) {
        authSession.setToken(nextToken);
      }

      return true;
    })().finally(() => {
      authRefreshPromise = null;
    });
  }

  return authRefreshPromise;
};

const clearClientSession = () => {
  authSession.clearToken();
  authSession.clearEmail();
};

const notifyUnauthorized = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
};

const requestWithAutomaticRefresh = async <T>(
  url: string,
  init: BackendRequestOptions,
  canRefresh: boolean,
): Promise<T> => {
  const requestInit: RequestInit = { ...init };
  if ("timeoutMs" in requestInit) {
    delete (requestInit as BackendRequestOptions).timeoutMs;
  }

  const response = await fetch(url, {
    ...requestInit,
    credentials: "include",
    headers: cloneHeaders(requestInit.headers, authSession.getToken()),
  });

  if (response.status === 401 && canRefresh) {
    const refreshed = await refreshAuthSession();
    if (refreshed) {
      const retryResponse = await fetch(url, {
        ...requestInit,
        credentials: "include",
        headers: cloneHeaders(requestInit.headers, authSession.getToken()),
      });

      if (retryResponse.status !== 401) {
        return parseBackendResponse<T>(retryResponse);
      }
    }

    clearClientSession();
    notifyUnauthorized();
  }

  return parseBackendResponse<T>(response);
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  return parseBackendResponse<T>(response);
};

export const backendRequest = async <T>(
  path: string,
  init: BackendRequestOptions = {},
): Promise<T> => {
  const timeoutMs = Number.isFinite(init.timeoutMs)
    ? Math.max(1000, Number(init.timeoutMs))
    : DEFAULT_REQUEST_TIMEOUT_MS;
  const controller = new AbortController();
  let didTimeout = false;
  const timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);
  const externalSignal = init.signal;
  const abortFromExternal = () => controller.abort();

  const requestInit: RequestInit = { ...init };
  if ("timeoutMs" in requestInit) {
    delete (requestInit as BackendRequestOptions).timeoutMs;
  }

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener("abort", abortFromExternal, {
        once: true,
      });
    }
  }

  try {
    const requestPath = getRequestPath(path);
    return await requestWithAutomaticRefresh<T>(
      backendUrl(path),
      {
        ...requestInit,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(requestInit.headers ?? {}),
        },
      },
      !shouldSkipAuthRefresh(requestPath),
    );
  } catch (error) {
    if (error instanceof BackendApiError) {
      throw error;
    }

    const errorName =
      typeof error === "object" && error !== null && "name" in error
        ? String((error as { name?: unknown }).name)
        : "";

    if (errorName === "AbortError") {
      if (externalSignal?.aborted) {
        throw new BackendApiError("Request was cancelled", 499, error);
      }

      if (didTimeout) {
        throw new BackendApiError(
          "Request timed out. Please try again.",
          408,
          error,
        );
      }

      throw new BackendApiError("Request was cancelled", 0, error);
    }

    if (error instanceof TypeError) {
      throw new BackendApiError(
        "Network error. Please check your internet connection and try again.",
        0,
        error,
      );
    }

    throw new BackendApiError("Unexpected error. Please try again.", 0, error);
  } finally {
    clearTimeout(timeoutId);
    if (externalSignal) {
      externalSignal.removeEventListener("abort", abortFromExternal);
    }
  }
};

export const backendFetcher = async <T>(url: string): Promise<T> => {
  return requestWithAutomaticRefresh<T>(
    url,
    { method: "GET" },
    !shouldSkipAuthRefresh(getRequestPath(url)),
  );
};

export const getUnauthorizedEventName = () => AUTH_UNAUTHORIZED_EVENT;
