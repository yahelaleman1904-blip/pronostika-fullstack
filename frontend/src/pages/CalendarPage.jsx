import { useState } from 'react';
import { CalendarDays, Radio, ChevronRight } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import FixtureRow from '../components/ui/FixtureRow';
import { Skeleton } from '../components/ui/Skeleton';
import useLoader from '../hooks/useLoader';
import { getLeagueLogo } from '../utils/teamLogos';
import { LEAGUES, getFixtures, toDateKey, withDelay } from '../data/sampleFootball';

const DAYS_BACK = 3;
const DAYS_AHEAD = 4;

const buildDays = () => {
  const days = [];
  for (let offset = -DAYS_BACK; offset <= DAYS_AHEAD; offset += 1) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    days.push({
      key: toDateKey(d),
      offset,
      weekday: offset === 0 ? 'Hoy' : d.toLocaleDateString('es-MX', { weekday: 'short' }).replace('.', ''),
      day: d.getDate(),
      month: d.toLocaleDateString('es-MX', { month: 'short' }).replace('.', ''),
    });
  }
  return days;
};

// Calendario y partidos en vivo con filtros por fecha y por liga.
export default function CalendarPage({ onOpenTeam, onOpenLeague }) {
  const [days] = useState(buildDays);
  const [dateKey, setDateKey] = useState(days[DAYS_BACK].key);
  const [league, setLeague] = useState('todas');
  const [liveOnly, setLiveOnly] = useState(false);

  const { data: fixtures, loading } = useLoader(() => withDelay(getFixtures(dateKey), 350), dateKey);

  const filtered = (fixtures || []).filter(
    (f) => (league === 'todas' || f.ligaId === league) && (!liveOnly || f.estado === 'en_vivo')
  );
  const liveCount = (fixtures || []).filter((f) => f.estado === 'en_vivo').length;

  const groups = LEAGUES.map((l) => ({ league: l, items: filtered.filter((f) => f.ligaId === l.id) })).filter(
    (g) => g.items.length
  );

  return (
    <div className="space-y-6">
      <PageHeader icon={CalendarDays} title="Calendario" subtitle="Resultados, partidos en vivo y próximos encuentros">
        <button
          onClick={() => setLiveOnly((v) => !v)}
          className={`btn-press inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold cursor-pointer ${
            liveOnly
              ? 'bg-red-500/20 border-red-500/40 text-red-200 shadow-[0_0_20px_-6px_rgba(239,68,68,0.7)]'
              : 'bg-[#0F172A]/70 border-white/10 text-slate-300 hover:text-white'
          }`}
          aria-pressed={liveOnly}
        >
          {liveCount > 0 ? <span className="live-dot" /> : <Radio className="w-3.5 h-3.5" />}
          En vivo
          <span className="tabular-nums opacity-80">{loading ? '–' : liveCount}</span>
        </button>
      </PageHeader>

      {/* Tira de fechas */}
      <div className="glass-card rounded-2xl p-2 overflow-x-auto animate-fade-up">
        <div className="flex gap-1.5 min-w-max">
          {days.map((d) => {
            const active = d.key === dateKey;
            return (
              <button
                key={d.key}
                onClick={() => setDateKey(d.key)}
                className={`w-16 py-2 rounded-xl flex flex-col items-center transition-all duration-200 cursor-pointer active:scale-95 ${
                  active
                    ? 'bg-[#10B981] text-slate-950 shadow-[0_8px_24px_-10px_rgba(16,185,129,0.9)]'
                    : 'text-slate-400 hover:bg-white/6 hover:text-white'
                }`}
              >
                <span className="text-[11px] font-semibold uppercase">{d.weekday}</span>
                <span className="font-display text-xl font-extrabold leading-tight tabular-nums">{d.day}</span>
                <span className="text-[10px] uppercase opacity-80">{d.month}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtro por liga */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[{ id: 'todas', nombre: 'Todas' }, ...LEAGUES].map((l) => {
          const active = league === l.id;
          const logo = l.id === 'todas' ? null : getLeagueLogo(l.nombre);
          return (
            <button
              key={l.id}
              onClick={() => setLeague(l.id)}
              className={`btn-press shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer ${
                active
                  ? 'bg-[#10B981]/15 border-[#10B981]/40 text-[#10B981]'
                  : 'bg-[#0F172A]/60 border-white/10 text-slate-300 hover:border-white/20'
              }`}
            >
              {logo && <img src={logo} alt="" className="w-4 h-4 object-contain bg-white rounded-full p-px" />}
              {l.nombre}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-4 space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center animate-fade-in">
          <p className="text-sm text-[#94A3B8]">
            {liveOnly ? 'No hay partidos en vivo con estos filtros.' : 'No hay partidos para esta fecha y liga.'}
          </p>
        </div>
      ) : (
        <div key={`${dateKey}-${league}-${liveOnly}`} className="space-y-4 stagger">
          {groups.map(({ league: l, items }) => (
            <section key={l.id} className="glass-card rounded-2xl overflow-hidden">
              <button
                onClick={() => onOpenLeague?.(l.id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 border-b border-white/8 cursor-pointer group hover:bg-white/3 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  {getLeagueLogo(l.nombre) && (
                    <img src={getLeagueLogo(l.nombre)} alt="" className="w-6 h-6 object-contain bg-white rounded-md p-0.5" />
                  )}
                  <span className="text-sm font-bold text-white">{l.nombre}</span>
                  <span className="text-xs text-slate-500">{l.pais}</span>
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500 group-hover:text-[#10B981]">
                  Ver tabla
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
              {items.map((f) => (
                <FixtureRow key={f.id} fixture={f} onTeamClick={onOpenTeam} />
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
