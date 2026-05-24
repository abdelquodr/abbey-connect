export interface TokenResponse {
  token: string;
  expires: Date;
}

export interface AuthTokensResponse {
  access: TokenResponse;
  refresh?: TokenResponse;
}

export interface AuthSessionResponse {
  user: {
    id: number;
    email: string;
    name?: string | null;
    headline?: string | null;
    bio?: string | null;
    city?: string | null;
    avatarUrl?: string | null;
    role: string;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  tokens: AuthTokensResponse;
}
