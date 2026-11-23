import { useLanguage } from "../../context/LanguageContext.jsx";

export default function FullPageLoader({ message = "Loading your workspace..." }) {
  const { t } = useLanguage();

  return (
    <div className="full-page-loader" role="status" aria-live="polite">
      <span className="full-page-spinner" aria-hidden="true" />
      <strong>{t(message)}</strong>
      <span className="loader-caption">{t("Getting everything ready for you")}</span>
    </div>
  );
}
