import { useLanguage } from "../../context/LanguageContext.jsx";

export default function SectionLoader({ message = "Loading...", className = "" }) {
  const { t } = useLanguage();

  return (
    <div className={`section-loader ${className}`} role="status" aria-live="polite">
      <span className="section-spinner" aria-hidden="true" />
      <span>{t(message)}</span>
    </div>
  );
}
