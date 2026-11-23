import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { formatNumber } from "../../utils/format.js";

export default function StatCard({ label, value, caption, icon: Icon, tone = "neutral", onClick }) {
  const { t } = useLanguage();
  const Element = onClick ? "button" : "div";
  return (
    <Element className={`stat-card ${onClick ? "stat-card-button" : ""}`} onClick={onClick} type={onClick ? "button" : undefined}>
      <div className="stat-card-heading"><span>{t(label)}</span><span className={`stat-icon ${tone}`}><Icon size={17} /></span></div>
      <div className="stat-value">{value == null ? "—" : formatNumber(value)}</div>
      <div className="stat-caption">{caption ? t(caption) : <><ArrowUpRight size={14} /> {t("From your notes")}</>}</div>
    </Element>
  );
}
