import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNotes } from "../context/NotesContext.jsx";
import { getErrorMessage } from "../utils/errors.js";

export default function useNoteMutation() {
  const { refresh } = useNotes();
  const pendingRef = useRef(new Set());
  const [pendingActions, setPendingActions] = useState({});

  const run = useCallback(async (action, note, actionName, successMessage) => {
    const id = note._id || note.id;
    if (pendingRef.current.has(id)) return;
    pendingRef.current.add(id);
    setPendingActions((current) => ({ ...current, [id]: actionName }));

    try {
      await action(id);
      toast.success(successMessage);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update this note."));
      pendingRef.current.delete(id);
      setPendingActions((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      return;
    }

    try {
      await refresh();
    } catch {
      // The notes provider reports refresh failures and retains the previous data.
    } finally {
      pendingRef.current.delete(id);
      setPendingActions((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
    }
  }, [refresh]);

  return { run, pendingActions };
}
