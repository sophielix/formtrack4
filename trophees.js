/* =============================================
   TROPHEES.JS — 150 trophées marche japonaise
   ============================================= */

const TROPHEES = [
  // ── PREMIÈRES FOIS (15) ──────────────────────
  { id:'t001', cat:'debuts', emoji:'🌅', nom:'Premier Pas', desc:'Complète ta toute première séance de marche japonaise.', condition: s => s.length >= 1 },
  { id:'t002', cat:'debuts', emoji:'🗓️', nom:'3 Jours !', desc:'3 séances de marche japonaise complétées.', condition: s => s.length >= 3 },
  { id:'t003', cat:'debuts', emoji:'🌟', nom:'Une semaine de guerrière', desc:'7 séances au total.', condition: s => s.length >= 7 },
  { id:'t004', cat:'debuts', emoji:'🎽', nom:'Rituel installé', desc:'10 séances complétées. La marche japonaise fait partie de ta vie.', condition: s => s.length >= 10 },
  { id:'t005', cat:'debuts', emoji:'🎯', nom:'Cap des 20', desc:'20 séances — tu es officielle.', condition: s => s.length >= 20 },
  { id:'t006', cat:'debuts', emoji:'🌙', nom:'Premier km', desc:'Distance totale : 1 km parcouru.', condition: s => s.reduce((a,x)=>a+(x.distance||0),0) >= 1 },
  { id:'t007', cat:'debuts', emoji:'🔥', nom:'Première sueur', desc:'Ta première séance avec une FC enregistrée.', condition: s => s.some(x => x.fc > 0) },
  { id:'t008', cat:'debuts', emoji:'📝', nom:'Chroniqueuse', desc:'Ajoute un commentaire dans une séance.', condition: s => s.some(x => x.commentaires && x.commentaires.length > 2) },
  { id:'t009', cat:'debuts', emoji:'🗺️', nom:'Exploratrice', desc:'Enregistre un premier lieu de marche.', condition: s => s.some(x => x.lieu && x.lieu.length > 1) },
  { id:'t010', cat:'debuts', emoji:'🌤️', nom:'Météo consciente', desc:'Enregistre la météo d\'une séance.', condition: s => s.some(x => x.meteo && x.meteo.length > 1) },
  { id:'t011', cat:'debuts', emoji:'⚡', nom:'Interval Queen', desc:'Complète 10 intervalles rapides (1 séance = 5 intervalles rapides).', condition: s => s.length >= 2 },
  { id:'t012', cat:'debuts', emoji:'🦋', nom:'Métamorphose', desc:'30 séances — la transformation commence.', condition: s => s.length >= 30 },
  { id:'t013', cat:'debuts', emoji:'💎', nom:'50 séances', desc:'50 séances de marche japonaise. Impressionnant !', condition: s => s.length >= 50 },
  { id:'t014', cat:'debuts', emoji:'👑', nom:'Centenaire', desc:'100 séances. Tu es une légende vivante.', condition: s => s.length >= 100 },
  { id:'t015', cat:'debuts', emoji:'🏯', nom:'Maître Sensei', desc:'200 séances. La marche japonaise coule dans tes veines.', condition: s => s.length >= 200 },

  // ── RÉGULARITÉ / STREAK (20) ─────────────────
  { id:'t016', cat:'regularite', emoji:'🔄', nom:'2 jours d\'affilée', desc:'2 séances consécutives.', condition: (s,stats) => stats.maxStreak >= 2 },
  { id:'t017', cat:'regularite', emoji:'📅', nom:'3 jours de suite', desc:'3 jours consécutifs de marche japonaise.', condition: (s,stats) => stats.maxStreak >= 3 },
  { id:'t018', cat:'regularite', emoji:'🗓️', nom:'5 jours non-stop', desc:'5 jours de suite. La régularité, c\'est la clé !', condition: (s,stats) => stats.maxStreak >= 5 },
  { id:'t019', cat:'regularite', emoji:'🏅', nom:'Semaine parfaite', desc:'7 jours d\'affilée sans interruption.', condition: (s,stats) => stats.maxStreak >= 7 },
  { id:'t020', cat:'regularite', emoji:'💪', nom:'10 jours de feu', desc:'10 jours consécutifs.', condition: (s,stats) => stats.maxStreak >= 10 },
  { id:'t021', cat:'regularite', emoji:'🌊', nom:'Flux continu', desc:'14 jours sans manquer une séance.', condition: (s,stats) => stats.maxStreak >= 14 },
  { id:'t022', cat:'regularite', emoji:'🏔️', nom:'3 semaines de roc', desc:'21 jours d\'affilée.', condition: (s,stats) => stats.maxStreak >= 21 },
  { id:'t023', cat:'regularite', emoji:'🗻', nom:'1 mois sans faille', desc:'30 jours consécutifs — un mois entier !', condition: (s,stats) => stats.maxStreak >= 30 },
  { id:'t024', cat:'regularite', emoji:'🌸', nom:'Marche de printemps', desc:'Au moins 3 séances dans la semaine pendant 4 semaines.', condition: s => { const byW = getSessionsByWeek(s); return Object.values(byW).filter(w => w.length >= 3).length >= 4; } },
  { id:'t025', cat:'regularite', emoji:'☀️', nom:'Juillet actif', desc:'Au moins une séance chaque semaine pendant 2 mois.', condition: s => { const byW = getSessionsByWeek(s); return Object.values(byW).filter(w => w.length >= 1).length >= 8; } },
  { id:'t026', cat:'regularite', emoji:'📆', nom:'Mois complet', desc:'Au moins 20 séances en un seul mois.', condition: s => { const byM = getSessionsByMonth(s); return Object.values(byM).some(m => m.length >= 20); } },
  { id:'t027', cat:'regularite', emoji:'🎄', nom:'Toute l\'année', desc:'Des séances dans chacun des 12 mois de l\'année.', condition: s => { const months = new Set(s.map(x => x.date.substring(0,7).substring(5,7))); return months.size >= 12; } },
  { id:'t028', cat:'regularite', emoji:'🌞', nom:'Lève-tôt', desc:'3 séances enregistrées un lundi matin (date d\'un lundi).', condition: s => s.filter(x => new Date(x.date).getDay() === 1).length >= 3 },
  { id:'t029', cat:'regularite', emoji:'🌙', nom:'Endurance douce', desc:'5 séances le week-end.', condition: s => s.filter(x => [0,6].includes(new Date(x.date).getDay())).length >= 5 },
  { id:'t030', cat:'regularite', emoji:'🎯', nom:'3 fois par semaine', desc:'3 séances en une même semaine.', condition: s => { const byW = getSessionsByWeek(s); return Object.values(byW).some(w => w.length >= 3); } },
  { id:'t031', cat:'regularite', emoji:'🔥', nom:'5 fois par semaine', desc:'5 séances en une même semaine. Mode intensif !', condition: s => { const byW = getSessionsByWeek(s); return Object.values(byW).some(w => w.length >= 5); } },
  { id:'t032', cat:'regularite', emoji:'💫', nom:'4 semaines consécutives', desc:'Au moins 1 séance chaque semaine pendant 4 semaines de suite.', condition: s => { const byW = getSessionsByWeek(s); const keys = Object.keys(byW).sort(); let streak=0,max=0; keys.forEach(k => { if(byW[k].length>=1){streak++;if(streak>max)max=streak;}else{streak=0;} }); return max >= 4; } },
  { id:'t033', cat:'regularite', emoji:'⭐', nom:'Constance de novembre', desc:'Au moins 15 séances en novembre (mois difficile pour la motivation).', condition: s => s.filter(x => x.date.substring(5,7) === '11').length >= 15 },
  { id:'t034', cat:'regularite', emoji:'🧊', nom:'Marcheuse hivernale', desc:'5 séances en décembre ou janvier.', condition: s => s.filter(x => ['12','01'].includes(x.date.substring(5,7))).length >= 5 },
  { id:'t035', cat:'regularite', emoji:'🌺', nom:'Rituel du matin', desc:'10 séances un lundi ou vendredi (début/fin de semaine).', condition: s => s.filter(x => [1,5].includes(new Date(x.date).getDay())).length >= 10 },

  // ── DISTANCE (20) ────────────────────────────
  { id:'t036', cat:'distance', emoji:'📏', nom:'5 km totaux', desc:'5 km parcourus en tout depuis le début.', condition: s => s.reduce((a,x)=>a+(x.distance||0),0) >= 5 },
  { id:'t037', cat:'distance', emoji:'🚶', nom:'10 km au compteur', desc:'10 km parcourus au total.', condition: s => s.reduce((a,x)=>a+(x.distance||0),0) >= 10 },
  { id:'t038', cat:'distance', emoji:'🗼', nom:'Tour Eiffel ×10', desc:'30 km — comme 10 allers-retours au sommet de la Tour Eiffel (vu comme ça c\'est impressionnant).', condition: s => s.reduce((a,x)=>a+(x.distance||0),0) >= 30 },
  { id:'t039', cat:'distance', emoji:'🏙️', nom:'50 km', desc:'50 km parcourus. Paris-Versailles en marche japonaise !', condition: s => s.reduce((a,x)=>a+(x.distance||0),0) >= 50 },
  { id:'t040', cat:'distance', emoji:'🇫🇷', nom:'100 km', desc:'100 km ! Paris-Chartres et retour.', condition: s => s.reduce((a,x)=>a+(x.distance||0),0) >= 100 },
  { id:'t041', cat:'distance', emoji:'🌍', nom:'200 km', desc:'200 km parcourus. Paris-Lyon... presque.', condition: s => s.reduce((a,x)=>a+(x.distance||0),0) >= 200 },
  { id:'t042', cat:'distance', emoji:'🗺️', nom:'500 km', desc:'500 km — Santiago de Compostela t\'attend.', condition: s => s.reduce((a,x)=>a+(x.distance||0),0) >= 500 },
  { id:'t043', cat:'distance', emoji:'🌏', nom:'1000 km', desc:'1 000 km ! Paris-Madrid... à pied.', condition: s => s.reduce((a,x)=>a+(x.distance||0),0) >= 1000 },
  { id:'t044', cat:'distance', emoji:'🥇', nom:'3 km en une séance', desc:'Dépasse 3 km lors d\'une seule séance.', condition: s => s.some(x => (x.distance||0) >= 3) },
  { id:'t045', cat:'distance', emoji:'🏆', nom:'4 km en une séance', desc:'4 km en 30 minutes — performance de haut niveau !', condition: s => s.some(x => (x.distance||0) >= 4) },
  { id:'t046', cat:'distance', emoji:'💨', nom:'Semaine à 20 km', desc:'20 km parcourus en une seule semaine.', condition: s => { const byW = getSessionsByWeek(s); return Object.values(byW).some(w => w.reduce((a,x)=>a+(x.distance||0),0) >= 20); } },
  { id:'t047', cat:'distance', emoji:'📊', nom:'Mois à 50 km', desc:'50 km parcourus dans un seul mois.', condition: s => { const byM = getSessionsByMonth(s); return Object.values(byM).some(m => m.reduce((a,x)=>a+(x.distance||0),0) >= 50); } },
  { id:'t048', cat:'distance', emoji:'🎽', nom:'Toujours plus loin', desc:'3 séances consécutives avec distances croissantes.', condition: s => { const sorted = [...s].sort((a,b)=>new Date(a.date)-new Date(b.date)); for(let i=2;i<sorted.length;i++){if((sorted[i].distance||0)>(sorted[i-1].distance||0)&&(sorted[i-1].distance||0)>(sorted[i-2].distance||0))return true;} return false; } },
  { id:'t049', cat:'distance', emoji:'🌟', nom:'Régularité kilométrique', desc:'10 séances avec au moins 2 km chacune.', condition: s => s.filter(x => (x.distance||0) >= 2).length >= 10 },
  { id:'t050', cat:'distance', emoji:'⚡', nom:'Constance kilométrique', desc:'5 séances avec entre 2.5 et 3.5 km (interval régulier).', condition: s => s.filter(x => (x.distance||0) >= 2.5 && (x.distance||0) <= 3.5).length >= 5 },
  { id:'t051', cat:'distance', emoji:'🎯', nom:'2.5 km session', desc:'Atteins 2,5 km lors d\'une séance.', condition: s => s.some(x => (x.distance||0) >= 2.5) },
  { id:'t052', cat:'distance', emoji:'🔵', nom:'Toujours debout', desc:'150 km cumulés.', condition: s => s.reduce((a,x)=>a+(x.distance||0),0) >= 150 },
  { id:'t053', cat:'distance', emoji:'🟠', nom:'250 km cumulés', desc:'250 km parcourus depuis le début.', condition: s => s.reduce((a,x)=>a+(x.distance||0),0) >= 250 },
  { id:'t054', cat:'distance', emoji:'🟣', nom:'750 km', desc:'750 km — équivalent de Paris à Berlin.', condition: s => s.reduce((a,x)=>a+(x.distance||0),0) >= 750 },
  { id:'t055', cat:'distance', emoji:'🌈', nom:'Surpasse-toi', desc:'Bats ton record de distance en une séance.', condition: s => { if(s.length < 2) return false; const sorted=[...s].sort((a,b)=>new Date(a.date)-new Date(b.date)); const maxSoFar=[]; let mx=0; for(const x of sorted){if((x.distance||0)>mx){if(mx>0)return true;mx=x.distance||0;}} return false; } },

  // ── RYTHME / VITESSE (15) ────────────────────
  { id:'t056', cat:'rythme', emoji:'⚡', nom:'Interval rapide', desc:'Enregistre un rythme d\'intervalle rapide.', condition: s => s.some(x => x.rythme_rapide && x.rythme_rapide.length > 0) },
  { id:'t057', cat:'rythme', emoji:'🐆', nom:'Sprint des intervalles', desc:'Un intervalle rapide sous 8\'00\'/km.', condition: s => s.some(x => parseRythme(x.rythme_rapide) > 0 && parseRythme(x.rythme_rapide) < 8) },
  { id:'t058', cat:'rythme', emoji:'🦅', nom:'Intervalle sous 7\'', desc:'Un intervalle rapide sous 7\'00\'/km — tu voles !', condition: s => s.some(x => parseRythme(x.rythme_rapide) > 0 && parseRythme(x.rythme_rapide) < 7) },
  { id:'t059', cat:'rythme', emoji:'🏎️', nom:'Fusée', desc:'Un intervalle rapide sous 6\'30\'/km.', condition: s => s.some(x => parseRythme(x.rythme_rapide) > 0 && parseRythme(x.rythme_rapide) < 6.5) },
  { id:'t060', cat:'rythme', emoji:'🎯', nom:'Rythme moyen stable', desc:'5 séances avec un rythme moyen entre 7\' et 9\'/km.', condition: s => s.filter(x => { const r=parseRythme(x.rythme); return r>=7&&r<=9; }).length >= 5 },
  { id:'t061', cat:'rythme', emoji:'📈', nom:'Progression rythme', desc:'Améliore ton rythme moyen sur 5 séances consécutives.', condition: s => { const sorted=[...s].filter(x=>parseRythme(x.rythme)>0).sort((a,b)=>new Date(a.date)-new Date(b.date)); for(let i=4;i<sorted.length;i++){const chunk=sorted.slice(i-4,i+1).map(x=>parseRythme(x.rythme));const improving=chunk.every((v,j)=>j===0||v<chunk[j-1]);if(improving)return true;} return false; } },
  { id:'t062', cat:'rythme', emoji:'🌊', nom:'Écart interval maîtrisé', desc:'Séance avec moins de 2\'/km d\'écart entre rapide et lent.', condition: s => s.some(x => { const r=parseRythme(x.rythme_rapide); const l=parseRythme(x.rythme_lent); return r>0&&l>0&&(l-r)<2; }) },
  { id:'t063', cat:'rythme', emoji:'🎵', nom:'Rythme en musique', desc:'10 séances avec un rythme enregistré.', condition: s => s.filter(x => parseRythme(x.rythme)>0).length >= 10 },
  { id:'t064', cat:'rythme', emoji:'🐢', nom:'Récupération active', desc:'Un intervalle lent au-dessus de 12\'/km (vraie récup !).', condition: s => s.some(x => parseRythme(x.rythme_lent) > 12) },
  { id:'t065', cat:'rythme', emoji:'⚖️', nom:'Équilibre parfait', desc:'5 séances avec un rythme moyen régulier (±30sec entre elles).', condition: s => { const rythmes=s.filter(x=>parseRythme(x.rythme)>0).map(x=>parseRythme(x.rythme)); if(rythmes.length<5)return false; for(let i=0;i<rythmes.length-4;i++){const chunk=rythmes.slice(i,i+5);const avg=chunk.reduce((a,b)=>a+b,0)/5;if(chunk.every(r=>Math.abs(r-avg)<0.5))return true;} return false; } },
  { id:'t066', cat:'rythme', emoji:'🏃', nom:'Allure de compétition', desc:'Rythme moyen sous 8\'/km sur une séance.', condition: s => s.some(x => parseRythme(x.rythme) > 0 && parseRythme(x.rythme) < 8) },
  { id:'t067', cat:'rythme', emoji:'💨', nom:'Vent dans le dos', desc:'Meilleur rythme global amélioré 3 fois de suite.', condition: s => { const sorted=[...s].filter(x=>parseRythme(x.rythme)>0).sort((a,b)=>new Date(a.date)-new Date(b.date)); let best=Infinity,count=0; for(const x of sorted){const r=parseRythme(x.rythme);if(r<best){best=r;count++;}else{count=0;} if(count>=3)return true;} return false; } },
  { id:'t068', cat:'rythme', emoji:'🎯', nom:'Rythme cible', desc:'Rythme moyen entre 8\' et 10\'/km pendant 10 séances.', condition: s => s.filter(x=>{const r=parseRythme(x.rythme);return r>=8&&r<=10;}).length>=10 },
  { id:'t069', cat:'rythme', emoji:'🌟', nom:'Maîtrise des intervalles', desc:'20 séances avec rythme rapide et lent tous deux enregistrés.', condition: s => s.filter(x=>parseRythme(x.rythme_rapide)>0&&parseRythme(x.rythme_lent)>0).length>=20 },
  { id:'t070', cat:'rythme', emoji:'👟', nom:'Régulière comme une horloge', desc:'3 séances avec exactement le même rythme moyen (±15sec).', condition: s => { const rythmes=s.filter(x=>parseRythme(x.rythme)>0).map(x=>parseRythme(x.rythme)); for(let i=0;i<rythmes.length;i++){for(let j=i+1;j<rythmes.length;j++){for(let k=j+1;k<rythmes.length;k++){if(Math.abs(rythmes[i]-rythmes[j])<0.25&&Math.abs(rythmes[j]-rythmes[k])<0.25)return true;}}}return false; } },

  // ── FRÉQUENCE CARDIAQUE (15) ─────────────────
  { id:'t071', cat:'coeur', emoji:'❤️', nom:'Cardio tracké', desc:'5 séances avec FC enregistrée.', condition: s => s.filter(x=>x.fc>0).length>=5 },
  { id:'t072', cat:'coeur', emoji:'💓', nom:'Zone cardio', desc:'Séance avec FC moyenne entre 120 et 150 bpm (zone aérobie idéale).', condition: s => s.some(x=>x.fc>=120&&x.fc<=150) },
  { id:'t073', cat:'coeur', emoji:'💗', nom:'Cardio efficace', desc:'10 séances avec FC dans la zone 110-160 bpm.', condition: s => s.filter(x=>x.fc>=110&&x.fc<=160).length>=10 },
  { id:'t074', cat:'coeur', emoji:'🫀', nom:'Cœur vaillant', desc:'20 séances avec FC enregistrée.', condition: s => s.filter(x=>x.fc>0).length>=20 },
  { id:'t075', cat:'coeur', emoji:'📉', nom:'FC en baisse', desc:'Ta FC moyenne diminue sur 5 séances (signe d\'adaptation cardiovasculaire).', condition: s => { const withFc=[...s].filter(x=>x.fc>0).sort((a,b)=>new Date(a.date)-new Date(b.date)); for(let i=4;i<withFc.length;i++){const chunk=withFc.slice(i-4,i+1).map(x=>x.fc);if(chunk.every((v,j)=>j===0||v<chunk[j-1]))return true;} return false; } },
  { id:'t076', cat:'coeur', emoji:'🏥', nom:'Zone brûle-graisse', desc:'Séance avec FC entre 60% et 70% de FCmax (zone lipides ~108-126 bpm pour 180 FCmax).', condition: s => s.some(x=>x.fc>=105&&x.fc<=130) },
  { id:'t077', cat:'coeur', emoji:'💪', nom:'Effort intense', desc:'FC moyenne au-dessus de 150 bpm lors d\'une séance.', condition: s => s.some(x=>x.fc>=150) },
  { id:'t078', cat:'coeur', emoji:'🧘', nom:'Récupération rapide', desc:'FC basse (< 115 bpm) maintenue sur 3 séances légères.', condition: s => s.filter(x=>x.fc>0&&x.fc<115).length>=3 },
  { id:'t079', cat:'coeur', emoji:'📊', nom:'Cardio constant', desc:'5 séances avec FC dans un écart de 10 bpm.', condition: s => { const fcs=s.filter(x=>x.fc>0).map(x=>x.fc); if(fcs.length<5)return false; for(let i=0;i<=fcs.length-5;i++){const chunk=fcs.slice(i,i+5);if(Math.max(...chunk)-Math.min(...chunk)<=10)return true;} return false; } },
  { id:'t080', cat:'coeur', emoji:'🎯', nom:'30 séances cardio', desc:'30 séances avec FC enregistrée.', condition: s => s.filter(x=>x.fc>0).length>=30 },
  { id:'t081', cat:'coeur', emoji:'❤️‍🔥', nom:'Cœur de championne', desc:'50 séances avec FC enregistrée.', condition: s => s.filter(x=>x.fc>0).length>=50 },
  { id:'t082', cat:'coeur', emoji:'🩺', nom:'Adaptation cardiaque', desc:'FC moyenne globale diminuée de 5 bpm sur les 10 dernières vs 10 premières séances.', condition: s => { const withFc=[...s].filter(x=>x.fc>0).sort((a,b)=>new Date(a.date)-new Date(b.date)); if(withFc.length<20)return false; const first10=withFc.slice(0,10).map(x=>x.fc); const last10=withFc.slice(-10).map(x=>x.fc); const avg1=first10.reduce((a,b)=>a+b,0)/10; const avg2=last10.reduce((a,b)=>a+b,0)/10; return avg2<=avg1-5; } },
  { id:'t083', cat:'coeur', emoji:'💝', nom:'Cœur fidèle', desc:'FC enregistrée pendant 3 mois consécutifs.', condition: s => { const withFc=s.filter(x=>x.fc>0); const months=new Set(withFc.map(x=>x.date.substring(0,7))); const mArr=[...months].sort(); for(let i=1;i<mArr.length;i++){const prev=new Date(mArr[i-1]+'-01');const curr=new Date(mArr[i]+'-01');const diff=(curr-prev)/2.628e9;if(diff>1.1)return false;} return mArr.length>=3; } },
  { id:'t084', cat:'coeur', emoji:'🌡️', nom:'Séance chaude', desc:'Séance par temps chaud avec FC > 140 bpm (la chaleur augmente l\'effort cardiaque).', condition: s => s.some(x=>x.fc>140&&(x.meteo||'').toLowerCase().match(/chaud|soleil|chaleur/)) },
  { id:'t085', cat:'coeur', emoji:'🥶', nom:'Cœur de glace', desc:'Séance par temps froid avec FC enregistrée.', condition: s => s.some(x=>x.fc>0&&(x.meteo||'').toLowerCase().match(/froid|frais|neige|hiver/)) },

  // ── CALORIES (10) ────────────────────────────
  { id:'t086', cat:'calories', emoji:'🔥', nom:'100 kcal brûlées', desc:'100 kcal dépensées en une séance.', condition: s => s.some(x=>(x.kcal||0)>=100) },
  { id:'t087', cat:'calories', emoji:'🍕', nom:'Pizza brûlée', desc:'1000 kcal cumulées (environ 2.5 parts de pizza !).', condition: s => s.reduce((a,x)=>a+(x.kcal||0),0)>=1000 },
  { id:'t088', cat:'calories', emoji:'🍫', nom:'5000 kcal', desc:'5 000 kcal brûlées — une belle tablette de chocolat justifiée.', condition: s => s.reduce((a,x)=>a+(x.kcal||0),0)>=5000 },
  { id:'t089', cat:'calories', emoji:'🎂', nom:'10 000 kcal', desc:'10 000 kcal brûlées. Bravo !', condition: s => s.reduce((a,x)=>a+(x.kcal||0),0)>=10000 },
  { id:'t090', cat:'calories', emoji:'🏋️', nom:'50 000 kcal', desc:'50 000 kcal — dépense totale phénoménale.', condition: s => s.reduce((a,x)=>a+(x.kcal||0),0)>=50000 },
  { id:'t091', cat:'calories', emoji:'🌶️', nom:'200 kcal en séance', desc:'200 kcal brûlées en une seule séance.', condition: s => s.some(x=>(x.kcal||0)>=200) },
  { id:'t092', cat:'calories', emoji:'💥', nom:'250 kcal', desc:'250 kcal brûlées en 30 minutes — effort intense !', condition: s => s.some(x=>(x.kcal||0)>=250) },
  { id:'t093', cat:'calories', emoji:'⚡', nom:'Brûleuse de calories', desc:'20 séances avec kcal enregistrées.', condition: s => s.filter(x=>(x.kcal||0)>0).length>=20 },
  { id:'t094', cat:'calories', emoji:'📊', nom:'Suivi énergétique', desc:'10 séances consécutives avec kcal enregistrées.', condition: s => { const sorted=[...s].sort((a,b)=>new Date(a.date)-new Date(b.date)); let streak=0; for(const x of sorted){if((x.kcal||0)>0)streak++;else streak=0;if(streak>=10)return true;} return false; } },
  { id:'t095', cat:'calories', emoji:'🎯', nom:'Régularité calorique', desc:'5 séances avec entre 150 et 200 kcal.', condition: s => s.filter(x=>(x.kcal||0)>=150&&(x.kcal||0)<=200).length>=5 },

  // ── LIEUX / MÉTÉO (15) ───────────────────────
  { id:'t096', cat:'lieux', emoji:'🌳', nom:'Marcheuse des parcs', desc:'5 séances dans des parcs ou jardins.', condition: s => s.filter(x=>(x.lieu||'').toLowerCase().match(/parc|jardin/)).length>=5 },
  { id:'t097', cat:'lieux', emoji:'🏖️', nom:'Pieds dans le sable', desc:'Une séance au bord de la mer ou de la plage.', condition: s => s.some(x=>(x.lieu||'').toLowerCase().match(/plage|mer|bord|océan|ocean/)) },
  { id:'t098', cat:'lieux', emoji:'🌲', nom:'Esprit de la forêt', desc:'3 séances en forêt ou dans un bois.', condition: s => s.filter(x=>(x.lieu||'').toLowerCase().match(/bois|forêt|foret/)).length>=3 },
  { id:'t099', cat:'lieux', emoji:'🗺️', nom:'3 lieux différents', desc:'Marche dans au moins 3 endroits différents.', condition: s => { const lieux=new Set(s.map(x=>x.lieu||'').filter(l=>l.length>1)); return lieux.size>=3; } },
  { id:'t100', cat:'lieux', emoji:'🌏', nom:'5 lieux différents', desc:'5 endroits de marche différents — tu explores !', condition: s => { const lieux=new Set(s.map(x=>x.lieu||'').filter(l=>l.length>1)); return lieux.size>=5; } },
  { id:'t101', cat:'lieux', emoji:'🗺️', nom:'10 lieux différents', desc:'10 lieux différents au compteur.', condition: s => { const lieux=new Set(s.map(x=>x.lieu||'').filter(l=>l.length>1)); return lieux.size>=10; } },
  { id:'t102', cat:'lieux', emoji:'🏙️', nom:'Urbaine', desc:'5 séances en milieu urbain.', condition: s => s.filter(x=>(x.lieu||'').toLowerCase().match(/rue|ville|boulevard|avenue|city|centre|center/)).length>=5 },
  { id:'t103', cat:'lieux', emoji:'⛰️', nom:'Altitude', desc:'Une séance en montagne.', condition: s => s.some(x=>(x.lieu||'').toLowerCase().match(/montagne|col|alpes|pyrénées|vosges|massif/)) },
  { id:'t104', cat:'lieux', emoji:'☀️', nom:'Sous le soleil', desc:'5 séances par beau temps.', condition: s => s.filter(x=>(x.meteo||'').toLowerCase().match(/soleil|beau|ensoleillé/)).length>=5 },
  { id:'t105', cat:'lieux', emoji:'🌧️', nom:'Pluie de courage', desc:'Une séance sous la pluie — rien ne t\'arrête !', condition: s => s.some(x=>(x.meteo||'').toLowerCase().match(/pluie|pluvieux|averse/)) },
  { id:'t106', cat:'lieux', emoji:'🌬️', nom:'Contre le vent', desc:'Une séance par grand vent.', condition: s => s.some(x=>(x.meteo||'').toLowerCase().match(/vent|venteux|bourrasque/)) },
  { id:'t107', cat:'lieux', emoji:'❄️', nom:'Glaciale mais motivée', desc:'Une séance dans le froid ou sous la neige.', condition: s => s.some(x=>(x.meteo||'').toLowerCase().match(/neige|gel|froid|glacial/)) },
  { id:'t108', cat:'lieux', emoji:'🌫️', nom:'Dans les nuages', desc:'Une séance par temps brumeux.', condition: s => s.some(x=>(x.meteo||'').toLowerCase().match(/brouillard|brume|nuage/)) },
  { id:'t109', cat:'lieux', emoji:'🌡️', nom:'Canicule warrior', desc:'Séance par forte chaleur. Hydratatation +1 !', condition: s => s.some(x=>(x.meteo||'').toLowerCase().match(/chaud|canicule|chaleur|35/)) },
  { id:'t110', cat:'lieux', emoji:'🏠', nom:'Fidèle au poste', desc:'10 séances au même lieu de prédilection.', condition: s => { const lieux={}; s.forEach(x=>{const l=x.lieu||'?';lieux[l]=(lieux[l]||0)+1;}); return Object.values(lieux).some(v=>v>=10); } },

  // ── INTERVALLES / TECHNIQUE (15) ─────────────
  { id:'t111', cat:'intervalles', emoji:'⏱️', nom:'Reine des intervalles', desc:'50 intervalles rapides complétés (10 séances × 5 intervalles).', condition: s => s.length>=10 },
  { id:'t112', cat:'intervalles', emoji:'🎯', nom:'100 intervalles rapides', desc:'100 intervalles rapides au total (20 séances).', condition: s => s.length>=20 },
  { id:'t113', cat:'intervalles', emoji:'💪', nom:'250 intervalles', desc:'250 intervalles rapides — puissance cardio maximale.', condition: s => s.length>=50 },
  { id:'t114', cat:'intervalles', emoji:'⚡', nom:'500 intervalles', desc:'500 intervalles rapides. Tu es une machine.', condition: s => s.length>=100 },
  { id:'t115', cat:'intervalles', emoji:'🌊', nom:'Récupération maîtrisée', desc:'10 séances avec rythme lent enregistré.', condition: s => s.filter(x=>x.rythme_lent&&x.rythme_lent.length>0).length>=10 },
  { id:'t116', cat:'intervalles', emoji:'🎵', nom:'Cadence parfaite', desc:'5 séances avec les deux rythmes (rapide + lent) enregistrés.', condition: s => s.filter(x=>x.rythme_rapide&&x.rythme_lent).length>=5 },
  { id:'t117', cat:'intervalles', emoji:'📐', nom:'Écart technique', desc:'Séance avec plus de 3\'/km d\'écart entre rapide et lent — tu exploites tout le potentiel.', condition: s => s.some(x=>{const r=parseRythme(x.rythme_rapide);const l=parseRythme(x.rythme_lent);return r>0&&l>0&&(l-r)>=3;}) },
  { id:'t118', cat:'intervalles', emoji:'🔄', nom:'50 séances complètes', desc:'50 séances de 30 minutes de marche japonaise = 500 intervalles de 3 minutes.', condition: s => s.length>=50 },
  { id:'t119', cat:'intervalles', emoji:'⏰', nom:'Durée fidèle', desc:'20 séances de 30 minutes exactement.', condition: s => s.filter(x=>(x.duree||30)===30).length>=20 },
  { id:'t120', cat:'intervalles', emoji:'🏅', nom:'Bonne fatigue', desc:'Séance avec FC élevée ET bon rythme (FC>140 et rythme<9\'/km).', condition: s => s.some(x=>x.fc>140&&parseRythme(x.rythme)>0&&parseRythme(x.rythme)<9) },
  { id:'t121', cat:'intervalles', emoji:'🧬', nom:'Adaptation', desc:'Ton rythme s\'améliore tandis que ta FC baisse sur les 5 dernières séances.', condition: s => { const sorted=[...s].filter(x=>x.fc>0&&parseRythme(x.rythme)>0).sort((a,b)=>new Date(a.date)-new Date(b.date)); if(sorted.length<6)return false; const old5=sorted.slice(-6,-1); const last=sorted[sorted.length-1]; const avgFc=old5.reduce((a,x)=>a+x.fc,0)/5; const avgR=old5.reduce((a,x)=>a+parseRythme(x.rythme),0)/5; return last.fc<avgFc&&parseRythme(last.rythme)<avgR; } },
  { id:'t122', cat:'intervalles', emoji:'🌡️', nom:'Effort mesuré', desc:'10 séances avec FC entre 130 et 150 bpm (zone optimale pour les intervalles).', condition: s => s.filter(x=>x.fc>=130&&x.fc<=150).length>=10 },
  { id:'t123', cat:'intervalles', emoji:'🎖️', nom:'1000 intervalles', desc:'1000 intervalles rapides complétés (200 séances).', condition: s => s.length>=200 },
  { id:'t124', cat:'intervalles', emoji:'🌸', nom:'Douceur et puissance', desc:'Séance avec intervalle lent > 12\' et intervalle rapide < 8\' — maîtrise totale.', condition: s => s.some(x=>parseRythme(x.rythme_lent)>12&&parseRythme(x.rythme_rapide)<8) },
  { id:'t125', cat:'intervalles', emoji:'🔥', nom:'150 séances d\'intervalles', desc:'150 séances — 1500 intervalles rapides dans les jambes.', condition: s => s.length>=150 },

  // ── HUMOUR / ANECDOTES (15) ──────────────────
  { id:'t126', cat:'fun', emoji:'🐌', nom:'Tortue zen', desc:'Séance avec rythme lent très confortable (> 13\'/km). La récupération, ça se mérite.', condition: s => s.some(x=>parseRythme(x.rythme_lent)>13) },
  { id:'t127', cat:'fun', emoji:'🌂', nom:'Singin\' in the rain', desc:'Séance sous la pluie — comme dans le film !', condition: s => s.some(x=>(x.meteo||'').toLowerCase().match(/pluie|pluie|averse/)) },
  { id:'t128', cat:'fun', emoji:'🧃', nom:'Dépense ta pizza', desc:'500 kcal brûlées en une semaine (environ une part de pizza).', condition: s => { const byW=getSessionsByWeek(s); return Object.values(byW).some(w=>w.reduce((a,x)=>a+(x.kcal||0),0)>=500); } },
  { id:'t129', cat:'fun', emoji:'🕐', nom:'7h30 de marche', desc:'7h30 de marche japonaise au total (30mn × 15 séances).', condition: s => s.length>=15 },
  { id:'t130', cat:'fun', emoji:'🌏', nom:'Tokyo-Paris', desc:'10 000 km parcourus... non, 10 km. Mais tout aussi bien !', condition: s => s.reduce((a,x)=>a+(x.distance||0),0)>=10 },
  { id:'t131', cat:'fun', emoji:'🐧', nom:'Marcheuse du lundi', desc:'3 séances un lundi. Le lundi n\'a qu\'à bien se tenir !', condition: s => s.filter(x=>new Date(x.date).getDay()===1).length>=3 },
  { id:'t132', cat:'fun', emoji:'🌅', nom:'L\'aube du guerrier', desc:'Séance enregistrée un dimanche (le luxe de se lever pour marcher).', condition: s => s.some(x=>new Date(x.date).getDay()===0) },
  { id:'t133', cat:'fun', emoji:'🗾', nom:'Esprit japonais', desc:'Pratique la marche japonaise pendant 3 mois consécutifs. 歩く力 (la force de marcher).', condition: s => { const months=new Set(s.map(x=>x.date.substring(0,7))); return months.size>=3; } },
  { id:'t134', cat:'fun', emoji:'📱', nom:'Data addict', desc:'Toutes les colonnes remplies dans une séance (lieu, météo, FC, rythme, kcal, commentaires).', condition: s => s.some(x=>x.lieu&&x.meteo&&x.fc>0&&x.rythme&&x.kcal>0&&x.commentaires) },
  { id:'t135', cat:'fun', emoji:'🌸', nom:'Hanami walking', desc:'Séance en avril ou mai (la saison des fleurs au Japon).', condition: s => s.some(x=>['04','05'].includes(x.date.substring(5,7))) },
  { id:'t136', cat:'fun', emoji:'🎃', nom:'Halloween walker', desc:'Séance le mois d\'octobre.', condition: s => s.some(x=>x.date.substring(5,7)==='10') },
  { id:'t137', cat:'fun', emoji:'🎅', nom:'Père Noël sportif', desc:'Séance en décembre — même en période de fêtes !', condition: s => s.some(x=>x.date.substring(5,7)==='12') },
  { id:'t138', cat:'fun', emoji:'💬', nom:'Poétesse', desc:'5 commentaires écrits dans tes séances.', condition: s => s.filter(x=>x.commentaires&&x.commentaires.length>5).length>=5 },
  { id:'t139', cat:'fun', emoji:'📖', nom:'Journaliste sportive', desc:'10 commentaires écrits — tu racontes ta vie de marcheuse.', condition: s => s.filter(x=>x.commentaires&&x.commentaires.length>5).length>=10 },
  { id:'t140', cat:'fun', emoji:'🎌', nom:'Nihon Spirit', desc:'50 séances de marche japonaise. 五十歩百歩 — chaque pas compte.', condition: s => s.length>=50 },

  // ── PROGRESSION / RECORDS (10) ───────────────
  { id:'t141', cat:'records', emoji:'🏆', nom:'Record de distance', desc:'Bats ton propre record de distance en une séance.', condition: s => { if(s.length<2)return false; const sorted=[...s].sort((a,b)=>new Date(a.date)-new Date(b.date)); let max=0,beaten=false; for(const x of sorted){if((x.distance||0)>max&&max>0)beaten=true;if((x.distance||0)>max)max=x.distance||0;} return beaten; } },
  { id:'t142', cat:'records', emoji:'⚡', nom:'Record de rythme', desc:'Bats ton meilleur rythme d\'intervalle rapide.', condition: s => { const withR=s.filter(x=>parseRythme(x.rythme_rapide)>0).sort((a,b)=>new Date(a.date)-new Date(b.date)); if(withR.length<2)return false; let best=Infinity,beaten=false; for(const x of withR){const r=parseRythme(x.rythme_rapide);if(r<best&&best<Infinity)beaten=true;if(r<best)best=r;} return beaten; } },
  { id:'t143', cat:'records', emoji:'🔥', nom:'Record calorique', desc:'Bats ton record de kcal en une séance.', condition: s => { const sorted=[...s].sort((a,b)=>new Date(a.date)-new Date(b.date)); let max=0,beaten=false; for(const x of sorted){if((x.kcal||0)>max&&max>0)beaten=true;if((x.kcal||0)>max)max=x.kcal||0;} return beaten; } },
  { id:'t144', cat:'records', emoji:'📈', nom:'5 records personnels', desc:'5 nouveaux records battus (distance, rythme ou kcal).', condition: s => { let count=0; const sorted=[...s].sort((a,b)=>new Date(a.date)-new Date(b.date)); let maxD=0,minR=Infinity,maxK=0; for(const x of sorted){if((x.distance||0)>maxD&&maxD>0)count++;if((x.distance||0)>maxD)maxD=x.distance||0;const r=parseRythme(x.rythme_rapide);if(r>0&&r<minR&&minR<Infinity)count++;if(r>0&&r<minR)minR=r;if((x.kcal||0)>maxK&&maxK>0)count++;if((x.kcal||0)>maxK)maxK=x.kcal||0;} return count>=5; } },
  { id:'t145', cat:'records', emoji:'🌙', nom:'Nuit de progrès', desc:'Ta moyenne de distance augmente mois après mois pendant 3 mois.', condition: s => { const byM=getSessionsByMonth(s); const keys=Object.keys(byM).sort(); if(keys.length<3)return false; for(let i=2;i<keys.length;i++){const avg=m=>byM[m].reduce((a,x)=>a+(x.distance||0),0)/byM[m].length; if(avg(keys[i])<=avg(keys[i-1])||avg(keys[i-1])<=avg(keys[i-2]))return false;} return true; } },
  { id:'t146', cat:'records', emoji:'💫', nom:'Progression globale', desc:'Amélioration sur tous les critères sur le dernier mois vs le premier.', condition: s => { const byM=getSessionsByMonth(s); const keys=Object.keys(byM).sort(); if(keys.length<2)return false; const first=byM[keys[0]]; const last=byM[keys[keys.length-1]]; const avgDist=arr=>arr.reduce((a,x)=>a+(x.distance||0),0)/arr.length; return avgDist(last)>=avgDist(first)&&last.length>=first.length; } },
  { id:'t147', cat:'records', emoji:'🏅', nom:'Meilleure semaine', desc:'Ta meilleure semaine (en distance) de tous les temps.', condition: s => { const byW=getSessionsByWeek(s); return Object.values(byW).some(w=>w.reduce((a,x)=>a+(x.distance||0),0)>=15); } },
  { id:'t148', cat:'records', emoji:'🌟', nom:'Meilleur mois', desc:'Mois record avec 25 séances ou plus.', condition: s => { const byM=getSessionsByMonth(s); return Object.values(byM).some(m=>m.length>=25); } },
  { id:'t149', cat:'records', emoji:'🎯', nom:'3 mois de progression', desc:'3 mois consécutifs avec plus de séances que le mois précédent.', condition: s => { const byM=getSessionsByMonth(s); const keys=Object.keys(byM).sort(); if(keys.length<3)return false; for(let i=2;i<keys.length;i++){if(byM[keys[i]].length<=byM[keys[i-1]].length||byM[keys[i-1]].length<=byM[keys[i-2]].length)return false;} return true; } },
  { id:'t150', cat:'records', emoji:'🌈', nom:'Légende de la Marche', desc:'Tous les critères au sommet : 100+ séances, 200+ km, streak 30+, 10+ lieux.', condition: (s,stats) => s.length>=100&&s.reduce((a,x)=>a+(x.distance||0),0)>=200&&stats.maxStreak>=30&&new Set(s.map(x=>x.lieu||'').filter(l=>l.length>1)).size>=10 }
];

const TROPHY_CATEGORIES = [
  { id:'all', label:'Tous' },
  { id:'debuts', label:'Débuts' },
  { id:'regularite', label:'Régularité' },
  { id:'distance', label:'Distance' },
  { id:'rythme', label:'Rythme' },
  { id:'coeur', label:'Cœur' },
  { id:'calories', label:'Calories' },
  { id:'lieux', label:'Lieux' },
  { id:'intervalles', label:'Intervalles' },
  { id:'fun', label:'Fun' },
  { id:'records', label:'Records' }
];

function checkTrophees(sessions) {
  const stats = computeStats(sessions);
  const unlocked = [];
  TROPHEES.forEach(t => {
    try {
      if (t.condition(sessions, stats)) unlocked.push(t.id);
    } catch(e) {}
  });
  return unlocked;
}

function getTropheeById(id) {
  return TROPHEES.find(t => t.id === id);
}

function saveTrophees(unlockedIds) {
  localStorage.setItem('mj_trophees', JSON.stringify(unlockedIds));
}

function loadTrophees() {
  try {
    const raw = localStorage.getItem('mj_trophees');
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}
