import { useState } from 'react';
import LeaguesPage from './LeaguesPage';
import StandingsPage from './StandingsPage';
import TeamPage from './TeamPage';
import CalendarPage from './CalendarPage';
import TopPlayersPage from './TopPlayersPage';

// Contenedor de las vistas de fútbol con navegación interna:
// competiciones -> tabla de una liga -> perfil de equipo (y regreso con historial).
// `section` es la vista inicial que eligió el menú: 'ligas', 'calendario' o 'estadisticas'.
// Desde DashboardPage se monta con key={section} para reiniciar el historial al cambiar de menú.
export default function FootballHub({ section = 'ligas' }) {
  const [stack, setStack] = useState([{ view: section }]);
  const current = stack[stack.length - 1];

  const push = (entry) => {
    setStack((s) => [...s, entry]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));

  const openLeague = (leagueId) => push({ view: 'liga', leagueId });
  const openTeam = (team) => push({ view: 'equipo', team });

  let content;
  switch (current.view) {
    case 'liga':
      content = (
        <StandingsPage
          leagueId={current.leagueId}
          onBack={back}
          onOpenTeam={openTeam}
        />
      );
      break;
    case 'equipo':
      content = (
        <TeamPage
          team={current.team}
          onBack={back}
          onOpenTeam={openTeam}
          onOpenLeague={openLeague}
        />
      );
      break;
    case 'calendario':
      content = <CalendarPage onOpenTeam={openTeam} onOpenLeague={openLeague} />;
      break;
    case 'estadisticas':
      content = <TopPlayersPage onOpenTeam={openTeam} />;
      break;
    default:
      content = <LeaguesPage onOpenLeague={openLeague} />;
  }

  return (
    <div
      key={`${stack.length}-${current.view}-${current.leagueId || ''}-${current.team || ''}`}
      className="animate-fade-up"
    >
      {content}
    </div>
  );
}
