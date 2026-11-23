import { FileText } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function EmptyState({ title, description, action }) {
  const { t } = useLanguage();

  return (
    <div className="empty-state">
      <span className="empty-icon"><FileText size={23} /></span>
      <h3>{t(title)}</h3>
      <p>{t(description)}</p>
      {action}
    </div>
  );
}
