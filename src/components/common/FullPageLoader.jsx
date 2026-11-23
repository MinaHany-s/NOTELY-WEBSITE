export default function FullPageLoader({ message = "Loading your workspace..." }) {
  return (
    <div className="full-page-loader" role="status" aria-live="polite">
      <span className="full-page-spinner" aria-hidden="true" />
      <strong>{message}</strong>
      <span className="loader-caption">Getting everything ready for you</span>
    </div>
  );
}
