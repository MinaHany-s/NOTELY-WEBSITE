import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getNotes, getNotesStats } from "../api/notes.api.js";
import { useAuth } from "./AuthContext.jsx";
import { getErrorMessage } from "../utils/errors.js";

const NotesContext = createContext(null);

export function NotesProvider({ children }) {
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  const [notes, setNotes] = useState({ all: [], archived: [], trashed: [] });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async ({ notify = false } = {}) => {
    if (!userId) {
      setNotes({ all: [], archived: [], trashed: [] });
      setStats(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [allResponse, archivedResponse, trashedResponse, statsResponse] = await Promise.all([
        getNotes({ limit: 100 }),
        getNotes({ archived: true, limit: 100 }),
        getNotes({ trashed: true, limit: 100 }),
        getNotesStats(),
      ]);
      setNotes({
        all: allResponse.data || [],
        archived: archivedResponse.data || [],
        trashed: trashedResponse.data || [],
      });
      setStats(statsResponse.data);
      if (notify) toast.success("Notes updated");
    } catch (error) {
      setError(error);
      toast.error(getErrorMessage(error, "Could not load your notes."));
      throw error;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) refresh().catch(() => {});
    else {
      setNotes({ all: [], archived: [], trashed: [] });
      setStats(null);
      setError(null);
      setLoading(false);
    }
  }, [userId, refresh]);

  const isLoading = loading || Boolean(userId && !stats && !error);

  const value = useMemo(() => ({
    notes,
    stats,
    loading: isLoading,
    error,
    refresh,
    pinned: notes.all.filter((note) => note.isPinned),
  }), [notes, stats, isLoading, error, refresh]);

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) throw new Error("useNotes must be used within NotesProvider.");
  return context;
}
