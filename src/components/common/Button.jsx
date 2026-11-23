import ButtonLoader from "./ButtonLoader.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

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
  const { t } = useLanguage();

  return (
    <button
      className={`button button-${variant} button-${size} ${loading ? "button-is-loading" : ""} ${className}`}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <ButtonLoader />}
      <span className="button-label">{loading ? t(loadingLabel) : children}</span>
    </button>
  );
}
