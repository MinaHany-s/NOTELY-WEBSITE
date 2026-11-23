import { Languages } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function LanguageSwitcher({ className = "" }) {
  const { language, setLanguage, t } = useLanguage();
  const nextLanguage = language === "en" ? "ar" : "en";
  const switchLabel = language === "en" ? "Switch to Arabic" : "Switch to English";

  return (
    <button
      type="button"
      className={`language-switcher ${className}`}
      onClick={() => setLanguage(nextLanguage)}
      aria-label={t(switchLabel)}
      title={t(switchLabel)}
    >
      <Languages size={16} aria-hidden="true" />
      <span>{nextLanguage === "ar" ? "AR" : "EN"}</span>
    </button>
  );
}
