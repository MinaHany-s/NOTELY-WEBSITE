import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight, Search, Shield, Trash2, UserRound } from "lucide-react";
import { deleteUser, getUsers, toggleUserRole } from "../../api/users.api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { formatDate, getInitials } from "../../utils/format.js";
import { getErrorMessage } from "../../utils/errors.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import SkeletonTable from "../../components/common/SkeletonTable.jsx";
import ButtonLoader from "../../components/common/ButtonLoader.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Modal from "../../components/common/Modal.jsx";
import Button from "../../components/common/Button.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function UsersPage() {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const [result, setResult] = useState({ users: [], totalUsers: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const navigate = useNavigate();
  const canToggleRoles = currentUser?.email === "admin@notely.com";

  async function load(page = 1, currentQuery = query) {
    setLoading(true);
    setError(null);
    try {
      const response = await getUsers({ page, limit: 10, ...(currentQuery ? { search: currentQuery } : {}) });
      setResult(response.data);
    } catch (requestError) {
      setError(requestError);
      toast.error(getErrorMessage(requestError, "Could not load users."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(1, query); }, [query]);

  function submitSearch(event) {
    event.preventDefault();
    setQuery(search.trim());
  }

  async function changeRole(target) {
    setBusyId(target._id);
    try {
      await toggleUserRole(target._id);
      toast.success(t("{name}’s role was updated", { name: target.firstName }));
      await load(result.page);
    } catch (error) {
      toast.error(getErrorMessage(error, t("Could not update the user role.")));
    } finally {
      setBusyId(null);
    }
  }

  async function removeUser() {
    setBusyId(pendingDelete?._id);
    try {
      await deleteUser(pendingDelete._id);
      toast.success(t("User and their notes deleted"));
      setPendingDelete(null);
      const nextPage = result.page > 1 && result.users.length === 1 ? result.page - 1 : result.page;
      await load(nextPage);
    } catch (error) {
      toast.error(getErrorMessage(error, t("Could not delete this user.")));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="page-wrap">
      <PageHeader eyebrow="ADMINISTRATION" title="Manage users" description="Review accounts and manage access to your workspace." />
      <div className="table-toolbar">
        <div>{t(result.totalUsers === 1 ? "{count} member" : "{count} members", { count: result.totalUsers })}</div>
        <form className="search-field users-search" onSubmit={submitSearch}><Search size={16} /><input placeholder={t("Search people...")} value={search} onChange={(event) => setSearch(event.target.value)} /><button type="submit" disabled={loading}>{loading ? <><ButtonLoader /> {t("Searching...")}</> : t("Search")}</button></form>
      </div>
      <div className="table-card">
        {loading ? <SkeletonTable rows={5} /> : error ? <div className="table-error"><p>{t("Users could not be loaded. Your previous results are preserved.")}</p><Button variant="secondary" onClick={() => load(result.page)} loading={loading} loadingLabel="Loading users...">{t("Retry")}</Button></div> : result.users.length ? (
          <>
            <div className="table-scroll"><table className="users-table">
              <thead><tr><th>{t("Member")}</th><th>{t("Role")}</th><th>{t("Joined")}</th><th className="align-right">{t("Actions")}</th></tr></thead>
              <tbody>{result.users.map((member) => (
                <tr key={member._id}>
                  <td><button className="member-cell" onClick={() => navigate(`/admin/users/${member._id}`)}><span className="avatar">{getInitials(member) || <UserRound size={15} />}</span><span><strong dir="auto">{member.firstName} {member.lastName}</strong><small dir="ltr">{member.email}</small></span></button></td>
                  <td><span className={`role-badge ${member.role === "admin" ? "role-admin" : ""}`}>{member.role === "admin" && <Shield size={12} />}{t(member.role === "admin" ? "Administrator" : "User")}</span></td>
                  <td>{formatDate(member.createdAt)}</td>
                  <td><div className="table-actions">
                    <button className="table-action" onClick={() => navigate(`/admin/users/${member._id}`)}>{t("Details")}</button>
                    {canToggleRoles && member._id !== currentUser?._id && <button className="icon-button" title={t("Toggle user role")} aria-label={t(busyId === member._id ? "Updating role..." : "Toggle user role")} aria-busy={busyId === member._id || undefined} disabled={Boolean(busyId)} onClick={() => changeRole(member)}>{busyId === member._id ? <ButtonLoader /> : <Shield size={16} />}</button>}
                    {member._id !== currentUser?._id && member.role !== "admin" && <button className="icon-button danger-hover" title={t("Delete user")} aria-label={t("Delete user")} disabled={Boolean(busyId)} onClick={() => setPendingDelete(member)}><Trash2 size={16} /></button>}
                  </div></td>
                </tr>
              ))}</tbody>
            </table></div>
            <div className="table-pagination"><span>{t("Page {page} of {total}", { page: result.page, total: Math.max(result.totalPages, 1) })}</span><div><button className="icon-button" aria-label={t("Previous page")} disabled={loading || result.page <= 1} onClick={() => load(result.page - 1)}><ChevronLeft size={17} /></button><button className="icon-button" aria-label={t("Next page")} disabled={loading || result.page >= result.totalPages} onClick={() => load(result.page + 1)}><ChevronRight size={17} /></button></div></div>
          </>
        ) : <EmptyState title="No members found" description={query ? "Try a different search term." : "New accounts will appear here."} />}
      </div>
      <Modal open={Boolean(pendingDelete)} title="Delete this user?" description={t("This will permanently delete {name}’s account and all of their notes.", { name: pendingDelete?.firstName || t("this user") })} onClose={() => !busyId && setPendingDelete(null)} onConfirm={removeUser} confirmLabel="Delete user" danger busy={Boolean(busyId)} busyLabel="Deleting..." />
    </div>
  );
}
