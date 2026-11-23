import { useNavigate } from "react-router-dom";
import { Archive, ArchiveRestore, Pin, PinOff, RotateCcw, Trash2, ExternalLink } from "lucide-react";
import { formatDate } from "../../utils/format.js";
import ButtonLoader from "../common/ButtonLoader.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function NoteCard({ note, view = "all", onPin, onArchive, onTrash, onRestore, onPermanentDelete, busyAction }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const id = note._id || note.id;
  const inTrash = view === "trash";

  function act(event, callback) {
    event.stopPropagation();
    callback?.(note);
  }

  function actionButton(action, title, icon, callback, className = "") {
    const active = busyAction === action;
    const localizedTitle = t(title);
    return (
      <button
        className={`icon-button note-action ${className}`}
        title={active ? `${localizedTitle}...` : localizedTitle}
        aria-label={active ? `${localizedTitle} ${t("in progress")}` : localizedTitle}
        aria-busy={active || undefined}
        disabled={Boolean(busyAction)}
        onClick={(event) => act(event, callback)}
      >
        {active ? <ButtonLoader /> : icon}
      </button>
    );
  }

  return (
    <article className="note-card" role="button" tabIndex={0} onClick={() => navigate(`/notes/${id}`)} onKeyDown={(event) => event.key === "Enter" && navigate(`/notes/${id}`)}>
      <div className="note-card-top">
        <div className="note-card-mark"><span className="note-mark-line" /><span className="note-mark-line small" /></div>
        <div className="note-actions" onClick={(event) => event.stopPropagation()}>
          {!inTrash && (
            <>
              {onPin && actionButton(note.isPinned ? "unpin" : "pin", note.isPinned ? "Unpin note" : "Pin note", note.isPinned ? <PinOff size={16} /> : <Pin size={16} />, onPin, note.isPinned ? "is-selected" : "")}
              {onArchive && actionButton("archive", "Archive note", <Archive size={16} />, onArchive)}
              {onTrash && actionButton("trash", "Move to trash", <Trash2 size={16} />, onTrash)}
            </>
          )}
          {view === "archived" && onRestore && actionButton("restore", "Restore note", <ArchiveRestore size={16} />, onRestore)}
          {inTrash && onRestore && actionButton("restore-trash", "Restore from trash", <RotateCcw size={16} />, onRestore)}
          {inTrash && onPermanentDelete && actionButton("permanent-delete", "Delete permanently", <Trash2 size={16} />, onPermanentDelete, "danger-hover")}
          <button className="icon-button note-action" title={t("Open note")} aria-label={t("Open note")} onClick={() => navigate(`/notes/${id}`)}><ExternalLink size={15} /></button>
        </div>
      </div>
      <h3 dir="auto">{note.title}</h3>
      <p className="note-preview" dir="auto">{note.content || t("No additional details.")}</p>
      <div className="note-card-footer">
        <div className="note-dates">
          <span>{t("Created {date}", { date: formatDate(note.createdAt) })}</span>
          <span>{t("Updated {date}", { date: formatDate(note.updatedAt) })}</span>
        </div>
        {note.category && note.category !== "General" && <span className="note-tag">{note.category}</span>}
        {note.isPinned && !inTrash && <span className="pin-indicator"><Pin size={12} /> {t("Pinned")}</span>}
      </div>
    </article>
  );
}
