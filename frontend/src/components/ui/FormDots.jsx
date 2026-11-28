// Últimos resultados en bolitas: W (victoria), D (empate), L (derrota).

const STYLES = {
  W: { cls: 'bg-[#10B981] text-slate-950', label: 'G', title: 'Victoria' },
  D: { cls: 'bg-slate-500 text-white', label: 'E', title: 'Empate' },
  L: { cls: 'bg-red-500 text-white', label: 'P', title: 'Derrota' },
};

export default function FormDots({ results = [], size = 'sm' }) {
  const box = size === 'md' ? 'w-6 h-6 text-[11px]' : 'w-5 h-5 text-[10px]';
  return (
    <div className="flex items-center gap-1" aria-label={`Últimos resultados: ${results.join(' ')}`}>
      {results.map((r, i) => {
        const s = STYLES[r] || STYLES.D;
        const isLast = i === results.length - 1;
        return (
          <span
            key={i}
            title={s.title}
            className={`${box} ${s.cls} rounded-full font-bold flex items-center justify-center tabular-nums ${
              isLast ? 'ring-2 ring-white/25 ring-offset-1 ring-offset-[#1E293B]' : ''
            }`}
          >
            {s.label}
          </span>
        );
      })}
    </div>
  );
}
