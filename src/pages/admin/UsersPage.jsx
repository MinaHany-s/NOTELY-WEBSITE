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

export default function UsersPage() {
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
      toast.success(`${target.firstName}’s role was updated`);
      await load(result.page);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update the user role."));
    } finally {
      setBusyId(null);
    }
  }

  async function removeUser() {
    setBusyId(pendingDelete?._id);
    try {
      await deleteUser(pendingDelete._id);
      toast.success("User and their notes deleted");
      setPendingDelete(null);
      const nextPage = result.page > 1 && result.users.length === 1 ? result.page - 1 : result.page;
      await load(nextPage);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete this user."));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="page-wrap">
      <PageHeader eyebrow="ADMINISTRATION" title="Manage users" description="Review accounts and manage access to your workspace." />
      <div className="table-toolbar">
        <div><strong>{result.totalUsers}</strong> {result.totalUsers === 1 ? "member" : "members"}</div>
        <form className="search-field users-search" onSubmit={submitSearch}><Search size={16} /><input placeholder="Search people..." value={search} onChange={(event) => setSearch(event.target.value)} /><button type="submit" disabled={loading}>{loading ? <><ButtonLoader /> Searching...</> : "Search"}</button></form>
      </div>
      <div className="table-card">
        {loading ? <SkeletonTable rows={5} /> : error ? <div className="table-error"><p>Users could not be loaded. Your previous results are preserved.</p><Button variant="secondary" onClick={() => load(result.page)} loading={loading} loadingLabel="Loading users...">Retry</Button></div> : result.users.length ? (
          <>
            <div className="table-scroll"><table className="users-table">
              <thead><tr><th>Member</th><th>Role</th><th>Joined</th><th className="align-right">Actions</th></tr></thead>
              <tbody>{result.users.map((member) => (
                <tr key={member._id}>
                  <td><button className="member-cell" onClick={() => navigate(`/admin/users/${member._id}`)}><span className="avatar">{getInitials(member) || <UserRound size={15} />}</span><span><strong>{member.firstName} {member.lastName}</strong><small>{member.email}</small></span></button></td>
                  <td><span className={`role-badge ${member.role === "admin" ? "role-admin" : ""}`}>{member.role === "admin" && <Shield size={12} />}{member.role}</span></td>
                  <td>{formatDate(member.createdAt)}</td>
                  <td><div className="table-actions">
                    <button className="table-action" onClick={() => navigate(`/admin/users/${member._id}`)}>Details</button>
                    {canToggleRoles && member._id !== currentUser?._id && <button className="icon-button" title="Toggle user role" aria-label={busyId === member._id ? "Updating role..." : "Toggle user role"} aria-busy={busyId === member._id || undefined} disabled={Boolean(busyId)} onClick={() => changeRole(member)}>{busyId === member._id ? <ButtonLoader /> : <Shield size={16} />}</button>}
                    {member._id !== currentUser?._id && member.role !== "admin" && <button className="icon-button danger-hover" title="Delete user" aria-label="Delete user" disabled={Boolean(busyId)} onClick={() => setPendingDelete(member)}><Trash2 size={16} /></button>}
                  </div></td>
                </tr>
              ))}</tbody>
            </table></div>
            <div className="table-pagination"><span>Page {result.page} of {Math.max(result.totalPages, 1)}</span><div><button className="icon-button" aria-label="Previous page" disabled={loading || result.page <= 1} onClick={() => load(result.page - 1)}><ChevronLeft size={17} /></button><button className="icon-button" aria-label="Next page" disabled={loading || result.page >= result.totalPages} onClick={() => load(result.page + 1)}><ChevronRight size={17} /></button></div></div>
          </>
        ) : <EmptyState title="No members found" description={query ? "Try a different search term." : "New accounts will appear here."} />}
      </div>
      <Modal open={Boolean(pendingDelete)} title="Delete this user?" description={`This will permanently delete ${pendingDelete?.firstName || "this user"}’s account and all of their notes.`} onClose={() => !busyId && setPendingDelete(null)} onConfirm={removeUser} confirmLabel="Delete user" danger busy={Boolean(busyId)} busyLabel="Deleting..." />
    </div>
  );
}
