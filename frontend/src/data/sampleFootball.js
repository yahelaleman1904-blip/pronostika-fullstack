// Datos de ejemplo para las vistas de ligas, tablas, equipos, calendario y estadísticas.
// Todo se genera de forma determinista (mismos datos en cada carga) a partir de las listas de abajo.
// Cuando exista un endpoint en el backend, basta con reemplazar las funciones exportadas
// (getStandings, getFixtures, getTopPlayers, getTeamProfile) por llamadas a la API.

export const SEASON = '2026/27';

export const LEAGUES = [
  {
    id: 'esp.1',
    nombre: 'LaLiga',
    pais: 'España',
    tipo: 'liga',
    equipos: ['Real Madrid', 'Barcelona', 'Atlético Madrid', 'Villarreal', 'Real Betis', 'Real Sociedad', 'Athletic Bilbao', 'Sevilla', 'Valencia', 'Getafe'],
  },
  {
    id: 'eng.1',
    nombre: 'Premier League',
    pais: 'Inglaterra',
    tipo: 'liga',
    equipos: ['Manchester City', 'Arsenal', 'Liverpool', 'Chelsea', 'Tottenham', 'Manchester United', 'Newcastle', 'Aston Villa', 'Brighton', 'West Ham'],
  },
  {
    id: 'mex.1',
    nombre: 'Liga MX',
    pais: 'México',
    tipo: 'liga',
    equipos: ['América', 'Toluca', 'Tigres', 'Cruz Azul', 'Monterrey', 'Pumas', 'Chivas', 'Pachuca', 'León', 'Santos'],
  },
  {
    id: 'ita.1',
    nombre: 'Serie A',
    pais: 'Italia',
    tipo: 'liga',
    equipos: ['Inter', 'Napoli', 'Juventus', 'AC Milan', 'Roma', 'Lazio', 'Atalanta', 'Fiorentina', 'Bologna', 'Torino'],
  },
  {
    id: 'ger.1',
    nombre: 'Bundesliga',
    pais: 'Alemania',
    tipo: 'liga',
    equipos: ['Bayern Munich', 'Bayer Leverkusen', 'Borussia Dortmund', 'RB Leipzig', 'Stuttgart', 'Eintracht Frankfurt', 'Freiburg', 'Wolfsburg', 'Mainz', 'Hoffenheim'],
  },
  {
    id: 'fra.1',
    nombre: 'Ligue 1',
    pais: 'Francia',
    tipo: 'liga',
    equipos: ['PSG', 'Marseille', 'Monaco', 'Lille', 'Lyon', 'Nice', 'Lens', 'Rennes', 'Nantes', 'Toulouse'],
  },
  {
    id: 'uefa.champions',
    nombre: 'Champions League',
    pais: 'Europa',
    tipo: 'internacional',
    equipos: ['Real Madrid', 'Manchester City', 'Bayern Munich', 'PSG', 'Inter', 'Arsenal', 'Barcelona', 'Bayer Leverkusen', 'Liverpool', 'Borussia Dortmund'],
  },
  {
    id: 'mex.copa',
    nombre: 'Campeones Cup',
    pais: 'Norteamérica',
    tipo: 'copa',
    equipos: ['América', 'Tigres', 'Monterrey', 'Cruz Azul', 'Toluca', 'Pachuca', 'Chivas', 'Pumas'],
  },
];

export const LEAGUE_TYPES = [
  { id: 'todas', label: 'Todas' },
  { id: 'liga', label: 'Ligas' },
  { id: 'copa', label: 'Copas' },
  { id: 'internacional', label: 'Internacional' },
];

// ---------- utilidades deterministas ----------

const hash = (text) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

// Generador pseudoaleatorio con semilla (mulberry32)
const seeded = (seedText) => {
  let a = hash(seedText);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const getLeague = (leagueId) => LEAGUES.find((l) => l.id === leagueId) || LEAGUES[0];

export const findLeagueOfTeam = (team) =>
  LEAGUES.find((l) => l.tipo === 'liga' && l.equipos.includes(team)) ||
  LEAGUES.find((l) => l.equipos.includes(team)) ||
  LEAGUES[0];

// ---------- tabla de posiciones ----------

const PLAYED = 14;

export function getStandings(leagueId) {
  const league = getLeague(leagueId);
  const total = league.equipos.length;

  const rows = league.equipos.map((team, index) => {
    const rand = seeded(`${league.id}-${team}`);
    const strength = 1 - index / (total + 2); // los primeros de la lista son más fuertes
    let g = 0;
    let e = 0;
    let p = 0;
    let gf = 0;
    let gc = 0;
    const results = [];

    for (let j = 0; j < PLAYED; j += 1) {
      const r = rand();
      const winChance = 0.2 + strength * 0.5;
      const drawChance = 0.22;
      if (r < winChance) {
        g += 1;
        const scored = 1 + Math.floor(rand() * 3);
        gf += scored;
        gc += Math.floor(rand() * scored);
        results.push('W');
      } else if (r < winChance + drawChance) {
        e += 1;
        const goals = Math.floor(rand() * 3);
        gf += goals;
        gc += goals;
        results.push('D');
      } else {
        p += 1;
        const conceded = 1 + Math.floor(rand() * 3);
        gc += conceded;
        gf += Math.floor(rand() * conceded);
        results.push('L');
      }
    }

    return {
      equipo: team,
      pj: PLAYED,
      g,
      e,
      p,
      gf,
      gc,
      dg: gf - gc,
      pts: g * 3 + e,
      forma: results.slice(-5), // del más antiguo al más reciente
    };
  });

  rows.sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf || a.equipo.localeCompare(b.equipo));
  return rows.map((row, i) => ({ ...row, pos: i + 1, zona: zoneFor(league, i + 1, total) }));
}

// Zonas de color de la tabla (clasificación, liguilla, descenso)
function zoneFor(league, pos, total) {
  if (league.id === 'mex.1') {
    if (pos <= 6) return 'liguilla';
    if (pos <= 8) return 'repechaje';
    return null;
  }
  if (league.tipo !== 'liga') return pos <= 4 ? 'clasificacion' : null;
  if (pos <= 4) return 'champions';
  if (pos === 5) return 'europa';
  if (pos > total - 2) return 'descenso';
  return null;
}

export const ZONES = {
  champions: { label: 'Champions League', color: 'bg-[#10B981]' },
  europa: { label: 'Europa League', color: 'bg-sky-400' },
  descenso: { label: 'Descenso', color: 'bg-red-500' },
  liguilla: { label: 'Liguilla directa', color: 'bg-[#10B981]' },
  repechaje: { label: 'Play-in', color: 'bg-amber-400' },
  clasificacion: { label: 'Clasifica a la siguiente fase', color: 'bg-[#10B981]' },
};

// ---------- calendario ----------

const KICKOFFS = ['12:00', '14:00', '16:30', '19:00', '21:00'];

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const toDateKey = (date) => {
  const d = new Date(date);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

// Partidos de un día. El estado depende de la fecha real: días pasados = finalizados,
// hoy = mezcla de en vivo, finalizados y por jugar, días futuros = programados.
export function getFixtures(dateKey, now = new Date()) {
  const day = startOfDay(`${dateKey}T00:00:00`);
  const today = startOfDay(now);
  const diffDays = Math.round((day - today) / 86400000);
  const fixtures = [];

  const dayNumber = Math.round(day.getTime() / 86400000);

  LEAGUES.forEach((league, leagueIndex) => {
    // Cada liga juega un día sí y dos no, para que un equipo no tenga partido diario.
    if ((dayNumber + leagueIndex) % 3 !== 0) return;
    const rand = seeded(`${league.id}-${dateKey}`);
    const teams = [...league.equipos].sort(() => rand() - 0.5);
    const count = 2 + Math.floor(rand() * 3);

    for (let i = 0; i < count && i * 2 + 1 < teams.length; i += 1) {
      const local = teams[i * 2];
      const visitante = teams[i * 2 + 1];
      const hora = KICKOFFS[Math.floor(rand() * KICKOFFS.length)];
      const golesLocal = Math.floor(rand() * 4);
      const golesVisitante = Math.floor(rand() * 3);

      let estado = 'programado';
      let minuto = null;
      if (diffDays < 0) {
        estado = 'finalizado';
      } else if (diffDays === 0) {
        const kickoff = new Date(`${dateKey}T${hora}:00`);
        const elapsed = Math.floor((now - kickoff) / 60000);
        if (elapsed >= 110) estado = 'finalizado';
        else if (elapsed >= 0) {
          estado = 'en_vivo';
          minuto = elapsed > 45 && elapsed < 60 ? 'MT' : `${Math.min(90, elapsed > 60 ? elapsed - 15 : elapsed)}'`;
        }
      }

      const partial = estado === 'en_vivo' ? 0.6 : 1;
      fixtures.push({
        id: `${dateKey}-${league.id}-${i}`,
        ligaId: league.id,
        liga: league.nombre,
        fecha: dateKey,
        hora,
        local,
        visitante,
        golesLocal: estado === 'programado' ? null : Math.round(golesLocal * partial),
        golesVisitante: estado === 'programado' ? null : Math.round(golesVisitante * partial),
        estado,
        minuto,
        probabilidadLocal: 30 + Math.floor(rand() * 45),
      });
    }
  });

  return fixtures.sort((a, b) => a.hora.localeCompare(b.hora));
}

export function getTeamFixtures(team, now = new Date()) {
  const recent = [];
  const upcoming = [];
  for (let offset = -21; offset <= 21 && (recent.length < 5 || upcoming.length < 5); offset += 1) {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    const key = toDateKey(d);
    getFixtures(key, now)
      .filter((f) => f.local === team || f.visitante === team)
      .forEach((f) => {
        if (f.estado === 'finalizado') recent.push(f);
        else upcoming.push(f);
      });
  }
  return { recientes: recent.slice(-5).reverse(), proximos: upcoming.slice(0, 5) };
}

// ---------- plantilla de ejemplo ----------

const FIRST = ['Alejandro', 'Diego', 'Luis', 'Carlos', 'Mateo', 'Javier', 'Hugo', 'Iván', 'Santiago', 'Andrés', 'Pablo', 'Rodrigo', 'Emilio', 'Bruno', 'Thiago', 'Marco'];
const LAST = ['García', 'Martínez', 'López', 'Hernández', 'Silva', 'Romero', 'Torres', 'Navarro', 'Castro', 'Vega', 'Ortiz', 'Ramos', 'Molina', 'Rivas', 'Suárez', 'Delgado'];
const SQUAD_SHAPE = [
  ['POR', 2],
  ['DEF', 6],
  ['MED', 6],
  ['DEL', 4],
];

export function getSampleSquad(team) {
  const rand = seeded(`squad-${team}`);
  const squad = [];
  let dorsal = 1;
  SQUAD_SHAPE.forEach(([position, count]) => {
    for (let i = 0; i < count; i += 1) {
      squad.push({
        id: `${team}-${dorsal}`,
        name: `${FIRST[Math.floor(rand() * FIRST.length)]} ${LAST[Math.floor(rand() * LAST.length)]}`,
        number: String(dorsal),
        position,
        age: 18 + Math.floor(rand() * 16),
        rating: (6.2 + rand() * 1.6).toFixed(1),
      });
      dorsal += 1;
    }
  });
  return squad;
}

// ---------- top jugadores (valores de ejemplo) ----------

export const TOP_PLAYERS = [
  { id: 1, nombre: 'Kylian Mbappé', equipo: 'Real Madrid', ligaId: 'esp.1', posicion: 'DEL', goles: 14, asistencias: 4, rating: 8.1, partidos: 14 },
  { id: 2, nombre: 'Erling Haaland', equipo: 'Manchester City', ligaId: 'eng.1', posicion: 'DEL', goles: 15, asistencias: 2, rating: 7.9, partidos: 14 },
  { id: 3, nombre: 'Harry Kane', equipo: 'Bayern Munich', ligaId: 'ger.1', posicion: 'DEL', goles: 16, asistencias: 5, rating: 8.2, partidos: 13 },
  { id: 4, nombre: 'Lamine Yamal', equipo: 'Barcelona', ligaId: 'esp.1', posicion: 'DEL', goles: 7, asistencias: 9, rating: 8.0, partidos: 14 },
  { id: 5, nombre: 'Mohamed Salah', equipo: 'Liverpool', ligaId: 'eng.1', posicion: 'DEL', goles: 10, asistencias: 7, rating: 7.8, partidos: 14 },
  { id: 6, nombre: 'Lautaro Martínez', equipo: 'Inter', ligaId: 'ita.1', posicion: 'DEL', goles: 11, asistencias: 3, rating: 7.6, partidos: 14 },
  { id: 7, nombre: 'Jude Bellingham', equipo: 'Real Madrid', ligaId: 'esp.1', posicion: 'MED', goles: 6, asistencias: 6, rating: 7.7, partidos: 13 },
  { id: 8, nombre: 'Jamal Musiala', equipo: 'Bayern Munich', ligaId: 'ger.1', posicion: 'MED', goles: 8, asistencias: 6, rating: 7.8, partidos: 14 },
  { id: 9, nombre: 'Bukayo Saka', equipo: 'Arsenal', ligaId: 'eng.1', posicion: 'DEL', goles: 6, asistencias: 8, rating: 7.6, partidos: 14 },
  { id: 10, nombre: 'Ousmane Dembélé', equipo: 'PSG', ligaId: 'fra.1', posicion: 'DEL', goles: 9, asistencias: 5, rating: 7.7, partidos: 13 },
  { id: 11, nombre: 'Khvicha Kvaratskhelia', equipo: 'PSG', ligaId: 'fra.1', posicion: 'DEL', goles: 6, asistencias: 7, rating: 7.5, partidos: 14 },
  { id: 12, nombre: 'Paulinho', equipo: 'Toluca', ligaId: 'mex.1', posicion: 'DEL', goles: 12, asistencias: 2, rating: 7.6, partidos: 14 },
  { id: 13, nombre: 'Henry Martín', equipo: 'América', ligaId: 'mex.1', posicion: 'DEL', goles: 8, asistencias: 3, rating: 7.2, partidos: 13 },
  { id: 14, nombre: 'Florian Wirtz', equipo: 'Liverpool', ligaId: 'eng.1', posicion: 'MED', goles: 5, asistencias: 7, rating: 7.6, partidos: 14 },
  { id: 15, nombre: 'Pedri', equipo: 'Barcelona', ligaId: 'esp.1', posicion: 'MED', goles: 3, asistencias: 6, rating: 7.7, partidos: 14 },
  { id: 16, nombre: 'Victor Osimhen', equipo: 'Napoli', ligaId: 'ita.1', posicion: 'DEL', goles: 9, asistencias: 1, rating: 7.3, partidos: 12 },
];

export const getTopPlayers = (leagueId = 'todas') =>
  leagueId === 'todas' ? TOP_PLAYERS : TOP_PLAYERS.filter((p) => p.ligaId === leagueId);

// Simula la latencia de una API para poder ver los skeleton loaders.
export const withDelay = (value, ms = 450) => new Promise((resolve) => setTimeout(() => resolve(value), ms));
