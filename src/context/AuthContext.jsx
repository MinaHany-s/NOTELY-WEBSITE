import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth.api.js";
import { getCurrentUser } from "../api/users.api.js";
import { clearAccessToken, refreshAccessToken } from "../api/axios.js";
import { getErrorMessage } from "../utils/errors.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("restoring");

  const loadUser = useCallback(async () => {
    const response = await getCurrentUser();
    const currentUser = response?.data;
    if (!currentUser) throw new Error("The current-user response did not include user data.");
    setUser(currentUser);
    return currentUser;
  }, []);

  const signIn = useCallback(async (credentials) => {
    await authApi.login(credentials);
    const currentUser = await loadUser();
    setStatus("authenticated");
    return currentUser;
  }, [loadUser]);

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      clearAccessToken();
      setUser(null);
      setStatus("unauthenticated");
      throw new Error(getErrorMessage(error, "Unable to complete sign out."));
    }
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const refreshUser = useCallback(async () => {
    const response = await getCurrentUser();
    setUser(response.data);
    setStatus("authenticated");
    return response.data;
  }, []);

  useEffect(() => {
    let active = true;
    const onExpired = () => {
      setUser(null);
      clearAccessToken();
      setStatus("unauthenticated");
    };
    window.addEventListener("notely:session-expired", onExpired);

    const restoreSession = async () => {
      let restored = false;
      let lastRefreshError = null;

      for (let attempt = 0; attempt < 2 && active; attempt += 1) {
        try {
          await refreshAccessToken();
          const response = await getCurrentUser();
          const currentUser = response?.data;
          if (!currentUser) throw new Error("The current-user response did not include user data.");
          if (active) {
            setUser(currentUser);
            setStatus("authenticated");
          }
          restored = true;
          break;
        } catch (error) {
          lastRefreshError = error;
          const statusCode = error?.response?.status;
          if (statusCode === 401) break;
          if (statusCode && statusCode !== 408 && statusCode !== 429 && statusCode >= 400) break;
          if (attempt < 1) await new Promise((resolve) => window.setTimeout(resolve, 300));
        }
      }

      if (!restored && active) {
        const statusCode = lastRefreshError?.response?.status;
        if (statusCode === 401) {
          clearAccessToken();
          setUser(null);
          setStatus("unauthenticated");
        } else {
          setStatus("unknown");
        }
      }
    };

    void (async () => {
      try {
        await restoreSession();
      } catch {
        if (active) setStatus("unknown");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
      window.removeEventListener("notely:session-expired", onExpired);
    };
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    status,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "admin",
    signIn,
    signOut,
    refreshUser,
  }), [user, loading, signIn, signOut, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
