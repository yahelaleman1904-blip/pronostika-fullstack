// Badges limpios para el estado del partido y la probabilidad.

export function StatusBadge({ estado, minuto }) {
  if (estado === 'en_vivo') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-500/15 border border-red-500/30 text-red-300 text-[11px] font-bold tabular-nums">
        <span className="live-dot" />
        {minuto || 'En vivo'}
      </span>
    );
  }
  if (estado === 'finalizado') {
    return (
      <span className="inline-flex px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400 text-[11px] font-semibold">
        Final
      </span>
    );
  }
  return (
    <span className="inline-flex px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/25 text-sky-300 text-[11px] font-semibold">
      Programado
    </span>
  );
}

export function ProbabilityBadge({ value }) {
  const v = Number(value) || 0;
  const tone =
    v >= 60
      ? 'bg-[#10B981]/15 border-[#10B981]/30 text-[#10B981]'
      : v >= 45
        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        : 'bg-white/5 border-white/10 text-slate-300';
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md border text-[11px] font-bold tabular-nums ${tone}`}>
      {v}%
    </span>
  );
}

export function PositionBadge({ position }) {
  const tones = {
    POR: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    G: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    DEF: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    D: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    MED: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
    M: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
    DEL: 'bg-red-500/15 text-red-300 border-red-500/30',
    F: 'bg-red-500/15 text-red-300 border-red-500/30',
  };
  return (
    <span
      className={`inline-flex w-10 justify-center py-0.5 rounded-md border text-[10px] font-bold ${
        tones[position] || 'bg-white/5 text-slate-300 border-white/10'
      }`}
    >
      {position}
    </span>
  );
}
