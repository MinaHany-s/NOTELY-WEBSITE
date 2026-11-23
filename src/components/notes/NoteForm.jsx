import Button from "../common/Button.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function NoteForm({ initialValues = { title: "", content: "" }, onSubmit, busy, submitLabel }) {
  const { t } = useLanguage();

  return (
    <form className="note-editor-form" onSubmit={(event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      onSubmit({ title: data.get("title").trim(), content: data.get("content") });
    }}>
      <input className="note-title-input" name="title" dir="auto" defaultValue={initialValues.title} placeholder={t("Untitled note")} required maxLength={150} autoFocus />
      <textarea className="note-content-input" name="content" dir="auto" defaultValue={initialValues.content} placeholder={t("Start writing your thoughts...")} rows={14} />
      <div className="editor-footer">
        <span className="muted">{t("Your changes are saved to your NOTELY account.")}</span>
        <Button type="submit" loading={busy} loadingLabel="Saving...">{submitLabel}</Button>
      </div>
    </form>
  );
}
