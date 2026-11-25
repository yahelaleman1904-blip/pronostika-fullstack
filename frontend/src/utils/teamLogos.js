const normalizeText = (text = '') =>
  text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const TEAM_LOGOS = {
  'real madrid': 'https://a.espncdn.com/i/teamlogos/soccer/500/86.png',
  'barcelona': 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png',
  'fc barcelona': 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png',
  'atletico madrid': 'https://a.espncdn.com/i/teamlogos/soccer/500/1068.png',
  'atletico de madrid': 'https://a.espncdn.com/i/teamlogos/soccer/500/1068.png',
  'villarreal': 'https://a.espncdn.com/i/teamlogos/soccer/500/102.png',
  'real betis': 'https://a.espncdn.com/i/teamlogos/soccer/500/244.png',
  'getafe': 'https://a.espncdn.com/i/teamlogos/soccer/500/2922.png',
  'sevilla': 'https://a.espncdn.com/i/teamlogos/soccer/500/243.png',
  'valencia': 'https://a.espncdn.com/i/teamlogos/soccer/500/94.png',
  'real sociedad': 'https://a.espncdn.com/i/teamlogos/soccer/500/89.png',
  'athletic bilbao': 'https://a.espncdn.com/i/teamlogos/soccer/500/93.png',
  'manchester city': 'https://a.espncdn.com/i/teamlogos/soccer/500/382.png',
  'man city': 'https://a.espncdn.com/i/teamlogos/soccer/500/382.png',
  'manchester united': 'https://a.espncdn.com/i/teamlogos/soccer/500/360.png',
  'man united': 'https://a.espncdn.com/i/teamlogos/soccer/500/360.png',
  'man utd': 'https://a.espncdn.com/i/teamlogos/soccer/500/360.png',
  'arsenal': 'https://a.espncdn.com/i/teamlogos/soccer/500/359.png',
  'liverpool': 'https://a.espncdn.com/i/teamlogos/soccer/500/364.png',
  'chelsea': 'https://a.espncdn.com/i/teamlogos/soccer/500/363.png',
  'tottenham': 'https://a.espncdn.com/i/teamlogos/soccer/500/367.png',
  'bayern munich': 'https://a.espncdn.com/i/teamlogos/soccer/500/132.png',
  'bayern': 'https://a.espncdn.com/i/teamlogos/soccer/500/132.png',
  'rb leipzig': 'https://a.espncdn.com/i/teamlogos/soccer/500/11420.png',
  'borussia dortmund': 'https://a.espncdn.com/i/teamlogos/soccer/500/124.png',
  'dortmund': 'https://a.espncdn.com/i/teamlogos/soccer/500/124.png',
  'bayer leverkusen': 'https://a.espncdn.com/i/teamlogos/soccer/500/131.png',
  'inter': 'https://a.espncdn.com/i/teamlogos/soccer/500/110.png',
  'inter milan': 'https://a.espncdn.com/i/teamlogos/soccer/500/110.png',
  'ac milan': 'https://a.espncdn.com/i/teamlogos/soccer/500/103.png',
  'milan': 'https://a.espncdn.com/i/teamlogos/soccer/500/103.png',
  'juventus': 'https://a.espncdn.com/i/teamlogos/soccer/500/111.png',
  'napoli': 'https://a.espncdn.com/i/teamlogos/soccer/500/114.png',
  'roma': 'https://a.espncdn.com/i/teamlogos/soccer/500/104.png',
  'lazio': 'https://a.espncdn.com/i/teamlogos/soccer/500/112.png',
  'psg': 'https://a.espncdn.com/i/teamlogos/soccer/500/160.png',
  'paris saint-germain': 'https://a.espncdn.com/i/teamlogos/soccer/500/160.png',
  'psv': 'https://a.espncdn.com/i/teamlogos/soccer/500/148.png',
  'america': 'https://a.espncdn.com/i/teamlogos/soccer/500/227.png',
  'club america': 'https://a.espncdn.com/i/teamlogos/soccer/500/227.png',
  'chivas': 'https://a.espncdn.com/i/teamlogos/soccer/500/219.png',
  'guadalajara': 'https://a.espncdn.com/i/teamlogos/soccer/500/219.png',
  'cruz azul': 'https://a.espncdn.com/i/teamlogos/soccer/500/218.png',
  'pumas': 'https://a.espncdn.com/i/teamlogos/soccer/500/233.png',
  'tigres': 'https://a.espncdn.com/i/teamlogos/soccer/500/232.png',
  'monterrey': 'https://a.espncdn.com/i/teamlogos/soccer/500/220.png',
  'toluca': 'https://a.espncdn.com/i/teamlogos/soccer/500/223.png',
};

const LEAGUE_LOGOS = {
  'laliga': 'https://a.espncdn.com/i/leaguelogos/soccer/500/15.png',
  'premier league': 'https://a.espncdn.com/i/leaguelogos/soccer/500/23.png',
  'bundesliga': 'https://a.espncdn.com/i/leaguelogos/soccer/500/10.png',
  'serie a': 'https://a.espncdn.com/i/leaguelogos/soccer/500/12.png',
  'liga mx': 'https://a.espncdn.com/i/leaguelogos/soccer/500/22.png',
  'champions league': 'https://a.espncdn.com/i/leaguelogos/soccer/500/2.png',
  'ligue 1': 'https://a.espncdn.com/i/leaguelogos/soccer/500/9.png',
};

export function getTeamLogo(teamName = '') {
  const key = normalizeText(teamName);
  if (TEAM_LOGOS[key]) return TEAM_LOGOS[key];
  const partial = Object.keys(TEAM_LOGOS).find((k) => key.includes(k) || k.includes(key));
  return partial ? TEAM_LOGOS[partial] : null;
}

export function getLeagueLogo(leagueName = '') {
  const key = normalizeText(leagueName);
  if (LEAGUE_LOGOS[key]) return LEAGUE_LOGOS[key];
  const partial = Object.keys(LEAGUE_LOGOS).find((k) => key.includes(k));
  return partial ? LEAGUE_LOGOS[partial] : null;
}

export function parseTeams(title = '') {
  const parts = title.split(/\s+vs\s+|\s+-\s+/i);
  if (parts.length >= 2) {
    return { local: parts[0].trim(), away: parts[1].trim() };
  }
  return { local: title || 'Local', away: 'Visitante' };
}