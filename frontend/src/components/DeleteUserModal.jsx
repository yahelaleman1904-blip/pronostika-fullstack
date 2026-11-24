import { AlertTriangle } from 'lucide-react';

// Confirmación para eliminar un usuario (reemplaza a confirm()).
export default function DeleteUserModal({ user, onCancel, onConfirm, isDeleting }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm rounded-2xl bg-[#1E293B] border border-[#334155] p-6 text-center shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">¿Eliminar usuario?</h3>
        <p className="text-sm text-[#94A3B8] mb-6">
          Se eliminará la cuenta de{' '}
          <span className="text-white font-semibold">
            {user.nombre} {user.apellido}
          </span>{' '}
          junto con sus pronósticos y quinielas. Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
