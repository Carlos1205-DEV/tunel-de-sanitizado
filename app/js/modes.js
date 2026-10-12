/* © 2026 Jose Carlos Trejo Espinosa. Todos los derechos reservados. */
/* Modos de la aplicación: Ruta guiada (tareas de las OT mensual y anual, con PDF al terminar), Historial de OT (filtros, PDF, Excel y borrado con PIN) y Análisis de fallas y refacciones */
(function () {
  'use strict';
  const TS = window.TS, S = TS.S, ACT = TS.ACT, DATA = TS.DATA, TASKS = TS.TASKS, COMP = TS.COMP, ELEM = TS.ELEM, $ = TS.$, $$ = TS.$$, esc = TS.esc, store = TS.store, clean = TS.clean, sentence = TS.sentence, tag = TS.tag;
  const CLAVES = [['B', 'Se realizó, todo bien'], ['BP', 'Se realizó, pero hay pendientes'], ['BCF', 'Se realizó, se corrigió la falla'], ['X', 'No se realizó'], ['N/A', 'No aplica']];
  const SAFETY = ['Utilizar equipos de protección personal (EPP) según la actividad.', 'Asegurarse de la correcta conexión a tierra y reportar fallos.', 'Verificar si requiere paro del equipo.', 'Aplicar el procedimiento de bloqueo y etiquetado de energías (LOTO) para riesgos eléctricos, neumáticos o mecánicos.', 'Revisar el correcto funcionamiento de las guardas de seguridad mientras la máquina esté operando.'];
  const nameOf = key => key.indexOf('comp:') === 0 ? COMP[key.slice(5)].name : clean(ELEM[key].n);
  const short = s => s.length > 52 ? s.slice(0, 50) + '…' : s;
  const otOf = id => DATA.ots.find(o => o.id === id);                 // OT maestra (mensual / anual); sus tareas son los pasos de la ruta
  const EQUIPO = 'Túnel de Sanitizado 01 (OP TS01)', LUGAR = 'Empaque · Línea Cortes · Planta 2 Querétaro · Qualtia';

  /* ============================================================
   *  Modo 2 · Ruta guiada
   * ============================================================ */
  const R = { fid: null, i: 0, res: [], name: store.get('ts01_tecnico', ''), t0: null, done: false, photo: true, rec: null, f: { tec: '', ficha: '', desde: '', hasta: '' } };
  const HV = { id: null, ask: null };                                  // OT abierta con «Ver» y cuadro del PIN
  const otMin = f => f.items.reduce((a, it) => a + (it.min || 0), 0);
  const needsReading = it => /temperatura/i.test(it.texto) && /amperaje/i.test(it.texto);
  function evalReading(l) {
    const t = parseFloat(String(l.temp).replace(',', '.')), a = parseFloat(String(l.amp).replace(',', '.')), v = parseFloat(String(l.volt).replace(',', '.')), out = [];
    if (!isNaN(t) && t > 42) out.push('temperatura mayor de 42 °C'); if (!isNaN(a) && a > 1.5) out.push('amperaje mayor de 1.5 A'); if (!isNaN(v) && (v < 198 || v > 242)) out.push('voltaje fuera de 220 V ±10 %');
    return out;
  }
  function counts(res) { const c = { B: 0, BP: 0, BCF: 0, X: 0, 'N/A': 0 }; res.forEach(r => { if (r && c[r.clave] !== undefined) c[r.clave]++; }); return c; }
  function resumenCorto(res) { const c = counts(res); return CLAVES.map(k => k[0] + ' ' + c[k[0]]).join(' · '); }
  const pendientes = res => res.filter(r => r && (r.clave === 'BP' || r.clave === 'X' || r.alerta));
  const readingText = l => `Temperatura ${l.temp || '—'} °C · Amperaje ${l.amp || '—'} A · Voltaje ${l.volt || '—'} V`;

  /* ---------- historial guardado en este equipo (localStorage) ---------- */
  function migrar() {                                                  // OT guardadas por versiones anteriores (sin id, o con los pasos 1101… de la rutina en vez de la Tarea No. de la OT)
    const h = store.get('ts01_hist', []); let cambio = false;
    h.forEach((x, i) => {
      if (!x.id) { x.id = Date.now() - 1000 * (i + 1); cambio = true; }
      const o = otOf(x.fid);
      if (o && !x.orden) { x.orden = o.orden; x.ficha = o.corto; cambio = true; }
      (x.res || []).forEach(r => {
        const t = r && o && o.items.find(it => it.rutina === r.codigo);
        if (t) { r.codigo = t.codigo; r.texto = t.texto; delete r.per; cambio = true; }
      });
      if (!x.ficha) x.ficha = '';
    });
    if (cambio) store.set('ts01_hist', h);
  }
  migrar();
  const histAll = () => store.get('ts01_hist', []);
  const fechaTxt = h => h.iso ? new Date(h.iso).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }) : (h.fecha || '');
  const hayFiltro = () => !!(R.f.tec || R.f.ficha || R.f.desde || R.f.hasta);
  function histFiltrado() {
    const F = R.f;
    return histAll().filter(h => {
      if (F.tec && (h.nombre || 'Sin nombre') !== F.tec) return false;
      if (F.ficha && h.fid !== F.ficha) return false;
      const d = h.iso ? h.iso.slice(0, 10) : null;
      if (F.desde && d && d < F.desde) return false;
      if (F.hasta && d && d > F.hasta) return false;
      return true;
    });
  }

  function rutaView() {
    if (!R.fid) {
      return `<div class="p-head"><div class="p-sys">Modo 2</div><div class="p-title">Ruta guiada de tareas</div></div>
      <div class="p-body"><p class="p-desc">Haz, una por una, las <b>tareas de las órdenes de trabajo (OT)</b> del túnel. Cada tarea te lleva a la pieza en el 3D, muestra la foto de referencia y registra su clave. Al terminar se descarga el reporte en PDF y la OT queda guardada en el historial.</p>
      <details class="callout stop" style="margin:10px 0"><summary style="cursor:pointer;font-weight:600">Seguridad antes de empezar</summary><ul style="margin:8px 0 0 18px;line-height:1.55">${SAFETY.map(s => `<li>${esc(s)}</li>`).join('')}</ul></details>
      <label class="field"><span>Nombre del técnico</span><input id="rName" value="${esc(R.name)}" placeholder="Tu nombre" autocomplete="name"></label>
      ${DATA.ots.map(o => `<button class="card click" data-act="rstart" data-id="${o.id}"><b class="t">${esc(o.corto)} · ${esc(o.titulo)}</b><small>${esc(o.orden)} · ${o.items.length} tareas · ~${otMin(o)} min</small></button>`).join('')}
      <h3 class="sec">Claves de cada tarea</h3>
      <table class="t">${CLAVES.map(c => `<tr><td><b>${c[0]}</b></td><td>${esc(c[1])}</td></tr>`).join('')}</table>
      <div class="callout" style="margin-top:10px">Cada OT que terminas se guarda en <b>③ Historial</b> (arriba): ahí puedes filtrarlas, volver a bajar su PDF o exportarlas a Excel. <button class="chip" style="margin-left:4px" data-act="mode" data-m="historial">Abrir historial</button></div>
      </div>`;
    }
    const f = otOf(R.fid);
    if (R.done) return rutaResumen(f);
    const it = f.items[R.i], prev = R.res[R.i] || {}, pct = Math.round(R.i / f.items.length * 100), lec = prev.lec || {};
    const puntos = it.puntos.filter(p => p !== 'ALL');
    return `<div class="p-head"><div class="p-sys">${esc(f.corto)} · ${esc(f.orden)} · tarea ${R.i + 1} de ${f.items.length}</div><div class="prog"><i style="width:${pct}%"></i></div></div>
    <div class="p-body">
      <div class="chips" style="margin-bottom:6px">${puntos.length ? puntos.map(p => `<button class="chip on" data-act="rfly" data-k="${p}">📍 ${esc(short(nameOf(p)))}</button>`).join('') : '<button class="chip on" data-act="rfly" data-k="ALL">📍 Vista general</button>'}</div>
      <div class="step-text">${esc(sentence(it.texto))}</div>
      ${it.nota ? `<p class="note" style="margin:6px 0 0">ℹ ${esc(it.nota)}</p>` : ''}
      <div class="badges">${tag('Tarea No. ' + it.codigo)}${tag(it.sistema + ' · ' + it.clase)}${tag(TS.FREQ[it.frec] || it.frec)}${tag(TS.nivelLabel(it.nivel))}${it.min ? tag(it.min + ' min') : ''}${it.paro === 'SI' ? tag('Requiere paro', 'paro') : ''}</div>
      ${it.paro === 'SI' ? '<div class="callout stop"><b>⛔ Requiere paro del equipo.</b> Detén la máquina y aplica bloqueo y etiquetado (LOTO) antes de intervenir.</div>' : ''}
      ${it.herr ? `<p class="note" style="margin-top:8px">Herramientas: ${esc(sentence(it.herr))}</p>` : ''}
      ${needsReading(it) ? `<h3 class="sec">Lecturas</h3><div class="trio">
        <label class="field"><span>Temperatura (°C) · máx 42</span><input id="rTemp" inputmode="decimal" value="${esc(lec.temp || '')}" placeholder="°C"></label>
        <label class="field"><span>Amperaje (A) · máx 1.5</span><input id="rAmp" inputmode="decimal" value="${esc(lec.amp || '')}" placeholder="A"></label>
        <label class="field"><span>Voltaje (V) · 220</span><input id="rVolt" inputmode="decimal" value="${esc(lec.volt || '')}" placeholder="V"></label></div>` : ''}
      <label class="field"><span>Observaciones (obligatorias con BP, BCF o X)</span><textarea id="rNote" placeholder="Describe lo que encontraste">${esc(prev.nota || '')}</textarea></label>
      <div class="claves" role="group" aria-label="Clave de la tarea">${CLAVES.map(c => `<button class="clave ${c[0].replace('/', '')}${prev.clave === c[0] ? ' on' : ''}" data-act="rclave" data-c="${c[0]}" title="${esc(c[1])}"><b>${c[0]}</b>${esc(c[1].replace('Se realizó, ', ''))}</button>`).join('')}</div>
      <div class="btns"><button class="btn sm" data-act="rprev" ${R.i === 0 ? 'disabled' : ''}>← Anterior</button><button class="btn sm" data-act="rphoto">${R.photo ? 'Ocultar' : 'Ver'} foto de referencia</button><button class="btn sm" data-act="rexit">Salir</button></div>
      ${R.photo && it.foto ? `<img class="photo" src="${TS.imgSrc(it.foto)}" alt="Foto de referencia de la tarea ${esc(it.codigo)}"><p class="note">Ayuda visual de planta (paso ${esc(it.rutina)}).</p>` : ''}
    </div>`;
  }
  function rutaResumen(f, hv, back) {
    const h = hv || R.rec || { res: R.res }, res = h.res, c = counts(res), ok = c.B + c.BCF, pend = pendientes(res);
    return `<div class="p-head"><div class="p-sys">${esc(f.corto || f.titulo)} · ${esc(f.orden || h.orden || '')}${h.iso ? ' · ' + esc(fechaTxt(h)) : ''}</div><div class="score">${Math.round(ok / (res.length || 1) * 100)}%</div><div class="note">${esc(resumenCorto(res))}${h.nombre ? ' · ' + esc(h.nombre) : ''}</div></div>
    <div class="p-body">
      <div class="btns" style="margin-top:0"><button class="btn pri" data-act="hpdf" data-id="${h.id || ''}">Descargar PDF</button><button class="btn" data-act="rcopy" data-id="${h.id || ''}">Copiar reporte</button>${back ? `<button class="btn" data-act="${back}">← Volver al historial</button>` : '<button class="btn" data-act="rexit">Otra OT</button>'}</div>
      ${pend.length ? `<h3 class="sec">Pendientes para seguimiento</h3>${pend.map(r => `<div class="row"><div class="top"><b>${esc(sentence(r.texto))}</b>${tag(r.clave, r.clave === 'X' ? 'crit' : 'media')}</div>${r.nota ? `<div class="sub">${esc(r.nota)}</div>` : ''}${r.alerta ? `<div class="sub" style="color:var(--crit)">Lectura fuera de rango: ${esc(r.alerta)}</div>` : ''}${r.puntos && r.puntos[0] && r.puntos[0] !== 'ALL' ? `<button class="chip" style="margin-top:6px" data-act="rfly" data-k="${r.puntos[0]}">Ver pieza</button> <button class="chip" style="margin-top:6px" data-act="rexplore" data-k="${r.puntos[0]}">Historial y refacciones</button>` : ''}</div>`).join('')}` : '<div class="callout" style="margin:12px 0">Sin pendientes. Buen trabajo.</div>'}
      <h3 class="sec">Tareas de la OT</h3>
      <table class="t">${res.map(r => r ? `<tr><td>${esc(r.codigo)}</td><td>${esc(sentence(r.texto))}${r.lec ? `<br><span class="note">${esc(readingText(r.lec))}</span>` : ''}${r.nota && r.clave === 'B' ? `<br><span class="note">${esc(r.nota)}</span>` : ''}</td><td><b>${esc(r.clave)}</b></td></tr>` : '').join('')}</table>
    </div>`;
  }
  function rutaGo() {
    const f = otOf(R.fid); if (!f || R.done) return; const it = f.items[R.i];
    if (it.paro === 'SI' && S.run) TS.setRun(false);
    if (it.puntos[0] === 'ALL') { TS.setFocus(null, { fly: false }); TS.setView('iso'); } else TS.setFocus(it.puntos);
  }
  function readDraft() {
    const g = id => ($('#' + id) || {}).value || '';
    return { nota: g('rNote').trim(), lec: $('#rTemp') ? { temp: g('rTemp').trim(), amp: g('rAmp').trim(), volt: g('rVolt').trim() } : null };
  }
  ACT.rstart = d => {
    const nm = $('#rName'); if (nm) { R.name = nm.value.trim(); store.set('ts01_tecnico', R.name); }
    R.fid = d.id; R.i = 0; R.res = []; R.done = false; R.rec = null; R.t0 = new Date(); R.photo = true; TS.stopAuto(); TS.renderPanel(); rutaGo();
  };
  ACT.rclave = d => {
    const f = otOf(R.fid), it = f.items[R.i], dr = readDraft(), c = d.c;
    if (['BP', 'BCF', 'X'].includes(c) && !dr.nota) { TS.toast('Escribe la observación para la clave ' + c); const n = $('#rNote'); if (n) n.focus(); return; }
    let alerta = ''; if (dr.lec) { const out = evalReading(dr.lec); alerta = out.join(', '); if (out.length && c === 'B') { TS.toast('Hay una lectura fuera de rango: usa BP o BCF y anótalo'); ['rTemp', 'rAmp', 'rVolt'].forEach(id => $('#' + id) && $('#' + id).classList.add('bad')); return; } }
    R.res[R.i] = { codigo: it.codigo, min: it.min, texto: it.texto, clave: c, nota: dr.nota, lec: dr.lec, alerta, puntos: it.puntos };
    if (R.i + 1 >= f.items.length) {
      R.done = true; R.rec = saveReport(f); TS.setFocus(null, { fly: false }); TS.setView('iso'); TS.renderPanel();
      descargarPDF(R.rec, true);                                       // el PDF de cada OT se genera solo al terminar
    }
    else { R.i++; TS.renderPanel(); rutaGo(); }
  };
  ACT.rprev = () => { if (R.i > 0) { R.i--; TS.renderPanel(); rutaGo(); } };
  ACT.rphoto = () => { const keep = readDraft(); const cur = R.res[R.i] || {}; R.res[R.i] = Object.assign(cur, { nota: keep.nota, lec: keep.lec || cur.lec, clave: cur.clave }); R.photo = !R.photo; TS.renderPanel(true); if (!cur.clave) delete R.res[R.i]; };
  ACT.rexit = () => { R.fid = null; R.done = false; R.rec = null; TS.setFocus(null, { fly: false }); TS.setView('iso'); TS.renderPanel(); };
  ACT.rfly = d => { if (d.k === 'ALL') { TS.setFocus(null, { fly: false }); TS.setView('iso'); } else TS.focusKeys([d.k]); };
  ACT.rexplore = d => { TS.setMode('explorar'); const k = d.k; if (k.indexOf('comp:') === 0) TS.select({ kind: 'comp', id: k.slice(5) }, { tab: 'fallas' }); else TS.select({ kind: 'elem', id: k }, { tab: 'fallas' }); };
  function saveReport(f) {
    const hist = histAll(), now = new Date();
    const rec = { id: now.getTime(), iso: now.toISOString(), inicio: R.t0 ? R.t0.toISOString() : null, ficha: f.corto, titulo: f.titulo, orden: f.orden, fid: f.id, nombre: R.name, total: f.items.length, res: R.res.slice() };
    hist.unshift(rec);
    store.set('ts01_hist', hist);                                      // sin límite: se conservan todas las OT
    return rec;
  }
  const recDe = id => (id && histAll().find(x => String(x.id) === String(id))) || R.rec;
  function reportText(h) {
    const o = otOf(h.fid) || { corto: h.ficha, titulo: h.titulo || '', orden: h.orden || '' };
    let s = `REPORTE DE OT — ${EQUIPO.toUpperCase()} · ${LUGAR}\nOrden No.: ${o.orden}\nDescripción: ${o.titulo}\nFecha: ${fechaTxt(h)}\nTécnico: ${h.nombre || '—'}\nResultado: ${resumenCorto(h.res)}\n\n`;
    h.res.forEach(r => { if (!r) return; s += `Tarea ${r.codigo} [${r.clave}] ${sentence(r.texto)}${r.lec ? ' | ' + readingText(r.lec) : ''}${r.alerta ? ' | FUERA DE RANGO: ' + r.alerta : ''}${r.nota ? ' | Obs: ' + r.nota : ''}\n`; });
    return s;
  }
  function copyText(txt, ok) {
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => TS.toast(ok), () => { const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); TS.toast(ok); } catch (e) { TS.toast('No se pudo copiar'); } ta.remove(); });
  }
  ACT.rcopy = d => { const h = recDe(d && d.id) || { fid: R.fid, res: R.res }; copyText(reportText(h), 'Reporte copiado'); };

  /* ============================================================
   *  Modo 3 · Historial de OT
   * ============================================================ */
  function histView() {
    if (HV.id) {
      const h = histAll().find(x => String(x.id) === String(HV.id));
      if (h) return rutaResumen(otOf(h.fid) || { corto: h.ficha, titulo: h.titulo || h.ficha, orden: h.orden }, h, 'hback');
      HV.id = null;
    }
    const all = histAll(), list = histFiltrado();
    const tecs = Array.from(new Set(all.map(h => h.nombre || 'Sin nombre'))).sort();
    const opt = (v, t, sel) => `<option value="${esc(v)}" ${v === sel ? 'selected' : ''}>${esc(t)}</option>`;
    return `<div class="p-head"><div class="p-sys">Modo 3</div><div class="p-title">Historial de OT (${all.length})</div></div>
      <div class="p-body"><p class="p-desc">Aquí quedan todas las OT terminadas en <b>② Ruta guiada</b> con sus tareas, de la más reciente a la más antigua.</p>
      ${cuadroBorrar(list)}
      ${all.length ? `<div class="hfil">
          <label class="field"><span>Técnico</span><select data-hf="tec">${opt('', 'Todos', R.f.tec)}${tecs.map(t => opt(t, t, R.f.tec)).join('')}</select></label>
          <label class="field"><span>OT</span><select data-hf="ficha">${opt('', 'Todas', R.f.ficha)}${DATA.ots.map(o => opt(o.id, o.corto + ' · ' + o.orden, R.f.ficha)).join('')}</select></label>
          <label class="field"><span>Desde</span><input type="date" data-hf="desde" value="${esc(R.f.desde)}"></label>
          <label class="field"><span>Hasta</span><input type="date" data-hf="hasta" value="${esc(R.f.hasta)}"></label>
        </div>
        <div class="btns"><button class="btn" data-act="hxls" ${list.length ? '' : 'disabled style="opacity:.4"'}>Exportar a Excel (${list.length})</button>${hayFiltro() ? '<button class="btn sm" data-act="hclear">Quitar filtros</button>' : ''}</div>
        ${list.length ? list.slice(0, 60).map(h => { const p = pendientes(h.res).length; return `<div class="card hrow"><div><b class="t" style="font-size:16px">${esc(h.ficha)}</b><small>${esc(h.orden || '')} · ${h.res.length} tareas</small><small>${esc(resumenCorto(h.res))}</small><small>${esc(fechaTxt(h))} · ${esc(h.nombre || 'Sin nombre')}${p ? ` · <span style="color:var(--crit)">${p} pendiente${p > 1 ? 's' : ''}</span>` : ''}</small></div>
          <div class="btns" style="margin:6px 0 0"><button class="btn sm" data-act="rhist" data-id="${h.id}">Ver</button><button class="btn sm pri" data-act="hpdf" data-id="${h.id}">PDF</button><button class="btn sm" data-act="hdel" data-id="${h.id}" title="Borrar esta OT" aria-label="Borrar esta OT" style="margin-left:auto">🗑</button></div></div>`; }).join('') + (list.length > 60 ? `<p class="note">Se muestran las 60 más recientes de ${list.length}. Usa los filtros o exporta a Excel para ver todas.</p>` : '')
          : '<div class="empty">Ninguna OT coincide con los filtros.</div>'}`
        : '<div class="empty">Aún no hay OT terminadas. Haz las tareas de una OT en ② Ruta guiada y aparecerá aquí.</div>'}
      ${list.length ? `<div class="btns" style="margin-top:12px"><button class="btn sm warn" data-act="hdelall">🗑 ${hayFiltro() ? (list.length === 1 ? 'Borrar la filtrada' : `Borrar las ${list.length} filtradas`) : 'Borrar historial'}</button><button class="btn sm" data-act="hpin">Cambiar PIN</button></div>` : ''}
      <p class="note" style="margin-top:10px">El historial se guarda en este equipo (navegador). Para conservarlo en otro lado, exporta a Excel o guarda los PDF. Para borrar se pide el PIN de supervisor.</p>
      </div>`;
  }
  $('#panelBody').addEventListener('change', e => {                    // filtros del historial
    const k = e.target.dataset && e.target.dataset.hf; if (!k) return;
    R.f[k] = e.target.value; TS.renderPanel(true);
  });
  ACT.hback = () => { HV.id = null; TS.renderPanel(); };
  ACT.rhist = d => { HV.id = d.id; TS.renderPanel(); $('#panelBody').scrollTop = 0; };
  ACT.hpdf = d => { const h = recDe(d.id); if (h) descargarPDF(h); };
  ACT.hclear = () => { R.f = { tec: '', ficha: '', desde: '', hasta: '' }; TS.renderPanel(true); };
  ACT.hxls = () => exportarCSV(histFiltrado(), 'Historial_OT_Tunel_Sanitizado_01');

  /* ---------- archivos: PDF y Excel (CSV) ---------- */
  // en el enlace publicado el visor bloquea las descargas; en la versión de un solo archivo se descargan normal
  function guardarArchivo(blob, nombre, auto) {
    if (window.claude) { if (!auto) TS.toast('En el enlace publicado no se pueden descargar archivos. Usa la versión de un solo archivo.'); return false; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    return true;
  }
  const limpio = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');
  function exportarCSV(list, nombre, aviso) {
    const rows = [['Fecha', 'Hora', 'Técnico', 'OT (Orden No.)', 'OT', 'Tarea', 'Tarea No.', 'Actividad', 'Clave', 'Significado', 'Temperatura (°C)', 'Amperaje (A)', 'Voltaje (V)', 'Fuera de rango', 'Observaciones']];
    list.slice().reverse().forEach(h => {
      const d = h.iso ? new Date(h.iso) : null;
      h.res.forEach((r, i) => { if (r) rows.push([d ? d.toLocaleDateString('es-MX') : (h.fecha || ''), d ? d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '', h.nombre || '', h.orden || '', h.ficha, i + 1, r.codigo, sentence(r.texto), r.clave, (CLAVES.find(k => k[0] === r.clave) || [])[1] || '', r.lec ? r.lec.temp : '', r.lec ? r.lec.amp : '', r.lec ? r.lec.volt : '', r.alerta || '', r.nota || '']); });
    });
    const csv = '﻿' + rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\r\n');
    if (window.claude) {
      (navigator.clipboard ? navigator.clipboard.writeText(csv.slice(1)) : Promise.reject()).then(() => TS.toast(aviso ? aviso + ' (copiado: pégalo en Excel)' : 'Historial copiado: pégalo en Excel'), () => TS.toast('No se pudo copiar'));
      return;
    }
    if (guardarArchivo(new Blob([csv], { type: 'text/csv;charset=utf-8' }), nombre + '_' + new Date().toISOString().slice(0, 10) + '.csv')) TS.toast(aviso || 'Historial exportado (' + list.length + ' OT)');
  }

  /* ---------- borrar del historial: pide PIN de supervisor y antes baja un respaldo en Excel ---------- */
  const PIN_INICIAL = '2026';
  const pinActual = () => store.get('ts01_pin', null) || PIN_INICIAL;
  function pedir(ask) { HV.ask = ask; TS.renderPanel(true); const i = $('#hPin'); if (i) { $('#panelBody').scrollTop = 0; i.focus(); } }
  ACT.hdel = d => pedir({ tipo: 'uno', id: d.id });
  ACT.hdelall = () => pedir({ tipo: 'lista' });
  ACT.hpin = () => pedir({ tipo: 'pin' });
  ACT.hcancel = () => { HV.ask = null; TS.renderPanel(true); };
  ACT.hok = () => {
    const ask = HV.ask; if (!ask) return;
    const pin = ($('#hPin') || {}).value || '';
    if (pin !== pinActual()) { TS.toast('PIN incorrecto'); $('#hPin').value = ''; $('#hPin').focus(); return; }
    if (ask.tipo === 'pin') {
      const nuevo = (($('#hPin2') || {}).value || '').trim();
      if (!/^\d{4,8}$/.test(nuevo)) { TS.toast('El PIN nuevo debe tener de 4 a 8 números'); $('#hPin2').focus(); return; }
      store.set('ts01_pin', nuevo); HV.ask = null; TS.renderPanel(true); TS.toast('PIN cambiado'); return;
    }
    const todos = histAll();
    const quitar = ask.tipo === 'uno' ? todos.filter(h => String(h.id) === String(ask.id)) : histFiltrado();
    if (!quitar.length) { HV.ask = null; TS.renderPanel(true); return; }
    const ids = new Set(quitar.map(h => String(h.id)));
    exportarCSV(quitar, 'Respaldo_borrado_Tunel_Sanitizado_01', quitar.length === 1 ? 'OT borrada; se bajó un respaldo en Excel' : quitar.length + ' OT borradas; se bajó un respaldo en Excel');
    store.set('ts01_hist', todos.filter(h => !ids.has(String(h.id))));
    if (ask.tipo === 'lista') R.f = { tec: '', ficha: '', desde: '', hasta: '' };
    HV.ask = null; TS.renderPanel(true);
  };
  $('#panelBody').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.target.id === 'hPin' || e.target.id === 'hPin2')) { e.preventDefault(); ACT.hok(); } });
  function cuadroBorrar(list) {
    const ask = HV.ask; if (!ask) return '';
    let t, p, b = 'Borrar';
    if (ask.tipo === 'pin') { t = 'Cambiar el PIN de supervisor'; p = 'Escribe el PIN actual y el nuevo (de 4 a 8 números).'; b = 'Cambiar PIN'; }
    else if (ask.tipo === 'uno') { const h = histAll().find(x => String(x.id) === String(ask.id)) || {}; t = '¿Borrar esta OT?'; p = `${esc(h.ficha || '')} · ${esc(fechaTxt(h))} · ${esc(h.nombre || 'Sin nombre')}`; }
    else { t = hayFiltro() ? (list.length === 1 ? '¿Borrar la OT filtrada?' : `¿Borrar las ${list.length} OT filtradas?`) : `¿Borrar todo el historial (${list.length} OT)?`; p = hayFiltro() ? 'Solo se borran las que se ven con los filtros actuales.' : 'Se borran todas las OT guardadas en este equipo.'; }
    return `<div class="callout stop hask"><b>${t}</b><p class="note" style="margin:4px 0 6px">${p}</p>${ask.tipo !== 'pin' ? '<p class="note" style="margin:0 0 6px">Antes de borrar se baja un respaldo en Excel. Esta acción no se puede deshacer.</p>' : ''}
      <label class="field"><span>${ask.tipo === 'pin' ? 'PIN actual' : 'PIN de supervisor'}</span><input id="hPin" type="password" inputmode="numeric" autocomplete="off"></label>
      ${ask.tipo === 'pin' ? '<label class="field"><span>PIN nuevo</span><input id="hPin2" type="password" inputmode="numeric" autocomplete="off"></label>' : ''}
      <div class="btns"><button class="btn warn" data-act="hok">${b}</button><button class="btn" data-act="hcancel">Cancelar</button></div></div>`;
  }

  /* ---------- reporte PDF de una OT (con sus tareas) ---------- */
  function reportePDF(h) {
    const o = otOf(h.fid) || { corto: h.ficha, titulo: h.titulo || h.ficha, orden: h.orden || '' };
    const doc = PDFMini.create(), M = 40, Wd = doc.W - 2 * M, INK = [0.12, 0.13, 0.15], SOFT = [0.42, 0.45, 0.5], AMB = [0.88, 0.64, 0.23];
    const COLR = { B: [0.16, 0.55, 0.3], BCF: [0.1, 0.4, 0.7], BP: [0.75, 0.5, 0.05], X: [0.8, 0.18, 0.15], 'N/A': [0.45, 0.47, 0.5] };
    const cols = [{ t: '#', w: 20 }, { t: 'Tarea No.', w: 88 }, { t: 'Actividad', w: 164 }, { t: 'Min', w: 28 }, { t: 'Clave', w: 34 }, { t: 'Lecturas', w: 74 }, { t: 'Observaciones', w: Wd - 20 - 88 - 164 - 28 - 34 - 74 }];
    const fecha = h.iso ? new Date(h.iso) : null, c = counts(h.res), ok = c.B + c.BCF;
    const dur = h.iso && h.inicio ? Math.max(1, Math.round((new Date(h.iso) - new Date(h.inicio)) / 60000)) : 0;
    let y;
    const encabezado = () => {
      doc.addPage(); doc.rect(0, 0, doc.W, 6, AMB);
      doc.font('bold', 15).text('ORDEN DE TRABAJO · REGISTRO DE TAREAS', M, 38, { color: INK });
      doc.font('', 9.5).text(EQUIPO + ' · ' + LUGAR, M, 52, { color: SOFT });
      doc.line(M, 62, M + Wd, 62, AMB, 1.2);
      y = 76;
    };
    const filaTabla = (vals, bold, fill, clave) => {
      const lines = vals.map((v, i) => doc.wrap(v, cols[i].w - 8, bold || i === 4 ? 'bold' : '', 8.5));
      const hgt = Math.max(...lines.map(l => l.length)) * 10.5 + 7;
      if (y + hgt > doc.H - 60) { encabezado(); filaTabla(cols.map(k => k.t), true, [0.92, 0.93, 0.94]); }
      if (fill) doc.rect(M, y, Wd, hgt, fill);
      let x = M;
      lines.forEach((ls, i) => {
        const color = !bold && i === 4 ? (COLR[clave] || INK) : INK;
        doc.font(bold || i === 4 ? 'bold' : '', 8.5);
        ls.forEach((l, k) => doc.text(l, x + 4, y + 11 + k * 10.5, { color }));
        x += cols[i].w;
      });
      doc.line(M, y + hgt, M + Wd, y + hgt, [0.8, 0.81, 0.83], 0.5);
      y += hgt;
    };
    encabezado();
    // datos generales
    const datos = [['Orden No.', o.orden], ['Descripción', o.titulo], ['Equipo', o.equipo_no ? o.equipo_no + ' · ' + o.equipo : 'OP TS01 · TÚNEL DE SANITIZADO'], ['Tipo / clase', o.tipo ? o.tipo + ' · ' + o.clase : '—'],
      ['Fecha', fecha ? fecha.toLocaleDateString('es-MX', { dateStyle: 'long' }) + ', ' + fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : (h.fecha || '')], ['Técnico', h.nombre || '—']];
    if (dur) datos.push(['Duración', dur + ' min']);
    datos.push(['Resultado', resumenCorto(h.res) + '  (cumplimiento ' + Math.round(ok / (h.res.length || 1) * 100) + ' %)']);
    doc.rect(M, y, Wd, datos.length * 16 + 10, [0.96, 0.96, 0.97], [0.85, 0.86, 0.88]);
    datos.forEach((d, i) => { doc.font('bold', 9.5).text(d[0] + ':', M + 10, y + 18 + i * 16, { color: SOFT }); doc.font('', 9.5).text(d[1], M + 100, y + 18 + i * 16, { color: INK }); });
    y += datos.length * 16 + 26;
    doc.font('bold', 11).text('Tareas de la OT (' + h.res.filter(Boolean).length + ')', M, y, { color: INK }); y += 8;
    filaTabla(cols.map(k => k.t), true, [0.92, 0.93, 0.94]);
    h.res.forEach((r, i) => {
      if (!r) return;
      const lec = r.lec ? `Temp. ${r.lec.temp || '—'} °C\nAmp. ${r.lec.amp || '—'} A\nVolt. ${r.lec.volt || '—'} V` : '';
      filaTabla([String(i + 1), r.codigo, sentence(r.texto), r.min !== undefined ? String(r.min) : (minDe(o, r.codigo) || ''), r.clave, lec, (r.alerta ? 'FUERA DE RANGO: ' + r.alerta + '. ' : '') + (r.nota || '')], false, null, r.clave);
    });
    const pend = pendientes(h.res);
    if (pend.length) {
      y += 18; if (y > doc.H - 120) encabezado();
      doc.font('bold', 11).text('Pendientes para seguimiento', M, y, { color: COLR.X }); y += 6;
      pend.forEach(r => {
        const ls = doc.wrap('• [' + r.clave + '] ' + r.codigo + ' · ' + sentence(r.texto) + (r.nota ? ' — ' + r.nota : '') + (r.alerta ? ' — Lectura fuera de rango: ' + r.alerta : ''), Wd - 10, '', 9.5);
        if (y + ls.length * 12 + 6 > doc.H - 60) encabezado();
        doc.font('', 9.5); ls.forEach(l => { y += 12; doc.text(l, M + 6, y, { color: INK }); }); y += 4;
      });
    }
    // claves
    y += 12; if (y > doc.H - 90) encabezado();
    doc.font('', 8).wrap('Claves: ' + CLAVES.map(k => k[0] + ' = ' + k[1]).join(' · '), Wd, '', 8).forEach(l => { y += 10; doc.text(l, M, y, { color: SOFT }); });
    // firmas
    y += 36; if (y > doc.H - 54) { encabezado(); y += 40; }
    [['Realizó', h.nombre || ''], ['Revisó / supervisor', '']].forEach((s, i) => {
      const x = M + i * (Wd / 2 + 10), w = Wd / 2 - 10;
      doc.line(x, y, x + w, y, INK, 0.7);
      doc.font('bold', 9).text(s[0], x, y + 13, { color: SOFT });
      if (s[1]) doc.font('', 9).text(s[1], x + w, y + 13, { color: INK, align: 'right' });
    });
    // pie de página en todas las hojas
    const N = doc.pageCount;
    for (let p = 0; p < N; p++) {
      doc.onPage(p).font('', 7.5);
      doc.line(M, doc.H - 34, M + Wd, doc.H - 34, [0.85, 0.86, 0.88], 0.5);
      doc.text('Generado con Túnel de Sanitizado 01 interactivo · Desarrollado por Jose Carlos Trejo Espinosa · 2026', M, doc.H - 22, { color: SOFT });
      doc.text(`Página ${p + 1} de ${N}`, M + Wd, doc.H - 22, { color: SOFT, align: 'right' });
    }
    return doc.output();
  }
  const minDe = (o, codigo) => { const it = o && o.items && o.items.find(x => x.codigo === codigo); return it ? String(it.min) : ''; };
  function descargarPDF(h, auto) {
    const nombre = `${limpio(h.ficha)}_${(h.iso || new Date().toISOString()).slice(0, 10)}_${limpio(h.nombre) || 'sin_nombre'}.pdf`;
    if (guardarArchivo(new Blob([reportePDF(h)], { type: 'application/pdf' }), nombre, auto)) TS.toast('PDF guardado: ' + nombre);
    else if (auto) TS.toast('OT guardada en el historial. El PDF se descarga en la versión de un solo archivo.');
  }

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
  TS.MODE_RENDER.ruta = rutaView; TS.MODE_RENDER.historial = histView; TS.MODE_RENDER.analisis = analisisView;
  window.MODES = {
    enter(m) { if (m === 'ruta' && R.fid && !R.done) rutaGo(); if (m === 'analisis' || m === 'historial') TS.setView('iso'); },
    leave(from) { if (from === 'historial') { HV.id = null; HV.ask = null; } if (from === 'analisis') { paretoSel = null; } },
    openTask(fid, code) { const f = otOf(fid); if (!f) return; R.fid = fid; R.i = Math.max(0, f.items.findIndex(x => x.codigo === code)); R.res = []; R.done = false; R.rec = null; R.t0 = new Date(); R.photo = true; TS.renderPanel(); rutaGo(); },
    ready() { },
    state: { R, HV }
  };
})();
