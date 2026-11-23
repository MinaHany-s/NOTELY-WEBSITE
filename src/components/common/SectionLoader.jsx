export default function SectionLoader({ message = "Loading...", className = "" }) {
  return (
    <div className={`section-loader ${className}`} role="status" aria-live="polite">
      <span className="section-spinner" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
