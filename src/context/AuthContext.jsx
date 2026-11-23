import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth.api.js";
import { getCurrentUser } from "../api/users.api.js";
import { clearAccessToken, refreshAccessToken } from "../api/axios.js";
import { getErrorMessage } from "../utils/errors.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const response = await getCurrentUser();
    const currentUser = response?.data;
    if (!currentUser) throw new Error("The current-user response did not include user data.");
    setUser(currentUser);
    return currentUser;
  }, []);

  const signIn = useCallback(async (credentials) => {
    await authApi.login(credentials);
    return loadUser();
  }, [loadUser]);

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      clearAccessToken();
      setUser(null);
      throw new Error(getErrorMessage(error, "Unable to complete sign out."));
    }
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const response = await getCurrentUser();
    setUser(response.data);
    return response.data;
  }, []);

  useEffect(() => {
    let active = true;
    const onExpired = () => {
      setUser(null);
      clearAccessToken();
    };
    window.addEventListener("notely:session-expired", onExpired);

    (async () => {
      try {
        await refreshAccessToken();
        if (!active) return;
        const response = await getCurrentUser();
        const currentUser = response?.data;
        if (!currentUser) throw new Error("The current-user response did not include user data.");
        if (active) setUser(currentUser);
      } catch {
        clearAccessToken();
        if (active) setUser(null);
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
