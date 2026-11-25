import { useState, useEffect } from 'react';
import {
  Activity,
  Target,
  ClipboardCheck,
  Flame,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import MatchTable from '../components/MatchTable';
import MatchCardsGrid from '../components/MatchCardsGrid';
import MatchDetailModal from '../components/MatchDetailModal';
import CrudModal from '../components/CrudModal';
import ConfirmModal from '../components/ConfirmModal';
import ProfilePage from './ProfilePage';
import AdminUsersPage from './AdminUsersPage';
import {
  fetchMatches,
  createMatchApi,
  updateMatchApi,
  deleteMatchApi,
} from '../services/api';

export default function DashboardPage({ user, onLogout }) {
  const [activeView, setActiveView] = useState('predicciones');
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Estado interactivo para la vista "Mi Quiniela"
  const [quinielaPicks, setQuinielaPicks] = useState({});

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const getInitialPage = () => {
    const params = new URLSearchParams(window.location.search);
    const p = parseInt(params.get('page'), 10);
    return p > 0 ? p : 1;
  };

  const getInitialLimit = () => {
    const params = new URLSearchParams(window.location.search);
    const l = parseInt(params.get('limit'), 10);
    return [10, 20, 40, 50].includes(l) ? l : 10;
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [limit, setLimit] = useState(getInitialLimit);

  // Modales CRUD y Detalle Sofascore
  const [isCrudModalOpen, setIsCrudModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const displayName = user?.nombre || user?.firstName || 'Analista';
  const displayLastName = user?.apellido || user?.lastName || '';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', currentPage);
    params.set('limit', limit);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({ page: currentPage, limit }, '', newUrl);
  }, [currentPage, limit]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getInitialPage());
      setLimit(getInitialLimit());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setErrorMsg('');
      try {
        const data = await fetchMatches();
        setMatches(data);
      } catch (err) {
        setErrorMsg(err.message || 'Error al conectar con la API.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const categories = Array.from(new Set(matches.map((m) => m.category)));

  const handleSaveCrud = async (formData) => {
    try {
      if (editingItem) {
        await updateMatchApi(editingItem.id, formData);
        setMatches((prev) =>
          prev.map((item) =>
            item.id === editingItem.id ? { ...item, ...formData } : item
          )
        );
        showToast('Pronóstico actualizado correctamente.');
      } else {
        const apiResponse = await createMatchApi(formData);
        const newRecord = {
          id: apiResponse.id || Date.now(),
          ...formData,
          fecha: apiResponse.fecha || 'Próximamente',
        };
        setMatches((prev) => [newRecord, ...prev]);
        showToast('Nuevo pronóstico agregado correctamente.');
      }
      setIsCrudModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteMatchApi(itemToDelete.id);
      setMatches((prev) => prev.filter((item) => item.id !== itemToDelete.id));
      showToast('Pronóstico eliminado correctamente.');
      setItemToDelete(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePickQuiniela = (matchId, selection) => {
    setQuinielaPicks((prev) => ({ ...prev, [matchId]: selection }));
  };

  const acertadasCount = matches.filter(
    (m) => m.estado?.toLowerCase() === 'acertada'
  ).length;
  const tasaAcierto = matches.length
    ? Math.round((acertadasCount / matches.length) * 100)
    : 68;

  return (
    <div className="relative min-h-screen flex bg-[#0F172A] text-[#F8FAFC] overflow-x-clip">
      {/* Fondo ambiental sutil con movimiento lento */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-subtle-grid opacity-90" />
        <div className="absolute -top-32 -left-20 w-130 h-130 rounded-full bg-[#10B981]/14 blur-[120px] animate-ambient-slow" />
        <div className="absolute -bottom-40 -right-20 w-140 h-140 rounded-full bg-[#38BDF8]/10 blur-[130px] animate-ambient-slower" />
      </div>

      <div className="relative z-10 flex w-full min-h-screen">
        <Sidebar activeView={activeView} setActiveView={setActiveView} user={user} />

        <div className="flex-1 flex flex-col min-w-0">
          <Navbar
            user={user}
            activeView={activeView}
            onLogout={onLogout}
            onQuickAdd={() => {
              setEditingItem(null);
              setIsCrudModalOpen(true);
            }}
          />

          <main className="p-6 lg:p-8 space-y-7 overflow-y-auto max-w-360 w-full mx-auto">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-[11px] font-semibold tracking-wide uppercase mb-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  Panel en tiempo real
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Hola, {displayName} {displayLastName}
                </h2>
                <p className="text-sm text-[#94A3B8] mt-1">
                  Revisa tus pronósticos, gestiona tu quiniela y analiza las probabilidades de la jornada.
                </p>
              </div>

              {toastMsg && (
                <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#10B981]/15 border border-[#10B981]/35 text-[#10B981] text-xs font-semibold shadow-lg shadow-[#10B981]/10 backdrop-blur-md">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{toastMsg}</span>
                </div>
              )}
            </div>

            {/* Tarjetas KPI con efecto cristal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              <div
                onClick={() => setActiveView('predicciones')}
                className={`glass-panel glass-card-interactive p-5 rounded-2xl cursor-pointer group ${
                  activeView === 'predicciones' ? 'ring-1 ring-[#10B981]/40' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-[#94A3B8]">Predicciones activas</p>
                  <div className="w-9 h-9 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981]">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold tracking-tight text-white tabular-nums">
                  {matches.length}
                </p>
                <div className="flex items-center gap-1 text-xs text-[#10B981] font-medium mt-2">
                  <span>Ver tabla completa</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>

              <div
                onClick={() => setActiveView('estadisticas')}
                className={`glass-panel glass-card-interactive p-5 rounded-2xl cursor-pointer group ${
                  activeView === 'estadisticas' ? 'ring-1 ring-[#10B981]/40' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-[#94A3B8]">Tasa de acierto</p>
                  <div className="w-9 h-9 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981]">
                    <Target className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold tracking-tight text-white tabular-nums">
                  {tasaAcierto}%
                </p>
                <p className="text-xs text-[#10B981] font-medium mt-2">
                  +4.2% vs. mes anterior
                </p>
              </div>

              <div
                onClick={() => setActiveView('quiniela')}
                className={`glass-panel glass-card-interactive p-5 rounded-2xl cursor-pointer group ${
                  activeView === 'quiniela' ? 'ring-1 ring-[#10B981]/40' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-[#94A3B8]">Selecciones en Quiniela</p>
                  <div className="w-9 h-9 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981]">
                    <ClipboardCheck className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold tracking-tight text-white tabular-nums">
                  {Object.keys(quinielaPicks).length}
                  <span className="text-lg text-[#94A3B8] font-semibold"> / 10</span>
                </p>
                <div className="flex items-center gap-1 text-xs text-[#10B981] font-medium mt-2">
                  <span>Armar mi quiniela</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>

              <div
                onClick={() => setActiveView('partidos')}
                className={`glass-panel glass-card-interactive p-5 rounded-2xl cursor-pointer group ${
                  activeView === 'partidos' ? 'ring-1 ring-[#10B981]/40' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-[#94A3B8]">Racha actual</p>
                  <div className="w-9 h-9 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981]">
                    <Flame className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold tracking-tight text-white tabular-nums">
                  5
                </p>
                <p className="text-xs text-[#10B981] font-medium mt-2">
                  aciertos seguidos
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="glass-panel py-20 text-center rounded-2xl">
                <div className="w-10 h-10 border-3 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-[#94A3B8] font-medium">
                  Cargando pronósticos desde el servidor...
                </p>
              </div>
            ) : errorMsg ? (
              <div className="p-8 text-center rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 backdrop-blur-md">
                <p className="font-bold mb-1">Ocurrió un problema al cargar los datos</p>
                <p className="text-sm opacity-90">{errorMsg}</p>
              </div>
            ) : activeView === 'perfil' ? (
              <ProfilePage user={user} />
            ) : activeView === 'admin' ? (
              <AdminUsersPage currentUser={user} />
            ) : activeView === 'partidos' ? (
              <MatchCardsGrid
                matches={matches}
                onSelectForEdit={(item) => setSelectedMatch(item)}
              />
            ) : activeView === 'quiniela' ? (
              <div className="glass-panel rounded-2xl p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/8 pb-5">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-white">
                      Boleta Oficial · Jornada 12 ({displayName})
                    </h3>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      Selecciona Local (L), Empate (E) o Visita (V) para cada encuentro.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      showToast(
                        `Quiniela guardada con ${Object.keys(quinielaPicks).length} pronósticos registrados.`
                      )
                    }
                    className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-slate-950 font-bold text-xs tracking-wide transition shadow-lg shadow-[#10B981]/20 cursor-pointer"
                  >
                    Guardar mi Quiniela ({Object.keys(quinielaPicks).length}/10)
                  </button>
                </div>

                <div className="space-y-3">
                  {matches.slice(0, 10).map((item) => {
                    const currentPick = quinielaPicks[item.id];
                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl bg-[#0F172A]/75 border border-white/6 hover:border-white/12 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-md mb-1">
                            {item.category}
                          </span>
                          <p className="text-sm font-semibold text-white">{item.title}</p>
                          <p className="text-xs text-[#94A3B8] mt-0.5 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
                            Favorito IA: <span className="text-slate-200 font-medium">{item.ganadorPrevisto}</span> ({item.probabilidad}%)
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {['Local', 'Empate', 'Visita'].map((option) => (
                            <button
                              key={option}
                              onClick={() => handlePickQuiniela(item.id, option)}
                              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                                currentPick === option
                                  ? 'bg-[#10B981] text-slate-950 border-[#10B981] shadow-md shadow-[#10B981]/25'
                                  : 'bg-[#1E293B]/80 text-slate-300 border-white/8 hover:border-[#10B981]/60 hover:text-white'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : activeView === 'estadisticas' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel rounded-2xl p-6">
                  <h3 className="text-lg font-bold tracking-tight text-white mb-5">
                    Precisión por Liga / Categoría
                  </h3>
                  <div className="space-y-4">
                    {categories.slice(0, 6).map((cat, idx) => {
                      const pct = 88 - idx * 7;
                      return (
                        <div key={cat}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="font-semibold text-slate-200 capitalize">{cat}</span>
                            <span className="text-[#10B981] font-bold tabular-nums">
                              {pct}% efectividad
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[#0F172A]/90 overflow-hidden border border-white/5">
                            <div
                              className="h-full bg-linear-to-r from-[#059669] to-[#10B981] rounded-full shadow-[0_0_12px_rgba(16,185,129,0.45)]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="glass-panel rounded-2xl p-6">
                  <h3 className="text-lg font-bold tracking-tight text-white mb-5">
                    Ranking de Analistas · Temporada 2026/27
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        pos: 1,
                        name: `${displayName} ${displayLastName} (Tú)`,
                        pts: '1,240 pts',
                        acc: '87%',
                        highlight: true,
                      },
                      { pos: 2, name: 'Mario Eduardo Grajales', pts: '1,195 pts', acc: '84%' },
                      { pos: 3, name: 'Emily Smith', pts: '1,120 pts', acc: '81%' },
                      { pos: 4, name: 'Michael Williams', pts: '980 pts', acc: '76%' },
                    ].map((row) => (
                      <div
                        key={row.pos}
                        className={`p-3.5 rounded-xl flex items-center justify-between border transition ${
                          row.highlight
                            ? 'bg-[#10B981]/12 border-[#10B981]/35 shadow-sm shadow-[#10B981]/10'
                            : 'bg-[#0F172A]/70 border-white/6'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center tabular-nums ${
                              row.highlight
                                ? 'bg-[#10B981] text-slate-950'
                                : 'bg-[#1E293B] text-[#10B981]'
                            }`}
                          >
                            #{row.pos}
                          </span>
                          <span className="text-sm font-semibold text-white">{row.name}</span>
                        </div>
                        <div className="text-right tabular-nums">
                          <p className="text-xs font-bold text-[#10B981]">{row.pts}</p>
                          <p className="text-[11px] text-[#94A3B8]">Precisión: {row.acc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <MatchTable
                matches={matches}
                categories={
                  categories.length ? categories : ['LaLiga', 'Liga MX', 'Premier League']
                }
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                limit={limit}
                setLimit={setLimit}
                onSelectMatch={(item) => setSelectedMatch(item)}
                onOpenAdd={() => {
                  setEditingItem(null);
                  setIsCrudModalOpen(true);
                }}
                onOpenEdit={(item) => {
                  setEditingItem(item);
                  setIsCrudModalOpen(true);
                }}
                onOpenDelete={(item) => setItemToDelete(item)}
              />
            )}
          </main>
        </div>
      </div>

      <MatchDetailModal
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
        onEdit={(item) => {
          setEditingItem(item);
          setIsCrudModalOpen(true);
        }}
      />

      <CrudModal
        isOpen={isCrudModalOpen}
        onClose={() => {
          setIsCrudModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveCrud}
        editingItem={editingItem}
        categories={categories.length ? categories : ['LaLiga', 'Liga MX', 'Premier League']}
      />

      <ConfirmModal
        isOpen={Boolean(itemToDelete)}
        itemTitle={itemToDelete?.title}
        onCancel={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}