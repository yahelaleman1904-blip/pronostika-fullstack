import { useState } from 'react';
import { Shield, Users, CalendarClock, History, ChevronDown, Database, FlaskConical } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import SegmentedTabs from '../components/ui/SegmentedTabs';
import TeamCrest from '../components/ui/TeamCrest';
import FormDots from '../components/ui/FormDots';
import FixtureRow from '../components/ui/FixtureRow';
import { PositionBadge } from '../components/ui/Badges';
import { Skeleton, SkeletonRows } from '../components/ui/Skeleton';
import useLoader from '../hooks/useLoader';
import { fetchRealMatchDetails } from '../services/api';
import {
  SEASON,
  findLeagueOfTeam,
  getStandings,
  getTeamFixtures,
  getSampleSquad,
} from '../data/sampleFootball';

const TABS = [
  { id: 'resumen', label: 'Resumen', icon: CalendarClock },
  { id: 'plantilla', label: 'Plantilla', icon: Users },
];

const POSITION_GROUPS = [
  { id: 'POR', label: 'Porteros', match: ['POR', 'G', 'GK'] },
  { id: 'DEF', label: 'Defensas', match: ['DEF', 'D', 'CB', 'LB', 'RB'] },
  { id: 'MED', label: 'Mediocampistas', match: ['MED', 'M', 'CM', 'DM', 'AM'] },
  { id: 'DEL', label: 'Delanteros', match: ['DEL', 'F', 'FW', 'ST', 'LW', 'RW'] },
];

const groupOf = (pos = '') =>
  POSITION_GROUPS.find((g) => g.match.includes(pos.toUpperCase()))?.id || 'MED';

// Recientes desde los datos de ejemplo, en el mismo formato que regresa el backend.
const recentFromFixtures = (team, fixtures) =>
  fixtures.map((f) => {
    const isHome = f.local === team;
    const mine = isHome ? f.golesLocal : f.golesVisitante;
    const theirs = isHome ? f.golesVisitante : f.golesLocal;
    return {
      date: f.fecha,
      rival: isHome ? f.visitante : f.local,
      score: `${mine} - ${theirs}`,
      result: mine > theirs ? 'W' : mine < theirs ? 'L' : 'D',
      isHome,
    };
  });

// Intenta traer plantilla y últimos partidos reales del backend (/api/sports/match-details);
// si no responde, usa los datos de ejemplo.
async function loadTeam(team) {
  const league = findLeagueOfTeam(team);
  const row = getStandings(league.id).find((r) => r.equipo === team);
  const fixtures = getTeamFixtures(team);
  let roster = getSampleSquad(team);
  let recent = recentFromFixtures(team, fixtures.recientes);
  let source = 'ejemplo';

  try {
    const data = await fetchRealMatchDetails(team, team, league.nombre);
    const home = data?.home;
    if (home?.found) {
      if (home.roster?.length) roster = home.roster;
      if (home.recentMatches?.length) recent = home.recentMatches;
      source = 'backend';
    }
  } catch {
    // Backend apagado o sin sesión: se quedan los datos de ejemplo.
  }

  return { league, row, roster, recent, proximos: fixtures.proximos, source };
}

function SquadGroup({ group, players, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/3 transition-colors"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-bold text-white">
          {group.label}
          <span className="text-xs font-semibold text-slate-500 tabular-nums">{players.length}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className="collapse-grid" data-open={open}>
        <div>
          {players.map((p) => (
            <div key={p.id} className="glass-row flex items-center gap-3 px-4 py-2.5 border-t border-white/5">
              <span className="w-8 h-8 rounded-lg bg-[#0F172A] border border-white/10 flex items-center justify-center font-display font-bold text-sm text-[#10B981] tabular-nums">
                {p.number}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                <p className="text-xs text-slate-500">{p.age ? `${p.age} años` : 'Edad no disponible'}</p>
              </div>
              {p.rating && (
                <span className="px-2 py-0.5 rounded-md bg-[#10B981]/15 border border-[#10B981]/30 text-[11px] font-bold text-[#10B981] tabular-nums">
                  {p.rating}
                </span>
              )}
              <PositionBadge position={p.position} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Perfil de equipo: escudo, posición en la tabla, plantilla, próximos partidos y resultados recientes.
export default function TeamPage({ team, onBack, onOpenTeam, onOpenLeague }) {
  const [tab, setTab] = useState('resumen');
  const { data, loading } = useLoader(() => loadTeam(team), team);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-24" />
        <div className="glass-card rounded-3xl p-6 flex items-center gap-5">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <SkeletonRows rows={6} />
        </div>
      </div>
    );
  }

  const { league, row, roster, recent, proximos, source } = data;
  const grouped = POSITION_GROUPS.map((g) => ({
    group: g,
    players: roster.filter((p) => groupOf(p.position) === g.id),
  })).filter((g) => g.players.length);

  const tiles = row
    ? [
        { label: 'Posición', value: `${row.pos}°` },
        { label: 'Puntos', value: row.pts, accent: true },
        { label: 'PJ', value: row.pj },
        { label: 'G-E-P', value: `${row.g}-${row.e}-${row.p}` },
        { label: 'Goles', value: `${row.gf}:${row.gc}` },
        { label: 'DG', value: row.dg > 0 ? `+${row.dg}` : row.dg },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Shield}
        title="Perfil de equipo"
        subtitle={`Temporada ${SEASON}`}
        onBack={onBack}
      >
        <SegmentedTabs tabs={TABS} value={tab} onChange={setTab} size="sm" />
      </PageHeader>

      {/* Tarjeta principal */}
      <div className="relative glass-card rounded-3xl p-6 overflow-hidden animate-fade-up">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#10B981]/15 blur-3xl" />
        <div className="relative flex flex-col xl:flex-row xl:items-center gap-6">
          <div className="flex items-center gap-5 min-w-0">
            <div className="w-28 h-28 rounded-3xl bg-[#0F172A]/80 border border-white/10 flex items-center justify-center shadow-inner shrink-0">
              <TeamCrest name={team} size="xl" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-3xl sm:text-4xl font-black text-white truncate">{team}</h3>
              <button
                onClick={() => onOpenLeague?.(league.id)}
                className="mt-1 text-sm text-[#10B981] font-semibold hover:underline cursor-pointer"
              >
                {league.nombre} · {league.pais}
              </button>
              <div className="mt-3 flex items-center gap-3">
                {recent.length > 0 && <FormDots results={recent.map((m) => m.result).reverse()} size="md" />}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-semibold whitespace-nowrap ${
                    source === 'backend'
                      ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  {source === 'backend' ? <Database className="w-3 h-3" /> : <FlaskConical className="w-3 h-3" />}
                  {source === 'backend' ? 'Datos reales' : 'Datos de ejemplo'}
                </span>
              </div>
            </div>
          </div>

          {tiles.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 xl:ml-auto">
              {tiles.map((t) => (
                <div key={t.label} className="rounded-xl bg-[#0F172A]/60 border border-white/8 px-3 py-2.5 text-center min-w-20 whitespace-nowrap">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">{t.label}</p>
                  <p
                    className={`font-display text-xl font-extrabold tabular-nums ${
                      t.accent ? 'text-[#10B981]' : 'text-white'
                    }`}
                  >
                    {t.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {tab === 'resumen' ? (
        <div key="resumen" className="grid gap-6 lg:grid-cols-2 animate-fade-up">
          <section className="glass-card rounded-2xl overflow-hidden">
            <h4 className="flex items-center gap-2 px-4 py-3 border-b border-white/8 text-sm font-bold text-white">
              <CalendarClock className="w-4 h-4 text-[#10B981]" />
              Próximos partidos
            </h4>
            {proximos.length === 0 ? (
              <p className="p-6 text-sm text-center text-[#94A3B8]">Sin partidos programados.</p>
            ) : (
              proximos.map((f) => (
                <FixtureRow key={f.id} fixture={f} onTeamClick={onOpenTeam} highlightTeam={team} showDate />
              ))
            )}
          </section>

          <section className="glass-card rounded-2xl overflow-hidden">
            <h4 className="flex items-center gap-2 px-4 py-3 border-b border-white/8 text-sm font-bold text-white">
              <History className="w-4 h-4 text-[#10B981]" />
              Resultados recientes
            </h4>
            {recent.length === 0 ? (
              <p className="p-6 text-sm text-center text-[#94A3B8]">Sin resultados recientes.</p>
            ) : (
              recent.map((m, i) => (
                <div key={`${m.date}-${i}`} className="glass-row flex items-center gap-3 px-4 py-3 border-t border-white/5 first:border-t-0">
                  <FormDots results={[m.result]} />
                  <span className="w-14 text-xs text-slate-500 tabular-nums">
                    {new Date(`${m.date}T00:00:00`).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                  </span>
                  <span className="text-[10px] font-semibold uppercase text-slate-500 w-9">{m.isHome ? 'Local' : 'Visita'}</span>
                  <button
                    onClick={() => onOpenTeam?.(m.rival)}
                    className="flex items-center gap-2 flex-1 min-w-0 text-left cursor-pointer hover:text-[#10B981] text-slate-200"
                  >
                    <TeamCrest name={m.rival} size="xs" />
                    <span className="text-sm truncate">{m.rival}</span>
                  </button>
                  <span className="font-display text-base font-bold text-white tabular-nums">{m.score}</span>
                </div>
              ))
            )}
          </section>
        </div>
      ) : (
        <div key="plantilla" className="grid gap-4 lg:grid-cols-2 items-start stagger">
          {grouped.map(({ group, players }, i) => (
            <SquadGroup key={group.id} group={group} players={players} defaultOpen={i < 2} />
          ))}
        </div>
      )}
    </div>
  );
}
