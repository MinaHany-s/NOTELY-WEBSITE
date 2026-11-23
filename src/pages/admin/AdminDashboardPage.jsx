import { useCallback, useEffect, useState } from "react";
import { Archive, ArrowRight, FileText, Shield, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getAdminStats } from "../../api/users.api.js";
import { getErrorMessage } from "../../utils/errors.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import StatCard from "../../components/notes/StatCard.jsx";
import SkeletonCard from "../../components/common/SkeletonCard.jsx";
import Button from "../../components/common/Button.jsx";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminStats();
      setStats(response.data);
    } catch (requestError) {
      setError(requestError);
      toast.error(getErrorMessage(requestError, "Could not load admin statistics."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="page-wrap">
      <PageHeader eyebrow="ADMINISTRATION" title="Admin dashboard" description="A high-level view of your NOTELY community." action={<button className="text-button" onClick={() => navigate("/admin/users")}>Manage users <ArrowRight size={15} /></button>} />
      {error && <div className="inline-error"><span>Admin statistics could not be loaded.</span><Button variant="secondary" onClick={loadStats} loading={loading} loadingLabel="Refreshing...">Retry</Button></div>}
      {loading && !stats ? <div className="stats-grid stat-grid-large">{[1, 2, 3, 4].map((item) => <SkeletonCard key={item} />)}</div> : stats && (
        <>
          <div className="stats-grid stat-grid-large">
            <StatCard label="Total users" value={stats?.users?.total} caption={`${stats?.users?.admins ?? 0} administrators`} icon={Users} tone="violet" />
            <StatCard label="Total notes" value={stats?.notes?.total} caption="Created across all accounts" icon={FileText} tone="blue" />
            <StatCard label="Active notes" value={stats?.notes?.active} caption="Currently in use" icon={Shield} tone="amber" />
            <StatCard label="Archived" value={stats?.notes?.archived} caption={`${stats?.notes?.trashed ?? 0} notes in trash`} icon={Archive} tone="rose" />
          </div>
          <section className="admin-spotlight">
            <div className="spotlight-icon"><Users size={20} /></div>
            <div><h2>People make the product</h2><p className="muted">Review member accounts, their note collections, and account roles.</p></div>
            <button className="button button-secondary" onClick={() => navigate("/admin/users")}>Open user management <ArrowRight size={15} /></button>
          </section>
        </>
      )}
    </div>
  );
}
