import Button from "../common/Button.jsx";

export default function NoteForm({ initialValues = { title: "", content: "" }, onSubmit, busy, submitLabel }) {
  return (
    <form className="note-editor-form" onSubmit={(event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      onSubmit({ title: data.get("title").trim(), content: data.get("content") });
    }}>
      <input className="note-title-input" name="title" defaultValue={initialValues.title} placeholder="Untitled note" required maxLength={150} autoFocus />
      <textarea className="note-content-input" name="content" defaultValue={initialValues.content} placeholder="Start writing your thoughts..." rows={14} />
      <div className="editor-footer">
        <span className="muted">Your changes are saved to your NOTELY account.</span>
        <Button type="submit" loading={busy} loadingLabel="Saving...">{submitLabel}</Button>
      </div>
    </form>
  );
}
