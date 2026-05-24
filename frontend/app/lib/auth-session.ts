const AUTH_TOKEN_KEY = "zojapay-auth-token";
const AUTH_EMAIL_KEY = "zojapay-auth-email";

const isBrowser = () => typeof window !== "undefined";

export const authSession = {
  getToken() {
    if (!isBrowser()) {
      return null;
    }

    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  },

  setToken(token: string) {
    if (!isBrowser()) {
      return;
    }

    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  clearToken() {
    if (!isBrowser()) {
      return;
    }

    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  getEmail() {
    if (!isBrowser()) {
      return null;
    }

    return window.localStorage.getItem(AUTH_EMAIL_KEY);
  },

  setEmail(email: string) {
    if (!isBrowser()) {
      return;
    }

    window.localStorage.setItem(AUTH_EMAIL_KEY, email);
  },

  clearEmail() {
    if (!isBrowser()) {
      return;
    }

    window.localStorage.removeItem(AUTH_EMAIL_KEY);
  },
};
