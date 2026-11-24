import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

// Notificación flotante (reemplaza a alert()). type: 'success' | 'error'
export default function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isError = type === 'error';
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <div className="fixed bottom-6 right-6 z-[60] max-w-sm" role="status" aria-live="polite">
      <div
        className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl bg-[#1E293B] ${
          isError ? 'border-red-500/40 text-red-300' : 'border-[#10B981]/40 text-[#10B981]'
        }`}
      >
        <Icon className="w-5 h-5 shrink-0 mt-0.5" />
        <p className="text-sm text-slate-200 flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white cursor-pointer"
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
