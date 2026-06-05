/* =============================================
   DATA.JS — Gestion des données
   ============================================= */

const DB = {
  KEY: 'marche_japonaise_v1',

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : { sessions: [] };
    } catch(e) { return { sessions: [] }; }
  },

  save(data) {
    try { localStorage.setItem(this.KEY, JSON.stringify(data)); } catch(e) {}
  },

  getSessions() { return this.load().sessions || []; },

  addSession(session) {
    const data = this.load();
    session.id = Date.now().toString();
    data.sessions.push(session);
    data.sessions.sort((a,b) => new Date(b.date) - new Date(a.date));
    this.save(data);
    return session;
  },

  deleteSession(id) {
    const data = this.load();
    data.sessions = data.sessions.filter(s => s.id !== id);
    this.save(data);
  },

  importSessions(sessions) {
    const data = this.load();
    sessions.forEach(s => {
      if (!s.id) s.id = Date.now().toString() + Math.random();
    });
    data.sessions = [...data.sessions, ...sessions];
    // Déduplication par date+lieu
    const seen = new Set();
    data.sessions = data.sessions.filter(s => {
      const key = s.date + '|' + (s.lieu || '');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    data.sessions.sort((a,b) => new Date(b.date) - new Date(a.date));
    this.save(data);
    return data.sessions.length;
  }
};

/* ---- CSV Parser ---- */
function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());

  // Mapping flexible des colonnes
  const colMap = {
    date: ['date'],
    lieu: ['lieu', 'endroit', 'place', 'location'],
    distance: ['distance', 'km', 'distance (km)'],
    meteo: ['météo', 'meteo', 'temps', 'weather'],
    duree: ['durée', 'duree', 'duration', 'temps (min)', 'minutes'],
    fc: ['fréquence cardiaque', 'frequence cardiaque', 'fc', 'bpm', 'fc moy', 'fréquence cardiaque moyenne', 'coeur'],
    rythme: ['rythme moyen', 'rythme', 'allure', 'pace', 'allure moyenne'],
    rythme_rapide: ['rythme rapide', 'intervalle rapide', 'rythme le plus rapide', 'rythme de l\'intervalle le plus rapide', 'rapide'],
    rythme_lent: ['rythme lent', 'intervalle lent', 'rythme le plus lent', 'rythme de l\'intervalle le plus lent', 'lent'],
    kcal: ['kcal', 'calories', 'kilocalories', 'kilocalories totales', 'cal'],
    commentaires: ['commentaires', 'commentaire', 'notes', 'note', 'remarques']
  };

  function findCol(key) {
    const aliases = colMap[key];
    for (let alias of aliases) {
      const idx = header.findIndex(h => h.includes(alias));
      if (idx !== -1) return idx;
    }
    return -1;
  }

  const cols = {};
  for (const key of Object.keys(colMap)) {
    cols[key] = findCol(key);
  }

  const sessions = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV line (gère les guillemets)
    const values = parseCSVLine(line);

    function get(key) {
      const idx = cols[key];
      if (idx === -1 || idx >= values.length) return '';
      return values[idx].trim().replace(/^"|"$/g, '');
    }

    const dateRaw = get('date');
    if (!dateRaw) continue;

    // Normaliser la date
    let dateNorm = dateRaw;
    // Format DD/MM/YYYY → YYYY-MM-DD
    const dmyMatch = dateRaw.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (dmyMatch) dateNorm = `${dmyMatch[3]}-${dmyMatch[2].padStart(2,'0')}-${dmyMatch[1].padStart(2,'0')}`;

    const session = {
      id: '',
      date: dateNorm,
      lieu: get('lieu'),
      distance: parseFloat(get('distance').replace(',', '.')) || 0,
      meteo: get('meteo'),
      duree: parseInt(get('duree')) || 30,
      fc: parseInt(get('fc')) || 0,
      rythme: get('rythme'),
      rythme_rapide: get('rythme_rapide'),
      rythme_lent: get('rythme_lent'),
      kcal: parseInt(get('kcal')) || 0,
      commentaires: get('commentaires')
    };

    if (session.date) sessions.push(session);
  }
  return sessions;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

/* ---- Stats helpers ---- */
function parseRythme(str) {
  // Format min'sec'' ou min:sec ou decimal
  if (!str) return 0;
  const s = String(str).trim();
  const mMatch = s.match(/^(\d+)[':'](\d+)/);
  if (mMatch) return parseInt(mMatch[1]) + parseInt(mMatch[2]) / 60;
  const f = parseFloat(s.replace(',', '.'));
  return isNaN(f) ? 0 : f;
}

function formatRythme(minPerKm) {
  if (!minPerKm || minPerKm === 0) return '—';
  const min = Math.floor(minPerKm);
  const sec = Math.round((minPerKm - min) * 60);
  return `${min}'${String(sec).padStart(2,'0')}''`;
}

function computeStats(sessions) {
  if (!sessions || sessions.length === 0) {
    return {
      total: 0, totalDist: 0, totalKcal: 0, avgDist: 0,
      avgFc: 0, avgRythme: 0, bestRythme: 0, worstRythme: 0,
      streak: 0, maxStreak: 0, thisWeek: 0, thisMonth: 0,
      totalIntervalles: 0
    };
  }

  const total = sessions.length;
  const totalDist = sessions.reduce((s,x) => s + (x.distance || 0), 0);
  const totalKcal = sessions.reduce((s,x) => s + (x.kcal || 0), 0);
  const avgDist = totalDist / total;
  const withFc = sessions.filter(x => x.fc > 0);
  const avgFc = withFc.length ? withFc.reduce((s,x) => s + x.fc, 0) / withFc.length : 0;

  const rythmes = sessions.map(x => parseRythme(x.rythme)).filter(r => r > 0);
  const avgRythme = rythmes.length ? rythmes.reduce((a,b) => a+b, 0) / rythmes.length : 0;
  const bestRythme = rythmes.length ? Math.min(...rythmes) : 0;
  const worstRythme = rythmes.length ? Math.max(...rythmes) : 0;

  // Streak actuel
  const sortedDates = sessions.map(s => s.date).sort((a,b) => new Date(b)-new Date(a));
  let streak = 0, maxStreak = 0, curStreak = 0;
  const today = new Date(); today.setHours(0,0,0,0);
  const uniqueDates = [...new Set(sortedDates)].map(d => new Date(d));
  uniqueDates.sort((a,b) => b-a);

  // Check streak from today or yesterday
  let expected = new Date(today);
  let startedStreak = false;
  for (const d of uniqueDates) {
    const diff = Math.round((expected - d) / 86400000);
    if (diff === 0 || (!startedStreak && diff <= 1)) {
      curStreak++;
      expected = new Date(d);
      expected.setDate(expected.getDate() - 1);
      startedStreak = true;
      if (diff === 0 || diff === 1) streak = curStreak;
    } else if (startedStreak && diff === 1) {
      curStreak++;
      expected.setDate(expected.getDate() - 1);
      streak = curStreak;
    } else {
      if (curStreak > maxStreak) maxStreak = curStreak;
      curStreak = 0;
    }
  }
  if (curStreak > maxStreak) maxStreak = curStreak;

  // This week / this month
  const now = new Date();
  const startWeek = new Date(now); startWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)); startWeek.setHours(0,0,0,0);
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisWeek = sessions.filter(s => new Date(s.date) >= startWeek).length;
  const thisMonth = sessions.filter(s => new Date(s.date) >= startMonth).length;

  // Chaque séance = 5 intervalles de 3mn rapide + 5 de 3mn normal = 10 intervalles
  const totalIntervalles = total * 10;

  return {
    total, totalDist, totalKcal, avgDist, avgFc,
    avgRythme, bestRythme, worstRythme,
    streak, maxStreak, thisWeek, thisMonth,
    totalIntervalles
  };
}

function getSessionsByMonth(sessions) {
  const map = {};
  sessions.forEach(s => {
    const key = s.date.substring(0, 7);
    if (!map[key]) map[key] = [];
    map[key].push(s);
  });
  return map;
}

function getSessionsByWeek(sessions) {
  const map = {};
  sessions.forEach(s => {
    const d = new Date(s.date);
    const startOfWeek = new Date(d);
    const day = d.getDay() || 7;
    startOfWeek.setDate(d.getDate() - day + 1);
    const key = startOfWeek.toISOString().substring(0, 10);
    if (!map[key]) map[key] = [];
    map[key].push(s);
  });
  return map;
}

function getLieux(sessions) {
  const map = {};
  sessions.forEach(s => {
    const lieu = s.lieu || 'Lieu inconnu';
    if (!map[lieu]) map[lieu] = { count: 0, totalDist: 0, sessions: [] };
    map[lieu].count++;
    map[lieu].totalDist += s.distance || 0;
    map[lieu].sessions.push(s);
  });
  return Object.entries(map).sort((a,b) => b[1].count - a[1].count);
}

function getLieuEmoji(lieu) {
  const l = (lieu || '').toLowerCase();
  if (l.includes('parc') || l.includes('jardin')) return '🌳';
  if (l.includes('plage') || l.includes('mer') || l.includes('bord')) return '🏖️';
  if (l.includes('bois') || l.includes('forêt') || l.includes('foret')) return '🌲';
  if (l.includes('ville') || l.includes('rue') || l.includes('center') || l.includes('centre')) return '🏙️';
  if (l.includes('lac') || l.includes('rivière') || l.includes('riviere')) return '💧';
  if (l.includes('montagne') || l.includes('col') || l.includes('alpes')) return '⛰️';
  if (l.includes('stade') || l.includes('piste')) return '🏟️';
  return '📍';
}

function getMeteoEmoji(meteo) {
  const m = (meteo || '').toLowerCase();
  if (m.includes('soleil') || m.includes('beau') || m.includes('ensoleillé')) return '☀️';
  if (m.includes('nuage') || m.includes('couvert')) return '☁️';
  if (m.includes('pluie') || m.includes('pluvieux')) return '🌧️';
  if (m.includes('vent') || m.includes('venteux')) return '💨';
  if (m.includes('brouillard')) return '🌫️';
  if (m.includes('neige')) return '❄️';
  if (m.includes('chaud') || m.includes('chaleur')) return '🌡️';
  if (m.includes('frais') || m.includes('frois') || m.includes('froid')) return '🧊';
  return '🌤️';
}

function getLast7DaysActivity(sessions) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().substring(0, 10);
    const daySessions = sessions.filter(s => s.date === dateStr);
    days.push({
      date: dateStr,
      dayShort: ['D','L','M','M','J','V','S'][d.getDay()],
      count: daySessions.length,
      dist: daySessions.reduce((s,x) => s + (x.distance||0), 0),
      isToday: i === 0
    });
  }
  return days;
}
