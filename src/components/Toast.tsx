import React from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  description?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-5 ${
            t.type === "success"
              ? "border-emerald-500/30 bg-emerald-950/90 text-emerald-100"
              : t.type === "error"
              ? "border-rose-500/30 bg-rose-950/90 text-rose-100"
              : "border-amber-500/30 bg-neutral-900/95 text-neutral-100"
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {t.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            ) : t.type === "error" ? (
              <AlertTriangle className="h-5 w-5 text-rose-400" />
            ) : (
              <Info className="h-5 w-5 text-amber-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-bold leading-tight text-white">{t.title}</h5>
            {t.description && (
              <p className="mt-1 text-[11px] opacity-80 leading-normal">{t.description}</p>
            )}
          </div>

          <button
            onClick={() => onDismiss(t.id)}
            className="shrink-0 p-1 text-white/50 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
