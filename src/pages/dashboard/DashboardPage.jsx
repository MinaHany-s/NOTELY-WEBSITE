import { useNavigate } from "react-router-dom";
import { Archive, ArrowRight, BarChart3, FileText, Pin, Plus, Sparkles, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNotes } from "../../context/NotesContext.jsx";
import { archiveNote, pinNote, trashNote, unpinNote } from "../../api/notes.api.js";
import useNoteMutation from "../../hooks/useNoteMutation.js";
import NoteCard from "../../components/notes/NoteCard.jsx";
import StatCard from "../../components/notes/StatCard.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import NotesSkeleton from "../../components/common/NotesSkeleton.jsx";
import SkeletonCard from "../../components/common/SkeletonCard.jsx";
import Button from "../../components/common/Button.jsx";
import { formatDate } from "../../utils/format.js";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function DashboardPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { notes, stats, loading, error, refresh } = useNotes();
  const { run: mutate, pendingActions } = useNoteMutation();
  const navigate = useNavigate();
  const recent = [...notes.all].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 3);
  const pinned = notes.all.filter((note) => note.isPinned).slice(0, 2);

  return (
    <div className="page-wrap">
      <section className="welcome-panel">
        <div className="welcome-content">
          <div className="eyebrow"><Sparkles size={14} /> {t("YOUR PERSONAL SPACE")}</div>
          <h1>{t("Good to see you, {name}.", { name: user?.firstName || "" })}</h1>
          <p>{t("Make today a little clearer. Your thoughts are right where you left them.")}</p>
          <Button onClick={() => navigate("/notes/new")}><Plus size={16} /> {t("Capture a thought")}</Button>
        </div>
        <div className="welcome-date"><span>{t("TODAY")}</span><strong>{formatDate(new Date(), { weekday: "long", month: "long", day: "numeric" })}</strong><i>{t("Make space for what matters.")}</i></div>
      </section>

      <div className="section-heading"><div><h2>{t("Your workspace")}</h2><p className="muted">{t("A quick look at everything you’re keeping.")}</p></div><button className="text-button" onClick={() => navigate("/statistics")}>{t("All statistics")} <ArrowRight size={15} /></button></div>
      {loading && !stats ? <div className="stats-grid">{[1, 2, 3, 4].map((item) => <SkeletonCard key={item} />)}</div> : stats && (
        <div className="stats-grid">
          <StatCard label="Active notes" value={stats?.activeNotes} caption="Ready when you are" icon={FileText} tone="violet" />
          <StatCard label="Pinned" value={stats?.pinnedNotes} caption="Your most important thoughts" icon={Pin} tone="amber" />
          <StatCard label="Archived" value={stats?.archivedNotes} caption="Tucked away for later" icon={Archive} tone="blue" />
          <StatCard label="In trash" value={stats?.trashedNotes} caption="Removed in the last 7 days" icon={Trash2} tone="rose" />
        </div>
      )}
      {error && <div className="inline-error"><span>{t("Your dashboard data could not be refreshed.")}</span><Button variant="secondary" onClick={() => refresh().catch(() => {})} loading={loading} loadingLabel="Refreshing...">{t("Retry")}</Button></div>}

      <section className="dashboard-section">
        <div className="section-heading"><div><h2>{t("Recently updated")}</h2><p className="muted">{t("Your latest thoughts, all in one place.")}</p></div><button className="text-button" onClick={() => navigate("/notes")}>{t("View all")} <ArrowRight size={15} /></button></div>
        {loading && !notes.all.length ? <NotesSkeleton count={3} /> : error && !notes.all.length ? null : recent.length ? (
          <div className="notes-grid">
            {recent.map((note) => <NoteCard key={note._id} note={note} busyAction={pendingActions[note._id]} onPin={(n) => mutate(n.isPinned ? unpinNote : pinNote, n, n.isPinned ? "unpin" : "pin", n.isPinned ? "Note unpinned" : "Note pinned")} onArchive={(n) => mutate(archiveNote, n, "archive", "Note archived")} onTrash={(n) => mutate(trashNote, n, "trash", "Note moved to trash")} />)}
          </div>
        ) : <EmptyState title="A fresh page" description="Create your first note and give your ideas a place to land." action={<Button onClick={() => navigate("/notes/new")}><Plus size={16} /> {t("Create a note")}</Button>} />}
      </section>

      {pinned.length > 0 && (
        <section className="dashboard-section">
          <div className="section-heading"><div><h2><Pin size={17} className="inline-icon" /> {t("Pinned notes")}</h2><p className="muted">{t("The notes you want to keep close.")}</p></div><button className="text-button" onClick={() => navigate("/pinned")}>{t("See pinned")} <ArrowRight size={15} /></button></div>
          <div className="notes-grid">{pinned.map((note) => <NoteCard key={note._id} note={note} busyAction={pendingActions[note._id]} onPin={(n) => mutate(unpinNote, n, "unpin", "Note unpinned")} onArchive={(n) => mutate(archiveNote, n, "archive", "Note archived")} onTrash={(n) => mutate(trashNote, n, "trash", "Note moved to trash")} />)}</div>
        </section>
      )}
      <div className="dashboard-footnote"><BarChart3 size={15} /> {t("Your notes are private to your account.")}</div>
    </div>
  );
}
