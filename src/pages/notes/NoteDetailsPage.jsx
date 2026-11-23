import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Archive, ArrowLeft, CalendarDays, Clock3, Pencil, Pin, PinOff, RotateCcw, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { archiveNote, getNote, permanentlyDeleteNote, pinNote, restoreArchivedNote, restoreDeletedNote, trashNote, unpinNote } from "../../api/notes.api.js";
import { useNotes } from "../../context/NotesContext.jsx";
import { formatDate } from "../../utils/format.js";
import { getErrorMessage } from "../../utils/errors.js";
import LoadingScreen from "../../components/common/LoadingScreen.jsx";
import Button from "../../components/common/Button.jsx";
import ButtonLoader from "../../components/common/ButtonLoader.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Modal from "../../components/common/Modal.jsx";

export default function NoteDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refresh } = useNotes();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [retry, setRetry] = useState(0);
  const [busyAction, setBusyAction] = useState(null);
  const [confirmPermanent, setConfirmPermanent] = useState(false);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await getNote(id);
      setNote(response.data);
    } catch (error) {
      setLoadError(error);
      toast.error(getErrorMessage(error, "Could not load this note."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id, retry]);

  async function mutate(action, message, actionName) {
    if (busyAction) return;
    setBusyAction(actionName);
    let response;
    try {
      response = await action(id);
      if (response.data) setNote(response.data);
      toast.success(message);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update this note."));
      setBusyAction(null);
      return;
    }
    if (action === trashNote) navigate("/trash");
    else if (action === restoreDeletedNote || action === restoreArchivedNote) navigate("/notes");
    await refresh().catch(() => {});
    setBusyAction(null);
  }

  async function permanentlyDelete() {
    if (busyAction) return;
    setBusyAction("permanent-delete");
    try {
      await permanentlyDeleteNote(id);
      toast.success("Note permanently deleted");
      setConfirmPermanent(false);
      await refresh().catch(() => {});
      navigate("/trash");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not permanently delete this note."));
    } finally {
      setBusyAction(null);
    }
  }

  if (loading) return <LoadingScreen message="Loading your note..." />;
  if (loadError || !note) return (
    <div className="page-wrap">
      <EmptyState
        title="This note couldn’t be loaded"
        description={getErrorMessage(loadError, "Check your connection and try again.")}
        action={<Button onClick={() => setRetry((current) => current + 1)}>Retry</Button>}
      />
    </div>
  );
  const trashed = Boolean(note.deletedAt);
  const archived = note.isArchived;
  const actionButton = (actionName, title, Icon, onClick, className = "") => {
    const active = busyAction === actionName;
    return <button className={`icon-button ${className}`} title={active ? `${title}...` : title} aria-label={active ? `${title} in progress` : title} aria-busy={active || undefined} disabled={Boolean(busyAction)} onClick={onClick}>{active ? <ButtonLoader /> : <Icon size={17} />}</button>;
  };

  return (
    <div className="page-wrap detail-page">
      <div className="detail-toolbar">
        <button className="back-link" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Back</button>
        <div className="detail-actions">
          {!trashed && <Button variant="secondary" size="sm" disabled={Boolean(busyAction)} onClick={() => navigate(`/notes/${id}/edit`)}><Pencil size={15} /> Edit</Button>}
          {!trashed && actionButton(note.isPinned ? "unpin" : "pin", note.isPinned ? "Unpin note" : "Pin note", note.isPinned ? PinOff : Pin, () => mutate(note.isPinned ? unpinNote : pinNote, note.isPinned ? "Note unpinned" : "Note pinned", note.isPinned ? "unpin" : "pin"), note.isPinned ? "is-selected" : "")}
          {!trashed && !archived && actionButton("archive", "Archive note", Archive, () => mutate(archiveNote, "Note archived", "archive"))}
          {archived && !trashed && <Button variant="secondary" size="sm" loading={busyAction === "restore"} disabled={Boolean(busyAction) && busyAction !== "restore"} loadingLabel="Restoring..." onClick={() => mutate(restoreArchivedNote, "Note restored", "restore")}><RotateCcw size={15} /> Restore</Button>}
          {trashed && <Button variant="secondary" size="sm" loading={busyAction === "restore-trash"} disabled={Boolean(busyAction) && busyAction !== "restore-trash"} loadingLabel="Restoring..." onClick={() => mutate(restoreDeletedNote, "Note restored", "restore-trash")}><RotateCcw size={15} /> Restore</Button>}
          {!trashed && actionButton("trash", "Move to trash", Trash2, () => mutate(trashNote, "Note moved to trash", "trash"), "danger-hover")}
          {trashed && <Button variant="danger-outline" size="sm" disabled={Boolean(busyAction)} onClick={() => setConfirmPermanent(true)}><Trash2 size={15} /> Delete forever</Button>}
        </div>
      </div>
      <article className="note-detail">
        <div className="detail-eyebrow">{trashed ? "IN TRASH" : archived ? "ARCHIVED NOTE" : note.isPinned ? "PINNED NOTE" : "NOTE"}</div>
        <h1>{note.title}</h1>
        <div className="detail-meta"><span><CalendarDays size={15} /> Created {formatDate(note.createdAt)}</span><span><Clock3 size={15} /> Updated {formatDate(note.updatedAt)}</span></div>
        <div className="detail-divider" />
        <div className="detail-content">{note.content || <span className="muted">This note doesn’t have any additional content.</span>}</div>
      </article>
      <Modal open={confirmPermanent} title="Delete this note forever?" description="This action can’t be undone. The note will be permanently removed from your account." onClose={() => !busyAction && setConfirmPermanent(false)} onConfirm={permanentlyDelete} confirmLabel="Delete permanently" danger busy={busyAction === "permanent-delete"} busyLabel="Deleting..." />
    </div>
  );
}
