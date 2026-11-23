import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, FileText, Shield, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { getUserById } from "../../api/users.api.js";
import { formatDate, getInitials } from "../../utils/format.js";
import { getErrorMessage } from "../../utils/errors.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import LoadingScreen from "../../components/common/LoadingScreen.jsx";
import SectionLoader from "../../components/common/SectionLoader.jsx";
import Button from "../../components/common/Button.jsx";

export default function UserDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [notesPage, setNotesPage] = useState(1);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setNotesLoading(true);
    setLoadError(null);
    getUserById(id, { page: notesPage, limit: 10 }).then((response) => active && setResult(response.data))
      .catch((error) => {
        if (active) {
          setLoadError(error);
          toast.error(getErrorMessage(error, "Could not load this member."));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
          setNotesLoading(false);
        }
      });
    return () => { active = false; };
  }, [id, notesPage, retry]);

  if (loading && !result) return <LoadingScreen message="Loading member details..." />;
  if (!result?.user) return <div className="page-wrap"><EmptyState title="Member unavailable" description={getErrorMessage(loadError, "This account may have been removed.")} action={<Button onClick={() => setRetry((current) => current + 1)}>Retry</Button>} /></div>;
  const { user, notes } = result;

  return (
    <div className="page-wrap">
      <button className="back-link" onClick={() => navigate("/admin/users")}><ArrowLeft size={16} /> Back to users</button>
      <PageHeader eyebrow="MEMBER DETAILS" title={`${user.firstName} ${user.lastName}`} description="Account information and recent notes." />
      <section className="member-profile-card"><span className="avatar avatar-large">{getInitials(user) || <UserRound size={23} />}</span><div className="member-profile-copy"><h2>{user.firstName} {user.lastName}</h2><p className="muted">{user.email}</p><div className="member-profile-meta"><span className={`role-badge ${user.role === "admin" ? "role-admin" : ""}`}>{user.role === "admin" && <Shield size={12} />}{user.role}</span><span>Joined {formatDate(user.createdAt)}</span></div></div><div className="member-notes-count"><FileText size={17} /><strong>{notes.totalNotes}</strong><span>notes</span></div></section>
      <div className="section-heading"><div><h2>Recent notes</h2><p className="muted">Notes owned by this member. Content is visible to administrators.</p></div></div>
      {loadError && <div className="inline-error"><span>Member data could not be refreshed.</span><Button variant="secondary" onClick={() => setRetry((current) => current + 1)} loading={notesLoading} loadingLabel="Loading notes...">Retry</Button></div>}
      {notesLoading ? <SectionLoader message="Loading this member’s notes..." /> : notes.items?.length ? <div className="admin-notes-list">
        {notes.items.map((note) => <article className="admin-note-row" key={note._id}><span className="note-row-icon"><FileText size={17} /></span><div><h3>{note.title}</h3><p>{note.content || "No additional details."}</p></div><time>{formatDate(note.updatedAt)}</time></article>)}
        {notes.totalPages > 1 && <div className="table-pagination"><span>Page {notes.page} of {notes.totalPages} · {notes.totalNotes} notes</span><div><button className="icon-button" aria-label="Previous notes page" disabled={notesLoading || notes.page <= 1} onClick={() => setNotesPage(notesPage - 1)}><ChevronLeft size={17} /></button><button className="icon-button" aria-label="Next notes page" disabled={notesLoading || notes.page >= notes.totalPages} onClick={() => setNotesPage(notesPage + 1)}><ChevronRight size={17} /></button></div></div>}
      </div> : <EmptyState title="No notes yet" description="This member hasn’t created any notes." />}
      <p className="pagination-note">Showing {notes.items?.length || 0} of {notes.totalNotes} notes.</p>
    </div>
  );
}
