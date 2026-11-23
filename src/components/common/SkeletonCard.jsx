export default function SkeletonCard() {
  return (
    <div className="skeleton-stat-card" aria-hidden="true">
      <div className="skeleton-stat-heading"><span className="skeleton skeleton-label" /><span className="skeleton skeleton-stat-icon" /></div>
      <div className="skeleton skeleton-stat-value" />
      <div className="skeleton skeleton-stat-caption" />
    </div>
  );
}
