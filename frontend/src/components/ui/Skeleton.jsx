// Bloques de carga con brillo animado (reemplazan los textos "Cargando...").

export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function SkeletonRows({ rows = 6, className = 'h-10' }) {
  return (
    <div className="space-y-2.5" role="status" aria-label="Cargando">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={`w-full ${className}`} />
      ))}
    </div>
  );
}

export function SkeletonCards({ count = 6, className = 'h-32' }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Cargando">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`rounded-2xl ${className}`} />
      ))}
    </div>
  );
}
