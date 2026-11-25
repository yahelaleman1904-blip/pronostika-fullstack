import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Star,
  Calendar,
  Sparkles,
  BarChart3,
  Users,
  TrendingUp,
  Edit3,
  CloudRain,
  Wind,
  Droplets,
  Tv,
  X,
  Crosshair,
  AlertTriangle,
  History,
  Check,
} from 'lucide-react';
import { getTeamLogo, getLeagueLogo } from '../utils/teamLogos';

// Generador determinista para que cada partido tenga datos consistentes
function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function buildMatchData(equipoLocal, equipoVisitante, liga, probLocal) {
  const seed = hashString(`${equipoLocal}-${equipoVisitante}`);

  const rivalsPool = [
    'Real Sociedad',
    'Villarreal',
    'Atalanta',
    'Aston Villa',
    'Sporting CP',
    'Feyenoord',
    'Benfica',
    'Sevilla',
    'Fiorentina',
    'Lille',
  ];

  const makeRecentMatches = (team, offset) =>
    Array.from({ length: 5 }, (_, i) => {
      const s = seed + offset * 17 + i * 31;
      const rival = rivalsPool[s % rivalsPool.length];
      const gf = (s % 4);
      const ga = ((s >> 2) % 3);
      const result = gf > ga ? 'W' : gf === ga ? 'D' : 'L';
      const day = 22 - i * 4;
      return {
        id: `${team}-${i}`,
        date: `${day > 0 ? day : 28 + day}/11/26`,
        rival,
        score: `${gf} - ${ga}`,
        result,
        isHome: i % 2 === 0,
      };
    });

  const homeNames = [
    'M. Neuer', 'D. Carvajal', 'R. Araujo', 'A. Bastoni', 'T. Hernández',
    'F. Valverde', 'Pedri', 'J. Bellingham', 'B. Saka', 'L. Martínez', 'Vinícius Jr.',
  ];
  const awayNames = [
    'G. Donnarumma', 'A. Hakimi', 'W. Saliba', 'V. van Dijk', 'A. Davies',
    'Rodri', 'F. Wirtz', 'M. Ødegaard', 'L. Yamal', 'E. Haaland', 'K. Mbappé',
  ];

  // Posiciones (x%, y%) en cancha horizontal: local a la izquierda, visitante a la derecha
  const homeCoords = [
    [7, 50],
    [19, 16], [18, 38], [18, 62], [19, 84],
    [32, 26], [30, 50], [32, 74],
    [43, 18], [45, 50], [43, 82],
  ];
  const awayCoords = [
    [93, 50],
    [81, 16], [82, 38], [82, 62], [81, 84],
    [68, 26], [70, 50], [68, 74],
    [57, 18], [55, 50], [57, 82],
  ];
  const positions = ['POR', 'LD', 'DFC', 'DFC', 'LI', 'MC', 'MCD', 'MC', 'ED', 'DC', 'EI'];

  const makePlayers = (names, coords, team, sideOffset) =>
    names.map((name, idx) => {
      const s = seed + idx * 19 + sideOffset * 73;
      const rating = (6.3 + ((s % 22) / 10)).toFixed(2);
      const isAttacker = idx >= 7;
      const shots = isAttacker ? 2 + (s % 4) : idx >= 5 ? (s % 3) : (s % 2);
      const shotsOnTarget = Math.min(shots, isAttacker ? 1 + (s % 3) : (s % 2));
      const goals = isAttacker && s % 3 === 0 ? 1 : 0;
      const assists = idx >= 5 && s % 4 === 0 ? 1 : 0;
      const passes = 24 + (s % 48);
      const passAcc = 78 + (s % 18);

      return {
        id: `${team}-${idx}`,
        number: idx === 0 ? 1 : ((idx * 3 + (s % 7)) % 29) + 2,
        name,
        team,
        position: positions[idx],
        rating: Number(rating),
        x: coords[idx][0],
        y: coords[idx][1],
        shots,
        shotsOnTarget,
        goals,
        assists,
        passes,
        passAcc,
        xg: (shots * 0.24 + goals * 0.35).toFixed(2),
        recentGames: Array.from({ length: 5 }, (_, g) => {
          const gs = s + g * 13;
          const r = rivalsPool[gs % rivalsPool.length];
          return {
            date: `${22 - g * 4}/11/26`,
            rival: r,
            score: `${1 + (gs % 3)} - ${gs % 3}`,
            rating: (6.2 + ((gs % 24) / 10)).toFixed(1),
            goals: isAttacker && gs % 3 === 0 ? 1 : 0,
          };
        }),
      };
    });

  const homePlayers = makePlayers(homeNames, homeCoords, equipoLocal, 1);
  const awayPlayers = makePlayers(awayNames, awayCoords, equipoVisitante, 2);

  return {
    homeRecent: makeRecentMatches(equipoLocal, 1),
    awayRecent: makeRecentMatches(equipoVisitante, 2),
    homePlayers,
    awayPlayers,
    homeAvgRating: (7.1 + ((seed % 8) / 10)).toFixed(2),
    awayAvgRating: (6.9 + ((seed % 7) / 10)).toFixed(2),
    homePos: 2 + (seed % 6),
    awayPos: 5 + (seed % 10),
    homePts: 24 + (seed % 14),
    awayPts: 16 + (seed % 12),
    referee: { name: 'Nick Walsh', yellowAvg: '4.25', redAvg: '0.19' },
    coaches: { home: 'X. Alonso', away: 'H. Flick' },
    injuries: {
      home: [{ name: 'A. McCarthy', reason: 'Tarjeta roja', type: 'red' }],
      away: [
        { name: 'A. Christensen', reason: 'Lesionado · Pantorrilla', type: 'injury' },
        { name: 'L. Yamal', reason: 'Lesionado · Tobillo', type: 'injury' },
      ],
    },
    weather: { temp: 14 + (seed % 9), desc: 'Nublado parcial', wind: '18 km/h', clouds: '72%', humidity: '68%' },
    liga,
    probLocal,
  };
}

function getRatingColor(rating) {
  if (rating >= 7.5) return 'bg-[#10B981] text-slate-950';
  if (rating >= 7.0) return 'bg-lime-400 text-slate-950';
  if (rating >= 6.5) return 'bg-amber-400 text-slate-950';
  return 'bg-orange-500 text-white';
}

export default function MatchDetailPage({ match, onBack, onEdit }) {
  const [activeTab, setActiveTab] = useState('alineaciones');
  const [isFavorite, setIsFavorite] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  if (!match) return null;

  // Corrección de nombres y liga desde DashboardPage (title, category, fecha)
  const [parsedLocal, parsedVisita] = (match.title || '').split(/\s+vs\.?\s+/i);
  const equipoLocal = match.equipoLocal || parsedLocal?.trim() || 'Local';
  const equipoVisitante = match.equipoVisitante || parsedVisita?.trim() || 'Visitante';
  const liga = match.liga || match.category || 'Liga';
  const fechaPartido = match.fechaPartido || match.fecha || 'Próximo encuentro';

  const probLocal = Number(match.probabilidad) || 55;
  const probEmpate = Math.max(10, Math.round((100 - probLocal) * 0.45));
  const probVisita = Math.max(5, 100 - probLocal - probEmpate);

  const cuotaLocal = (100 / probLocal).toFixed(2);
  const cuotaEmpate = (100 / probEmpate).toFixed(2);
  const cuotaVisita = (100 / probVisita).toFixed(2);

  const data = useMemo(
    () => buildMatchData(equipoLocal, equipoVisitante, liga, probLocal),
    [equipoLocal, equipoVisitante, liga, probLocal]
  );

  const allShooters = useMemo(() => {
    return [...data.homePlayers, ...data.awayPlayers]
      .filter((p) => p.shots > 0)
      .sort((a, b) => b.shots - a.shots || b.rating - a.rating)
      .slice(0, 10);
  }, [data]);

  const stats = [
    { label: 'Posesión de balón', home: `${Math.min(68, 42 + Math.round(probLocal * 0.25))}%`, away: `${Math.max(32, 58 - Math.round(probLocal * 0.25))}%`, homePct: 58 },
    { label: 'Tiros totales', home: 14, away: 9, homePct: 61 },
    { label: 'Tiros a puerta', home: 6, away: 3, homePct: 67 },
    { label: 'Goles esperados (xG)', home: '1.84', away: '0.92', homePct: 66 },
    { label: 'Saques de esquina', home: 7, away: 4, homePct: 64 },
    { label: 'Pases precisos', home: '87%', away: '81%', homePct: 54 },
  ];

  const momentumBars = [18, 25, 12, -10, -22, 15, 32, 28, -8, 14, 22, -18, -28, -12, 10, 26, 35, 20, -14, 18, 24, 16];

  return (
    <div className="min-h-screen bg-[#0B1120] text-[#F8FAFC] pb-14">
      {/* Barra superior / Breadcrumb */}
      <div className="sticky top-0 z-20 bg-[#0F172A]/90 backdrop-blur-md border-b border-white/8 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 truncate">
              <span>Fútbol</span>
              <span>›</span>
              <span className="text-slate-300 font-medium">{liga}</span>
              <span>›</span>
              <span className="text-white font-semibold truncate">
                {equipoLocal} vs {equipoVisitante}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                isFavorite
                  ? 'bg-amber-400/15 border-amber-400/40 text-amber-300'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-300' : ''}`} />
              {isFavorite ? 'Favorito' : 'Seguir'}
            </button>

            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(match)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-slate-950 text-xs font-bold transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Editar pronóstico
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* Encabezado del partido */}
        <div className="rounded-3xl bg-[#131C31] border border-white/8 p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-6">
            {getLeagueLogo(liga) && (
              <img src={getLeagueLogo(liga)} alt={liga} className="w-4 h-4 object-contain" />
            )}
            <span className="font-bold uppercase tracking-wider text-slate-300">{liga}</span>
            <span>•</span>
            <Calendar className="w-3.5 h-3.5" />
            <span>{fechaPartido}</span>
          </div>

          <div className="grid grid-cols-3 items-center gap-4 max-w-3xl mx-auto">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0F172A] border border-white/10 p-3 flex items-center justify-center">
                <img src={getTeamLogo(equipoLocal)} alt={equipoLocal} className="w-full h-full object-contain" />
              </div>
              <h2 className="font-display text-base sm:text-xl font-extrabold text-white">
                {equipoLocal}
              </h2>
            </div>

            <div className="flex flex-col items-center text-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/35 text-[#10B981] text-[11px] font-bold uppercase tracking-wider">
                {match.estado || 'PENDIENTE'}
              </span>
              <span className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight">
                VS
              </span>
              <span className="text-xs text-slate-400">
                Pick: <strong className="text-[#10B981]">{match.ganadorPrevisto}</strong>
              </span>
            </div>

            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0F172A] border border-white/10 p-3 flex items-center justify-center">
                <img src={getTeamLogo(equipoVisitante)} alt={equipoVisitante} className="w-full h-full object-contain" />
              </div>
              <h2 className="font-display text-base sm:text-xl font-extrabold text-white">
                {equipoVisitante}
              </h2>
            </div>
          </div>
        </div>

        {/* Grid principal 3 columnas estilo Sofascore */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna Izquierda: Cuotas, Impulso, Clima */}
          <div className="lg:col-span-3 space-y-5">
            {/* Cuotas 1X2 */}
            <div className="rounded-2xl bg-[#131C31] border border-white/8 p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tiempo reglamentario (1X2)
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '1', odd: cuotaLocal },
                  { label: 'X', odd: cuotaEmpate },
                  { label: '2', odd: cuotaVisita },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-[#0F172A] border border-white/8 p-2.5 text-center">
                    <div className="text-[11px] text-slate-400 font-semibold">{item.label}</div>
                    <div className="text-sm font-extrabold text-[#10B981] mt-0.5">{item.odd}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Impulso */}
            <div className="rounded-2xl bg-[#131C31] border border-white/8 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Impulso del partido
                </h3>
                <TrendingUp className="w-4 h-4 text-[#10B981]" />
              </div>
              <div className="h-24 rounded-xl bg-[#0F172A] border border-white/8 p-3 flex items-center justify-between gap-1">
                {momentumBars.map((val, idx) => (
                  <div key={idx} className="flex-1 h-full flex flex-col justify-center items-center">
                    <div
                      style={{ height: `${Math.abs(val) * 1.4}%` }}
                      className={`w-full rounded-sm ${
                        val >= 0 ? 'bg-[#10B981] self-end mb-auto' : 'bg-sky-400/80 self-start mt-auto'
                      }`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 truncate gap-2">
                <span className="truncate">{equipoLocal}</span>
                <span className="truncate">{equipoVisitante}</span>
              </div>
            </div>

            {/* Clima */}
            <div className="rounded-2xl bg-[#131C31] border border-white/8 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <CloudRain className="w-8 h-8 text-sky-400 shrink-0" />
                <div>
                  <div className="text-xl font-extrabold text-white">{data.weather.temp}°C</div>
                  <div className="text-xs text-slate-400">{data.weather.desc}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/8 text-center">
                <div>
                  <Wind className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
                  <div className="text-[11px] font-bold text-white">{data.weather.wind}</div>
                </div>
                <div>
                  <CloudRain className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
                  <div className="text-[11px] font-bold text-white">{data.weather.clouds}</div>
                </div>
                <div>
                  <Droplets className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
                  <div className="text-[11px] font-bold text-white">{data.weather.humidity}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Central: Pestañas principales */}
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-2xl bg-[#131C31] border border-white/8 overflow-hidden">
              <div className="flex border-b border-white/8 px-4 pt-3 gap-3 overflow-x-auto">
                {[
                  { id: 'alineaciones', label: 'Alineaciones', icon: Users },
                  { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
                  { id: 'tiradores', label: 'Quién ha tirado', icon: Crosshair },
                  { id: 'ultimos', label: 'Últimos partidos', icon: History },
                  { id: 'ia', label: 'Análisis', icon: Sparkles },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 pb-3 px-2 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
                        active
                          ? 'border-[#10B981] text-[#10B981]'
                          : 'border-transparent text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="p-5">
                {/* 1. ALINEACIONES EN CANCHA INTERACTIVA */}
                {activeTab === 'alineaciones' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{equipoLocal}</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#10B981] text-slate-950 font-extrabold text-[11px]">
                          {data.homeAvgRating}
                        </span>
                        <span className="text-slate-400 hidden sm:inline">4-3-3</span>
                      </div>
                      <span className="text-[11px] text-slate-400">Haz clic en un jugador</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 hidden sm:inline">4-3-3</span>
                        <span className="px-1.5 py-0.5 rounded bg-sky-400 text-slate-950 font-extrabold text-[11px]">
                          {data.awayAvgRating}
                        </span>
                        <span className="font-bold text-white">{equipoVisitante}</span>
                      </div>
                    </div>

                    {/* Cancha SVG + Jugadores clickeables */}
                    <div className="relative w-full aspect-16/10 rounded-2xl bg-[#0D2B22] border border-[#10B981]/30 overflow-hidden select-none">
                      {/* Líneas de cancha */}
                      <svg viewBox="0 0 100 62" className="absolute inset-0 w-full h-full opacity-35" preserveAspectRatio="none">
                        <rect x="2" y="2" width="96" height="58" fill="none" stroke="#a7f3d0" strokeWidth="0.4" />
                        <line x1="50" y1="2" x2="50" y2="60" stroke="#a7f3d0" strokeWidth="0.4" />
                        <circle cx="50" cy="31" r="8" fill="none" stroke="#a7f3d0" strokeWidth="0.4" />
                        <rect x="2" y="16" width="14" height="30" fill="none" stroke="#a7f3d0" strokeWidth="0.4" />
                        <rect x="84" y="16" width="14" height="30" fill="none" stroke="#a7f3d0" strokeWidth="0.4" />
                      </svg>

                      {[...data.homePlayers, ...data.awayPlayers].map((p) => {
                        const isHome = p.team === equipoLocal;
                        const isSelected = selectedPlayer?.id === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setSelectedPlayer(p)}
                            style={{ left: `${p.x}%`, top: `${p.y}%` }}
                            className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer transition-transform hover:scale-110 ${
                              isSelected ? 'scale-110 z-20' : 'z-10'
                            }`}
                          >
                            <div
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 shadow-lg ${
                                isHome
                                  ? 'bg-[#10B981]/20 border-[#10B981] text-white'
                                  : 'bg-sky-500/25 border-sky-400 text-white'
                              } ${isSelected ? 'ring-2 ring-white' : ''}`}
                            >
                              {p.number}
                            </div>
                            <span
                              className={`-mt-1.5 px-1 rounded text-[9px] font-extrabold leading-tight shadow ${getRatingColor(
                                p.rating
                              )}`}
                            >
                              {p.rating.toFixed(1)}
                            </span>
                            <span className="mt-0.5 px-1 rounded bg-black/65 text-[9px] font-semibold text-white whitespace-nowrap max-w-16 truncate">
                              {p.name.split(' ').slice(-1)[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Árbitro, Entrenadores y Lesiones */}
                    <div className="rounded-xl bg-[#0F172A] border border-white/8 p-4 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/8 text-xs">
                        <div>
                          <span className="text-slate-400">Árbitro: </span>
                          <strong className="text-white">{data.referee.name}</strong>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-300">
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-3.5 rounded-[2px] bg-amber-400 inline-block" />
                            {data.referee.yellowAvg}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-3.5 rounded-[2px] bg-red-500 inline-block" />
                            {data.referee.redAvg}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <div className="text-[11px] text-slate-400 mb-1">Entrenador {equipoLocal}</div>
                          <div className="font-bold text-white">{data.coaches.home}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] text-slate-400 mb-1">Entrenador {equipoVisitante}</div>
                          <div className="font-bold text-white">{data.coaches.away}</div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/8">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          Lesiones y suspensiones
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1.5">
                            {data.injuries.home.map((inj) => (
                              <div key={inj.name} className="flex items-center justify-between bg-white/3 px-2.5 py-1.5 rounded-lg">
                                <span className="font-semibold text-white">{inj.name}</span>
                                <span className="text-[11px] text-red-400">{inj.reason}</span>
                              </div>
                            ))}
                          </div>
                          <div className="space-y-1.5">
                            {data.injuries.away.map((inj) => (
                              <div key={inj.name} className="flex items-center justify-between bg-white/3 px-2.5 py-1.5 rounded-lg">
                                <span className="font-semibold text-white">{inj.name}</span>
                                <span className="text-[11px] text-red-400">{inj.reason}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. ESTADÍSTICAS DEL PARTIDO */}
                {activeTab === 'estadisticas' && (
                  <div className="space-y-5">
                    {stats.map((s) => (
                      <div key={s.label} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-white">{s.home}</span>
                          <span className="text-slate-400 font-medium">{s.label}</span>
                          <span className="text-white">{s.away}</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#0F172A] overflow-hidden flex gap-1">
                          <div style={{ width: `${s.homePct}%` }} className="h-full bg-[#10B981] rounded-l-full" />
                          <div style={{ width: `${100 - s.homePct}%` }} className="h-full bg-sky-400/80 rounded-r-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. QUIÉN HA TIRADO / ESTADÍSTICAS DE JUGADORES */}
                {activeTab === 'tiradores' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400">
                      Haz clic en cualquier jugador para abrir su ficha completa y últimos partidos.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-slate-400 border-b border-white/8">
                            <th className="py-2 font-semibold">Jugador</th>
                            <th className="py-2 text-center font-semibold">Tiros</th>
                            <th className="py-2 text-center font-semibold">A puerta</th>
                            <th className="py-2 text-center font-semibold">xG</th>
                            <th className="py-2 text-right font-semibold">Rating</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {allShooters.map((p) => (
                            <tr
                              key={p.id}
                              onClick={() => setSelectedPlayer(p)}
                              className="hover:bg-white/5 cursor-pointer transition"
                            >
                              <td className="py-2.5">
                                <div className="font-bold text-white">{p.name}</div>
                                <div className="text-[11px] text-slate-400">{p.team} · {p.position}</div>
                              </td>
                              <td className="py-2.5 text-center font-bold text-white">{p.shots}</td>
                              <td className="py-2.5 text-center font-bold text-[#10B981]">{p.shotsOnTarget}</td>
                              <td className="py-2.5 text-center text-slate-300">{p.xg}</td>
                              <td className="py-2.5 text-right">
                                <span className={`px-2 py-0.5 rounded font-extrabold text-[11px] ${getRatingColor(p.rating)}`}>
                                  {p.rating.toFixed(1)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. ÚLTIMOS PARTIDOS DE CADA EQUIPO */}
                {activeTab === 'ultimos' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { team: equipoLocal, list: data.homeRecent },
                      { team: equipoVisitante, list: data.awayRecent },
                    ].map(({ team, list }) => (
                      <div key={team} className="space-y-2.5">
                        <div className="flex items-center gap-2 pb-2 border-b border-white/8">
                          <img src={getTeamLogo(team)} alt={team} className="w-5 h-5 object-contain" />
                          <h4 className="text-xs font-bold text-white truncate">Últimos 5 · {team}</h4>
                        </div>
                        {list.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0F172A] border border-white/6 text-xs"
                          >
                            <div className="min-w-0">
                              <div className="text-[10px] text-slate-500">{m.date}</div>
                              <div className="font-semibold text-white truncate">
                                {m.isHome ? `vs ${m.rival}` : `@ ${m.rival}`}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-extrabold text-slate-200">{m.score}</span>
                              <span
                                className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-black ${
                                  m.result === 'W'
                                    ? 'bg-[#10B981] text-slate-950'
                                    : m.result === 'D'
                                    ? 'bg-amber-400 text-slate-950'
                                    : 'bg-red-500 text-white'
                                }`}
                              >
                                {m.result}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* 5. ANÁLISIS */}
                {activeTab === 'ia' && (
                  <div className="p-4 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30 text-sm text-slate-200 leading-relaxed">
                    <span className="font-bold text-[#10B981]">Veredicto Pronostika: </span>
                    El modelo proyecta ventaja para <strong>{match.ganadorPrevisto}</strong> con una
                    probabilidad del <strong>{probLocal}%</strong> basada en rendimiento reciente y
                    volumen ofensivo en {liga}.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Votación, Clasificación previa y Dónde verlo */}
          <div className="lg:col-span-3 space-y-5">
            {/* ¿Quién ganará? */}
            <div className="rounded-2xl bg-[#131C31] border border-white/8 p-5 space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white">¿Quién ganará?</h3>
                <p className="text-xs text-slate-400 mt-0.5">Envía tu voto y compáralo</p>
              </div>
              <div className="space-y-2">
                {[
                  { id: 'local', label: equipoLocal, pct: probLocal },
                  { id: 'empate', label: 'Empate (X)', pct: probEmpate },
                  { id: 'visita', label: equipoVisitante, pct: probVisita },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setUserVote(opt.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      userVote === opt.id
                        ? 'bg-[#10B981]/15 border-[#10B981] text-[#10B981]'
                        : 'bg-[#0F172A] border-white/8 text-white hover:border-white/25'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    <span>{opt.pct}%</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Clasificación previa al partido */}
            <div className="rounded-2xl bg-[#131C31] border border-white/8 p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Clasificación previa
              </h3>
              {[
                { pos: data.homePos, team: equipoLocal, recent: data.homeRecent, rating: data.homeAvgRating, pts: data.homePts },
                { pos: data.awayPos, team: equipoVisitante, recent: data.awayRecent, rating: data.awayAvgRating, pts: data.awayPts },
              ].map((row) => (
                <div key={row.team} className="flex items-center justify-between gap-2 text-xs py-1.5 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-4 text-slate-400 font-bold">{row.pos}</span>
                    <img src={getTeamLogo(row.team)} alt={row.team} className="w-5 h-5 object-contain shrink-0" />
                    <div className="flex gap-0.5">
                      {row.recent.slice(0, 4).map((r) => (
                        <span
                          key={r.id}
                          className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center ${
                            r.result === 'W'
                              ? 'bg-[#10B981] text-slate-950'
                              : r.result === 'D'
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-red-500 text-white'
                          }`}
                        >
                          {r.result}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-[#10B981]">{row.rating}</span>
                    <span className="font-extrabold text-white w-5 text-right">{row.pts}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Dónde verlo */}
            <div className="rounded-2xl bg-[#131C31] border border-white/8 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Dónde verlo (MX)
                </h3>
                <Tv className="w-4 h-4 text-slate-400" />
              </div>
              {[
                { name: 'FOX+', votes: 12 },
                { name: 'TUDN', votes: 35 },
                { name: 'ViX', votes: 47 },
              ].map((ch) => (
                <div key={ch.name} className="flex items-center justify-between text-xs py-1">
                  <span className="font-bold text-white">{ch.name}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#0F172A] border border-white/8 text-[#10B981] text-[11px] font-bold">
                    <Check className="w-3 h-3" /> {ch.votes}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PANEL LATERAL DE ESTADÍSTICAS DEL JUGADOR (al dar clic en la cancha o en tiradores) */}
      {selectedPlayer && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs"
          onClick={() => setSelectedPlayer(null)}
        >
          <div
            className="w-full max-w-sm bg-[#131C31] border-l border-white/10 h-full overflow-y-auto p-6 space-y-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0F172A] border border-white/10 flex items-center justify-center font-display text-lg font-black text-[#10B981]">
                  #{selectedPlayer.number}
                </div>
                <div>
                  <h3 className="font-display text-lg font-extrabold text-white">
                    {selectedPlayer.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{selectedPlayer.team}</span>
                    <span>•</span>
                    <span>{selectedPlayer.position}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlayer(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Rating destacado */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0F172A] border border-white/8">
              <span className="text-xs font-semibold text-slate-400">Calificación Pronostika</span>
              <span className={`px-3 py-1 rounded-lg font-black text-sm ${getRatingColor(selectedPlayer.rating)}`}>
                {selectedPlayer.rating.toFixed(2)}
              </span>
            </div>

            {/* Estadísticas del jugador */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              {[
                { label: 'Tiros', value: selectedPlayer.shots },
                { label: 'A puerta', value: selectedPlayer.shotsOnTarget },
                { label: 'Goles', value: selectedPlayer.goals },
                { label: 'Asist.', value: selectedPlayer.assists },
                { label: 'Pases', value: selectedPlayer.passes },
                { label: 'Precisión', value: `${selectedPlayer.passAcc}%` },
              ].map((stat) => (
                <div key={stat.label} className="p-3 rounded-xl bg-[#0F172A] border border-white/8">
                  <div className="text-base font-extrabold text-white">{stat.value}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Últimos partidos del jugador */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Últimos partidos del jugador
              </h4>
              {selectedPlayer.recentGames.map((g, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#0F172A] border border-white/6 text-xs"
                >
                  <div>
                    <div className="text-[10px] text-slate-500">{g.date}</div>
                    <div className="font-semibold text-white">vs {g.rival}</div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-slate-300">{g.score}</span>
                    <span className={`px-2 py-0.5 rounded font-extrabold text-[11px] ${getRatingColor(Number(g.rating))}`}>
                      {g.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}