import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function StatCard({ label, value, caption, icon: Icon, tone = "neutral", onClick }) {
  const Element = onClick ? "button" : "div";
  return (
    <Element className={`stat-card ${onClick ? "stat-card-button" : ""}`} onClick={onClick} type={onClick ? "button" : undefined}>
      <div className="stat-card-heading"><span>{label}</span><span className={`stat-icon ${tone}`}><Icon size={17} /></span></div>
      <div className="stat-value">{value ?? "—"}</div>
      <div className="stat-caption">{caption || <><ArrowUpRight size={14} /> From your notes</>}</div>
    </Element>
  );
}
