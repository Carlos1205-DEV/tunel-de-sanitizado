/* © 2026 Jose Carlos Trejo Espinosa. Todos los derechos reservados. */
/* Regenera las imágenes de la guía (app/img/guia_*.jpg) con Playwright.
 * Uso: node tools/capturas_guia.js   (Chromium ya instalado; tarda varios minutos)
 * En otra máquina cambia los ids de elementos (transmision:7…) y las posiciones de cámara. */
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = ROOT + '/app/img/';
const URL = 'file://' + ROOT + '/app/index.html';
const SOLO = process.argv.slice(2);                       // opcional: solo estas (ej. node tools/capturas_guia.js pieza tareas)
const quiero = n => !SOLO.length || SOLO.includes(n.replace('guia_', ''));
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  p.on('pageerror', e => console.log('PAGEERROR', e.message));
  await p.addInitScript(() => { try {
    localStorage.setItem('ts01_calidad', 'Media');
    const mk = (d, fid, ficha, orden, nombre, res) => ({ id: Date.parse(d), iso: new Date(d).toISOString(), ficha, orden, fid, nombre, total: res.length, res });
    const CM = ['TS01-INSP-ELEC-01', 'TS01-INSP-GRAL-01', 'TS01-INSP-GRAL-02', 'TS01-INSP-MEC-01', 'TS01-INSP-MEC-02', 'TS01-INSP-MEC-03', 'TS01-INSP-MEC-04', 'TS01-INSP-MEC-05', 'TS01-INSP-MEC-06', 'TS01-INSP-MEC-07', 'TS01-INSP-MEC-08', 'TS01-INSP-MEC-09', 'TS01-PRED-ELEC-01', 'TS01-PREV-ELEC-02', 'TS01-PREV-MEC-01'];
    const CA = ['TS01-PREV-ELEC-01', 'TS01-PREV-MEC-02', 'TS01-PREV-MEC-03', 'TS01-PREV-MEC-04', 'TS01-PREV-MEC-05', 'TS01-PREV-MEC-06', 'TS01-PREV-MEC-07'];
    const res = (cods, malos) => cods.map((c, i) => { const cl = malos[i] || 'ok'; return { codigo: c, min: 5, texto: 'tarea de ejemplo', estado: cl, nota: cl === 'anom' ? 'Ejemplo' : '', lec: null, alerta: '', puntos: [] }; });
    const M = 'OP-TS01-INSP-GRAL-EO-1M', A = 'OP-TS01-PREV-MEC/ELEC-EP-1A';
    localStorage.setItem('ts01_hist', JSON.stringify([
      mk('2026-10-09T08:10:00', 'mensual', 'OT mensual', M, 'Técnico de ejemplo', res(CM, { 2: 'anom', 13: 'skip' })),
      mk('2026-10-02T08:05:00', 'anual', 'OT anual', A, 'Operador de ejemplo', res(CA, { 3: 'skip' })),
      mk('2026-09-11T09:30:00', 'mensual', 'OT mensual', M, 'Técnico de ejemplo', res(CM, { 5: 'anom' }))]));
  } catch (e) {} });
  await p.goto(URL);
  await p.waitForFunction(() => window.__ts && document.getElementById('loading').classList.contains('done'), null, { timeout: 120000 });
  await p.addStyleTag({ content: '.mk{position:fixed;z-index:999;width:34px;height:34px;border-radius:50%;background:#e8352b;color:#fff;font:800 19px sans-serif;display:grid;place-items:center;border:3px solid #fff;box-shadow:0 2px 8px #000a}.box{position:fixed;z-index:998;border:3px solid #e8352b;border-radius:8px;pointer-events:none}' });
  const mark = list => p.evaluate(list => { document.querySelectorAll('.mk,.box').forEach(e => e.remove()); list.forEach(m => { if (m.b) { const d = document.createElement('div'); d.className = 'box'; Object.assign(d.style, { left: m.b[0] + 'px', top: m.b[1] + 'px', width: m.b[2] + 'px', height: m.b[3] + 'px' }); document.body.appendChild(d); } const n = document.createElement('div'); n.className = 'mk'; n.textContent = m.n; n.style.left = m.x + 'px'; n.style.top = m.y + 'px'; document.body.appendChild(n); }); }, list);
  const rect = sel => p.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; }, sel);
  const settle = (n) => p.evaluate(n => { for (let i = 0; i < n; i++) { __ts.despiece.update(0.05); __ts.model.update(0.05); } }, n || 40);   // en Chromium sin GPU los fotogramas son lentos: se adelantan las animaciones a mano
  const shot = async (name, clip) => { if (!quiero(name)) return; await settle(); await p.waitForTimeout(1500); await p.screenshot({ path: OUT + name + '.jpg', type: 'jpeg', quality: 78, timeout: 150000, clip }); console.log('ok', name); };
  await p.evaluate(() => { __ts.setView('iso'); document.querySelector('#menuMas [data-chk="rot"]').click(); }); await p.waitForTimeout(1200);
  const sys = await rect('#sys'), dock = await rect('#dock'), panel = await rect('#panel'), modes = await rect('#modes');
  await mark([{ n: 1, x: modes[0] - 40, y: 10, b: modes }, { n: 2, x: sys[0] + sys[2] - 20, y: sys[1] + 6, b: sys }, { n: 3, x: 640, y: 330 }, { n: 4, x: dock[0] - 14, y: dock[1] - 14, b: dock }, { n: 5, x: panel[0] - 14, y: panel[1] + 30, b: panel }]);
  await shot('guia_mapa'); await mark([]);
  await shot('guia_barra', { x: dock[0] - 6, y: dock[1] - 6, width: dock[2] + 12, height: dock[3] + 12 });
  await p.evaluate(() => { __ts.select({ kind: 'elem', id: 'transmision:21' }); }); await p.waitForTimeout(800);
  const hero = await rect('#panelBody > :first-child'), tabs = await rect('.tabs'), btns = await rect('#panelBody .btns');
  await mark([{ n: 'A', x: panel[0] + 10, y: hero[1] + 6, b: hero }, { n: 'B', x: tabs[0] - 12, y: tabs[1] - 6, b: tabs }, { n: 'C', x: btns[0] - 12, y: btns[1] - 8, b: btns }]);
  await shot('guia_pieza'); await mark([]);
  await p.evaluate(() => { __ts.S.tab = 'tareas'; __ts.renderPanel(); }); await p.waitForTimeout(500);
  await shot('guia_tareas', { x: panel[0], y: panel[1], width: panel[2], height: panel[3] });
  await p.evaluate(() => { __ts.S.tab = 'resumen'; __ts.renderPanel(); });
  await p.evaluate(() => { __ts.select({ kind: 'comp', id: 'transmision' }); __ts.desStartComp('transmision', 'radial'); }); await p.waitForTimeout(800);
  await shot('guia_despiece');
  await p.evaluate(() => { __ts.select(null, { fly: false }); __ts.setView('iso'); }); await p.waitForTimeout(800);
  await p.evaluate(() => { __ts.setRun(true); __ts.setView('banda'); }); await p.evaluate(() => __ts.setXray(false));
  await shot('guia_operacion');
  await p.evaluate(() => { __ts.setRun(false); __ts.setXray(true); __ts.setView('campana'); });
  await shot('guia_rayosx');
  await p.evaluate(() => { __ts.setXray(false); __ts.setView('iso'); }); await p.waitForTimeout(1000);
  await p.evaluate(() => { const s = document.getElementById('sExp'); s.value = 100; s.dispatchEvent(new Event('input')); });
  await shot('guia_explosion');
  await p.evaluate(() => { const s = document.getElementById('sExp'); s.value = 0; s.dispatchEvent(new Event('input')); __ts.setHeat('refs'); });
  await shot('guia_calor');
  await p.evaluate(() => { __ts.setHeat('none'); __ts.setMode('historial'); }); await p.waitForTimeout(800);
  await shot('guia_historial', { x: panel[0], y: panel[1], width: panel[2], height: panel[3] });
  await p.evaluate(() => { __ts.setMode('ruta'); window.MODES.openTask('mensual', 'TS01-PRED-ELEC-01'); }); await p.waitForTimeout(800);
  await shot('guia_ruta');
  await p.evaluate(() => { window.MODES.state.R.fid = null; __ts.setMode('analisis'); });
  await shot('guia_analisis');
  if (!quiero('guia_celular')) { await b.close(); return; }
  const m = await b.newPage({ viewport: { width: 390, height: 844 } });
  await m.addInitScript(() => { try { localStorage.setItem('ts01_calidad', 'Baja'); } catch (e) {} });
  await m.goto(URL);
  await m.waitForFunction(() => window.__ts && document.getElementById('loading').classList.contains('done'), null, { timeout: 120000 });
  await m.evaluate(() => { __ts.setView('iso'); });
  await m.waitForTimeout(2500); await m.screenshot({ path: OUT + 'guia_celular.jpg', type: 'jpeg', quality: 78, timeout: 150000 }); console.log('ok cel');
  await b.close();
})();
