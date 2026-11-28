// Pestañas tipo píldora con indicador que se desliza al cambiar de opción.

export default function SegmentedTabs({ tabs, value, onChange, size = 'md' }) {
  const index = Math.max(
    0,
    tabs.findIndex((t) => t.id === value)
  );
  const pad = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';

  return (
    <div
      role="tablist"
      className="relative inline-grid rounded-xl bg-[#0F172A]/70 border border-white/10 p-1"
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden="true"
        className="absolute top-1 bottom-1 left-1 rounded-lg bg-[#10B981]/15 border border-[#10B981]/35 shadow-[0_0_18px_-6px_rgba(16,185,129,0.6)] transition-transform duration-300 ease-out"
        style={{
          width: `calc((100% - 0.5rem) / ${tabs.length})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {tabs.map((tab) => {
        const active = tab.id === value;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`relative z-10 inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-semibold transition-colors cursor-pointer active:scale-95 ${pad} ${
              active ? 'text-[#10B981]' : 'text-slate-400 hover:text-white'
            }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
