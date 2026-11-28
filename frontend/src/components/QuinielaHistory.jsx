import { useEffect, useState } from 'react';
import { History, ChevronDown, ChevronUp, Ticket, CalendarDays } from 'lucide-react';
import { listarQuinielasApi, obtenerQuinielaApi } from '../services/api';

const formatFecha = (iso) => {
  if (!iso) return 'Recién registrada';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
};

export default function QuinielaHistory({ refreshKey = 0 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [detailsById, setDetailsById] = useState({});
  const [loadingDetailId, setLoadingDetailId] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    listarQuinielasApi({ page: 0, size: 10 })
      .then((res) => {
        if (!active) return;
        const list = Array.isArray(res) ? res : res?.contenido || res?.content || [];
        setItems(list);
      })
      .catch((err) => {
        if (active) setError(err.message || 'No se pudo cargar el historial.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const toggleDetail = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (detailsById[id]) return;

    setLoadingDetailId(id);
    try {
      const detail = await obtenerQuinielaApi(id);
      setDetailsById((prev) => ({ ...prev, [id]: detail }));
    } catch {
      setDetailsById((prev) => ({ ...prev, [id]: { partidos: [] } }));
    } finally {
      setLoadingDetailId(null);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-white/8 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#10B981]/12 border border-[#10B981]/25 flex items-center justify-center text-[#10B981]">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Mis Quinielas Guardadas</h4>
            <p className="text-xs text-[#94A3B8]">
              Consulta el folio y detalle de tus boletas registradas en el servidor.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 tabular-nums">
          {items.length} registradas
        </span>
      </div>

      {loading ? (
        <p className="text-xs text-[#94A3B8] py-4">Cargando historial de quinielas...</p>
      ) : error ? (
        <p className="text-xs text-red-400 py-2">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-[#94A3B8] py-4">
          Aún no has guardado ninguna quiniela. Selecciona tus partidos arriba y presiona guardar.
        </p>
      ) : (
        <div className="space-y-2.5">
          {items.map((q) => {
            const isOpen = expandedId === q.id;
            const detail = detailsById[q.id];
            return (
              <div
                key={q.id}
                className="rounded-xl bg-[#0F172A]/75 border border-white/8 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleDetail(q.id)}
                  className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-white/4 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#10B981]/12 text-[#10B981] text-xs font-bold tabular-nums">
                      <Ticket className="w-3.5 h-3.5" />#{q.id}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {q.nombreJornada}
                      </p>
                      <p className="text-[11px] text-[#94A3B8] flex items-center gap-1.5 mt-0.5">
                        <CalendarDays className="w-3 h-3" />
                        {formatFecha(q.createdAt)} · {q.totalPartidos} partidos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-[#10B981] tabular-nums">
                      {q.puntosTotales ?? 0} pts
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-2 border-t border-white/6 space-y-2">
                    {loadingDetailId === q.id ? (
                      <p className="text-xs text-[#94A3B8]">Cargando detalle...</p>
                    ) : detail?.partidos?.length ? (
                      detail.partidos.map((p) => (
                        <div
                          key={p.partidoId}
                          className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0"
                        >
                          <span className="text-slate-200">
                            {p.equipoLocal} vs {p.equipoVisitante}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-[#10B981]/15 text-[#10B981] font-bold">
                            {p.seleccion}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#94A3B8]">Sin partidos registrados.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
