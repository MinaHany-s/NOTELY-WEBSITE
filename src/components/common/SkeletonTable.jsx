import { useLanguage } from "../../context/LanguageContext.jsx";

export default function SkeletonTable({ rows = 5 }) {
  const { t } = useLanguage();

  return (
    <div className="skeleton-table" role="status" aria-label={t("Loading users")}>
      <div className="skeleton-table-head"><span>{t("Member")}</span><span>{t("Role")}</span><span>{t("Joined")}</span><span>{t("Actions")}</span></div>
      {Array.from({ length: rows }, (_, index) => (
        <div className="skeleton-table-row" key={index}>
          <div className="skeleton-member"><span className="skeleton skeleton-avatar" /><span className="skeleton-member-lines"><i className="skeleton" /><i className="skeleton" /></span></div>
          <span className="skeleton skeleton-cell role-cell" />
          <span className="skeleton skeleton-cell date-cell" />
          <span className="skeleton skeleton-cell action-cell" />
        </div>
      ))}
    </div>
  );
}
