import { useNotes } from "../../context/NotesContext.jsx";
import { Archive, FileText, Pin, Trash2 } from "lucide-react";
import PageHeader from "../../components/common/PageHeader.jsx";
import StatCard from "../../components/notes/StatCard.jsx";
import SkeletonCard from "../../components/common/SkeletonCard.jsx";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button.jsx";

export default function StatisticsPage() {
  const { stats, loading, error, refresh } = useNotes();
  const navigate = useNavigate();
  const entries = [
    { key: "activeNotes", label: "Active notes", icon: FileText, tone: "violet", to: "/notes" },
    { key: "pinnedNotes", label: "Pinned notes", icon: Pin, tone: "amber", to: "/pinned" },
    { key: "archivedNotes", label: "Archived notes", icon: Archive, tone: "blue", to: "/archived" },
    { key: "trashedNotes", label: "In trash", icon: Trash2, tone: "rose", to: "/trash" },
  ];
  return (
    <div className="page-wrap">
      <PageHeader eyebrow="YOUR ACTIVITY" title="Notes statistics" description="A simple overview of what you’ve collected." />
      {error && <div className="inline-error"><span>Statistics could not be refreshed.</span><Button variant="secondary" onClick={() => refresh().catch(() => {})} loading={loading} loadingLabel="Refreshing...">Retry</Button></div>}
      {loading && !stats ? <div className="stats-grid stat-grid-large">{[1, 2, 3, 4].map((item) => <SkeletonCard key={item} />)}</div> : stats && (
        <>
          <div className="stats-grid stat-grid-large">{entries.map((entry) => <StatCard {...entry} key={entry.key} onClick={() => navigate(entry.to)} value={stats?.[entry.key]} caption="View notes" />)}</div>
          <section className="insight-panel"><div className="insight-icon"><FileText size={19} /></div><div><h3>Your collection</h3><p className="muted">You have <strong>{stats?.totalNotes ?? 0}</strong> notes in total. Keep collecting the ideas worth remembering.</p></div></section>
        </>
      )}
    </div>
  );
}
