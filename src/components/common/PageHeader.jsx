import { useLanguage } from "../../context/LanguageContext.jsx";

export default function PageHeader({ eyebrow, title, description, action }) {
  const { t } = useLanguage();

  return (
    <div className="page-header">
      <div>
        {eyebrow && <div className="eyebrow">{t(eyebrow)}</div>}
        <h1>{t(title)}</h1>
        {description && <p className="muted">{t(description)}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </div>
  );
}
