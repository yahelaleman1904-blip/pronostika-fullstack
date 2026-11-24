import { Calendar, Sparkles, Shield, BarChart3 } from 'lucide-react';
import { getTeamLogo, getLeagueLogo, parseTeams } from '../utils/teamLogos';

const formatFecha = (raw) => {
  if (!raw || raw === 'Próximamente') return 'Próximamente';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

function TeamCrest({ name }) {
  const logo = getTeamLogo(name);
  if (logo) {
    return (
      <div className="w-14 h-14 rounded-2xl bg-[#0F172A]/80 border border-white/8 flex items-center justify-center p-2 shadow-inner">
        <img src={logo} alt={name} className="w-10 h-10 object-contain drop-shadow-md" />
      </div>
    );
  }
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="w-14 h-14 rounded-2xl bg-[#0F172A]/80 border border-white/10 flex items-center justify-center font-display font-bold text-sm text-[#10B981]">
      {initials}
    </div>
  );
}

export default function MatchCardsGrid({ matches, onSelectForEdit }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h3 className="text-xl font-bold text-white">Cartelera de Partidos</h3>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Haz clic en cualquier encuentro para abrir el análisis IA, estadísticas y votación.
          </p>
        </div>
        <span className="text-xs font-semibold text-[#10B981] tabular-nums">
          {matches.length} encuentros disponibles
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {matches.map((item) => {
          const { local, away } = parseTeams(item.title);
          const leagueLogo = getLeagueLogo(item.category);
          const prob = Number(item.probabilidad) || 50;

          return (
            <div
              key={item.id}
              onClick={() => onSelectForEdit(item)}
              className="glass-panel glass-card-interactive rounded-2xl p-5 cursor-pointer flex flex-col justify-between gap-5 group"
            >
              {/* Cabecera: Liga + Estado */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/8">
                <div className="flex items-center gap-2 min-w-0">
                  {leagueLogo ? (
                    <img
                      src={leagueLogo}
                      alt={item.category}
                      className="w-5 h-5 object-contain shrink-0"
                    />
                  ) : (
                    <Shield className="w-4 h-4 text-[#10B981] shrink-0" />
                  )}
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 truncate">
                    {item.category}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#10B981]/12 border border-[#10B981]/30 text-[#10B981] text-[10px] font-bold uppercase tracking-wider shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  {item.estado}
                </span>
              </div>

              {/* Enfrentamiento con escudos reales */}
              <div className="grid grid-cols-3 items-center text-center gap-2">
                <div className="flex flex-col items-center gap-2">
                  <TeamCrest name={local} />
                  <p className="font-display font-bold text-sm text-white leading-tight line-clamp-2">
                    {local}
                  </p>
                  <span className="text-[10px] uppercase tracking-wider text-[#94A3B8]">Local</span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="font-display font-black text-xl text-slate-500 group-hover:text-[#10B981] transition-colors">
                    VS
                  </span>
                  <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#94A3B8] tabular-nums">
                    <Calendar className="w-3 h-3 text-[#10B981]" />
                    <span>{formatFecha(item.fecha)}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <TeamCrest name={away} />
                  <p className="font-display font-bold text-sm text-white leading-tight line-clamp-2">
                    {away}
                  </p>
                  <span className="text-[10px] uppercase tracking-wider text-[#94A3B8]">
                    Visitante
                  </span>
                </div>
              </div>

              {/* Barra de probabilidad IA + Botón */}
              <div className="space-y-3 pt-3 border-t border-white/8">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
                    Favorito IA: <strong className="text-white">{item.ganadorPrevisto}</strong>
                  </span>
                  <span className="font-display font-extrabold text-[#10B981] tabular-nums">
                    {prob}%
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-[#0F172A] overflow-hidden border border-white/6">
                  <div
                    className="h-full bg-linear-to-r from-[#059669] to-[#10B981] rounded-full"
                    style={{ width: `${prob}%` }}
                  />
                </div>

                <button
                  type="button"
                  className="w-full py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-slate-950 font-bold text-xs tracking-wide transition shadow-lg shadow-[#10B981]/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Ver estadísticas y votar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}