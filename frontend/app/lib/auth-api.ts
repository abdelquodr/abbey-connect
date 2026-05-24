import { BackendApiError, backendRequest } from "./backend-api";

type AuthTokenResponse = {
  token?: string;
  access_token?: string;
  accessToken?: string;
};

type AuthResponse<T = Record<string, unknown>> = T & AuthTokenResponse;

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type VerifyOtpPayload = {
  otp: string;
};

type ResendOtpPayload = {
  email: string;
};

type AuthApiErrorCode =
  | "HTTP_ERROR"
  | "NETWORK_ERROR"
  | "TIMEOUT_ERROR"
  | "ABORTED"
  | "UNEXPECTED_ERROR";

export class AuthApiError extends Error {
  status: number;
  details?: unknown;
  code: AuthApiErrorCode;
  retriable: boolean;

  constructor(
    message: string,
    status: number,
    details?: unknown,
    code: AuthApiErrorCode = "HTTP_ERROR",
    retriable = false,
  ) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    this.details = details;
    this.code = code;
    this.retriable = retriable;
  }
}

const mapBackendError = (error: BackendApiError) => {
  if (error.status === 408) {
    return new AuthApiError(
      error.message,
      error.status,
      error.details,
      "TIMEOUT_ERROR",
      true,
    );
  }

  if (error.status === 499) {
    return new AuthApiError(
      error.message,
      error.status,
      error.details,
      "ABORTED",
      false,
    );
  }

  if (error.status === 0) {
    const isNetworkError = error.message.toLowerCase().includes("network");
    return new AuthApiError(
      error.message,
      error.status,
      error.details,
      isNetworkError ? "NETWORK_ERROR" : "UNEXPECTED_ERROR",
      isNetworkError,
    );
  }

  return new AuthApiError(
    error.message,
    error.status,
    error.details,
    "HTTP_ERROR",
    false,
  );
};

const authRequest = async <T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<T> => {
  try {
    return await backendRequest<T>(path, init);
  } catch (error) {
    if (error instanceof BackendApiError) {
      throw mapBackendError(error);
    }

    throw error;
  }
};

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

export const getAuthTokenFromResponse = (response: unknown) =>
  extractNestedToken(response);

export const authApi = {
  async register(payload: RegisterPayload) {
    return authRequest<AuthResponse>("/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
      timeoutMs: 45000,
    });
  },

  async login(payload: LoginPayload) {
    return authRequest<AuthResponse>("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async verifyOtp(payload: VerifyOtpPayload) {
    return authRequest<AuthResponse>(
      `/v1/auth/verify-email?token=${encodeURIComponent(payload.otp)}`,
      { method: "POST" },
    );
  },

  async resendVerificationEmail(payload: ResendOtpPayload) {
    return authRequest<AuthResponse>("/v1/auth/resend-verification-email", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export type {
  AuthApiErrorCode,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  ResendOtpPayload,
  VerifyOtpPayload,
};
