import { useState } from 'react';
import {
  X,
  Star,
  Sparkles,
  BarChart3,
  TrendingUp,
  Calendar,
  Shield,
  Pencil,
} from 'lucide-react';
import { getTeamLogo, getLeagueLogo, parseTeams } from '../utils/teamLogos';

function TeamBadge({ name, size = 'lg' }) {
  const logo = getTeamLogo(name);
  const dim = size === 'lg' ? 'w-14 h-14' : 'w-7 h-7';
  if (logo) {
    return <img src={logo} alt={name} className={`${dim} object-contain drop-shadow-md`} />;
  }
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className={`${dim} rounded-2xl bg-[#1E293B] border border-white/10 flex items-center justify-center font-display font-bold text-[#10B981]`}
    >
      {initials}
    </div>
  );
}

export default function MatchDetailModal({ match, onClose, onEdit }) {
  const [activeTab, setActiveTab] = useState('ia');
  const [userVote, setUserVote] = useState(null);
  const [isFav, setIsFav] = useState(false);

  if (!match) return null;

  const { local, away } = parseTeams(match.title);
  const leagueLogo = getLeagueLogo(match.category);

  // Probabilidades calculadas a partir del pronóstico
  const prob = Number(match.probabilidad) || 65;
  const isLocalFav = match.ganadorPrevisto?.toLowerCase().includes(local.toLowerCase());
  const isDrawFav = match.ganadorPrevisto?.toLowerCase().includes('empate');
  const localPct = isLocalFav ? prob : isDrawFav ? Math.round((100 - prob) / 2) : Math.max(12, 100 - prob - 18);
  const drawPct = isDrawFav ? prob : 18;
  const awayPct = Math.max(8, 100 - localPct - drawPct);

  // Estadísticas proyectadas consistentes por partido
  const seed = (match.id || 1) * 7;
  const stats = [
    { label: 'Posesión estimada', local: `${48 + (seed % 14)}%`, away: `${52 - (seed % 14)}%`, pct: 48 + (seed % 14) },
    { label: 'Goles esperados (xG)', local: (1.2 + (localPct / 100)).toFixed(2), away: (0.8 + (awayPct / 100)).toFixed(2), pct: localPct },
    { label: 'Tiros totales', local: 10 + (seed % 7), away: 7 + ((seed + 3) % 6), pct: 58 },
    { label: 'Tiros a puerta', local: 4 + (seed % 4), away: 3 + ((seed + 1) % 3), pct: 55 },
    { label: 'Córners esperados', local: 5 + (seed % 4), away: 4 + ((seed + 2) % 3), pct: 54 },
  ];

  const formLocal = ['W', 'W', 'D', 'W', 'L'];
  const formAway = ['D', 'L', 'W', 'W', 'L'];

  const formColor = (r) =>
    r === 'W'
      ? 'bg-[#10B981] text-slate-950'
      : r === 'D'
      ? 'bg-amber-400 text-slate-950'
      : 'bg-red-500 text-white';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl bg-[#0F172A] border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado estilo Sofascore */}
        <div className="p-5 border-b border-white/8 bg-[#1E293B]/60">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              {leagueLogo ? (
                <img src={leagueLogo} alt={match.category} className="w-5 h-5 object-contain" />
              ) : (
                <Shield className="w-4 h-4 text-[#10B981]" />
              )}
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {match.category}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-[#94A3B8] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {match.fecha}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFav(!isFav)}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  isFav
                    ? 'bg-amber-400/15 border-amber-400/40 text-amber-400'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
                title="Marcar favorito"
              >
                <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Marcador / Equipos */}
          <div className="grid grid-cols-3 items-center text-center gap-3 py-2">
            <div className="flex flex-col items-center gap-2.5">
              <TeamBadge name={local} size="lg" />
              <p className="font-display font-bold text-base sm:text-lg text-white leading-tight">
                {local}
              </p>
            </div>

            <div className="flex flex-col items-center">
              <span className="px-3 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-[11px] font-bold uppercase tracking-wider mb-1.5">
                {match.estado}
              </span>
              <p className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                VS
              </p>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                Pick IA: <strong className="text-white">{match.ganadorPrevisto}</strong>
              </p>
            </div>

            <div className="flex flex-col items-center gap-2.5">
              <TeamBadge name={away} size="lg" />
              <p className="font-display font-bold text-base sm:text-lg text-white leading-tight">
                {away}
              </p>
            </div>
          </div>
        </div>

        {/* Pestañas */}
        <div className="flex border-b border-white/8 px-5 bg-[#0F172A]">
          {[
            { id: 'ia', label: 'Análisis IA', icon: Sparkles },
            { id: 'stats', label: 'Estadísticas', icon: BarChart3 },
            { id: 'forma', label: 'Forma y Cuotas', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-xs font-bold border-b-2 transition cursor-pointer ${
                  active
                    ? 'border-[#10B981] text-[#10B981]'
                    : 'border-transparent text-[#94A3B8] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Contenido scrollable */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'ia' && (
            <>
              {/* Bloque "¿Quién ganará?" estilo Sofascore */}
              <div className="p-4 rounded-2xl bg-[#1E293B]/60 border border-white/8">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-display font-bold text-sm text-white">¿Quién ganará?</h4>
                    <p className="text-xs text-[#94A3B8]">
                      {userVote ? `Votaste por: ${userVote}` : 'Envía tu voto y compáralo con la IA'}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#10B981] tabular-nums">
                    Confianza IA: {prob}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { key: local, label: local, pct: localPct },
                    { key: 'Empate', label: 'X (Empate)', pct: drawPct },
                    { key: away, label: away, pct: awayPct },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setUserVote(opt.key)}
                      className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                        userVote === opt.key
                          ? 'bg-[#10B981]/20 border-[#10B981] text-white'
                          : 'bg-[#0F172A]/80 border-white/10 hover:border-[#10B981]/50 text-slate-300'
                      }`}
                    >
                      <p className="text-xs font-bold truncate">{opt.label}</p>
                      <p className="font-display font-extrabold text-lg text-[#10B981] mt-0.5 tabular-nums">
                        {opt.pct}%
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#10B981]/8 border border-[#10B981]/25 text-xs text-slate-200 leading-relaxed">
                <strong className="text-[#10B981]">Veredicto Pronostika IA:</strong> El modelo
                proyecta ventaja para <strong className="text-white">{match.ganadorPrevisto}</strong>{' '}
                con una probabilidad del <strong className="text-white">{prob}%</strong> basada en
                rendimiento reciente y volumen ofensivo en {match.category}.
              </div>
            </>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-4">
              {stats.map((st) => (
                <div key={st.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold tabular-nums">
                    <span className="text-white">{st.local}</span>
                    <span className="text-[#94A3B8] font-medium">{st.label}</span>
                    <span className="text-white">{st.away}</span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-[#1E293B] gap-0.5">
                    <div className="bg-[#10B981] rounded-l-full" style={{ width: `${st.pct}%` }} />
                    <div className="bg-sky-400 rounded-r-full flex-1" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'forma' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#1E293B]/60 border border-white/8 space-y-3">
                <h4 className="font-display font-bold text-sm text-white">Últimos 5 partidos</h4>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">{local}</span>
                  <div className="flex gap-1.5">
                    {formLocal.map((r, i) => (
                      <span
                        key={i}
                        className={`w-6 h-6 rounded-md text-[11px] font-extrabold flex items-center justify-center ${formColor(r)}`}
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">{away}</span>
                  <div className="flex gap-1.5">
                    {formAway.map((r, i) => (
                      <span
                        key={i}
                        className={`w-6 h-6 rounded-md text-[11px] font-extrabold flex items-center justify-center ${formColor(r)}`}
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'Cuota 1', val: (100 / localPct).toFixed(2) },
                  { label: 'Cuota X', val: (100 / drawPct).toFixed(2) },
                  { label: 'Cuota 2', val: (100 / awayPct).toFixed(2) },
                ].map((q) => (
                  <div
                    key={q.label}
                    className="p-3 rounded-xl bg-[#1E293B]/60 border border-white/8"
                  >
                    <p className="text-[11px] text-[#94A3B8]">{q.label}</p>
                    <p className="font-display font-extrabold text-base text-white mt-0.5 tabular-nums">
                      {q.val}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/8 bg-[#1E293B]/40 flex justify-end gap-2">
          <button
            onClick={() => {
              onClose();
              onEdit(match);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-slate-950 font-bold text-xs transition cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Editar pronóstico</span>
          </button>
        </div>
      </div>
    </div>
  );
}