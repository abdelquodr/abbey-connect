const AUTH_TOKEN_KEY = "abbey-auth-token";
const AUTH_EMAIL_KEY = "abbey-auth-email";
const AUTH_SESSION_EVENT = "abbey-auth-session-changed";

const isBrowser = () => typeof window !== "undefined";

const notifySessionChange = () => {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
};

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
    notifySessionChange();
  },

  clearToken() {
    if (!isBrowser()) {
      return;
    }

    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    notifySessionChange();
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
    notifySessionChange();
  },

  clearEmail() {
    if (!isBrowser()) {
      return;
    }

    window.localStorage.removeItem(AUTH_EMAIL_KEY);
    notifySessionChange();
  },

  getSessionEventName() {
    return AUTH_SESSION_EVENT;
  },
};
