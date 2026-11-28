import { ChevronLeft } from 'lucide-react';

// Encabezado común de las vistas: icono o imagen, título, subtítulo, regreso y acciones.
export default function PageHeader({ icon: Icon, image, title, subtitle, onBack, backLabel = 'Regresar', children }) {
  return (
    <div className="animate-fade-up space-y-3">
      {onBack && (
        <button
          onClick={onBack}
          className="btn-press inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          {backLabel}
        </button>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {image ? (
            <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center p-2 shrink-0">
              <img src={image} alt="" className="w-10 h-10 object-contain" />
            </div>
          ) : (
            Icon && (
              <div className="w-12 h-12 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/35 flex items-center justify-center text-[#10B981] shrink-0 shadow-[0_0_24px_-8px_rgba(16,185,129,0.7)]">
                <Icon className="w-6 h-6" />
              </div>
            )
          )}
          <div className="min-w-0">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white truncate">{title}</h2>
            {subtitle && <p className="text-sm text-[#94A3B8] mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}
