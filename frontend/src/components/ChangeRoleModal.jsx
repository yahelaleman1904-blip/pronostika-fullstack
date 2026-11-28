import { useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';

const ROLE_INFO = {
  ADMIN: 'Acceso total, incluido este panel de usuarios.',
  ANALISTA: 'Puede publicar y editar pronósticos de los partidos.',
  USUARIO: 'Consulta partidos y arma sus propias quinielas.',
};

// Se monta solo cuando hay un usuario seleccionado (el padre usa key={user.id}),
// así el estado inicial siempre es el rol actual.
export default function ChangeRoleModal({ user, roles, onCancel, onConfirm, isSaving }) {
  const [selectedRole, setSelectedRole] = useState(user.rol);
  const options = roles.length ? roles : Object.keys(ROLE_INFO);
  const unchanged = selectedRole === user.rol;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-2xl glass-card p-6 animate-scale-in shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Cambiar rol</h3>
              <p className="text-xs text-[#94A3B8]">
                {user.nombre} {user.apellido} · {user.email}
              </p>
            </div>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-white cursor-pointer btn-press" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {options.map((role) => (
            <label
              key={role}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                selectedRole === role
                  ? 'border-[#10B981] bg-[#10B981]/10'
                  : 'border-[#334155] bg-[#0F172A] hover:border-slate-500'
              }`}
            >
              <input
                type="radio"
                name="rol"
                value={role}
                checked={selectedRole === role}
                onChange={() => setSelectedRole(role)}
                className="mt-1 accent-[#10B981]"
              />
              <div>
                <p className="text-sm font-semibold text-white">{role}</p>
                <p className="text-xs text-[#94A3B8]">{ROLE_INFO[role] || 'Rol del sistema.'}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-5">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium cursor-pointer btn-press"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(selectedRole)}
            disabled={unchanged || isSaving}
            className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-slate-950 text-sm font-bold cursor-pointer btn-press disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Guardando...' : 'Guardar rol'}
          </button>
        </div>
      </div>
    </div>
  );
}
