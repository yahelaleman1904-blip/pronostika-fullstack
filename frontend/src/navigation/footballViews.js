import { Trophy, CalendarDays, Star } from 'lucide-react';

// Entradas de menú para las vistas de fútbol (FootballHub).
// Para activarlas:
//   Sidebar.jsx       -> agregar ...FOOTBALL_MENU_ITEMS al arreglo menuItems
//   DashboardPage.jsx -> antes del último else:
//     ) : isFootballView(activeView) ? (
//       <FootballHub key={activeView} section={footballSection(activeView)} />
export const FOOTBALL_MENU_ITEMS = [
  { id: 'ligas', label: 'Ligas y tablas', icon: Trophy },
  { id: 'calendario', label: 'Calendario', icon: CalendarDays },
  { id: 'top-jugadores', label: 'Top jugadores', icon: Star },
];

const SECTION_BY_VIEW = {
  ligas: 'ligas',
  calendario: 'calendario',
  'top-jugadores': 'estadisticas',
};

export const isFootballView = (view) => Object.prototype.hasOwnProperty.call(SECTION_BY_VIEW, view);

export const footballSection = (view) => SECTION_BY_VIEW[view] || 'ligas';

export const FOOTBALL_TITLES = {
  ligas: 'Ligas y Tablas',
  calendario: 'Calendario y En Vivo',
  'top-jugadores': 'Top Jugadores',
};
