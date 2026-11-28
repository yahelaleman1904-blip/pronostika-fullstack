import { useState } from 'react';
import { getTeamLogo } from '../../utils/teamLogos';

const SIZES = {
  xs: 'w-5 h-5 text-[8px]',
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-16 h-16 text-base',
  xl: 'w-24 h-24 text-2xl',
};

const initialsOf = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

// Escudo del equipo con respaldo de iniciales si no hay logo o falla la imagen.
export default function TeamCrest({ name, size = 'sm', src }) {
  const [failed, setFailed] = useState(false);
  const logo = src || getTeamLogo(name);
  const box = SIZES[size] || SIZES.sm;

  if (logo && !failed) {
    return (
      <img
        src={logo}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className={`${box} object-contain shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]`}
      />
    );
  }

  return (
    <span
      className={`${box} shrink-0 rounded-full bg-[#0F172A] border border-white/10 flex items-center justify-center font-display font-bold text-[#10B981]`}
      aria-hidden="true"
    >
      {initialsOf(name)}
    </span>
  );
}
