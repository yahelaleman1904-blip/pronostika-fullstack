import { useState } from 'react';
import { Bell, LogOut, Plus, CheckCircle2, Flame } from 'lucide-react';

export default function Navbar({ user, activeView, onLogout, onQuickAdd }) {
  const [notifOpen, setNotifOpen] = useState(false);

  const titles = {
    predicciones: 'Predicciones',
    partidos: 'Partidos de la Jornada',
    quiniela: 'Mi Quiniela Interactiva',
    estadisticas: 'Estadísticas y Rendimiento',
  };

  const firstName = user?.nombre || user?.firstName || 'Analista';
  const lastName = user?.apellido || user?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const handle = user?.email ? user.email.split('@')[0] : user?.username || 'pronostika';
  const initials = `${firstName[0] || 'P'}${lastName[0] || ''}`.toUpperCase();
  const avatarSrc = user?.avatarUrl || user?.image;

  return (
    <header className="h-18 bg-[#0F172A]/75 backdrop-blur-xl border-b border-white/8 px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-bold tracking-tight text-white">
          {titles[activeView] || 'Predicciones'}
        </h1>
        <p className="text-xs text-[#94A3B8]">Temporada 2026/27</p>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onQuickAdd}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#10B981]/12 hover:bg-[#10B981]/20 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Crear pronóstico</span>
        </button>

        {/* Campana de Notificaciones */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="w-2 h-2 rounded-full bg-[#10B981] absolute top-1.5 right-1.5 ring-2 ring-[#0F172A]" />
          </button>

          {notifOpen && (
            <div className="glass-panel absolute right-0 mt-2.5 w-80 rounded-2xl p-4 z-50">
              <p className="text-xs font-bold text-white mb-3 tracking-wide uppercase">
                Notificaciones recientes
              </p>
              <div className="space-y-2.5 text-xs text-[#94A3B8]">
                <div className="p-3 rounded-xl bg-[#0F172A]/75 border border-white/6 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <p>
                    <span className="text-white font-semibold">Pronóstico registrado:</span> tus
                    selecciones están sincronizadas con el servidor.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#0F172A]/75 border border-white/6 flex items-start gap-2.5">
                  <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p>
                    <span className="text-white font-semibold">Jornada 12:</span> llevas 5 aciertos
                    seguidos esta semana.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Perfil del usuario activo */}
        <div className="flex items-center gap-3 pl-4 border-l border-white/8">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={fullName}
              className="w-9 h-9 rounded-full object-cover border border-[#10B981]/60 bg-[#1E293B]"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#10B981]/15 border border-[#10B981]/40 text-[#10B981] font-bold text-xs flex items-center justify-center">
              {initials}
            </div>
          )}
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-white leading-none">{fullName}</p>
            <p className="text-xs text-[#10B981] mt-1 tabular-nums">@{handle} · 1,240 pts</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 text-xs font-semibold transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Cerrar sesión</span>
        </button>
      </div>
    </header>
  );
}