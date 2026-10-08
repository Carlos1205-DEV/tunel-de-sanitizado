/* Modos de la aplicación: Ruta guiada (rutinas mensual y anual), Práctica y Análisis de fallas y refacciones */
(function () {
  'use strict';
  const TS = window.TS, S = TS.S, ACT = TS.ACT, DATA = TS.DATA, TASKS = TS.TASKS, COMP = TS.COMP, ELEM = TS.ELEM, $ = TS.$, $$ = TS.$$, esc = TS.esc, store = TS.store, clean = TS.clean, sentence = TS.sentence, tag = TS.tag;
  const SYSNAME = { 1: 'Mecánico', 2: 'Neumático', 3: 'Eléctrico', 4: 'Hidráulico', 5: 'Instrumentación', 6: 'Lubricación', 7: 'General' };
  const CLASSNAME = { 1: 'Inspección', 2: 'Predictivo', 3: 'Preventivo' };
  const CLAVES = [['B', 'Se realizó, todo bien'], ['BP', 'Se realizó, pero hay pendientes'], ['BCF', 'Se realizó, se corrigió la falla'], ['X', 'No se realizó'], ['N/A', 'No aplica']];
  const SAFETY = ['Utilizar equipos de protección personal (EPP) según la actividad.', 'Asegurarse de la correcta conexión a tierra y reportar fallos.', 'Verificar si requiere paro del equipo.', 'Aplicar el procedimiento de bloqueo y etiquetado de energías (LOTO) para riesgos eléctricos, neumáticos o mecánicos.', 'Revisar el correcto funcionamiento de las guardas de seguridad mientras la máquina esté operando.'];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pickN = (a, n) => shuffle(a).slice(0, n);
  const nameOf = key => key.indexOf('comp:') === 0 ? COMP[key.slice(5)].name : clean(ELEM[key].n);
  const short = s => s.length > 52 ? s.slice(0, 50) + '…' : s;
  const fichaOf = id => DATA.fichas.find(f => f.id === id);

  /* ============================================================
   *  Modo 2 · Ruta guiada
   * ============================================================ */
  const R = { fid: null, i: 0, res: [], name: store.get('ts01_tecnico', ''), t0: null, done: false, photo: true, hist: null };
  const fichaMin = f => f.items.reduce((a, it) => a + (it.min || 0), 0);
  const needsReading = it => /temperatura/i.test(it.texto) && /amperaje/i.test(it.texto);
  function evalReading(l) {
    const t = parseFloat(String(l.temp).replace(',', '.')), a = parseFloat(String(l.amp).replace(',', '.')), v = parseFloat(String(l.volt).replace(',', '.')), out = [];
    if (!isNaN(t) && t > 42) out.push('temperatura mayor de 42 °C'); if (!isNaN(a) && a > 1.5) out.push('amperaje mayor de 1.5 A'); if (!isNaN(v) && (v < 198 || v > 242)) out.push('voltaje fuera de 220 V ±10 %');
    return out;
  }
  function rutaView() {
    if (!R.fid) {
      const hist = store.get('ts01_hist', []);
      return `<div class="p-head"><div class="p-sys">Modo 2</div><div class="p-title">Ruta guiada de rutina</div></div>
      <div class="p-body"><p class="p-desc">Sigue las rutinas de mantenimiento del túnel punto por punto. Cada paso te lleva a la pieza en el 3D, muestra la foto de referencia y registra la clave de la rutina. Al final obtienes un reporte.</p>
      <details class="callout stop" style="margin:10px 0"><summary style="cursor:pointer;font-weight:600">Seguridad antes de empezar</summary><ul style="margin:8px 0 0 18px;line-height:1.55">${SAFETY.map(s => `<li>${esc(s)}</li>`).join('')}</ul></details>
      <label class="field"><span>Nombre del técnico</span><input id="rName" value="${esc(R.name)}" placeholder="Tu nombre" autocomplete="name"></label>
      ${DATA.fichas.map(f => `<button class="card click" data-act="rstart" data-id="${f.id}"><b class="t">${esc(f.titulo)}</b><small>${esc(f.periodo)} · ${f.items.length} puntos · ~${fichaMin(f)} min</small></button>`).join('')}
      <h3 class="sec">Claves de la rutina</h3>
      <table class="t">${CLAVES.map(c => `<tr><td><b>${c[0]}</b></td><td>${esc(c[1])}</td></tr>`).join('')}</table>
      ${hist.length ? `<h3 class="sec">Reportes recientes</h3>${hist.slice(0, 5).map((h, k) => `<button class="card click" data-act="rhist" data-k="${k}"><b class="t" style="font-size:16px">${esc(h.ficha)} · ${h.resumen}</b><small>${esc(h.fecha)} · ${esc(h.nombre || 'sin nombre')}</small></button>`).join('')}` : ''}
      </div>`;
    }
    const f = fichaOf(R.fid);
    if (R.done) return rutaResumen(f);
    const it = f.items[R.i], prev = R.res[R.i] || {}, pct = Math.round(R.i / f.items.length * 100), lec = prev.lec || {};
    const puntos = it.puntos.filter(p => p !== 'ALL');
    return `<div class="p-head"><div class="p-sys">${esc(f.titulo)} · paso ${R.i + 1} de ${f.items.length}</div><div class="prog"><i style="width:${pct}%"></i></div></div>
    <div class="p-body">
      <div class="chips" style="margin-bottom:6px">${puntos.length ? puntos.map(p => `<button class="chip on" data-act="rfly" data-k="${p}">📍 ${esc(short(nameOf(p)))}</button>`).join('') : '<button class="chip on" data-act="rfly" data-k="ALL">📍 Vista general</button>'}</div>
      <div class="step-text">${esc(sentence(it.texto))}</div>
      <div class="badges">${tag(it.codigo)}${tag(it.sistema + ' · ' + it.clase)}${tag(TS.FREQ[it.frec] || it.frec)}${tag(TS.nivelLabel(it.nivel))}${it.min ? tag(it.min + ' min') : ''}${it.paro === 'SI' ? tag('Requiere paro', 'paro') : ''}</div>
      ${it.paro === 'SI' ? '<div class="callout stop"><b>⛔ Requiere paro del equipo.</b> Detén la máquina y aplica bloqueo y etiquetado (LOTO) antes de intervenir.</div>' : ''}
      ${it.herr ? `<p class="note" style="margin-top:8px">Herramientas: ${esc(sentence(it.herr))}</p>` : ''}
      ${needsReading(it) ? `<h3 class="sec">Lecturas</h3><div class="trio">
        <label class="field"><span>Temperatura (°C) · máx 42</span><input id="rTemp" inputmode="decimal" value="${esc(lec.temp || '')}" placeholder="°C"></label>
        <label class="field"><span>Amperaje (A) · máx 1.5</span><input id="rAmp" inputmode="decimal" value="${esc(lec.amp || '')}" placeholder="A"></label>
        <label class="field"><span>Voltaje (V) · 220</span><input id="rVolt" inputmode="decimal" value="${esc(lec.volt || '')}" placeholder="V"></label></div>` : ''}
      <label class="field"><span>Observaciones (obligatorias con BP, BCF o X)</span><textarea id="rNote" placeholder="Describe lo que encontraste">${esc(prev.nota || '')}</textarea></label>
      <div class="claves" role="group" aria-label="Clave de la rutina">${CLAVES.map(c => `<button class="clave ${c[0].replace('/', '')}${prev.clave === c[0] ? ' on' : ''}" data-act="rclave" data-c="${c[0]}" title="${esc(c[1])}"><b>${c[0]}</b>${esc(c[1].replace('Se realizó, ', ''))}</button>`).join('')}</div>
      <div class="btns"><button class="btn sm" data-act="rprev" ${R.i === 0 ? 'disabled' : ''}>← Anterior</button><button class="btn sm" data-act="rphoto">${R.photo ? 'Ocultar' : 'Ver'} foto de referencia</button><button class="btn sm" data-act="rexit">Salir</button></div>
      ${R.photo && it.foto ? `<img class="photo" src="img/${it.foto}.jpg" alt="Foto de referencia de la tarea ${esc(it.codigo)}">` : ''}
    </div>`;
  }
  function counts(res) { const c = { B: 0, BP: 0, BCF: 0, X: 0, 'N/A': 0 }; res.forEach(r => { if (r) c[r.clave]++; }); return c; }
  function resumenCorto(res) { const c = counts(res); return CLAVES.map(k => k[0] + ' ' + c[k[0]]).join(' · '); }
  function rutaResumen(f) {
    const c = counts(R.res), ok = c.B + c.BCF, pend = R.res.filter(r => r && (r.clave === 'BP' || r.clave === 'X' || r.alerta));
    return `<div class="p-head"><div class="p-sys">Ruta completada · ${esc(f.titulo)}</div><div class="score">${Math.round(ok / f.items.length * 100)}%</div><div class="note">${esc(resumenCorto(R.res))}</div></div>
    <div class="p-body">
      ${pend.length ? `<h3 class="sec">Pendientes para seguimiento</h3>${pend.map(r => `<div class="row"><div class="top"><b>${esc(sentence(r.texto))}</b>${tag(r.clave, r.clave === 'X' ? 'crit' : 'media')}</div>${r.nota ? `<div class="sub">${esc(r.nota)}</div>` : ''}${r.alerta ? `<div class="sub" style="color:var(--crit)">Lectura fuera de rango: ${esc(r.alerta)}</div>` : ''}${r.puntos[0] && r.puntos[0] !== 'ALL' ? `<button class="chip" style="margin-top:6px" data-act="rfly" data-k="${r.puntos[0]}">Ver pieza</button> <button class="chip" style="margin-top:6px" data-act="rexplore" data-k="${r.puntos[0]}">Historial y refacciones</button>` : ''}</div>`).join('')}` : '<div class="callout" style="margin:12px 0">Sin pendientes. Buen trabajo.</div>'}
      <h3 class="sec">Detalle</h3>
      <table class="t">${R.res.map((r, i) => r ? `<tr><td>${esc(r.codigo)}</td><td>${esc(sentence(r.texto))}${r.lec ? `<br><span class="note">${esc(readingText(r.lec))}</span>` : ''}</td><td><b>${esc(r.clave)}</b></td></tr>` : '').join('')}</table>
      <div class="btns"><button class="btn pri" data-act="rcopy">Copiar reporte</button><button class="btn" data-act="rcsv">Copiar CSV</button><button class="btn" data-act="rexit">Nueva ruta</button></div>
    </div>`;
  }
  const readingText = l => `Temperatura ${l.temp || '—'} °C · Amperaje ${l.amp || '—'} A · Voltaje ${l.volt || '—'} V`;
  function rutaGo() {
    const f = fichaOf(R.fid); if (!f || R.done) return; const it = f.items[R.i];
    if (it.paro === 'SI' && S.run) TS.setRun(false);
    if (it.puntos[0] === 'ALL') { TS.setFocus(null, { fly: false }); TS.setView('iso'); } else TS.setFocus(it.puntos);
  }
  function readDraft() {
    const g = id => ($('#' + id) || {}).value || '';
    return { nota: g('rNote').trim(), lec: $('#rTemp') ? { temp: g('rTemp').trim(), amp: g('rAmp').trim(), volt: g('rVolt').trim() } : null };
  }
  ACT.rstart = d => {
    const nm = $('#rName'); if (nm) { R.name = nm.value.trim(); store.set('ts01_tecnico', R.name); }
    R.fid = d.id; R.i = 0; R.res = []; R.done = false; R.t0 = new Date(); R.photo = true; TS.stopAuto(); TS.renderPanel(); rutaGo();
  };
  ACT.rclave = d => {
    const f = fichaOf(R.fid), it = f.items[R.i], dr = readDraft(), c = d.c;
    if (['BP', 'BCF', 'X'].includes(c) && !dr.nota) { TS.toast('Escribe la observación para la clave ' + c); const n = $('#rNote'); if (n) n.focus(); return; }
    let alerta = ''; if (dr.lec) { const out = evalReading(dr.lec); alerta = out.join(', '); if (out.length && c === 'B') { TS.toast('Hay una lectura fuera de rango: usa BP o BCF y anótalo'); ['rTemp', 'rAmp', 'rVolt'].forEach(id => $('#' + id) && $('#' + id).classList.add('bad')); return; } }
    R.res[R.i] = { codigo: it.codigo, per: it.per, texto: it.texto, clave: c, nota: dr.nota, lec: dr.lec, alerta, puntos: it.puntos };
    if (R.i + 1 >= f.items.length) { R.done = true; saveReport(f); TS.setFocus(null, { fly: false }); TS.setView('iso'); TS.renderPanel(); }
    else { R.i++; TS.renderPanel(); rutaGo(); }
  };
  ACT.rprev = () => { if (R.i > 0) { R.i--; TS.renderPanel(); rutaGo(); } };
  ACT.rphoto = () => { const keep = readDraft(); const cur = R.res[R.i] || {}; R.res[R.i] = Object.assign(cur, { nota: keep.nota, lec: keep.lec || cur.lec, clave: cur.clave }); R.photo = !R.photo; TS.renderPanel(true); if (!cur.clave) delete R.res[R.i]; };
  ACT.rexit = () => { R.fid = null; R.done = false; TS.setFocus(null, { fly: false }); TS.setView('iso'); TS.renderPanel(); };
  ACT.rfly = d => { if (d.k === 'ALL') { TS.setFocus(null, { fly: false }); TS.setView('iso'); } else TS.focusKeys([d.k]); };
  ACT.rexplore = d => { TS.setMode('explorar'); const k = d.k; if (k.indexOf('comp:') === 0) TS.select({ kind: 'comp', id: k.slice(5) }, { tab: 'fallas' }); else TS.select({ kind: 'elem', id: k }, { tab: 'fallas' }); };
  function reportText(f, res, when, name) {
    const c = counts(res); let s = `REPORTE DE RUTINA — TÚNEL DE SANITIZADO 01 (OP TS01) · Área Empaque · Línea Cortes\nRutina: ${f.titulo} (${f.periodo})\nFecha: ${when}\nTécnico: ${name || '—'}\nResultado: ${resumenCorto(res)}\n\n`;
    res.forEach(r => { if (!r) return; s += `${r.codigo} [${r.clave}] ${sentence(r.texto)}${r.lec ? ' | ' + readingText(r.lec) : ''}${r.alerta ? ' | FUERA DE RANGO: ' + r.alerta : ''}${r.nota ? ' | Obs: ' + r.nota : ''}\n`; });
    return s;
  }
  function copyText(txt, ok) {
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => TS.toast(ok), () => { const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); TS.toast(ok); } catch (e) { TS.toast('No se pudo copiar'); } ta.remove(); });
  }
  function saveReport(f) {
    const hist = store.get('ts01_hist', []); hist.unshift({ ficha: f.titulo, fid: f.id, fecha: new Date().toLocaleString('es-MX'), nombre: R.name, resumen: resumenCorto(R.res), res: R.res }); store.set('ts01_hist', hist.slice(0, 10));
  }
  ACT.rcopy = () => { const f = fichaOf(R.fid); copyText(reportText(f, R.res, new Date().toLocaleString('es-MX'), R.name), 'Reporte copiado'); };
  ACT.rcsv = () => {
    const rows = [['codigo', 'clave', 'actividad', 'lecturas', 'observaciones']].concat(R.res.filter(Boolean).map(r => [r.codigo, r.clave, sentence(r.texto), r.lec ? readingText(r.lec) : '', r.nota]));
    const csv = rows.map(r => r.map(c => '"' + String(c === undefined ? '' : c).replace(/"/g, '""') + '"').join(',')).join('\n');
    if (window.claude) { copyText(csv, 'CSV copiado: pégalo en Excel'); return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })); a.download = 'rutina_tunel_sanitizado_' + R.fid + '.csv'; a.click();
  };
  ACT.rhist = d => { const h = store.get('ts01_hist', [])[+d.k]; if (!h) return; R.fid = h.fid; R.res = h.res; R.done = true; R.name = h.nombre; TS.renderPanel(); };

  /* ============================================================
   *  Modo 3 · Práctica
   * ============================================================ */
  const LOCATE = ['spray:1', 'motorreductor:1', 'motorreductor:2', 'motorreductor:3', 'dossatron:1', 'botonera:1', 'transmision:1', 'transmision:7', 'transmision:8', 'transmision:9', 'transmision:12', 'transmision:15', 'transmision:17', 'transmision:19', 'transmision:20', 'transmision:21', 'transmision:22', 'transmision:34', 'transmision:35', 'gabinete:1', 'gabinete:2', 'gabinete:3', 'gabinete:4', 'gabinete:5', 'gabinete:6', 'gabinete:10', 'gabinete:13', 'gabinete:14', 'cubierta:1', 'cubierta:2', 'cubierta:4', 'cubierta:6', 'cubierta:8'];
  const Q = { mode: null, list: [], i: 0, score: 0, log: [], tries: 0, answered: false, picked: -1 };
  const firstSentence = s => { const m = String(s || '').match(/^[^.]+\./); return m ? m[0] : s; };
  function genLocate() { return shuffle(LOCATE).map(k => ({ type: 'locate', key: k, text: 'Ubica en el modelo 3D:', target: clean(ELEM[k].n), where: COMP[ELEM[k].comp].name, explain: TS.infoOf(k).d || '' })); }
  function genMC() {
    const out = [], freqs = ['Mensual', 'Anual', 'Semestral', 'Diaria'];
    pickN(TASKS, 6).forEach(t => { const fl = TS.FREQ[t.frec] || t.frec; out.push({ type: 'mc', text: 'Esta tarea, ¿cada cuánto se realiza?', sub: sentence(t.texto), options: freqs, answer: freqs.indexOf(fl), explain: `La rutina ${t.fichaTitulo.toLowerCase()} incluye la tarea ${t.codigo} (${t.per}).`, keys: t.puntos }); });
    pickN(TASKS, 5).forEach(t => { const si = t.paro === 'SI'; out.push({ type: 'mc', text: '¿Esta tarea requiere paro del equipo?', sub: sentence(t.texto), options: ['Sí, se detiene el equipo', 'No, se hace con el equipo operando'], answer: si ? 0 : 1, explain: `${t.codigo}: ${si ? 'requiere paro y bloqueo (LOTO)' : 'no requiere paro'}.`, keys: t.puntos }); });
    pickN(TASKS, 4).forEach(t => {
      const d = t.codigo, ok = `${SYSNAME[d[0]]} · ${CLASSNAME[d[1]]} · tarea ${d.slice(2)}`, wrong = new Set();
      while (wrong.size < 3) { const s = SYSNAME[1 + Math.floor(Math.random() * 7)], c = CLASSNAME[1 + Math.floor(Math.random() * 3)], n = String(1 + Math.floor(Math.random() * 9)).padStart(2, '0'), o = `${s} · ${c} · tarea ${n}`; if (o !== ok) wrong.add(o); }
      const opts = shuffle([ok].concat(Array.from(wrong)));
      out.push({ type: 'mc', text: `En la rutina, el código ${d} significa…`, sub: 'Primer dígito: sistema · segundo: clase (1 inspección, 2 predictivo, 3 preventivo) · últimos dos: número de tarea.', options: opts, answer: opts.indexOf(ok), explain: `${d} = ${ok}.`, keys: t.puntos });
    });
    [['BP', 'Se realizó, pero hay pendientes'], ['BCF', 'Se realizó, se corrigió la falla'], ['X', 'No se realizó'], ['B', 'Se realizó, todo bien']].forEach(c => {
      const opts = shuffle(CLAVES.map(k => k[1])); out.push({ type: 'mc', text: `En la rutina, ¿qué significa la clave ${c[0]}?`, options: opts, answer: opts.indexOf(c[1]), explain: `${c[0]} = ${c[1]}.` });
    });
    pickN(DATA.refs, 4).forEach(r => { const o = ['CRÍTICO', 'MEDIA', 'BAJA']; out.push({ type: 'mc', text: `¿Qué severidad tiene la refacción «${short(r.desc)}»?`, options: o.map(k => TS.SEV_LABEL[k]), answer: o.indexOf(r.sev), explain: `En la hoja REFACCIONES está como ${TS.SEV_LABEL[r.sev].toLowerCase()}.`, keys: r.elems }); });
    pickN(LOCATE.filter(k => !k.startsWith('cubierta')), 4).forEach(k => { const e = ELEM[k], cs = Object.keys(COMP).filter(c => c !== e.comp && !COMP[c].extra), o = shuffle(pickN(cs, 3).concat(e.comp)); out.push({ type: 'mc', text: `¿A qué sección pertenece «${short(clean(e.n))}»?`, options: o.map(c => COMP[c].name), answer: o.indexOf(e.comp), explain: `En la taxonomía está en «${COMP[e.comp].name}».`, keys: [k] }); });
    pickN(LOCATE, 4).forEach(k => { const others = pickN(LOCATE.filter(x => x !== k && TS.infoOf(x).d), 3), o = shuffle([k].concat(others)); out.push({ type: 'mc', text: `¿Cuál describe mejor «${short(clean(ELEM[k].n))}»?`, options: o.map(x => firstSentence(TS.infoOf(x).d)), answer: o.indexOf(k), explain: TS.infoOf(k).d, keys: [k] }); });
    const g0 = DATA.pareto[0]; out.push({ type: 'mc', text: '¿Qué tipo de falla se repite más en el historial del túnel?', options: shuffle(DATA.pareto.slice(0, 4).map(p => p.grupo)).map(x => x), get answer() { return this.options.indexOf(g0.grupo); }, explain: `${g0.grupo}: ${g0.ot} OT (${g0.pct} % del total).`, keys: DATA.grupoElem[g0.grupo] });
    [['¿Cuál es la temperatura máxima del motor en la rutina mensual?', '42 °C', ['35 °C', '55 °C', '60 °C']], ['¿Cuántos dientes tienen los sprockets de la banda?', '12 dientes', ['8 dientes', '16 dientes', '24 dientes']], ['¿Qué relación de reducción tiene el reductor?', '40:1', ['20:1', '60:1', '10:1']], ['¿Cuánto mide de ancho la banda modular?', '330 mm', ['250 mm', '450 mm', '600 mm']], ['¿Qué amperaje máximo se acepta en el motor?', '1.5 A', ['0.5 A', '3 A', '5 A']]].forEach(f => { const o = shuffle([f[1]].concat(f[2])); out.push({ type: 'mc', text: f[0], options: o, answer: o.indexOf(f[1]), explain: 'Dato de la rutina mensual y la taxonomía del Excel.' }); });
    return shuffle(out);
  }
  function practicaView() {
    const best = store.get('ts01_best', {});
    if (!Q.mode) {
      return `<div class="p-head"><div class="p-sys">Modo 3</div><div class="p-title">Práctica</div></div>
      <div class="p-body"><p class="p-desc">Aprende jugando: 10 preguntas por ronda, generadas con tus rutinas, refacciones y las piezas del modelo 3D.</p>
      <button class="card click" data-act="qstart" data-m="locate"><b class="t">Ubica la pieza</b><small>Te decimos el nombre y tú tocas la pieza en el 3D. Mejor marca: ${best.locate !== undefined ? best.locate + '/100' : '—'}</small></button>
      <button class="card click" data-act="qstart" data-m="mc"><b class="t">Preguntas de mantenimiento</b><small>Frecuencias, paros, claves, códigos, severidades y datos técnicos. Mejor marca: ${best.mc !== undefined ? best.mc + '/100' : '—'}</small></button>
      <button class="card click" data-act="qstart" data-m="mix"><b class="t">Mixto</b><small>5 para ubicar en el 3D y 5 de preguntas. Mejor marca: ${best.mix !== undefined ? best.mix + '/100' : '—'}</small></button></div>`;
    }
    if (Q.i >= Q.list.length) {
      const wrong = Q.log.filter(l => !l.ok);
      return `<div class="p-head"><div class="p-sys">Resultado</div><div class="score">${Q.score}<span style="font-size:22px;color:var(--ink-soft)">/100</span></div><div class="note">${Q.log.filter(l => l.ok).length} de ${Q.list.length} correctas${Q.newBest ? ' · ¡nueva mejor marca!' : ''}</div></div>
      <div class="p-body">${wrong.length ? `<h3 class="sec">Para repasar</h3>${wrong.map(l => `<div class="row"><b>${esc(l.q.target || l.q.text)}</b>${l.q.sub ? `<div class="sub">${esc(l.q.sub)}</div>` : ''}<div class="sub" style="color:var(--amber)">${esc(l.q.explain)}</div>${(l.q.keys || (l.q.key ? [l.q.key] : [])).filter(k => k !== 'ALL').length ? `<button class="chip" style="margin-top:6px" data-act="qsee" data-k="${(l.q.keys || [l.q.key]).filter(k => k !== 'ALL').join(',')}">Ver en 3D</button>` : ''}</div>`).join('')}` : '<div class="callout">¡Perfecto! Sin errores.</div>'}
      <div class="btns"><button class="btn pri" data-act="qstart" data-m="${Q.mode}">Otra ronda</button><button class="btn" data-act="qexit">Cambiar modo</button></div></div>`;
    }
    const q = Q.list[Q.i], pct = Math.round(Q.i / Q.list.length * 100); let body;
    if (q.type === 'locate') {
      body = `<div class="q-text">${esc(q.text)}</div><div class="score" style="font-size:30px">${esc(q.target)}</div><p class="note">Sección: ${esc(q.where)}</p>
        <p class="note" style="margin-top:8px">Toca la pieza en el modelo. Puedes girar, acercar y usar Rayos X. Intentos: ${Q.tries}/3</p>
        <div class="btns"><button class="btn sm" data-act="qhint">Pista</button><button class="btn sm" data-act="qskip">Saltar</button></div>`;
    } else {
      body = `<div class="q-text">${esc(q.text)}</div>${q.sub ? `<div class="callout">${esc(q.sub)}</div>` : ''}
        <div class="opts">${q.options.map((o, k) => `<button class="opt ${Q.answered ? (k === q.answer ? 'good' : (k === Q.picked ? 'bad' : '')) : ''}" data-act="qans" data-k="${k}" ${Q.answered ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div>
        ${Q.answered ? `<div class="callout">${esc(q.explain)}</div><div class="btns">${(q.keys || []).filter(k => k !== 'ALL').length ? `<button class="btn" data-act="qsee" data-k="${q.keys.filter(k => k !== 'ALL').join(',')}">Ver en 3D</button>` : ''}<button class="btn pri" data-act="qnext">${Q.i + 1 >= Q.list.length ? 'Ver resultado' : 'Siguiente →'}</button></div>` : ''}`;
    }
    return `<div class="p-head"><div class="p-sys">Pregunta ${Q.i + 1} de ${Q.list.length} · ${Q.score} pts</div><div class="prog"><i style="width:${pct}%"></i></div></div><div class="p-body">${body}</div>`;
  }
  ACT.qstart = d => {
    Q.mode = d.m; Q.i = 0; Q.score = 0; Q.log = []; Q.answered = false; Q.tries = 0; Q.newBest = false; S.hint = null;
    const l = d.m === 'locate' ? genLocate().slice(0, 10) : d.m === 'mc' ? genMC().slice(0, 10) : genLocate().slice(0, 5).concat(genMC().slice(0, 5));
    Q.list = shuffle(l); TS.stopAuto(); TS.setFocus(null, { fly: false }); TS.setView('iso'); TS.renderPanel(); qEnter();
  };
  function qEnter() {
    S.onPick = null; Q.tries = 0; Q.answered = false; TS.hideBanner(); TS.setFocus(null, { fly: false });
    const q = Q.list[Q.i]; if (!q) return;
    if (q.type === 'locate') {
      if (q.key.indexOf('gabinete:') === 0) { TS.setDoor(true); S.autoDoor = true; }
      S.onPick = key => {
        if (!key) return;
        if (key === q.key) { const pts = Q.tries === 0 ? 10 : Q.tries === 1 ? 6 : 3; qFinish(true, pts); TS.showBanner(`✔ ¡Correcto! <b>${esc(q.target)}</b><small>+${pts} puntos</small>`, 'good', 1800); }
        else {
          Q.tries++; const nm = key.indexOf('comp:') === 0 ? COMP[key.slice(5)].name : clean(ELEM[key].n);
          if (Q.tries >= 3) { qFinish(false, 0); TS.showBanner(`Era: <b>${esc(q.target)}</b>`, 'bad', 2400); TS.setFocus([q.key]); }
          else { TS.showBanner(`✖ Esa es «${esc(short(nm))}»<small>Sigue buscando · intento ${Q.tries}/3</small>`, 'bad', 1600); if (Q.tries === 2) { toastHint(q); } TS.renderPanel(); }
        }
      };
      if (TS.infoOf(q.key).xray && !S.xray) { TS.setXray(true); S.autoXray = true; }   // piezas dentro de la campana: se activan los rayos X
      TS.showBanner(`Ubica: <b>${esc(q.target)}</b>${TS.infoOf(q.key).xray ? '<small>Está dentro de la campana: ya activamos los Rayos X</small>' : ''}`);
    }
  }
  function toastHint(q) { TS.toast('Pista: está en «' + q.where + '»'); TS.focusKeys(['comp:' + ELEM[q.key].comp], { pad: 2.4 }); }
  function qFinish(ok, pts) {
    const q = Q.list[Q.i]; Q.score += pts * (100 / (Q.list.length * 10)); Q.score = Math.round(Q.score);
    Q.log.push({ q, ok }); S.onPick = null;
    setTimeout(() => { if (S.mode !== 'practica') return; Q.i++; if (Q.i >= Q.list.length) endRound(); else { TS.renderPanel(); qEnter(); return; } TS.renderPanel(); }, ok ? 1500 : 2500);
  }
  function endRound() {
    TS.hideBanner(); S.onPick = null; TS.setFocus(null, { fly: false }); TS.setView('iso');
    const b = store.get('ts01_best', {}); if (b[Q.mode] === undefined || Q.score > b[Q.mode]) { Q.newBest = b[Q.mode] !== undefined; b[Q.mode] = Q.score; store.set('ts01_best', b); }
  }
  ACT.qhint = () => { const q = Q.list[Q.i]; toastHint(q); };
  ACT.qskip = () => { const q = Q.list[Q.i]; qFinish(false, 0); TS.setFocus([q.key]); TS.showBanner(`Era: <b>${esc(q.target)}</b>`, 'bad', 2400); };
  ACT.qans = d => { const q = Q.list[Q.i]; if (Q.answered) return; Q.answered = true; Q.picked = +d.k; const ok = Q.picked === q.answer; Q.log.push({ q, ok }); if (ok) Q.score += Math.round(100 / Q.list.length); TS.renderPanel(true); };
  ACT.qnext = () => { Q.i++; if (Q.i >= Q.list.length) endRound(); TS.renderPanel(); qEnter(); };
  ACT.qsee = d => { TS.setFocus(d.k.split(',')); };
  ACT.qexit = () => { Q.mode = null; TS.hideBanner(); S.onPick = null; TS.setFocus(null, { fly: false }); TS.renderPanel(); };

  /* ============================================================
   *  Modo 4 · Análisis
   * ============================================================ */
  let paretoSel = null;
  function analisisView() {
    const mx = Math.max(...DATA.pareto.map(r => r.ot)), crit = DATA.refs.filter(r => r.sev === 'CRÍTICO');
    const min = g => DATA.fallas.filter(f => f.grupo === g).reduce((a, f) => a + (f.total || f.min || 0), 0);
    const sections = Object.keys(COMP).map(id => ({ id, n: TS.fallasForComp(id).length })).filter(x => x.n).sort((a, b) => b.n - a.n), sm = Math.max(1, ...sections.map(x => x.n));
    const corr = DATA.fallas.filter(f => f.tipo !== 'PreventiveMaintenance').length, tot = DATA.fallas.reduce((a, f) => a + (f.total || f.min || 0), 0);
    return `<div class="p-head"><div class="p-sys">Modo 4</div><div class="p-title">Análisis de fallas y refacciones</div></div>
    <div class="p-body"><p class="p-desc">Toca una barra del Pareto para ver en el 3D qué piezas intervienen. También puedes pintar el modelo por severidad de refacciones o por cantidad de OT.</p>
      <div class="kpis"><div class="kpi"><b>${DATA.fallas.length}</b><span>OT desde ene-2025</span></div><div class="kpi"><b>${corr}</b><span>correctivas y de apoyo</span></div><div class="kpi"><b>${Math.round(tot / 60)} h</b><span>de trabajo acumulado</span></div><div class="kpi"><b>${crit.length}</b><span>refacciones críticas</span></div></div>
      <div class="btns"><button class="chip ${S.heat === 'refs' ? 'on' : ''}" data-act="aheat" data-h="refs">Mapa: refacciones</button><button class="chip ${S.heat === 'fallas' ? 'on' : ''}" data-act="aheat" data-h="fallas">Mapa: fallas (OT)</button><button class="chip ${S.heat === 'none' ? 'on' : ''}" data-act="aheat" data-h="none">Apagar mapa</button></div>
      <h3 class="sec">Pareto de OT</h3>
      ${DATA.pareto.map((r, i) => `<button class="bar ${paretoSel === i ? 'on' : ''}" data-act="pareto" data-i="${i}"><span class="lb">${esc(sentence(r.grupo))}</span><span class="tr"><i style="width:${r.ot / mx * 100}%"></i></span><span class="v">${r.ot} · ${Math.round(min(r.grupo) / 60 * 10) / 10} h</span></button>`).join('')}
      <p class="note">Fuente: hoja FALLAS REPETITIVAS (56 OT cerradas). Las barras muestran OT y horas de trabajo. Las inspecciones programadas y la documentación no son fallas.</p>
      <h3 class="sec">OT por sección</h3>
      ${sections.map(x => `<button class="bar" data-act="asec" data-id="${x.id}"><span class="lb" style="color:${COMP[x.id].color}">${esc(COMP[x.id].name)}</span><span class="tr"><i style="width:${x.n / sm * 100}%;background:${COMP[x.id].color}"></i></span><span class="v">${x.n}</span></button>`).join('')}
      <h3 class="sec">Refacciones críticas (${crit.length})</h3>
      ${crit.map((r, i) => `<button class="row click" data-act="acrit" data-i="${i}"><div class="top"><b>${esc(r.desc.length > 70 ? r.desc.slice(0, 68) + '…' : r.desc)}</b>${TS.sevTag(r.sev)}</div><div class="sub">${esc(r.uds || '')} · ${esc(r.parte)}</div></button>`).join('')}
    </div>`;
  }
  ACT.aheat = d => TS.setHeat(d.h);
  ACT.pareto = d => {
    const i = +d.i, g = DATA.pareto[i].grupo; paretoSel = paretoSel === i ? null : i;
    if (paretoSel === null) { TS.setFocus(null, { fly: false }); TS.renderPanel(true); return; }
    const keys = DATA.grupoElem[g];
    if (!keys || !keys.length) { TS.setFocus(null, { fly: false }); TS.setView('iso'); TS.toast('Estas OT son inspecciones o trámites del equipo completo'); }
    else TS.setFocus(keys);
    TS.renderPanel(true);
  };
  ACT.asec = d => { paretoSel = null; const ks = Object.keys(ELEM).filter(k => ELEM[k].comp === d.id && TS.fallasFor(k).length); TS.setFocus(ks.length ? ks : ['comp:' + d.id]); TS.renderPanel(true); };
  ACT.acrit = d => { const r = DATA.refs.filter(x => x.sev === 'CRÍTICO')[+d.i]; if (r && r.elems.length) TS.setFocus(r.elems); };

  /* ---------- registro de los modos ---------- */
  TS.MODE_RENDER.ruta = rutaView; TS.MODE_RENDER.practica = practicaView; TS.MODE_RENDER.analisis = analisisView;
  TS.MODE_RENDER['ruta:after'] = () => { if (R.fid && !R.done) { const n = $('#rNote'); } };
  window.MODES = {
    enter(m) { if (m === 'ruta' && R.fid && !R.done) rutaGo(); if (m === 'practica' && Q.mode && Q.i < Q.list.length) qEnter(); if (m === 'analisis') TS.setView('iso'); },
    leave(from) { if (from === 'practica') { S.onPick = null; TS.hideBanner(); } if (from === 'analisis') { paretoSel = null; } },
    openTask(fid, code) { const f = fichaOf(fid); if (!f) return; R.fid = fid; R.i = Math.max(0, f.items.findIndex(x => x.codigo === code)); R.res = []; R.done = false; R.photo = true; TS.renderPanel(); rutaGo(); },
    ready() { },
    state: { R, Q }
  };
})();
