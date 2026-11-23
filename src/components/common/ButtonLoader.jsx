export default function ButtonLoader({ className = "" }) {
  return <span className={`button-spinner ${className}`} aria-hidden="true" />;
}
