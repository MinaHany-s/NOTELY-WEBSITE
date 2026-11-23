import { useEffect, useState } from "react";
import { ArrowLeft, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { createNote, getNote, updateNote } from "../../api/notes.api.js";
import { useNotes } from "../../context/NotesContext.jsx";
import { getErrorMessage } from "../../utils/errors.js";
import Button from "../../components/common/Button.jsx";
import NoteForm from "../../components/notes/NoteForm.jsx";
import LoadingScreen from "../../components/common/LoadingScreen.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function NoteEditorPage() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { refresh } = useNotes();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [loadError, setLoadError] = useState(null);
  const [retry, setRetry] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    if (id) {
      setLoading(true);
      setLoadError(null);
      getNote(id).then((response) => active && setNote(response.data))
        .catch((error) => {
          if (active) {
            setLoadError(error);
            toast.error(getErrorMessage(error, t("Could not load this note.")));
          }
        })
        .finally(() => active && setLoading(false));
    }
    return () => { active = false; };
  }, [id, retry]);

  async function save(values) {
    setBusy(true);
    let response;
    try {
      response = id ? await updateNote(id, values) : await createNote(values);
      if (!response.data?._id && !id) throw new Error(t("The create-note response did not include a note ID."));
      toast.success(t(id ? "Note updated" : "Note created"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("Your note could not be saved.")));
      setBusy(false);
      return;
    }
    await refresh().catch(() => {});
    navigate(`/notes/${response.data?._id || id}`);
    setBusy(false);
  }

  if (loading) return <LoadingScreen message="Loading your note..." />;
  if (loadError) return <div className="page-wrap"><EmptyState title="This note couldn’t be loaded" description={getErrorMessage(loadError, "Check your connection and try again.")} action={<Button onClick={() => setRetry((current) => current + 1)}>{t("Retry")}</Button>} /></div>;

  return (
    <div className="page-wrap editor-page">
      <button className="back-link" onClick={() => navigate(-1)}><ArrowLeft size={16} /> {t("Back to notes")}</button>
      <div className="editor-container">
        <div className="editor-heading"><span className="editor-file-icon"><FileText size={18} /></span><div><span className="eyebrow">{t(id ? "EDIT NOTE" : "NEW NOTE")}</span><p className="muted">{t(id ? "Make this note your own." : "A new page for whatever’s on your mind.")}</p></div></div>
        <NoteForm initialValues={note || undefined} onSubmit={save} busy={busy} submitLabel={t(id ? "Save changes" : "Create note")} />
      </div>
    </div>
  );
}
