import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  Calendar,
  Sparkles,
  BarChart3,
  Users,
  TrendingUp,
  Edit3,
  Tv,
  X,
  History,
  Check,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { getTeamLogo, getLeagueLogo } from '../utils/teamLogos';
import { fetchRealMatchDetails, fetchAiMatchAnalysis } from '../services/api';

// Coordenadas en cancha horizontal (Local izquierda, Visitante derecha)
const HOME_COORDS = [
  [7, 50],
  [19, 16], [18, 38], [18, 62], [19, 84],
  [32, 26], [30, 50], [32, 74],
  [43, 18], [45, 50], [43, 82],
];

const AWAY_COORDS = [
  [93, 50],
  [81, 16], [82, 38], [82, 62], [81, 84],
  [68, 26], [70, 50], [68, 74],
  [57, 18], [55, 50], [57, 82],
];

export default function MatchDetailPage({ match, onBack, onEdit }) {
  const [activeTab, setActiveTab] = useState('alineaciones');
  const [isFavorite, setIsFavorite] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Estados de datos reales (ESPN)
  const [espnData, setEspnData] = useState(null);
  const [loadingEspn, setLoadingEspn] = useState(true);
  const [espnError, setEspnError] = useState('');

  // Estados de análisis real (Gemini IA)
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState('');

  if (!match) return null;

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

  // 1. Cargar plantillas y últimos partidos reales desde ESPN
  useEffect(() => {
    let active = true;
    const loadRealData = async () => {
      setLoadingEspn(true);
      setEspnError('');
      try {
        const res = await fetchRealMatchDetails(equipoLocal, equipoVisitante, liga);
        if (active) setEspnData(res);
      } catch (err) {
        if (active) setEspnError(err.message || 'No se pudieron cargar datos reales de ESPN.');
      } finally {
        if (active) setLoadingEspn(false);
      }
    };
    loadRealData();
    return () => {
      active = false;
    };
  }, [equipoLocal, equipoVisitante, liga]);

  // 2. Generar análisis crítico con Gemini usando los datos reales de ESPN
  const handleGenerateAi = async () => {
    setLoadingAi(true);
    setAiError('');
    try {
      const homeRecent = espnData?.home?.recentMatches || [];
      const awayRecent = espnData?.away?.recentMatches || [];
      const res = await fetchAiMatchAnalysis({
        local: equipoLocal,
        visitante: equipoVisitante,
        liga,
        homeRecent,
        awayRecent,
      });
      setAiAnalysis(res.analysis || 'No se recibió respuesta de la IA.');
    } catch (err) {
      setAiError(err.message || 'Error al generar el análisis con Gemini.');
    } finally {
      setLoadingAi(false);
    }
  };

  // Disparar Gemini automáticamente al abrir la pestaña "Análisis IA" por primera vez
  useEffect(() => {
    if (activeTab === 'ia' && !aiAnalysis && !loadingAi && !loadingEspn) {
      handleGenerateAi();
    }
  }, [activeTab, loadingEspn]);

  const homeRoster = (espnData?.home?.roster || []).slice(0, 11).map((p, idx) => ({
    ...p,
    team: equipoLocal,
    x: HOME_COORDS[idx]?.[0] ?? 25,
    y: HOME_COORDS[idx]?.[1] ?? 50,
  }));

  const awayRoster = (espnData?.away?.roster || []).slice(0, 11).map((p, idx) => ({
    ...p,
    team: equipoVisitante,
    x: AWAY_COORDS[idx]?.[0] ?? 75,
    y: AWAY_COORDS[idx]?.[1] ?? 50,
  }));

  const homeRecent = espnData?.home?.recentMatches || [];
  const awayRecent = espnData?.away?.recentMatches || [];

  const momentumBars = [
    18, 25, 12, -10, -22, 15, 32, 28, -8, 14, 22, -18, -28, -12, 10, 26, 35, 20, -14, 18, 24, 16,
  ];

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
          {/* Columna Izquierda: Cuotas e Impulso */}
          <div className="lg:col-span-3 space-y-5">
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

            {/* Impulso del partido CORREGIDO (crece desde la línea central 0) */}
            <div className="rounded-2xl bg-[#131C31] border border-white/8 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Impulso del partido
                </h3>
                <TrendingUp className="w-4 h-4 text-[#10B981]" />
              </div>
              <div className="relative h-24 rounded-xl bg-[#0F172A] border border-white/8 px-3 py-2 flex items-center justify-between gap-1">
                <div className="absolute left-3 right-3 top-1/2 h-px bg-white/15 pointer-events-none" />
                {momentumBars.map((val, idx) => (
                  <div key={idx} className="flex-1 h-full flex flex-col">
                    <div className="flex-1 flex items-end">
                      {val > 0 && (
                        <div
                          style={{ height: `${Math.min(100, val * 2.6)}%` }}
                          className="w-full bg-[#10B981] rounded-t-xs"
                        />
                      )}
                    </div>
                    <div className="flex-1 flex items-start">
                      {val < 0 && (
                        <div
                          style={{ height: `${Math.min(100, Math.abs(val) * 2.6)}%` }}
                          className="w-full bg-sky-400/85 rounded-b-xs"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 truncate gap-2">
                <span className="truncate">{equipoLocal}</span>
                <span className="truncate">{equipoVisitante}</span>
              </div>
            </div>
          </div>

          {/* Columna Central: Pestañas principales */}
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-2xl bg-[#131C31] border border-white/8 overflow-hidden">
              <div className="flex border-b border-white/8 px-4 pt-3 gap-3 overflow-x-auto">
                {[
                  { id: 'alineaciones', label: 'Plantillas reales', icon: Users },
                  { id: 'ultimos', label: 'Últimos 5 (ESPN)', icon: History },
                  { id: 'ia', label: 'Análisis Gemini IA', icon: Sparkles },
                  { id: 'estadisticas', label: 'Probabilidades', icon: BarChart3 },
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
                {loadingEspn && (activeTab === 'alineaciones' || activeTab === 'ultimos') ? (
                  <div className="py-14 flex flex-col items-center justify-center text-slate-400 gap-3">
                    <Loader2 className="w-7 h-7 animate-spin text-[#10B981]" />
                    <span className="text-xs">Consultando datos reales en ESPN...</span>
                  </div>
                ) : espnError && (activeTab === 'alineaciones' || activeTab === 'ultimos') ? (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                    {espnError}
                  </div>
                ) : (
                  <>
                    {/* 1. PLANTILLAS REALES EN CANCHA */}
                    {activeTab === 'alineaciones' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#10B981]">{equipoLocal}</span>
                          <span className="text-[11px] text-slate-400">
                            Haz clic en un jugador para ver su ficha
                          </span>
                          <span className="font-bold text-sky-400">{equipoVisitante}</span>
                        </div>

                        {homeRoster.length === 0 && awayRoster.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-8">
                            No se encontró plantilla en ESPN para esta liga ({liga}).
                          </p>
                        ) : (
                          <div className="relative w-full aspect-16/10 rounded-2xl bg-[#0D2B22] border border-[#10B981]/30 overflow-hidden select-none">
                            <svg
                              viewBox="0 0 100 62"
                              className="absolute inset-0 w-full h-full opacity-35"
                              preserveAspectRatio="none"
                            >
                              <rect x="2" y="2" width="96" height="58" fill="none" stroke="#a7f3d0" strokeWidth="0.4" />
                              <line x1="50" y1="2" x2="50" y2="60" stroke="#a7f3d0" strokeWidth="0.4" />
                              <circle cx="50" cy="31" r="8" fill="none" stroke="#a7f3d0" strokeWidth="0.4" />
                              <rect x="2" y="16" width="14" height="30" fill="none" stroke="#a7f3d0" strokeWidth="0.4" />
                              <rect x="84" y="16" width="14" height="30" fill="none" stroke="#a7f3d0" strokeWidth="0.4" />
                            </svg>

                            {[...homeRoster, ...awayRoster].map((p) => {
                              const isHome = p.team === equipoLocal;
                              const isSelected = selectedPlayer?.id === p.id;
                              return (
                                <button
                                  key={`${p.team}-${p.id}`}
                                  type="button"
                                  onClick={() => setSelectedPlayer(p)}
                                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-transform hover:scale-110 ${
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
                                    {p.number || '•'}
                                  </div>
                                  <span className="mt-0.5 px-1.5 rounded bg-black/75 text-[9px] font-semibold text-white whitespace-nowrap max-w-18 truncate">
                                    {p.name.split(' ').slice(-1)[0]}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 2. ÚLTIMOS 5 PARTIDOS REALES DE ESPN */}
                    {activeTab === 'ultimos' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[
                          { team: equipoLocal, list: homeRecent },
                          { team: equipoVisitante, list: awayRecent },
                        ].map(({ team, list }) => (
                          <div key={team} className="space-y-2.5">
                            <div className="flex items-center gap-2 pb-2 border-b border-white/8">
                              <img src={getTeamLogo(team)} alt={team} className="w-5 h-5 object-contain" />
                              <h4 className="text-xs font-bold text-white truncate">Últimos 5 · {team}</h4>
                            </div>
                            {list.length === 0 ? (
                              <p className="text-xs text-slate-500">Sin partidos recientes disponibles.</p>
                            ) : (
                              list.map((m, idx) => (
                                <div
                                  key={idx}
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
                              ))
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 3. ANÁLISIS REAL CON GEMINI IA */}
                    {activeTab === 'ia' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#10B981]">
                            <Sparkles className="w-4 h-4" />
                            Análisis táctico en vivo (Gemini 2.5 Flash)
                          </span>
                          <button
                            type="button"
                            onClick={handleGenerateAi}
                            disabled={loadingAi}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-slate-300 cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3 h-3 ${loadingAi ? 'animate-spin' : ''}`} />
                            Regenerar
                          </button>
                        </div>

                        {loadingAi ? (
                          <div className="py-10 flex flex-col items-center justify-center gap-2 text-slate-400">
                            <Loader2 className="w-6 h-6 animate-spin text-[#10B981]" />
                            <span className="text-xs">Analizando rachas y contexto táctico con Gemini...</span>
                          </div>
                        ) : aiError ? (
                          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                            {aiError}
                          </div>
                        ) : (
                          <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#10B981]/30 text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                            {aiAnalysis}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 4. PROBABILIDADES */}
                    {activeTab === 'estadisticas' && (
                      <div className="space-y-4">
                        {[
                          { label: `Victoria ${equipoLocal}`, pct: probLocal, color: 'bg-[#10B981]' },
                          { label: 'Empate', pct: probEmpate, color: 'bg-amber-400' },
                          { label: `Victoria ${equipoVisitante}`, pct: probVisita, color: 'bg-sky-400' },
                        ].map((row) => (
                          <div key={row.label} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-white">{row.label}</span>
                              <span className="text-slate-300">{row.pct}%</span>
                            </div>
                            <div className="h-2.5 rounded-full bg-[#0F172A] overflow-hidden">
                              <div style={{ width: `${row.pct}%` }} className={`h-full ${row.color} rounded-full`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Votación, Racha real y Dónde verlo */}
          <div className="lg:col-span-3 space-y-5">
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

            {/* Racha reciente real de ESPN */}
            <div className="rounded-2xl bg-[#131C31] border border-white/8 p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Racha reciente (ESPN)
              </h3>
              {[
                { team: equipoLocal, recent: homeRecent },
                { team: equipoVisitante, recent: awayRecent },
              ].map((row) => (
                <div key={row.team} className="flex items-center justify-between gap-2 text-xs py-1.5 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={getTeamLogo(row.team)} alt={row.team} className="w-5 h-5 object-contain shrink-0" />
                    <span className="font-semibold text-white truncate">{row.team}</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {row.recent.slice(0, 5).map((r, i) => (
                      <span
                        key={i}
                        className={`w-4 h-4 rounded-xs text-[9px] font-black flex items-center justify-center ${
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

      {/* PANEL LATERAL DEL JUGADOR REAL */}
      {selectedPlayer && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs"
          onClick={() => setSelectedPlayer(null)}
        >
          <div
            className="w-full max-w-sm bg-[#131C31] border-l border-white/10 h-full overflow-y-auto p-6 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0F172A] border border-white/10 flex items-center justify-center font-display text-lg font-black text-[#10B981]">
                  #{selectedPlayer.number || '•'}
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

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-[#0F172A] border border-white/8">
                <div className="text-base font-extrabold text-white">#{selectedPlayer.number || '-'}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Dorsal</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0F172A] border border-white/8">
                <div className="text-base font-extrabold text-white">{selectedPlayer.position}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Posición</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0F172A] border border-white/8">
                <div className="text-base font-extrabold text-white">{selectedPlayer.age || '-'}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Edad</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}