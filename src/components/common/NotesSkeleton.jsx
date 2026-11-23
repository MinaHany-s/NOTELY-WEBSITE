import NoteSkeleton from "./NoteSkeleton.jsx";

export default function NotesSkeleton({ count = 6, className = "" }) {
  return (
    <div className={`notes-grid ${className}`} aria-label="Loading notes">
      {Array.from({ length: count }, (_, index) => <NoteSkeleton key={index} />)}
    </div>
  );
}
