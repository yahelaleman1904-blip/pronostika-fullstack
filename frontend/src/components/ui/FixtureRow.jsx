import TeamCrest from './TeamCrest';
import { StatusBadge, ProbabilityBadge } from './Badges';

// Fila de partido estilo marcador: hora/estado, equipos con escudo y goles.
export default function FixtureRow({ fixture, onTeamClick, highlightTeam, showDate = false }) {
  const { local, visitante, golesLocal, golesVisitante, estado, minuto, hora, fecha } = fixture;
  const played = estado !== 'programado';
  const localWins = played && golesLocal > golesVisitante;
  const awayWins = played && golesVisitante > golesLocal;

  const teamLine = (name, goals, winner) => (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={() => onTeamClick?.(name)}
        disabled={!onTeamClick}
        className={`flex items-center gap-2.5 min-w-0 text-left ${onTeamClick ? 'cursor-pointer hover:text-[#10B981]' : 'cursor-default'} ${
          winner || highlightTeam === name ? 'text-white font-semibold' : 'text-slate-300'
        }`}
      >
        <TeamCrest name={name} size="xs" />
        <span className="truncate text-sm">{name}</span>
      </button>
      <span
        className={`font-display text-base tabular-nums w-5 text-right ${
          estado === 'en_vivo' ? 'text-red-300 font-bold' : winner ? 'text-white font-bold' : 'text-slate-400'
        }`}
      >
        {played ? goals : ''}
      </span>
    </div>
  );

  return (
    <div className="glass-row flex items-center gap-4 px-4 py-3 border-t border-white/5 first:border-t-0">
      <div className="w-20 shrink-0 flex flex-col items-start gap-1">
        {showDate && (
          <span className="text-[11px] text-slate-500 tabular-nums">
            {new Date(`${fecha}T00:00:00`).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
          </span>
        )}
        {estado === 'programado' ? (
          <span className="text-sm font-semibold text-slate-300 tabular-nums">{hora}</span>
        ) : (
          <StatusBadge estado={estado} minuto={minuto} />
        )}
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        {teamLine(local, golesLocal, localWins)}
        {teamLine(visitante, golesVisitante, awayWins)}
      </div>
      {estado === 'programado' && fixture.probabilidadLocal != null && (
        <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
          <span className="text-[10px] uppercase tracking-wider text-slate-500">Local</span>
          <ProbabilityBadge value={fixture.probabilidadLocal} />
        </div>
      )}
    </div>
  );
}
