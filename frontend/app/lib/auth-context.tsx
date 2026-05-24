"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authSession } from "./auth-session";

type AuthContextValue = {
  token: string | null;
  email: string | null;
  setToken: (token: string | null) => void;
  setEmail: (email: string | null) => void;
  clear: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() =>
    authSession.getToken(),
  );
  const [email, setEmailState] = useState<string | null>(() =>
    authSession.getEmail(),
  );

  useEffect(() => {
    // Keep localStorage in sync if something else modifies it externally
    const onStorage = (e: StorageEvent) => {
      if (e.key === "zojapay-auth-token") {
        setTokenState(authSession.getToken());
      }
      if (e.key === "zojapay-auth-email") {
        setEmailState(authSession.getEmail());
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setToken = useCallback((t: string | null) => {
    if (t) authSession.setToken(t);
    else authSession.clearToken();
    setTokenState(t);
  }, []);

  const setEmail = useCallback((e: string | null) => {
    if (e) authSession.setEmail(e);
    else authSession.clearEmail();
    setEmailState(e);
  }, []);

  const clear = useCallback(() => {
    authSession.clearToken();
    authSession.clearEmail();
    setTokenState(null);
    setEmailState(null);
  }, []);

  const value = useMemo(
    () => ({ token, email, setToken, setEmail, clear }),
    [token, email, setToken, setEmail, clear],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
