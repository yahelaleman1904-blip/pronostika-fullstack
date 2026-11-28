import {
  Trophy,
  Calendar,
  Target,
  ListChecks,
  BarChart3,
  UserCircle,
  ShieldCheck,
} from 'lucide-react';
import { FOOTBALL_MENU_ITEMS } from '../navigation/footballViews';

export default function Sidebar({ activeView, setActiveView, user }) {
  const isAdmin = (user?.rol || '').toUpperCase().includes('ADMIN');

  const menuItems = [
    { id: 'partidos', label: 'Partidos', icon: Calendar },
    { id: 'predicciones', label: 'Predicciones', icon: Target },
    { id: 'quiniela', label: 'Mi Quiniela', icon: ListChecks },
    ...FOOTBALL_MENU_ITEMS,
    { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
    { id: 'perfil', label: 'Mi Perfil', icon: UserCircle },
    ...(isAdmin ? [{ id: 'admin', label: 'Usuarios', icon: ShieldCheck }] : []),
  ];

  return (
    <aside className="w-64 bg-[#0F172A]/80 backdrop-blur-xl border-r border-white/8 flex flex-col justify-between shrink-0 min-h-screen p-5 sticky top-0 h-screen">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center text-[#10B981] shadow-md shadow-[#10B981]/15">
            <Trophy className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Pronostika</span>
        </div>

        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">
          Menú
        </p>

        {/* Navegación */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 shadow-sm shadow-[#10B981]/10'
                    : 'text-[#94A3B8] hover:bg-white/6 hover:text-white border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tarjeta inferior de Jornada */}
      <div className="glass-panel p-4 rounded-xl">
        <p className="text-xs font-bold text-white mb-1">Jornada 12</p>
        <p className="text-xs text-[#94A3B8] leading-relaxed">
          Cierra tu quiniela antes del viernes a las 19:00 h.
        </p>
      </div>
    </aside>
  );
}