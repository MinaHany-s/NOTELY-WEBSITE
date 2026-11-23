import { useEffect } from "react";
import { X } from "lucide-react";
import Button from "./Button.jsx";

export default function Modal({ open, title, description, children, onClose, onConfirm, confirmLabel = "Confirm", danger = false, busy = false, busyLabel = "Working..." }) {
  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, busy]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={(event) => !busy && event.target === event.currentTarget && onClose()}>
      <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="icon-button modal-close" onClick={onClose} aria-label="Close dialog" disabled={busy}><X size={18} /></button>
        <h2 id="modal-title">{title}</h2>
        {description && <p className="muted">{description}</p>}
        {children}
        {onConfirm && (
          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
            <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} loading={busy} loadingLabel={busyLabel}>
              {confirmLabel}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
