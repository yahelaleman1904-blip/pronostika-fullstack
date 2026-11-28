import { useState } from 'react';
import { ListOrdered, CalendarDays, Goal } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import SegmentedTabs from '../components/ui/SegmentedTabs';
import TeamCrest from '../components/ui/TeamCrest';
import FormDots from '../components/ui/FormDots';
import FixtureRow from '../components/ui/FixtureRow';
import { SkeletonRows } from '../components/ui/Skeleton';
import useLoader from '../hooks/useLoader';
import { getLeagueLogo } from '../utils/teamLogos';
import {
  SEASON,
  ZONES,
  getLeague,
  getStandings,
  getFixtures,
  getTopPlayers,
  toDateKey,
  withDelay,
} from '../data/sampleFootball';

const TABS = [
  { id: 'tabla', label: 'Tabla', icon: ListOrdered },
  { id: 'partidos', label: 'Partidos', icon: CalendarDays },
  { id: 'goleadores', label: 'Goleadores', icon: Goal },
];

const loadLeagueFixtures = (leagueId) => {
  const days = [];
  for (let offset = -3; offset <= 4; offset += 1) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    days.push(...getFixtures(toDateKey(d)).filter((f) => f.ligaId === leagueId));
  }
  return days;
};

function StandingsTable({ rows, onOpenTeam }) {
  const zonesInUse = [...new Set(rows.map((r) => r.zona).filter(Boolean))];
  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-fade-up">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-white/8">
              <th className="pl-4 pr-2 py-3 text-left w-10">#</th>
              <th className="px-2 py-3 text-left">Equipo</th>
              <th className="px-2 py-3 text-center" title="Partidos jugados">PJ</th>
              <th className="px-2 py-3 text-center hidden sm:table-cell" title="Ganados">G</th>
              <th className="px-2 py-3 text-center hidden sm:table-cell" title="Empatados">E</th>
              <th className="px-2 py-3 text-center hidden sm:table-cell" title="Perdidos">P</th>
              <th className="px-2 py-3 text-center hidden md:table-cell" title="Goles a favor y en contra">Goles</th>
              <th className="px-2 py-3 text-center" title="Diferencia de goles">DG</th>
              <th className="px-2 py-3 text-center">Pts</th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">Últimos 5</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.equipo}
                onClick={() => onOpenTeam?.(r.equipo)}
                className="glass-row border-t border-white/5 cursor-pointer"
              >
                <td className="pl-4 pr-2 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-1 h-6 rounded-full ${r.zona ? ZONES[r.zona].color : 'bg-transparent'}`} />
                    <span className="font-semibold tabular-nums text-slate-300">{r.pos}</span>
                  </div>
                </td>
                <td className="px-2 py-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <TeamCrest name={r.equipo} size="xs" />
                    <span className="font-semibold text-white truncate">{r.equipo}</span>
                  </div>
                </td>
                <td className="px-2 py-2.5 text-center tabular-nums text-slate-300">{r.pj}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-slate-400 hidden sm:table-cell">{r.g}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-slate-400 hidden sm:table-cell">{r.e}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-slate-400 hidden sm:table-cell">{r.p}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-slate-400 hidden md:table-cell">
                  {r.gf}:{r.gc}
                </td>
                <td
                  className={`px-2 py-2.5 text-center tabular-nums font-semibold ${
                    r.dg > 0 ? 'text-[#10B981]' : r.dg < 0 ? 'text-red-400' : 'text-slate-400'
                  }`}
                >
                  {r.dg > 0 ? `+${r.dg}` : r.dg}
                </td>
                <td className="px-2 py-2.5 text-center">
                  <span className="font-display text-base font-extrabold text-white tabular-nums">{r.pts}</span>
                </td>
                <td className="px-4 py-2.5 hidden lg:table-cell">
                  <FormDots results={r.forma} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {zonesInUse.length > 0 && (
        <div className="flex flex-wrap gap-x-5 gap-y-2 px-4 py-3 border-t border-white/8 text-xs text-[#94A3B8]">
          {zonesInUse.map((z) => (
            <span key={z} className="inline-flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${ZONES[z].color}`} />
              {ZONES[z].label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Tabla de posiciones de una liga con pestañas de partidos y goleadores.
export default function StandingsPage({ leagueId, onBack, onOpenTeam }) {
  const [tab, setTab] = useState('tabla');
  const league = getLeague(leagueId);

  const { data, loading } = useLoader(
    () =>
      withDelay({
        tabla: getStandings(league.id),
        partidos: loadLeagueFixtures(league.id),
        goleadores: getTopPlayers(league.id).sort((a, b) => b.goles - a.goles),
      }),
    league.id
  );

  return (
    <div className="space-y-6">
      <PageHeader
        image={getLeagueLogo(league.nombre)}
        icon={ListOrdered}
        title={league.nombre}
        subtitle={`${league.pais} · Temporada ${SEASON}`}
        onBack={onBack}
        backLabel="Todas las competiciones"
      >
        <SegmentedTabs tabs={TABS} value={tab} onChange={setTab} size="sm" />
      </PageHeader>

      {loading ? (
        <div className="glass-card rounded-2xl p-4">
          <SkeletonRows rows={10} className="h-9" />
        </div>
      ) : tab === 'tabla' ? (
        <StandingsTable rows={data.tabla} onOpenTeam={onOpenTeam} />
      ) : tab === 'partidos' ? (
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-up">
          {data.partidos.length === 0 ? (
            <p className="p-8 text-center text-sm text-[#94A3B8]">Sin partidos esta semana.</p>
          ) : (
            data.partidos.map((f) => <FixtureRow key={f.id} fixture={f} onTeamClick={onOpenTeam} showDate />)
          )}
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-up">
          {data.goleadores.length === 0 ? (
            <p className="p-8 text-center text-sm text-[#94A3B8]">Aún no hay goleadores registrados para esta competición.</p>
          ) : (
            data.goleadores.map((p, i) => (
              <div key={p.id} className="glass-row flex items-center gap-4 px-4 py-3 border-t border-white/5 first:border-t-0">
                <span className="w-6 text-sm font-semibold text-slate-400 tabular-nums">{i + 1}</span>
                <TeamCrest name={p.equipo} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{p.nombre}</p>
                  <p className="text-xs text-[#94A3B8]">{p.equipo}</p>
                </div>
                <span className="font-display text-xl font-extrabold text-[#10B981] tabular-nums">{p.goles}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
