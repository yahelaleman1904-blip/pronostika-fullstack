import { useState } from 'react';
import { Trophy, Search, ChevronRight, Globe2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import SegmentedTabs from '../components/ui/SegmentedTabs';
import TeamCrest from '../components/ui/TeamCrest';
import { SkeletonCards } from '../components/ui/Skeleton';
import useLoader from '../hooks/useLoader';
import { getLeagueLogo } from '../utils/teamLogos';
import { LEAGUES, LEAGUE_TYPES, SEASON, getStandings, withDelay } from '../data/sampleFootball';

const TYPE_LABEL = { liga: 'Liga', copa: 'Copa', internacional: 'Internacional' };

const normalize = (t) =>
  t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

// Torneos, ligas y competiciones. Al elegir una se abre su tabla de posiciones.
export default function LeaguesPage({ onOpenLeague }) {
  const [type, setType] = useState('todas');
  const [query, setQuery] = useState('');

  const { data: leagues, loading } = useLoader(
    () =>
      withDelay(
        LEAGUES.map((l) => ({ ...l, lider: getStandings(l.id)[0], logo: getLeagueLogo(l.nombre) }))
      ),
    'ligas'
  );

  const q = normalize(query.trim());
  const visible = (leagues || []).filter(
    (l) =>
      (type === 'todas' || l.tipo === type) &&
      (!q || normalize(l.nombre).includes(q) || normalize(l.pais).includes(q))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Trophy}
        title="Torneos y competiciones"
        subtitle={`Temporada ${SEASON} · ${LEAGUES.length} competiciones disponibles`}
      >
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar liga o país"
            className="w-56 pl-9 pr-3 py-2.5 rounded-xl bg-[#0F172A]/70 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#10B981] transition-colors"
          />
        </div>
      </PageHeader>

      <SegmentedTabs tabs={LEAGUE_TYPES} value={type} onChange={setType} size="sm" />

      {loading ? (
        <SkeletonCards count={6} className="h-40" />
      ) : visible.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-sm text-[#94A3B8] animate-fade-in">
          No hay competiciones que coincidan con la búsqueda.
        </div>
      ) : (
        <div key={type} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 stagger">
          {visible.map((league) => (
            <button
              key={league.id}
              onClick={() => onOpenLeague?.(league.id)}
              className="glass-card lift-hover rounded-2xl p-5 text-left cursor-pointer group active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-white/95 flex items-center justify-center p-1.5 shrink-0 shadow-inner">
                    {league.logo ? (
                      <img src={league.logo} alt="" className="w-9 h-9 object-contain" />
                    ) : (
                      <Globe2 className="w-6 h-6 text-slate-700" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-lg font-bold text-white truncate">{league.nombre}</p>
                    <p className="text-xs text-[#94A3B8]">{league.pais}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                  {TYPE_LABEL[league.tipo]}
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
                <div className="flex items-center gap-2 min-w-0">
                  <TeamCrest name={league.lider.equipo} size="sm" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Líder</p>
                    <p className="text-sm font-semibold text-white truncate">{league.lider.equipo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-display text-xl font-extrabold text-[#10B981] tabular-nums">{league.lider.pts}</p>
                    <p className="text-[10px] text-slate-500">pts</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-[#10B981]" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
