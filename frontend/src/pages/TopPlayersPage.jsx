import { useState } from 'react';
import { BarChart3, Goal, Footprints, Star, Crown } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import SegmentedTabs from '../components/ui/SegmentedTabs';
import TeamCrest from '../components/ui/TeamCrest';
import { PositionBadge } from '../components/ui/Badges';
import { Skeleton, SkeletonRows } from '../components/ui/Skeleton';
import useLoader from '../hooks/useLoader';
import { LEAGUES, getTopPlayers, withDelay } from '../data/sampleFootball';

const METRICS = [
  { id: 'goles', label: 'Goles', icon: Goal, unit: 'goles' },
  { id: 'asistencias', label: 'Asistencias', icon: Footprints, unit: 'asist.' },
  { id: 'rating', label: 'Rating', icon: Star, unit: 'prom.' },
];

const PODIUM_STYLE = [
  'from-amber-300/25 border-amber-300/40 text-amber-200',
  'from-slate-300/20 border-slate-300/35 text-slate-200',
  'from-orange-400/20 border-orange-400/35 text-orange-200',
];

// Estadísticas: top jugadores por goles, asistencias y rating, con filtro por liga.
export default function TopPlayersPage({ onOpenTeam }) {
  const [metric, setMetric] = useState('goles');
  const [league, setLeague] = useState('todas');

  const { data: players, loading } = useLoader(() => withDelay([...getTopPlayers(league)]), league);

  const sorted = [...(players || [])].sort((a, b) => b[metric] - a[metric]);
  const max = sorted.length ? sorted[0][metric] : 1;
  const unit = METRICS.find((m) => m.id === metric).unit;
  const format = (v) => (metric === 'rating' ? Number(v).toFixed(1) : v);

  return (
    <div className="space-y-6">
      <PageHeader icon={BarChart3} title="Estadísticas" subtitle="Top jugadores de la temporada">
        <select
          value={league}
          onChange={(e) => setLeague(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-[#0F172A]/70 border border-white/10 text-sm text-white focus:outline-none focus:border-[#10B981] cursor-pointer"
          aria-label="Filtrar por liga"
        >
          <option value="todas">Todas las ligas</option>
          {LEAGUES.filter((l) => l.tipo === 'liga').map((l) => (
            <option key={l.id} value={l.id}>
              {l.nombre}
            </option>
          ))}
        </select>
      </PageHeader>

      <SegmentedTabs tabs={METRICS} value={metric} onChange={setMetric} size="sm" />

      {loading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
          <div className="glass-card rounded-2xl p-4">
            <SkeletonRows rows={6} />
          </div>
        </>
      ) : sorted.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-sm text-[#94A3B8] animate-fade-in">
          Sin estadísticas para esta liga.
        </div>
      ) : (
        <div key={`${metric}-${league}`} className="space-y-6">
          {/* Podio */}
          <div className="grid gap-4 sm:grid-cols-3 stagger">
            {sorted.slice(0, 3).map((p, i) => (
              <div
                key={p.id}
                className={`relative rounded-2xl border bg-linear-to-b to-transparent p-5 glass-card lift-hover ${PODIUM_STYLE[i]}`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs font-bold">
                    {i === 0 && <Crown className="w-4 h-4" />}#{i + 1}
                  </span>
                  <PositionBadge position={p.posicion} />
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <TeamCrest name={p.equipo} size="md" />
                  <div className="min-w-0">
                    <p className="font-display text-lg font-bold text-white truncate">{p.nombre}</p>
                    <button
                      onClick={() => onOpenTeam?.(p.equipo)}
                      className="text-xs text-[#94A3B8] hover:text-[#10B981] cursor-pointer"
                    >
                      {p.equipo}
                    </button>
                  </div>
                </div>
                <p className="mt-4 font-display text-4xl font-black text-white tabular-nums">
                  {format(p[metric])}
                  <span className="ml-1.5 text-sm font-semibold text-slate-400">{unit}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Ranking completo */}
          <div className="glass-card rounded-2xl overflow-hidden animate-fade-up">
            {sorted.map((p, i) => (
              <div key={p.id} className="glass-row flex items-center gap-4 px-4 py-3 border-t border-white/5 first:border-t-0">
                <span className="w-6 text-sm font-semibold text-slate-400 tabular-nums">{i + 1}</span>
                <TeamCrest name={p.equipo} size="sm" />
                <div className="w-44 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{p.nombre}</p>
                  <p className="text-xs text-[#94A3B8] truncate">
                    {p.equipo} · {p.partidos} PJ
                  </p>
                </div>
                <div className="flex-1 hidden sm:block">
                  <div className="h-2 rounded-full bg-[#0F172A]/80 border border-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-[#059669] to-[#10B981] shadow-[0_0_12px_rgba(16,185,129,0.45)] transition-[width] duration-700 ease-out"
                      style={{ width: `${Math.max(8, (p[metric] / max) * 100)}%` }}
                    />
                  </div>
                </div>
                <span className="w-12 text-right font-display text-lg font-extrabold text-[#10B981] tabular-nums">
                  {format(p[metric])}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500">Valores de ejemplo mientras no exista un endpoint de estadísticas en el backend.</p>
        </div>
      )}
    </div>
  );
}
