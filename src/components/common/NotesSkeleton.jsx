import NoteSkeleton from "./NoteSkeleton.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function NotesSkeleton({ count = 6, className = "" }) {
  const { t } = useLanguage();

  return (
    <div className={`notes-grid ${className}`} aria-label={t("Loading notes")}>
      {Array.from({ length: count }, (_, index) => <NoteSkeleton key={index} />)}
    </div>
  );
}
