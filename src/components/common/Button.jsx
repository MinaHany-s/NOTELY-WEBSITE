import ButtonLoader from "./ButtonLoader.jsx";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  disabled = false,
  loading = false,
  loadingLabel = "Loading...",
  ...props
}) {
  return (
    <button
      className={`button button-${variant} button-${size} ${loading ? "button-is-loading" : ""} ${className}`}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <ButtonLoader />}
      <span className="button-label">{loading ? loadingLabel : children}</span>
    </button>
  );
}
