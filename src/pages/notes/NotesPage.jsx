import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useNotes } from "../../context/NotesContext.jsx";
import { archiveNote, getNotes, permanentlyDeleteNote, pinNote, restoreArchivedNote, restoreDeletedNote, trashNote, unpinNote } from "../../api/notes.api.js";
import { getErrorMessage } from "../../utils/errors.js";
import useNoteMutation from "../../hooks/useNoteMutation.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import NoteCard from "../../components/notes/NoteCard.jsx";
import NotesSkeleton from "../../components/common/NotesSkeleton.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Button from "../../components/common/Button.jsx";
import Modal from "../../components/common/Modal.jsx";
import { Plus } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.jsx";

const viewConfig = {
  all: { title: "All notes", eyebrow: "All notes", description: "A home for every idea, list, and little reminder.", emptyTitle: "Nothing here just yet", emptyDescription: "Start with a note, and let the ideas follow." },
  pinned: { title: "Pinned notes", eyebrow: "Pinned notes", description: "The thoughts you want to keep within reach.", emptyTitle: "No pinned notes", emptyDescription: "Pin a note to keep it close at hand." },
  archived: { title: "Archive", eyebrow: "Archive", description: "A quiet place for notes you may want later.", emptyTitle: "Your archive is empty", emptyDescription: "Archived notes will be waiting here when you need them." },
  trash: { title: "Trash", eyebrow: "Trash", description: "Notes here are permanently deleted after seven days.", emptyTitle: "Trash is empty", emptyDescription: "Nothing to clear. It’s a good feeling." },
};

export default function NotesPage({ view }) {
  const { t } = useLanguage();
  const { notes, loading: contextLoading, error: contextError, refresh } = useNotes();
  const { run: mutate, pendingActions } = useNoteMutation();
  const [params] = useSearchParams();
  const [remoteNotes, setRemoteNotes] = useState(null);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchRetry, setSearchRetry] = useState(0);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const search = params.get("search") || "";
  const config = viewConfig[view];

  useEffect(() => {
    let active = true;
    if (!search.trim()) {
      setRemoteNotes(null);
      setSearchError(null);
      return () => { active = false; };
    }
    setRemoteNotes(null);
    setSearchError(null);
    setRemoteLoading(true);
    getNotes({
      search,
      limit: 100,
      archived: view === "archived" ? true : undefined,
      trashed: view === "trash" ? true : undefined,
    }).then((response) => {
      if (active) setRemoteNotes(response.data || []);
    }).catch((error) => {
      if (active) {
        setSearchError(error);
        toast.error(getErrorMessage(error, "Search could not be completed."));
      }
    }).finally(() => active && setRemoteLoading(false));
    return () => { active = false; };
  }, [search, view, searchRetry]);

  const baseNotes = search ? (remoteNotes || []) : view === "archived" ? notes.archived : view === "trash" ? notes.trashed : notes.all;
  const visibleNotes = useMemo(() => view === "pinned" ? baseNotes.filter((note) => note.isPinned) : baseNotes, [baseNotes, view]);
  const isLoading = search
    ? remoteLoading || (remoteNotes === null && !searchError)
    : contextLoading && !baseNotes.length;

  async function confirmPermanentDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await permanentlyDeleteNote(pendingDelete._id);
      toast.success(t("Note permanently deleted"));
      setPendingDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error, t("Could not permanently delete this note.")));
      return;
    } finally {
      setDeleting(false);
    }
    await refresh().catch(() => {});
  }

  return (
    <div className="page-wrap">
      <PageHeader eyebrow={`${t(config.eyebrow)}${search ? ` · ${t("SEARCH")}` : ""}`} title={search ? "Search results" : config.title} description={search ? t("Showing matches for “{search}”.", { search }) : config.description} action={view === "all" && <Button onClick={() => navigate("/notes/new")}><Plus size={16} /> {t("New note")}</Button>} />
      {search && <div className="search-result-bar"><span>{isLoading ? t("Searching your notes...") : t(visibleNotes.length === 1 ? "{count} matching note" : "{count} matching notes", { count: visibleNotes.length })}</span><button className="text-button" onClick={() => navigate("/notes")}>{t("Clear search")}</button></div>}
      {!search && contextError && <div className="inline-error"><span>{t("Your notes could not be refreshed.")}</span><Button variant="secondary" onClick={() => refresh().catch(() => {})} loading={contextLoading} loadingLabel="Refreshing...">{t("Retry")}</Button></div>}
      {searchError && <div className="inline-error"><span>{t("Search couldn’t be completed.")}</span><Button variant="secondary" onClick={() => setSearchRetry((count) => count + 1)} loading={remoteLoading} loadingLabel="Searching...">{t("Retry search")}</Button></div>}
      {isLoading ? <NotesSkeleton count={6} /> :
        contextError && !search && !visibleNotes.length ? null :
        searchError ? null :
        visibleNotes.length ? (
          <div className="notes-grid">
            {visibleNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                view={view}
                busyAction={pendingActions[note._id]}
                onPin={view !== "archived" && view !== "trash" ? (n) => mutate(n.isPinned ? unpinNote : pinNote, n, n.isPinned ? "unpin" : "pin", n.isPinned ? "Note unpinned" : "Note pinned") : undefined}
                onArchive={view === "all" || view === "pinned" ? (n) => mutate(archiveNote, n, "archive", "Note archived") : undefined}
                onTrash={view === "all" || view === "pinned" || view === "archived" ? (n) => mutate(trashNote, n, "trash", "Note moved to trash") : undefined}
                onRestore={view === "archived" ? (n) => mutate(restoreArchivedNote, n, "restore", "Note restored") : view === "trash" ? (n) => mutate(restoreDeletedNote, n, "restore-trash", "Note restored from trash") : undefined}
                onPermanentDelete={view === "trash" ? setPendingDelete : undefined}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={search ? "No matching notes" : config.emptyTitle}
            description={search ? "Try a different title or phrase." : config.emptyDescription}
            action={view === "all" && !search ? <Button onClick={() => navigate("/notes/new")}><Plus size={16} /> {t("Create your first note")}</Button> : undefined}
          />
        )}
      <Modal open={Boolean(pendingDelete)} title="Delete this note forever?" description="This action can’t be undone. The note will be permanently removed from your account." onClose={() => !deleting && setPendingDelete(null)} onConfirm={confirmPermanentDelete} confirmLabel="Delete permanently" danger busy={deleting} busyLabel="Deleting..." />
    </div>
  );
}
