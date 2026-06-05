/* =============================================
   APP.JS — Logique principale
   ============================================= */

let currentScreen = 'accueil';
let currentStatTab = 'semaine';
let currentTrophyTab = 'all';
let previousUnlocked = loadTrophees();

const TIPS = [
  { icon:'💡', title:'Astuce cadence', text:'Vise 100-120 pas/minute pendant les phases rapides pour maximiser l\'efficacité cardio.' },
  { icon:'🫁', title:'Respiration', text:'Expire sur 2 pas, inspire sur 2 pas. La respiration rythmée améliore la récupération entre les intervalles.' },
  { icon:'🕐', title:'Timing Apple Watch', text:'Utilise les vibrations pour gérer tes intervalles sans regarder l\'écran — reste dans le moment présent.' },
  { icon:'💧', title:'Hydratation', text:'Bois 200ml d\'eau avant la séance. La marche japonaise active la transpiration même par temps frais.' },
  { icon:'🦵', title:'Technique', text:'Pendant les phases rapides, bascule légèrement le poids vers l\'avant et engage les bras.' },
  { icon:'🧘', title:'Récupération', text:'Les 3 minutes de marche normale sont aussi importantes que les rapides : profites-en pour récupérer activement.' },
  { icon:'📈', title:'Progression', text:'Les bienfaits cardiovasculaires apparaissent dès 2-3 semaines. La perte de poids suit dans un second temps.' },
  { icon:'🌡️', title:'Chaleur', text:'Par forte chaleur, réduis l\'intensité des intervalles rapides. Ta FC sera naturellement plus élevée.' },
  { icon:'🎯', title:'Zone cible', text:'Vise une FC entre 120-150 bpm pendant les intervalles rapides pour rester en zone aérobie efficace.' },
  { icon:'🌊', title:'Aquatique', text:'En piscine, la marche japonaise aquatique (3mn rapide / 3mn normale) offre les mêmes bénéfices sans impact articulaire.' },
];

// =============================================
// NAVIGATION
// =============================================
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const screen = btn.dataset.screen;
    navigateTo(screen);
  });
});

function navigateTo(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('screen-' + screen).classList.add('active');
  document.querySelector(`.nav-btn[data-screen="${screen}"]`).classList.add('active');
  currentScreen = screen;
  renderScreen(screen);
}

function renderScreen(screen) {
  switch(screen) {
    case 'accueil': renderAccueil(); break;
    case 'stats': renderStats(); break;
    case 'lieux': renderLieux(); break;
    case 'progres': renderProgres(); break;
    case 'trophees': renderTrophees(); break;
  }
}

// =============================================
// ACCUEIL
// =============================================
function renderAccueil() {
  const sessions = DB.getSessions();
  const stats = computeStats(sessions);
  const last = sessions[0] || null;
  const last7 = getLast7DaysActivity(sessions);
  const tipIndex = Math.floor(Date.now() / 86400000) % TIPS.length;
  const tip = TIPS[tipIndex];

  const maxBar = Math.max(...last7.map(d => d.dist), 0.1);

  const greetHour = new Date().getHours();
  const greet = greetHour < 12 ? 'Bonjour 🌅' : greetHour < 18 ? 'Bon après-midi ☀️' : 'Bonsoir 🌙';

  document.getElementById('screen-accueil').innerHTML = `
    <div class="hero-section">
      <div class="hero-greeting">${greet}</div>
      <div class="hero-title">Marche<br>Japonaise</div>
      <div class="hero-kanji">日本式ウォーキング</div>
    </div>

    <div class="quick-stats">
      <div class="qstat-card orange">
        <div class="qstat-icon">🚶</div>
        <div class="qstat-value">${stats.total}<span> séances</span></div>
        <div class="qstat-label">Total</div>
      </div>
      <div class="qstat-card blue">
        <div class="qstat-icon">📏</div>
        <div class="qstat-value">${stats.totalDist.toFixed(1)}<span> km</span></div>
        <div class="qstat-label">Distance totale</div>
      </div>
      <div class="qstat-card green">
        <div class="qstat-icon">🔥</div>
        <div class="qstat-value">${stats.totalKcal.toLocaleString('fr')}<span> kcal</span></div>
        <div class="qstat-label">Calories brûlées</div>
      </div>
      <div class="qstat-card purple">
        <div class="qstat-icon">⚡</div>
        <div class="qstat-value">${stats.totalIntervalles}<span> inter.</span></div>
        <div class="qstat-label">Intervalles rapides</div>
      </div>
    </div>

    ${stats.streak > 0 ? `
    <div class="streak-banner">
      <div class="streak-fire">🔥</div>
      <div class="streak-text">
        <h3>${stats.streak} jour${stats.streak > 1 ? 's' : ''} de suite !</h3>
        <p>Continue comme ça — la régularité fait tout.</p>
      </div>
    </div>` : `
    <div class="streak-banner">
      <div class="streak-fire">🎯</div>
      <div class="streak-text">
        <h3>Lance ta série !</h3>
        <p>Marche aujourd'hui pour démarrer un streak.</p>
      </div>
    </div>`}

    <div class="section-title">Cette semaine</div>
    <div class="weekly-chart-card">
      <div class="bar-chart">
        ${last7.map(d => `
          <div class="bar-item">
            <div class="bar ${d.isToday ? 'active' : d.count > 0 ? 'has-data' : ''}"
              style="height:${d.dist > 0 ? Math.max(8, (d.dist/maxBar)*100) : 4}%; background:${d.isToday ? 'var(--accent)' : 'var(--accent)'}"></div>
            <div class="bar-day" style="color:${d.isToday ? 'var(--accent)' : ''}">${d.dayShort}</div>
          </div>
        `).join('')}
      </div>
    </div>

    ${last ? `
    <div class="last-session">
      <div class="last-session-header">
        <h3>Dernière séance</h3>
        <span class="pill pill-green">${formatDate(last.date)}</span>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">
        ${last.lieu ? `<span class="interval-badge">${getLieuEmoji(last.lieu)} ${last.lieu}</span>` : ''}
        ${last.meteo ? `<span class="interval-badge">${getMeteoEmoji(last.meteo)} ${last.meteo}</span>` : ''}
      </div>
      <div class="last-session-grid">
        <div class="ls-item">
          <div class="ls-val">${last.distance ? last.distance.toFixed(2) : '—'}<span> km</span></div>
          <div class="ls-key">Distance</div>
        </div>
        <div class="ls-item">
          <div class="ls-val">${last.fc || '—'}<span>${last.fc ? ' bpm' : ''}</span></div>
          <div class="ls-key">FC moy.</div>
        </div>
        <div class="ls-item">
          <div class="ls-val" style="font-size:15px">${last.rythme || '—'}</div>
          <div class="ls-key">Rythme moy.</div>
        </div>
        <div class="ls-item">
          <div class="ls-val" style="font-size:13px;color:var(--accent)">⚡ ${last.rythme_rapide || '—'}</div>
          <div class="ls-key">Int. rapide</div>
        </div>
        <div class="ls-item">
          <div class="ls-val" style="font-size:13px;color:var(--blue)">🐢 ${last.rythme_lent || '—'}</div>
          <div class="ls-key">Int. lent</div>
        </div>
        <div class="ls-item">
          <div class="ls-val">${last.kcal || '—'}<span>${last.kcal ? ' kc' : ''}</span></div>
          <div class="ls-key">Calories</div>
        </div>
      </div>
      ${last.commentaires ? `<div style="margin-top:12px;padding:10px;background:var(--bg3);border-radius:8px;font-size:12px;color:var(--text2);font-weight:600;font-style:italic;">"${last.commentaires}"</div>` : ''}
    </div>` : ''}

    <div class="tip-card">
      <div class="tip-icon">${tip.icon}</div>
      <div class="tip-text">
        <h4>${tip.title}</h4>
        <p>${tip.text}</p>
      </div>
    </div>

    <div class="action-btns">
      <button class="btn btn-primary" onclick="openModalAjout()">➕ Ajouter</button>
      <button class="btn btn-secondary" onclick="openModalImport()">📂 Importer CSV</button>
    </div>

    <div class="bienfaits-section">
      <div class="bienfaits-title">Bienfaits de la marche japonaise</div>
      <div class="bienfait-item">
        <div class="bienfait-icon">❤️</div>
        <div class="bienfait-text">
          <h4>Santé cardiovasculaire</h4>
          <p>Les intervalles d'intensité variable améliorent la VO2max et la capacité cardiaque plus efficacement que la marche continue.</p>
        </div>
      </div>
      <div class="bienfait-item">
        <div class="bienfait-icon">🔥</div>
        <div class="bienfait-text">
          <h4>Combustion des graisses</h4>
          <p>L'alternance rapide/lent maintient un taux métabolique élevé jusqu'à 24h après la séance (effet EPOC).</p>
        </div>
      </div>
      <div class="bienfait-item">
        <div class="bienfait-icon">🦵</div>
        <div class="bienfait-text">
          <h4>Impact articulaire réduit</h4>
          <p>Contrairement à la course, la marche japonaise préserve les genoux et les hanches tout en offrant des bénéfices équivalents.</p>
        </div>
      </div>
      <div class="bienfait-item">
        <div class="bienfait-icon">🧠</div>
        <div class="bienfait-text">
          <h4>Bien-être mental</h4>
          <p>La régularité des intervalles crée un état de flow similaire à la méditation en mouvement. Libération d'endorphines garantie.</p>
        </div>
      </div>
      <div class="bienfait-item">
        <div class="bienfait-icon">📊</div>
        <div class="bienfait-text">
          <h4>Résultats mesurables</h4>
          <p>Étude japonaise (2019) : 5 mois de marche japonaise réduisent la pression artérielle et améliorent le VO2max de 8% en moyenne.</p>
        </div>
      </div>
    </div>
  `;
}

// =============================================
// STATS
// =============================================
function renderStats() {
  const el = document.getElementById('screen-stats');
  el.innerHTML = `
    <div class="page-header">
      <div class="page-title">Statistiques</div>
      <div class="page-subtitle">Analyse de tes performances</div>
    </div>
    <div class="tab-bar" id="stats-tabs">
      ${['semaine','mois','annee','global'].map(t => `
        <button class="tab-btn ${currentStatTab===t?'active':''}" onclick="switchStatTab('${t}')">
          ${{semaine:'Cette semaine',mois:'Ce mois',annee:'Cette année',global:'Global'}[t]}
        </button>
      `).join('')}
    </div>
    <div class="stats-content" id="stats-body"></div>
  `;
  renderStatBody();
}

function switchStatTab(tab) {
  currentStatTab = tab;
  document.querySelectorAll('#stats-tabs .tab-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.trim() === {semaine:'Cette semaine',mois:'Ce mois',annee:'Cette année',global:'Global'}[tab]);
  });
  renderStatBody();
}

function renderStatBody() {
  const allSessions = DB.getSessions();
  const now = new Date();
  let sessions = allSessions;

  if (currentStatTab === 'semaine') {
    const startWeek = new Date(now);
    const day = now.getDay() || 7;
    startWeek.setDate(now.getDate() - day + 1);
    startWeek.setHours(0,0,0,0);
    sessions = allSessions.filter(s => new Date(s.date) >= startWeek);
  } else if (currentStatTab === 'mois') {
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    sessions = allSessions.filter(s => new Date(s.date) >= startMonth);
  } else if (currentStatTab === 'annee') {
    const startYear = new Date(now.getFullYear(), 0, 1);
    sessions = allSessions.filter(s => new Date(s.date) >= startYear);
  }

  const stats = computeStats(sessions);
  const body = document.getElementById('stats-body');

  if (sessions.length === 0) {
    body.innerHTML = `<div class="no-data-msg"><div class="icon">📊</div>Aucune donnée pour cette période.<br>Importe tes séances ou ajoutes-en une !</div>`;
    return;
  }

  const totalHours = Math.floor((sessions.length * 30) / 60);
  const totalMins = (sessions.length * 30) % 60;

  // Fun facts
  const funFacts = [];
  if (stats.totalDist >= 1) {
    const eiffel = (stats.totalDist * 1000 / 300).toFixed(1);
    funFacts.push({ icon:'🗼', text:`Tu as marché l'équivalent de <strong>${eiffel}× la hauteur</strong> de la Tour Eiffel (à plat).` });
  }
  if (stats.totalKcal >= 200) {
    const chocolats = Math.round(stats.totalKcal / 520);
    funFacts.push({ icon:'🍫', text:`${stats.totalKcal} kcal brûlées = <strong>${chocolats} tablette${chocolats>1?'s':''} de chocolat</strong> (170g/tablette).` });
  }
  if (stats.totalIntervalles >= 10) {
    funFacts.push({ icon:'⚡', text:`<strong>${stats.totalIntervalles} intervalles rapides</strong> complétés. Chacun dure 3 minutes — soit ${(stats.totalIntervalles*3/60).toFixed(0)}h de pur effort !` });
  }

  // Graphique des séances par jour (7 derniers jours pour semaine, par semaine pour mois, par mois pour année/global)
  let chartHTML = '';
  if (currentStatTab === 'semaine') {
    const last7 = getLast7DaysActivity(allSessions.filter(s => {
      const startWeek = new Date(now);
      const day = now.getDay() || 7;
      startWeek.setDate(now.getDate() - day + 1);
      startWeek.setHours(0,0,0,0);
      return new Date(s.date) >= startWeek;
    }));
    // Show week days
    const days7 = getLast7DaysActivity(sessions);
    const maxD = Math.max(...days7.map(d=>d.dist),0.1);
    chartHTML = `
      <div class="stat-big-card">
        <h3>Distance par jour</h3>
        <div class="bar-chart" style="height:80px">
          ${days7.map(d=>`
            <div class="bar-item">
              <div style="font-size:10px;color:var(--accent);font-weight:900;margin-bottom:2px">${d.dist>0?d.dist.toFixed(1):''}</div>
              <div class="bar ${d.count>0?'has-data':''}" style="height:${d.dist>0?Math.max(10,(d.dist/maxD)*100):4}%"></div>
              <div class="bar-day">${d.dayShort}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else {
    const byM = getSessionsByMonth(sessions);
    const keys = Object.keys(byM).sort();
    const maxSes = Math.max(...keys.map(k=>byM[k].length),1);
    if (keys.length > 0) {
      chartHTML = `
        <div class="stat-big-card">
          <h3>Séances ${currentStatTab==='mois'?'par semaine':'par mois'}</h3>
          <div class="bar-chart" style="height:80px">
            ${keys.slice(-12).map(k=>`
              <div class="bar-item">
                <div style="font-size:10px;color:var(--accent);font-weight:900;margin-bottom:2px">${byM[k].length}</div>
                <div class="bar has-data" style="height:${Math.max(8,(byM[k].length/maxSes)*100)}%"></div>
                <div class="bar-day" style="font-size:9px">${k.substring(5)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  body.innerHTML = `
    <div class="highlight-number">
      <div class="big" style="color:var(--accent)">${sessions.length}</div>
      <div class="unit">séances</div>
      <div class="label">${totalHours}h${totalMins > 0 ? totalMins+'mn' : ''} de marche japonaise</div>
    </div>

    ${chartHTML}

    <div class="stat-big-card">
      <h3>📏 Distance</h3>
      <div class="stat-row"><span class="stat-row-label">Total</span><span class="stat-row-val">${stats.totalDist.toFixed(2)} km</span></div>
      <div class="stat-row"><span class="stat-row-label">Moyenne / séance</span><span class="stat-row-val">${stats.avgDist.toFixed(2)} km</span></div>
      <div class="stat-row"><span class="stat-row-label">Meilleure séance</span><span class="stat-row-val" style="color:var(--green)">${sessions.length ? Math.max(...sessions.map(s=>s.distance||0)).toFixed(2) : '—'} km</span></div>
    </div>

    <div class="stat-big-card">
      <h3>⚡ Rythme & Intervalles</h3>
      <div class="stat-row"><span class="stat-row-label">Rythme moyen</span><span class="stat-row-val">${formatRythme(stats.avgRythme)}</span></div>
      <div class="stat-row"><span class="stat-row-label">Meilleur intervalle rapide</span><span class="stat-row-val" style="color:var(--accent)">${formatRythme(stats.bestRythme)}</span></div>
      <div class="stat-row"><span class="stat-row-label">Intervalle le plus lent</span><span class="stat-row-val" style="color:var(--blue)">${formatRythme(stats.worstRythme)}</span></div>
      <div class="stat-row"><span class="stat-row-label">Intervalles rapides</span><span class="stat-row-val">${stats.totalIntervalles}</span></div>
    </div>

    <div class="stat-big-card">
      <h3>❤️ Fréquence cardiaque</h3>
      ${stats.avgFc > 0 ? `
        <div class="stat-row"><span class="stat-row-label">FC moyenne</span><span class="stat-row-val">${Math.round(stats.avgFc)} bpm</span></div>
        <div class="stat-row"><span class="stat-row-label">FC max enregistrée</span><span class="stat-row-val" style="color:var(--pink)">${sessions.filter(s=>s.fc>0).length ? Math.max(...sessions.filter(s=>s.fc>0).map(s=>s.fc)) : '—'} bpm</span></div>
        <div class="stat-row"><span class="stat-row-label">FC min enregistrée</span><span class="stat-row-val" style="color:var(--blue)">${sessions.filter(s=>s.fc>0).length ? Math.min(...sessions.filter(s=>s.fc>0).map(s=>s.fc)) : '—'} bpm</span></div>
        <div style="margin-top:14px">
          <div class="progress-bar-label"><span>Légère &lt;120</span><span>Zone optimale 120-150</span><span>Intense &gt;150</span></div>
          <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${Math.min(100,((Math.round(stats.avgFc)-60)/120)*100)}%"></div></div>
          <div style="text-align:center;font-size:12px;color:var(--text3);margin-top:4px;font-weight:700">
            ${Math.round(stats.avgFc)>=120&&Math.round(stats.avgFc)<=150 ? '✅ Tu es dans la zone aérobie idéale !' : Math.round(stats.avgFc)<120 ? '⬆️ Peut-être intensifier les phases rapides' : '⚠️ Surveille ton intensité'}
          </div>
        </div>
      ` : '<div style="color:var(--text3);font-size:14px;font-weight:700;text-align:center;padding:10px 0">Aucune FC enregistrée sur cette période</div>'}
    </div>

    <div class="stat-big-card">
      <h3>🔥 Calories</h3>
      <div class="stat-row"><span class="stat-row-label">Total brûlées</span><span class="stat-row-val">${stats.totalKcal.toLocaleString('fr')} kcal</span></div>
      <div class="stat-row"><span class="stat-row-label">Moyenne / séance</span><span class="stat-row-val">${sessions.filter(s=>s.kcal>0).length ? Math.round(sessions.filter(s=>s.kcal>0).reduce((a,s)=>a+s.kcal,0)/sessions.filter(s=>s.kcal>0).length) : '—'} kcal</span></div>
      <div class="stat-row"><span class="stat-row-label">Record en une séance</span><span class="stat-row-val" style="color:var(--yellow)">${sessions.filter(s=>s.kcal>0).length ? Math.max(...sessions.filter(s=>s.kcal>0).map(s=>s.kcal)) : '—'} kcal</span></div>
    </div>

    <div class="stat-big-card">
      <h3>🌤️ Météo favorite</h3>
      ${renderMeteoStats(sessions)}
    </div>

    ${funFacts.map(f=>`
      <div class="fun-fact-card">
        <div class="icon">${f.icon}</div>
        <div class="text">${f.text}</div>
      </div>
    `).join('')}
  `;
}

function renderMeteoStats(sessions) {
  const withMeteo = sessions.filter(s => s.meteo && s.meteo.length > 0);
  if (!withMeteo.length) return '<div style="color:var(--text3);font-size:14px;font-weight:700;text-align:center;padding:10px 0">Aucune météo enregistrée</div>';
  const map = {};
  withMeteo.forEach(s => {
    const k = s.meteo.trim();
    map[k] = (map[k] || 0) + 1;
  });
  return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v]) => `
    <div class="stat-row">
      <span class="stat-row-label">${getMeteoEmoji(k)} ${k}</span>
      <span class="stat-row-val">${v} séance${v>1?'s':''}</span>
    </div>
  `).join('');
}

// =============================================
// LIEUX
// =============================================
function renderLieux() {
  const sessions = DB.getSessions();
  const lieux = getLieux(sessions);
  const el = document.getElementById('screen-lieux');

  if (lieux.length === 0) {
    el.innerHTML = `
      <div class="page-header"><div class="page-title">Mes Lieux</div></div>
      <div class="empty-state">
        <div class="icon">📍</div>
        <h3>Aucun lieu enregistré</h3>
        <p>Ajoute le lieu de tes séances pour visualiser tes terrains de marche favoris.</p>
      </div>
    `;
    return;
  }

  el.innerHTML = `
    <div class="page-header">
      <div class="page-title">Mes Lieux</div>
      <div class="page-subtitle">${lieux.length} terrain${lieux.length>1?'s':''} de marche</div>
    </div>

    <div class="section-title">Top lieux</div>
    ${lieux.map(([nom, data], i) => `
      <div class="lieu-card stagger-item">
        <div class="lieu-icon">${getLieuEmoji(nom)}</div>
        <div class="lieu-info">
          <div class="lieu-name">${nom}</div>
          <div class="lieu-meta">${data.totalDist.toFixed(1)} km parcourus · moy. ${(data.totalDist/data.count).toFixed(2)} km/séance</div>
          ${i === 0 ? '<span class="pill pill-orange" style="margin-top:4px">Terrain favori 🏆</span>' : ''}
        </div>
        <div class="lieu-badge">
          <div class="lieu-count">${data.count}</div>
          <div class="lieu-count-label">séance${data.count>1?'s':''}</div>
        </div>
      </div>
    `).join('')}

    <div class="section-title" style="margin-top:16px">Météo par lieu</div>
    ${lieux.slice(0,5).map(([nom, data]) => {
      const meteoMap = {};
      data.sessions.forEach(s => { if(s.meteo) meteoMap[s.meteo]=(meteoMap[s.meteo]||0)+1; });
      const topMeteo = Object.entries(meteoMap).sort((a,b)=>b[1]-a[1])[0];
      return `
        <div class="lieu-card stagger-item">
          <div class="lieu-icon">${getLieuEmoji(nom)}</div>
          <div class="lieu-info">
            <div class="lieu-name">${nom}</div>
            <div class="lieu-meta">Météo la plus fréquente</div>
          </div>
          <div>${topMeteo ? getMeteoEmoji(topMeteo[0]) + ' ' + topMeteo[0] : '—'}</div>
        </div>
      `;
    }).join('')}
    <div style="height:100px"></div>
  `;
}

// =============================================
// PROGRÈS
// =============================================
function renderProgres() {
  const sessions = DB.getSessions();
  const allStats = computeStats(sessions);
  const el = document.getElementById('screen-progres');

  if (sessions.length === 0) {
    el.innerHTML = `
      <div class="page-header"><div class="page-title">Progrès</div></div>
      <div class="empty-state">
        <div class="icon">📈</div>
        <h3>Pas encore de données</h3>
        <p>Importe ou ajoute tes premières séances pour voir ta progression.</p>
      </div>
    `;
    return;
  }

  // Goals / anneaux style iOS Forme
  const weekGoal = 3;
  const monthGoal = 12;
  const distGoal = 30;
  const weekPct = Math.min(100, (allStats.thisWeek / weekGoal) * 100);
  const monthPct = Math.min(100, (allStats.thisMonth / monthGoal) * 100);
  const distPct = Math.min(100, (allStats.totalDist / distGoal) * 100);

  // Heatmap (52 semaines)
  const heatmap = buildHeatmap(sessions);

  // Evolution mensuelle
  const byM = getSessionsByMonth(sessions);
  const monthKeys = Object.keys(byM).sort().slice(-6);

  // Tendances
  const sorted = [...sessions].sort((a,b)=>new Date(a.date)-new Date(b.date));
  const firstHalf = sorted.slice(0, Math.ceil(sorted.length/2));
  const secondHalf = sorted.slice(Math.ceil(sorted.length/2));
  const avgDistFirst = firstHalf.reduce((a,s)=>a+(s.distance||0),0) / (firstHalf.length||1);
  const avgDistLast = secondHalf.reduce((a,s)=>a+(s.distance||0),0) / (secondHalf.length||1);
  const avgFcFirst = firstHalf.filter(s=>s.fc>0).reduce((a,s)=>a+s.fc,0) / (firstHalf.filter(s=>s.fc>0).length||1);
  const avgFcLast = secondHalf.filter(s=>s.fc>0).reduce((a,s)=>a+s.fc,0) / (secondHalf.filter(s=>s.fc>0).length||1);

  el.innerHTML = `
    <div class="page-header">
      <div class="page-title">Progrès</div>
      <div class="page-subtitle">Ton évolution en un coup d'œil</div>
    </div>

    <div class="section-title">Objectifs</div>
    <div style="padding: 0 20px 0; display:flex; flex-direction:column; gap:12px; margin-bottom:16px">
      <div class="evolution-card" style="margin:0">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="font-weight:800;font-size:14px">🗓️ Séances cette semaine</span>
          <span style="font-weight:900;font-size:14px;color:var(--accent)">${allStats.thisWeek} / ${weekGoal}</span>
        </div>
        <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${weekPct}%"></div></div>
      </div>
      <div class="evolution-card" style="margin:0">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="font-weight:800;font-size:14px">📅 Séances ce mois</span>
          <span style="font-weight:900;font-size:14px;color:var(--blue)">${allStats.thisMonth} / ${monthGoal}</span>
        </div>
        <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${monthPct}%;background:linear-gradient(90deg,var(--blue),var(--blue2))"></div></div>
      </div>
      <div class="evolution-card" style="margin:0">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="font-weight:800;font-size:14px">🗺️ Distance totale</span>
          <span style="font-weight:900;font-size:14px;color:var(--green)">${allStats.totalDist.toFixed(1)} / ${distGoal} km</span>
        </div>
        <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${distPct}%;background:linear-gradient(90deg,var(--green),var(--green2))"></div></div>
      </div>
    </div>

    <div class="section-title">Activité — 12 dernières semaines</div>
    <div class="heatmap-card">
      <div class="heatmap-grid">
        ${heatmap.map(c=>`<div class="heatmap-cell ${c}"></div>`).join('')}
      </div>
      <div style="display:flex;gap:6px;align-items:center;margin-top:10px;font-size:10px;font-weight:700;color:var(--text3)">
        <span>Moins</span>
        <div class="heatmap-cell" style="width:14px;height:14px;flex-shrink:0"></div>
        <div class="heatmap-cell l1" style="width:14px;height:14px;flex-shrink:0"></div>
        <div class="heatmap-cell l2" style="width:14px;height:14px;flex-shrink:0"></div>
        <div class="heatmap-cell l3" style="width:14px;height:14px;flex-shrink:0"></div>
        <div class="heatmap-cell l4" style="width:14px;height:14px;flex-shrink:0"></div>
        <span>Plus</span>
      </div>
    </div>

    <div class="section-title">Tendances</div>
    <div class="evolution-card">
      <h3>Première moitié vs seconde moitié</h3>
      <div class="trend-item">
        <div class="trend-icon">📏</div>
        <div class="trend-label">Distance moy./séance</div>
        <div class="trend-val ${avgDistLast>avgDistFirst?'trend-up':avgDistLast<avgDistFirst?'trend-down':'trend-neutral'}">
          ${avgDistLast.toFixed(2)} km
          <span class="trend-arrow">${avgDistLast>avgDistFirst?'↑':avgDistLast<avgDistFirst?'↓':'→'}</span>
        </div>
      </div>
      ${avgFcFirst > 0 && avgFcLast > 0 ? `
      <div class="trend-item">
        <div class="trend-icon">❤️</div>
        <div class="trend-label">FC moyenne</div>
        <div class="trend-val ${avgFcLast<avgFcFirst?'trend-up':avgFcLast>avgFcFirst?'trend-down':'trend-neutral'}">
          ${Math.round(avgFcLast)} bpm
          <span class="trend-arrow">${avgFcLast<avgFcFirst?'↓ (👍)':avgFcLast>avgFcFirst?'↑':'→'}</span>
        </div>
      </div>
      ` : ''}
      <div class="trend-item">
        <div class="trend-icon">📊</div>
        <div class="trend-label">Séances / période</div>
        <div class="trend-val ${secondHalf.length>=firstHalf.length?'trend-up':'trend-down'}">
          ${secondHalf.length} séances
          <span class="trend-arrow">${secondHalf.length>=firstHalf.length?'↑':'↓'}</span>
        </div>
      </div>
    </div>

    <div class="section-title">Évolution mensuelle</div>
    <div class="evolution-card">
      <h3>Séances par mois</h3>
      ${monthKeys.map(k => {
        const count = byM[k].length;
        const maxC = Math.max(...monthKeys.map(mk=>byM[mk].length),1);
        return `
          <div style="display:flex;align-items:center;gap:10px;padding:6px 0">
            <div style="font-size:12px;font-weight:800;color:var(--text3);width:40px;flex-shrink:0">${formatMonthShort(k)}</div>
            <div class="progress-bar-bg" style="flex:1"><div class="progress-bar-fill" style="width:${(count/maxC*100).toFixed(0)}%"></div></div>
            <div style="font-size:13px;font-weight:900;width:20px;text-align:right">${count}</div>
          </div>
        `;
      }).join('')}
    </div>

    <div class="section-title">Records personnels</div>
    <div class="evolution-card" style="margin-bottom:100px">
      <h3>Tes meilleures performances</h3>
      ${sessions.some(s=>s.distance>0) ? `
        <div class="trend-item"><div class="trend-icon">🏆</div><div class="trend-label">Distance record</div><div class="trend-val" style="color:var(--yellow)">${Math.max(...sessions.map(s=>s.distance||0)).toFixed(2)} km</div></div>
      ` : ''}
      ${sessions.some(s=>parseRythme(s.rythme_rapide)>0) ? `
        <div class="trend-item"><div class="trend-icon">⚡</div><div class="trend-label">Intervalle rapide record</div><div class="trend-val" style="color:var(--accent)">${formatRythme(Math.min(...sessions.filter(s=>parseRythme(s.rythme_rapide)>0).map(s=>parseRythme(s.rythme_rapide))))}/km</div></div>
      ` : ''}
      ${sessions.some(s=>s.kcal>0) ? `
        <div class="trend-item"><div class="trend-icon">🔥</div><div class="trend-label">Record kcal/séance</div><div class="trend-val" style="color:var(--orange)">${Math.max(...sessions.filter(s=>s.kcal>0).map(s=>s.kcal))} kcal</div></div>
      ` : ''}
      <div class="trend-item"><div class="trend-icon">🔥</div><div class="trend-label">Streak maximum</div><div class="trend-val" style="color:var(--green)">${allStats.maxStreak} j.</div></div>
    </div>
  `;
}

function buildHeatmap(sessions) {
  const cells = [];
  const today = new Date();
  // 12 semaines = 84 jours
  const dateMap = {};
  sessions.forEach(s => { dateMap[s.date] = (dateMap[s.date]||0)+1; });

  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().substring(0,10);
    const count = dateMap[key] || 0;
    if (count === 0) cells.push('');
    else if (count === 1) cells.push('l2');
    else if (count === 2) cells.push('l3');
    else cells.push('l4');
  }
  return cells;
}

// =============================================
// TROPHÉES
// =============================================
function renderTrophees() {
  const sessions = DB.getSessions();
  const unlockedIds = checkTrophees(sessions);
  saveTrophees(unlockedIds);

  // Detect new unlocks
  const newUnlocks = unlockedIds.filter(id => !previousUnlocked.includes(id));
  if (newUnlocks.length > 0) {
    previousUnlocked = unlockedIds;
    setTimeout(() => showTrophyNotif(newUnlocks[0]), 500);
  }

  const total = TROPHEES.length;
  const unlocked = unlockedIds.length;
  const pct = Math.round((unlocked/total)*100);

  const el = document.getElementById('screen-trophees');
  el.innerHTML = `
    <div class="page-header">
      <div class="page-title">Trophées</div>
      <div class="page-subtitle">${unlocked} / ${total} débloqués · ${pct}%</div>
    </div>

    <div style="padding:0 20px">
      <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${pct}%;background:linear-gradient(90deg,var(--yellow),#ffb700)"></div></div>
    </div>

    <div class="trophy-header-stats">
      <div class="trophy-stat-pill"><div class="val">${unlocked}</div><div class="lbl">Débloqués</div></div>
      <div class="trophy-stat-pill"><div class="val" style="color:var(--text3)">${total-unlocked}</div><div class="lbl">Restants</div></div>
      <div class="trophy-stat-pill"><div class="val" style="color:var(--green)">${pct}%</div><div class="lbl">Complétion</div></div>
    </div>

    <div class="trophy-category-tabs" id="trophy-tabs">
      ${TROPHY_CATEGORIES.map(c=>`
        <button class="tab-btn ${currentTrophyTab===c.id?'active':''}" onclick="switchTrophyTab('${c.id}')">
          ${c.label}
        </button>
      `).join('')}
    </div>

    <div class="trophy-grid" id="trophy-grid"></div>
  `;

  renderTrophyGrid(unlockedIds);
}

function switchTrophyTab(cat) {
  currentTrophyTab = cat;
  document.querySelectorAll('#trophy-tabs .tab-btn').forEach(b => {
    const catObj = TROPHY_CATEGORIES.find(c => b.textContent.trim() === c.label);
    if (catObj) b.classList.toggle('active', catObj.id === cat);
  });
  const sessions = DB.getSessions();
  const unlockedIds = checkTrophees(sessions);
  renderTrophyGrid(unlockedIds);
}

function renderTrophyGrid(unlockedIds) {
  const grid = document.getElementById('trophy-grid');
  if (!grid) return;
  const filtered = currentTrophyTab === 'all' ? TROPHEES : TROPHEES.filter(t => t.cat === currentTrophyTab);

  // Sort: unlocked first
  const sorted = [...filtered].sort((a,b) => {
    const au = unlockedIds.includes(a.id);
    const bu = unlockedIds.includes(b.id);
    return bu - au;
  });

  grid.innerHTML = sorted.map(t => {
    const isUnlocked = unlockedIds.includes(t.id);
    return `
      <div class="trophy-item ${isUnlocked?'unlocked':'locked'}" onclick="showTrophyModal('${t.id}',${isUnlocked})">
        ${!isUnlocked ? '<div class="trophy-locked-icon">🔒</div>' : ''}
        <span class="trophy-emoji">${t.emoji}</span>
        <div class="trophy-name">${t.nom}</div>
      </div>
    `;
  }).join('');
}

function showTrophyModal(id, isUnlocked) {
  const t = getTropheeById(id);
  if (!t) return;
  const overlay = document.getElementById('modal-trophy');
  overlay.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-handle"></div>
      <div class="trophy-modal-content">
        <span class="trophy-modal-emoji" style="${!isUnlocked?'filter:grayscale(1);opacity:.4':'animation:tropop .5s cubic-bezier(.34,1.56,.64,1)'}">${t.emoji}</span>
        <div class="trophy-modal-name">${t.nom}</div>
        <div class="trophy-modal-desc">${t.desc}</div>
        ${isUnlocked
          ? '<span class="pill pill-green">✅ Débloqué !</span>'
          : '<span class="pill" style="background:rgba(255,255,255,.05);color:var(--text3)">🔒 Pas encore débloqué</span>'
        }
        <div style="margin-top:24px">
          <button class="btn btn-secondary btn-full" onclick="closeModal(\'modal-trophy\')">Fermer</button>
        </div>
      </div>
    </div>
  `;
  overlay.classList.remove('hidden');
  overlay.addEventListener('click', e => { if(e.target===overlay) closeModal('modal-trophy'); }, {once:true});
}

function showTrophyNotif(id) {
  const t = getTropheeById(id);
  if (!t) return;
  // Temporary toast
  const toast = document.createElement('div');
  toast.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:999;background:#1e1e2e;border:1px solid rgba(255,214,10,.3);border-radius:16px;padding:12px 20px;display:flex;align-items:center;gap:10px;box-shadow:0 8px 32px rgba(0,0,0,.5);animation:fadeIn .3s ease;font-family:var(--font)`;
  toast.innerHTML = `<span style="font-size:24px">${t.emoji}</span><div><div style="font-size:13px;font-weight:900;color:#ffd60a">Trophée débloqué !</div><div style="font-size:12px;font-weight:700;color:rgba(255,255,255,.7)">${t.nom}</div></div>`;
  document.getElementById('app').appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// =============================================
// MODAL AJOUT
// =============================================
function openModalAjout() {
  const today = new Date().toISOString().substring(0,10);
  const overlay = document.getElementById('modal-ajout');
  overlay.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-handle"></div>
      <div class="modal-title">Nouvelle séance</div>
      <div style="padding:4px 20px;margin-top:4px">
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <span class="interval-badge">⏱️ 3' rapide / 3' normale</span>
          <span class="interval-badge">🕐 30 minutes</span>
          <span class="interval-badge">⚡ 5 intervalles rapides</span>
        </div>
      </div>

      <div class="form-group">
        <div class="form-label">Date *</div>
        <input class="form-input" type="date" id="f-date" value="${today}" />
      </div>

      <div class="form-group">
        <div class="form-label">Lieu</div>
        <input class="form-input" type="text" id="f-lieu" placeholder="Parc, forêt, bord de mer..." />
      </div>

      <div class="form-row">
        <div>
          <div class="form-label">Distance (km)</div>
          <input class="form-input" type="number" id="f-distance" placeholder="2.50" step="0.01" min="0" />
        </div>
        <div>
          <div class="form-label">Durée (min)</div>
          <input class="form-input" type="number" id="f-duree" value="30" min="1" />
        </div>
      </div>

      <div class="form-group">
        <div class="form-label">Météo</div>
        <input class="form-input" type="text" id="f-meteo" placeholder="Ensoleillé, nuageux, pluie..." />
      </div>

      <div class="form-row">
        <div>
          <div class="form-label">FC moyenne (bpm)</div>
          <input class="form-input" type="number" id="f-fc" placeholder="135" min="50" max="220" />
        </div>
        <div>
          <div class="form-label">Calories (kcal)</div>
          <input class="form-input" type="number" id="f-kcal" placeholder="180" min="0" />
        </div>
      </div>

      <div class="form-group">
        <div class="form-label">Rythme moyen (min'sec''/km)</div>
        <input class="form-input" type="text" id="f-rythme" placeholder="9'30''" />
      </div>

      <div class="form-row">
        <div>
          <div class="form-label">⚡ Intervalle rapide</div>
          <input class="form-input" type="text" id="f-rapide" placeholder="8'15''" />
        </div>
        <div>
          <div class="form-label">🐢 Intervalle lent</div>
          <input class="form-input" type="text" id="f-lent" placeholder="11'20''" />
        </div>
      </div>

      <div class="form-group">
        <div class="form-label">Commentaires</div>
        <textarea class="form-textarea" id="f-commentaires" placeholder="Ressenti, conditions, notes..."></textarea>
      </div>

      <div class="modal-actions">
        <button class="btn btn-primary btn-full" onclick="saveSession()">Enregistrer la séance</button>
        <button class="btn btn-secondary btn-full" onclick="closeModal('modal-ajout')">Annuler</button>
      </div>
    </div>
  `;
  overlay.classList.remove('hidden');
  overlay.addEventListener('click', e => { if(e.target===overlay) closeModal('modal-ajout'); }, {once:true});
}

function saveSession() {
  const date = document.getElementById('f-date').value;
  if (!date) { alert('La date est obligatoire.'); return; }
  const session = {
    date,
    lieu: document.getElementById('f-lieu').value.trim(),
    distance: parseFloat(document.getElementById('f-distance').value) || 0,
    duree: parseInt(document.getElementById('f-duree').value) || 30,
    meteo: document.getElementById('f-meteo').value.trim(),
    fc: parseInt(document.getElementById('f-fc').value) || 0,
    kcal: parseInt(document.getElementById('f-kcal').value) || 0,
    rythme: document.getElementById('f-rythme').value.trim(),
    rythme_rapide: document.getElementById('f-rapide').value.trim(),
    rythme_lent: document.getElementById('f-lent').value.trim(),
    commentaires: document.getElementById('f-commentaires').value.trim()
  };
  DB.addSession(session);
  closeModal('modal-ajout');
  navigateTo('accueil');

  // Check new trophies
  const sessions = DB.getSessions();
  const newUnlocked = checkTrophees(sessions);
  const fresh = newUnlocked.filter(id => !previousUnlocked.includes(id));
  if (fresh.length > 0) {
    previousUnlocked = newUnlocked;
    setTimeout(() => showTrophyNotif(fresh[0]), 600);
  }
}

// =============================================
// MODAL IMPORT CSV
// =============================================
function openModalImport() {
  const overlay = document.getElementById('modal-import');
  overlay.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-handle"></div>
      <div class="modal-title">Importer depuis Google Sheets</div>

      <div style="padding:16px 20px">
        <div class="tip-card" style="margin:0">
          <div class="tip-icon">📋</div>
          <div class="tip-text">
            <h4>Format attendu (CSV)</h4>
            <p>Dans Google Sheets → Fichier → Télécharger → CSV.<br><br>
            Colonnes supportées :<br>
            <strong>date, lieu, distance, météo, durée, fréquence cardiaque moyenne, rythme moyen, rythme de l'intervalle le plus rapide, rythme de l'intervalle le plus lent, kilocalories totales, commentaires</strong>
            </p>
          </div>
        </div>
      </div>

      <div class="form-group">
        <div class="form-label">Fichier CSV</div>
        <input class="form-input" type="file" id="f-csv" accept=".csv,text/csv" style="padding:10px" />
      </div>

      <div id="import-preview" style="padding:0 20px;display:none">
        <div style="background:var(--card);border-radius:10px;padding:14px;margin-top:8px">
          <div id="import-preview-text" style="font-size:13px;font-weight:700;color:var(--text2)"></div>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn btn-primary btn-full" onclick="importCSV()">Importer</button>
        <button class="btn btn-secondary btn-full" onclick="closeModal('modal-import')">Annuler</button>
      </div>
    </div>
  `;
  overlay.classList.remove('hidden');
  overlay.addEventListener('click', e => { if(e.target===overlay) closeModal('modal-import'); }, {once:true});

  // Preview on file select
  document.getElementById('f-csv').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const sessions = parseCSV(ev.target.result);
      const preview = document.getElementById('import-preview');
      const previewText = document.getElementById('import-preview-text');
      preview.style.display = 'block';
      if (sessions.length === 0) {
        previewText.innerHTML = '<span style="color:var(--pink)">⚠️ Aucune ligne valide trouvée. Vérifie le format CSV.</span>';
      } else {
        previewText.innerHTML = `✅ <strong style="color:var(--green)">${sessions.length} séance${sessions.length>1?'s':''}</strong> détectée${sessions.length>1?'s':''}.<br>
          Première entrée : <strong>${sessions[0].date}</strong> — ${sessions[0].lieu || '(lieu vide)'} — ${sessions[0].distance || '?'} km`;
      }
    };
    reader.readAsText(file, 'UTF-8');
  });
}

function importCSV() {
  const fileInput = document.getElementById('f-csv');
  if (!fileInput || !fileInput.files.length) { alert('Sélectionne un fichier CSV.'); return; }
  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = ev => {
    const sessions = parseCSV(ev.target.result);
    if (sessions.length === 0) { alert('Aucune séance valide trouvée dans le fichier.'); return; }
    const total = DB.importSessions(sessions);
    closeModal('modal-import');
    navigateTo('accueil');

    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:999;background:#1e1e2e;border:1px solid rgba(48,209,88,.3);border-radius:16px;padding:12px 20px;display:flex;align-items:center;gap:10px;box-shadow:0 8px 32px rgba(0,0,0,.5);font-family:var(--font)`;
    toast.innerHTML = `<span style="font-size:24px">✅</span><div style="font-size:14px;font-weight:800;color:var(--green)">${sessions.length} séance${sessions.length>1?'s':''} importée${sessions.length>1?'s':''} !</div>`;
    document.getElementById('app').appendChild(toast);
    setTimeout(() => toast.remove(), 3000);

    // Check trophies
    const all = DB.getSessions();
    const newUnlocked = checkTrophees(all);
    const fresh = newUnlocked.filter(id => !previousUnlocked.includes(id));
    if (fresh.length > 0) {
      previousUnlocked = newUnlocked;
      setTimeout(() => showTrophyNotif(fresh[0]), 800);
    }
  };
  reader.readAsText(file, 'UTF-8');
}

// =============================================
// HELPERS
// =============================================
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' });
}

function formatMonthShort(yearMonth) {
  const [y, m] = yearMonth.split('-');
  const months = ['Jan','Fév','Mar','Avr','Mai','Jui','Jul','Aoû','Sep','Oct','Nov','Déc'];
  return months[parseInt(m)-1];
}

// =============================================
// INIT
// =============================================
function init() {
  renderAccueil();
}

init();
