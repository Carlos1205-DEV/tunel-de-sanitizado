/* Túnel de Sanitizado 01 · aplicación 3D interactiva: escena, selección, controles, panel y despiece */
(function () {
  'use strict';
  const TAXO = window.TAXO, DATA = window.DATA, INFO = window.INFO;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => (s === null || s === undefined) ? '' : String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
  };

  /* ============================================================
   *  Catálogo (taxonomía) y enlaces con tareas, refacciones y fallas
   * ============================================================ */
  const COMP = {}, ELEM = {};
  const PALETTE = ['#e0a23a', '#e8756c', '#4aa3df', '#3fbf94', '#9b7be0', '#c9cf55', '#e88bc0'];
  TAXO.comps.forEach((c, k) => {
    c.color = PALETTE[k % PALETTE.length]; c.n = c.items.length; c.pieces = c.items.reduce((a, b) => a + b.q, 0);
    COMP[c.id] = c; c.items.forEach(it => { it.key = c.id + ':' + it.i; it.comp = c.id; ELEM[it.key] = it; });
  });
  const TOTAL_EL = Object.keys(ELEM).length;
  const KEEP = /^(DIN|ISO|SMS|PLC|HMI|EPDM|NBR|PP|PE|IP\d+K?|ITM|VFD|NPT|NEMA|WEG|ML\d+|UCFL.*|UNIJET|SF-CE3|T304|SH-\d+|C56|BM13|VAC|VDC|HP|GPM|PSI|Ø.*|ø.*)$/;
  const STOP = new Set(['de', 'del', 'con', 'para', 'en', 'y', 'o', 'a', 'la', 'el', 'los', 'las', 'por', 'sin', 'entre', 'un', 'una']);
  function nice(s) {
    s = String(s || '').replace(/\s+/g, ' ').trim();
    const letters = s.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g, ''); if (!letters.length) return s;
    if (letters.replace(/[^A-ZÁÉÍÓÚÑ]/g, '').length / letters.length < 0.7) return s;
    let first = true;
    return s.split(' ').map(w => {
      const core = w.replace(/[(),;]/g, '');
      if (STOP.has(core.toLowerCase()) && !first) return w.toLowerCase();
      if (/\d/.test(core) || /[\/\-\.]/.test(core) && core.length <= 4 || (core.length <= 3 && /^[A-Z]+$/.test(core)) || KEEP.test(core)) { first = false; return w; }
      const lw = w.toLowerCase(); const out = first ? lw.charAt(0).toUpperCase() + lw.slice(1) : lw; first = false; return out;
    }).join(' ');
  }
  // nombre limpio de un elemento (quita el sufijo repetido del manual y corrige erratas de la taxonomía)
  function clean(n) {
    n = String(n || '').replace(/\s+(DE\s+)?TUNEL DE DESINFECTADO PARA QUESO MADURADO QUALTIA QUERETARO REV A\.1/i, '').replace(/SELENOIDE/i, 'SOLENOIDE').replace(/\s*,\s*$/, '');
    return nice(n);
  }
  const compOf = sel => sel ? (sel.kind === 'elem' ? ELEM[sel.id].comp : sel.id) : null;

  const TASKS = []; DATA.fichas.forEach(f => f.items.forEach(it => TASKS.push(Object.assign({ ficha: f.id, fichaTitulo: f.titulo }, it))));
  const SEV_ORDER = { 'CRÍTICO': 3, 'MEDIA': 2, 'BAJA': 1 }, SEV_CLASS = { 'CRÍTICO': 'crit', 'MEDIA': 'media', 'BAJA': 'baja' }, SEV_LABEL = { 'CRÍTICO': 'Crítico', 'MEDIA': 'Moderado', 'BAJA': 'Normal' };
  const SEV_HEX = { 'CRÍTICO': 0xd4493f, 'MEDIA': 0xe2b43a, 'BAJA': 0x4aa872 };
  const FREQ = { MENSUAL: 'Mensual', ANUAL: 'Anual', SEMESTRAL: 'Semestral', DIARIA: 'Diaria' };
  const nivelLabel = n => n === 'OP' ? 'Operador' : n === 'TEC' ? 'Técnico' : (n || '—');
  const matchKey = (list, key) => { const comp = key.split(':')[0]; return list.includes(key) || list.includes('comp:' + comp); };
  const tasksFor = key => TASKS.filter(t => t.puntos.includes(key));
  const tasksForComp = id => TASKS.filter(t => t.puntos.some(p => p === 'comp:' + id || p.startsWith(id + ':')));
  const refsFor = key => DATA.refs.filter(r => r.elems.includes(key));
  const refsForComp = id => DATA.refs.filter(r => r.elems.some(e => e.startsWith(id + ':')));
  const fallasFor = key => DATA.fallas.filter(f => matchKey(DATA.grupoElem[f.grupo] || [], key));
  const fallasForComp = id => DATA.fallas.filter(f => (DATA.grupoElem[f.grupo] || []).some(e => e === 'comp:' + id || e.startsWith(id + ':')));
  const sevMax = list => list.reduce((m, r) => (SEV_ORDER[r.sev] || 0) > (SEV_ORDER[m] || 0) ? r.sev : m, null);
  const dataOf = key => { const c = key.split(':')[0]; return { tareas: tasksFor(key).concat(tasksFor('comp:' + c).filter(t => !tasksFor(key).includes(t))), refs: refsFor(key), fallas: fallasFor(key) }; };
  const dataOfComp = id => ({ tareas: tasksForComp(id), refs: refsForComp(id), fallas: fallasForComp(id) });
  let failMax = 1; Object.keys(ELEM).forEach(k => { failMax = Math.max(failMax, fallasFor(k).length); });
  const infoOf = key => (INFO.elem[key] || {});

  /* ============================================================
   *  Escena 3D
   * ============================================================ */
  const canvas = $('#gl');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  const SMALL = window.matchMedia('(max-width: 900px)').matches;
  let hd = false;
  function setPixelRatio() { renderer.setPixelRatio(Math.min((window.devicePixelRatio || 1) * (hd ? 1.5 : 1), hd ? 3 : (SMALL ? 1.5 : 2.25))); resize(); }
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.localClippingEnabled = true;

  const scene = new THREE.Scene(), BG = 0x252c35;
  scene.background = new THREE.Color(BG); scene.fog = new THREE.Fog(BG, 9, 26);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.03, 90);
  camera.position.set(2.7, 1.75, 3.1);
  const controls = new THREE.OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.09; controls.target.set(0.05, 0.72, 0.0);
  controls.minDistance = 0.25; controls.maxDistance = 10; controls.maxPolarAngle = Math.PI * 0.497; controls.autoRotate = true; controls.autoRotateSpeed = 0.8; controls.screenSpacePanning = true;

  function makeEnv() {
    const s = new THREE.Scene();
    const room = new THREE.Mesh(new THREE.BoxGeometry(30, 14, 30), new THREE.MeshBasicMaterial({ color: 0x3b4248, side: THREE.BackSide })); room.position.y = 7; s.add(room);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshBasicMaterial({ color: 0x8b867a })); floor.rotation.x = -Math.PI / 2; floor.position.y = 0.02; s.add(floor);
    const light = c => { const m = new THREE.MeshBasicMaterial(); m.color.setScalar(c); return m; };
    for (let i = -2; i <= 2; i++) for (let j = -1; j <= 1; j++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.0), light(14)); p.rotation.x = Math.PI / 2; p.position.set(i * 5, 13.9, j * 7); s.add(p); }
    [[-14.9, 0, Math.PI / 2], [14.9, 0, -Math.PI / 2], [0, -14.9, 0], [0, 14.9, Math.PI]].forEach(q => { for (let i = -3; i <= 3; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 7), light(i % 2 ? 4.5 : 1.6)); p.position.set(q[0] ? q[0] : i * 3.6, 4.8, q[1] ? q[1] : i * 3.6); p.rotation.y = q[2]; s.add(p); } });
    const pm = new THREE.PMREMGenerator(renderer); const t = pm.fromScene(s, 0.02).texture; pm.dispose(); return t;
  }
  scene.environment = makeEnv();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6f6a5e, 0.32));
  const sun = new THREE.DirectionalLight(0xffffff, 1.9); sun.position.set(2.8, 5.5, 3.8); sun.castShadow = true;
  sun.shadow.mapSize.set(SMALL ? 2048 : 4096, SMALL ? 2048 : 4096);
  Object.assign(sun.shadow.camera, { left: -2.6, right: 2.6, top: 2.3, bottom: -2.3, near: 0.5, far: 14 }); sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.012; sun.target.position.set(0.25, 0.7, 0); scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0xdde8ff, 0.5); fill.position.set(-4, 3, -3); scene.add(fill);
  const cutPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 100);

  /* ---------- estado ---------- */
  const S = { mode: 'explorar', sel: null, focus: null, hover: null, tab: 'resumen', xray: false, iso: false, labels: false, run: false, stop: false, exp: 0, cut: 0, heat: 'none', door: false, autoDoor: false, autoXray: false, onPick: null, hint: null };
  const D = { compMode: null, compId: null, elem: null, k: 1, autoIso: false, autoIso2: false, pins: [] };
  let model = null, despiece = null, detailLevel = SMALL ? 1 : 1.6;

  /* ---------- materiales: base, resaltado, fantasma, rayos X, mapa de calor ---------- */
  const shellMats = new Map(), vars = new Map(), hiMats = [];
  function shellOf(m) { if (!shellMats.has(m)) { const c = m.clone(); c.clippingPlanes = [cutPlane]; c.clipShadows = true; shellMats.set(m, c); } return shellMats.get(m); }
  function variant(m, kind) {
    let v = vars.get(m); if (!v) { v = {}; vars.set(m, v); }
    if (!v[kind]) {
      const c = m.clone();
      if (kind === 'ghost') { c.transparent = true; c.opacity = 0.06; c.depthWrite = false; }
      else if (kind === 'xray') { c.transparent = true; c.opacity = 0.13; c.depthWrite = false; }
      else if (kind === 'shade') { if (c.color) c.color.multiplyScalar(0.6); c.envMapIntensity = 0.55; }
      else if (kind === 'dim') { c.transparent = true; c.opacity = 0.42; c.depthWrite = false; }
      else if (kind === 'hi' || kind === 'hov') { if (c.emissive) { c.emissive = new THREE.Color(0xe0a23a); c.emissiveIntensity = kind === 'hi' ? 0.55 : 0.2; } if (kind === 'hi') hiMats.push(c); }
      else if (kind.indexOf('heat:') === 0) { c.color = new THREE.Color(parseInt(kind.slice(5), 16)).convertSRGBToLinear(); c.metalness = 0.0; c.roughness = 0.7; c.envMapIntensity = 0.55; c.map = null; c.transparent = false; c.opacity = 1; }
      v[kind] = c;
    }
    return v[kind];
  }

  /* ---------- montaje del modelo (a un nivel de malla dado) ---------- */
  function mountModel(detail) {
    const prev = S.sel ? { kind: S.sel.kind, id: S.sel.id } : null;
    if (despiece) despiece.stopAll(true);
    clearPins(); D.compMode = null; D.compId = null; D.elem = null;
    if (model) { scene.remove(model.root); model.dispose(); vars.forEach(v => Object.values(v).forEach(m => m.dispose())); shellMats.forEach(m => m.dispose()); }
    vars.clear(); shellMats.clear(); hiMats.length = 0;
    model = window.createTunelModel({ detail });
    scene.add(model.root);
    model.meshes.forEach(m => { m.userData.base = m.userData.shell ? shellOf(m.material) : m.material; m.material = m.userData.base; m.userData.cast = m.castShadow; });
    despiece = window.createDespiece(model);
    model.setRunning(S.run); model.setEstop(S.stop); model.setDoor('main', S.door); model.setExplode(S.exp);
    S.sel = prev; S.hover = null;
    refresh();
    TS.model = model; TS.despiece = despiece;
  }

  const keysOfSel = () => S.focus ? S.focus.keys : S.sel ? (S.sel.kind === 'elem' ? [S.sel.id] : ['comp:' + S.sel.id]) : [];
  function meshesOfKey(k) { return k.indexOf('comp:') === 0 ? (model.meshesByComp[k.slice(5)] || []) : (model.meshesByElem[k] || []); }
  function selSet() { const ks = keysOfSel(); if (!ks.length) return null; const s = new Set(); ks.forEach(k => meshesOfKey(k).forEach(m => s.add(m))); return s; }
  function heatHex(key) {
    if (!key) return 0x59636d;
    if (S.heat === 'refs') { const k = sevMax(refsFor(key)); return k ? SEV_HEX[k] : 0x59636d; }
    if (S.heat === 'fallas') { const n = fallasFor(key).length; if (!n) return 0x59636d; return new THREE.Color().setHSL((1 - Math.min(1, n / failMax)) * 0.33, 0.62, 0.45).getHex(); }
    return 0x59636d;
  }
  function refresh() {
    if (!model) return;
    const ss = selSet(), hoverSet = S.hover ? new Set(model.meshesByElem[S.hover] || model.meshesByComp[S.hover] || []) : null;
    const selComp = S.focus ? null : compOf(S.sel), has = !!ss;
    // en despiece de sección o de elemento se muestran los materiales reales (sin resaltado ámbar)
    const quiet = !!S.sel && ((!!D.compMode && S.sel.kind === 'comp') || (!!D.elem && S.sel.kind === 'elem' && S.sel.id === D.elem));
    model.meshes.forEach(m => {
      let kind = 'base'; const isSel = ss && ss.has(m) && !quiet, basic = m.userData.base.isMeshBasicMaterial;
      if (S.iso && has && !(ss && ss.has(m))) kind = m.userData.comp === selComp ? 'dim' : 'ghost';
      if (S.xray && m.userData.shell && !isSel) kind = 'xray';
      if (S.heat !== 'none' && !basic && !isSel) kind = m.userData.shell ? 'xray' : 'heat:' + heatHex(m.userData.elem).toString(16).padStart(6, '0');
      if (has && !quiet && !isSel && kind === 'base' && !basic) kind = 'shade';
      if (isSel && !basic) kind = 'hi';
      else if (hoverSet && hoverSet.has(m) && (kind === 'base' || kind === 'dim' || kind === 'shade') && !basic) kind = 'hov';
      m.material = kind === 'base' ? m.userData.base : variant(m.userData.base, kind);
      m.castShadow = m.userData.cast && kind !== 'ghost' && kind !== 'xray' && kind !== 'dim';
      m.userData.op = (kind === 'ghost') ? 0 : (kind === 'xray' ? 0.13 : (kind === 'dim' ? 0.42 : 1));
    });
    updateLegend();
  }
  function updateLegend() {
    const L = $('#legend');
    if (S.heat === 'refs') L.innerHTML = ['CRÍTICO', 'MEDIA', 'BAJA'].map(k => `<span><i style="background:#${SEV_HEX[k].toString(16).padStart(6, '0')}"></i>${SEV_LABEL[k]}</span>`).join('') + '<span><i style="background:#59636d"></i>Sin refacción</span>';
    else if (S.heat === 'fallas') L.innerHTML = '<span><i style="background:hsl(119,62%,45%)"></i>Pocas OT</span><span><i style="background:hsl(0,62%,45%)"></i>Muchas OT</span><span><i style="background:#59636d"></i>Sin OT</span>';
    else L.innerHTML = '';
    resize();
  }

  /* ---------- cámara y vistas ---------- */
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const VIEWS = [
    { g: 'Generales' },
    { id: 'iso', n: 'Isométrica', p: [2.7, 1.75, 3.1], t: [0.05, 0.72, 0.0] },
    { id: 'front', n: 'Lado A · gabinete', p: [0.0, 1.15, 3.9], t: [0.0, 0.8, 0.0] },
    { id: 'back', n: 'Lado B · bomba y motor', p: [0.0, 1.2, -3.9], t: [0.1, 0.8, -0.1] },
    { id: 'entrada', n: 'Entrada · varillas blancas', p: [-3.9, 1.25, 0.1], t: [-0.3, 0.85, 0.0] },
    { id: 'salida', n: 'Salida de la banda', p: [3.9, 1.25, 0.15], t: [0.3, 0.85, 0.0] },
    { id: 'top', n: 'Superior', p: [0.0, 4.2, 0.12], t: [0.0, 0.8, 0.0] },
    { g: 'Detalle' },
    { id: 'trans', n: 'Caja, cople y motorreductor', p: [1.9, 1.3, -1.5], t: [0.6, 0.82, -0.42] },
    { id: 'banda', n: 'Banda y sprockets', p: [-1.2, 1.6, 1.3], t: [-0.2, 0.9, 0.05] },
    { id: 'rods', n: 'Varillas blancas de la entrada', p: [-2.0, 1.2, 1.1], t: [-0.7, 0.9, 0.0] },
    { id: 'campana', n: 'Interior de la campana', p: [0.95, 1.65, 1.2], t: [0.05, 0.98, 0.0], xray: true },
    { id: 'gab', n: 'Gabinete eléctrico', p: [0.15, 0.95, 1.75], t: [-0.36, 0.66, 0.35] },
    { id: 'dos', n: 'Dossatron y garrafa', p: [0.6, 0.95, -1.75], t: [-0.05, 0.65, -0.35] },
    { id: 'bajo', n: 'Bajo la banda: tina y mangueras', p: [0.6, 0.35, 2.6], t: [0.0, 0.55, 0.0] }
  ];
  let tween = null, curView = 'iso';
  const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function flyTo(pos, target, ms) { tween = { t0: performance.now(), ms: ms || 950, p0: camera.position.clone(), g0: controls.target.clone(), p1: pos.clone(), g1: target.clone() }; }
  controls.addEventListener('start', () => { tween = null; stopAuto(); setViewLabel(null); });
  function stopAuto() { if (controls.autoRotate) { controls.autoRotate = false; setChk('rot', false); } $('#hint').style.opacity = 0; }
  function setViewLabel(id) { curView = id; const v = VIEWS.find(x => x.id === id); $('#vistaLbl').textContent = v ? v.n.split(' · ')[0] : 'Libre'; $$('#menuVista [data-v]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.v === id))); }
  let viewXray = false;
  const viewScale = () => camera.aspect < 0.9 ? 0.74 : 1;   // en pantallas verticales se acerca la cámara
  function viewPos(v) { const t = V3(...v.t); return t.clone().add(V3(...v.p).sub(t).multiplyScalar(viewScale())); }
  function setView(id) {
    const v = VIEWS.find(x => x.id === id); if (!v) return;
    flyTo(viewPos(v), V3(...v.t)); setViewLabel(id);
    if (v.xray && !S.xray) { setXray(true); viewXray = true; } else if (!v.xray && viewXray) { viewXray = false; setXray(false); }
  }
  function viewDir(c, id) {
    let d;
    if (c.z < -0.3) d = V3(0.35, 0.4, -1);
    else if (id === 'gabinete' || (Math.abs(c.x + 0.36) < 0.2 && c.z > 0.22 && c.z < 0.42 && c.y > 0.52 && c.y < 0.8)) d = V3(0.15, 0.12, 1);   // gabinete (y el solenoide que lleva dentro): se mira desde la derecha de la puerta abierta
    else if (c.y > 0.93 && c.y < 1.3 && Math.abs(c.x) < 0.5 && Math.abs(c.z) < 0.3) d = V3(0.25, 0.85, 0.7);
    else if (c.y < 0.45) d = V3(0.2, 0.22, 1);
    else d = V3((c.x >= 0 ? 1 : -1) * 0.28, 0.45, 1);
    return d.normalize();
  }
  function boxOfKeys(keys) {
    const b = new THREE.Box3();
    keys.forEach(k => { const info = k.indexOf('comp:') === 0 ? model.compInfo[k.slice(5)] : model.elems[k]; if (info && info.box && !info.box.isEmpty()) b.union(info.box); });
    return b;
  }
  function focusBox(box, id, pad) {
    if (box.isEmpty()) return;
    const c = box.getCenter(V3(0, 0, 0)), sz = box.getSize(V3(0, 0, 0)), R = Math.max(sz.x, sz.y, sz.z), dist = Math.max(0.55, R * (pad || 1.8) + 0.3);
    flyTo(c.clone().addScaledVector(viewDir(c, id), dist), c); setViewLabel(null);
  }
  function fitBox(box, dir, pad) {   // encuadra una caja completa en la parte libre de la pantalla (entre los paneles)
    const c = box.getCenter(V3(0, 0, 0)), sz = box.getSize(V3(0, 0, 0));
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight, mobile = window.matchMedia('(max-width: 900px)').matches;
    const vw = mobile ? w : Math.max(300, w - (document.body.classList.contains('panel-off') ? 10 : 410) - 270), asp = vw / h, t = Math.tan(camera.fov * Math.PI / 360);
    const dist = Math.max(sz.y / 2 / t, sz.x / 2 / (t * asp), 0.4) * (pad || 1.2) + sz.z / 2;
    flyTo(c.clone().addScaledVector(dir.clone().normalize(), dist), c); setViewLabel(null);
  }
  function focusKeys(keys, o) {
    o = o || {};
    if (!keys || !keys.length || keys[0] === 'ALL') { setView('iso'); return; }
    const b = boxOfKeys(keys); if (b.isEmpty()) { setView('iso'); return; }
    focusBox(b, keys[0].replace('comp:', '').split(':')[0], o.pad);
  }

  /* ---------- reveladores automáticos (rayos X y puerta del gabinete) ---------- */
  function setXray(v) { S.xray = v; setChk('xray', v); $('#bXray').classList.toggle('on', v); refresh(); }
  function setDoor(open) { S.door = open; model.setDoor('main', open); setChk('door', open); }
  function autoReveal() {
    const ks = keysOfSel();
    const needX = ks.some(k => k === 'comp:spray' || (infoOf(k).xray)), needD = ks.some(k => k === 'comp:gabinete' || (model.elemDoor[k] === 'main'));
    if (needX && !S.xray) { setXray(true); S.autoXray = true; } else if (!needX && S.autoXray) { S.autoXray = false; setXray(false); }
    if (needD && !S.door) { setDoor(true); S.autoDoor = true; } else if (!needD && S.autoDoor) { S.autoDoor = false; setDoor(false); }
  }

  /* ---------- despiece ---------- */
  const dpinsEl = document.createElement('div'); dpinsEl.id = 'dpins'; $('#app').appendChild(dpinsEl);
  function clearPins() { dpinsEl.innerHTML = ''; D.pins = []; }
  const EXTRA_NAMES = { 'gabinete:caja': 'Caja del gabinete', 'gabinete:pedestal': 'Poste y ménsula', 'gabinete:puerta': 'Puerta con operadores', 'gabinete:cables': 'Cableado interior' };
  function buildPins() {
    clearPins(); const L = despiece.comp; if (!L) return;
    L.items.forEach(it => {
      const e = it.key ? ELEM[it.key] : null, d = document.createElement('div');
      d.className = 'dpin' + (e ? '' : ' extra'); d.style.setProperty('--c', COMP[L.id].color);
      const label = e ? clean(e.n).slice(0, 44) : (EXTRA_NAMES[it.u.name] || 'Elemento de apoyo');
      d.innerHTML = `<i>${e ? e.i : '•'}</i>${e && L.mode === 'sheet' ? `<b>×${e.q}</b>` : ''}<span>${esc(label)}</span>`;
      if (e) { d.addEventListener('click', ev => { ev.stopPropagation(); select({ kind: 'elem', id: it.key }); }); d.addEventListener('mouseenter', () => { S.hover = it.key; refresh(); }); d.addEventListener('mouseleave', () => { S.hover = null; refresh(); }); } else d.style.cursor = 'default';
      dpinsEl.appendChild(d); D.pins.push({ d, key: it.key });
    });
  }
  const pv = new THREE.Vector3();
  function updatePins() {
    if (!D.pins.length) return; const w = canvas.clientWidth, h = canvas.clientHeight, pts = despiece.pins();
    D.pins.forEach((p, i) => {
      const q = pts[i]; if (!q) { p.d.style.display = 'none'; return; }
      pv.copy(q.pos).project(camera); const vis = pv.z < 1 && Math.abs(pv.x) < 1.15 && Math.abs(pv.y) < 1.15;
      p.d.style.display = vis ? 'flex' : 'none'; p.d.style.left = ((pv.x + 1) / 2 * w) + 'px'; p.d.style.top = ((1 - pv.y) / 2 * h) + 'px';
      p.d.classList.toggle('on', !!p.key && !!S.sel && S.sel.kind === 'elem' && S.sel.id === p.key);
    });
  }
  function pauseRun() { if (S.run) setRun(false); }
  function desStartComp(compId, mode) {
    if (compOf(S.sel) !== compId) { desStopAll(true); S.focus = null; S.sel = { kind: 'comp', id: compId }; autoReveal(); }
    desStopElem(true); pauseRun();
    const L = despiece.startComp(compId, mode);
    if (!L) { toast('Esta sección no tiene piezas separables'); return; }
    D.compMode = mode; D.compId = compId;
    if (!S.iso && mode === 'radial') { D.autoIso = true; iso(true); }
    refresh(); renderPanel(); highlightList(); buildPins(); stopAuto();
    const b = L.bounds(); if (mode === 'sheet') fitBox(b, V3(0, 0.1, 1), 1.15); else fitBox(b, viewDir(b.getCenter(V3(0, 0, 0)), compId), 1.3);
  }
  function desStopComp() {
    if (!D.compMode) return; const id = D.compId;
    despiece.stopComp(false); D.compMode = null; D.compId = null; clearPins();
    if (D.autoIso) { D.autoIso = false; if (D.elem) D.autoIso2 = true; else iso(false); }
    refresh(); renderPanel();
    if (S.sel && compOf(S.sel) === id) { const info = S.sel.kind === 'elem' ? model.elems[S.sel.id] : model.compInfo[S.sel.id]; focusBox(info.box, id); }
  }
  function desStartElem(key) {
    desStopElem(true); pauseRun();
    const L = despiece.startElem(key);
    if (!L) { toast('Este elemento es una sola pieza; no se puede separar más'); return; }
    D.elem = key;
    if (!S.iso) { D.autoIso2 = true; iso(true); }
    refresh(); renderPanel(); stopAuto();
    const b = L.bounds(); fitBox(b, viewDir(b.getCenter(V3(0, 0, 0)), compOf({ kind: 'elem', id: key })), 1.45);
  }
  function desStopElem(immediate) {
    if (!D.elem) return; despiece.stopElem(!!immediate); D.elem = null;
    if (D.autoIso2) { D.autoIso2 = false; iso(false); }
    if (!immediate) { refresh(); renderPanel(); }
  }
  function desStopAll(immediate) {
    if (D.elem) desStopElem(true);
    if (D.compMode) { despiece.stopComp(true); D.compMode = null; D.compId = null; clearPins(); if (D.autoIso) { D.autoIso = false; iso(false); } }
    if (!immediate) { refresh(); renderPanel(); }
  }
  let toastT = null;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600); }
  const banner = $('#banner');
  function showBanner(html, cls, ms) { banner.className = 'show ' + (cls || ''); banner.innerHTML = html; clearTimeout(showBanner.h); if (ms) showBanner.h = setTimeout(() => banner.classList.remove('show'), ms); }
  function hideBanner() { banner.classList.remove('show'); }

  /* ---------- selección ---------- */
  function select(sel, opts) {
    opts = opts || {};
    if (S.mode !== 'explorar' && !opts.keepMode) { if (sel) setMode('explorar'); }
    if (D.elem && !(sel && sel.kind === 'elem' && sel.id === D.elem)) desStopElem(false);
    if (D.compMode && compOf(sel) !== D.compId) { S.sel = sel; desStopComp(); }
    S.focus = opts.focus || null; S.sel = sel; S.tab = opts.tab || 'resumen';
    autoReveal(); refresh(); if (!opts.noPanel) renderPanel(); highlightList();
    if (sel && opts.fly !== false) {
      const inDes = D.compMode && compOf(sel) === D.compId, it = inDes && sel.kind === 'elem' ? despiece.itemInfo(sel.id) : null;
      if (it) { const dir = D.compMode === 'sheet' ? V3(0, 0.1, 1) : viewDir(it.center, compOf(sel)), R = Math.max(it.size.x, it.size.y, it.size.z); flyTo(it.center.clone().addScaledVector(dir, Math.max(0.5, R * 1.9 + 0.3)), it.center); }
      else if (!inDes) { const info = sel.kind === 'elem' ? model.elems[sel.id] : model.compInfo[sel.id]; focusBox(info.box, compOf(sel)); }
      stopAuto();
    }
    if (sel && S.mode === 'explorar' && document.body.classList.contains('panel-off')) { document.body.classList.remove('panel-off'); $('#panelToggle').textContent = '◂'; resize(); }
  }
  // resalta varias piezas a la vez (ruta guiada, análisis)
  function setFocus(keys, o) {
    o = o || {};
    desStopAll(true);
    S.sel = null; S.focus = keys && keys.length && keys[0] !== 'ALL' ? { keys } : null;
    autoReveal(); refresh(); highlightList();
    if (o.fly !== false) { focusKeys(keys); stopAuto(); }
  }

  /* ---------- selección con el ratón ---------- */
  const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const visibleDeep = o => { for (let n = o; n; n = n.parent) if (!n.visible) return false; return true; };
  function pick(ev) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const objs = model.meshes.filter(m => m.userData.op > 0.3 && !(S.xray && m.userData.shell) && !m.userData.mist && visibleDeep(m));
    const hit = raycaster.intersectObjects(objs, false)[0];
    return hit ? hit.object.userData : null;
  }
  let down = null;
  canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; closeMenus(); });
  canvas.addEventListener('pointerup', e => {
    if (!down) return; const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), dt = performance.now() - down.t; down = null;
    if (moved > 6 || dt > 500) return;
    const u = pick(e);
    if (S.onPick) { S.onPick(u ? (u.elem || ('comp:' + u.comp)) : null, u); return; }
    if (S.mode === 'ruta' || S.mode === 'practica') return;
    if (u) select(u.elem ? { kind: 'elem', id: u.elem } : { kind: 'comp', id: u.comp }, { fly: false }); else if (S.sel || S.focus) select(null, { fly: false });
  });
  const tip = $('#tip'); let hoverBusy = false;
  canvas.addEventListener('pointermove', e => {
    if (hoverBusy || e.buttons || e.pointerType === 'touch') { tip.style.opacity = 0; return; } hoverBusy = true;
    requestAnimationFrame(() => {
      hoverBusy = false; const u = pick(e); const key = u ? (u.elem || u.comp) : null;
      if (key !== S.hover) { S.hover = key; refresh(); canvas.style.cursor = key ? 'pointer' : 'grab'; }
      if (u && !S.onPick) { tip.textContent = u.elem ? clean(ELEM[u.elem].n).slice(0, 70) + '  ·  ' + COMP[u.comp].name : COMP[u.comp].name; tip.style.left = e.clientX + 'px'; tip.style.top = e.clientY + 'px'; tip.style.opacity = 1; } else tip.style.opacity = 0;
    });
  });
  canvas.addEventListener('pointerleave', () => { tip.style.opacity = 0; });
  window.addEventListener('keydown', e => { if (e.key === 'Escape') { if (!closeMenus()) select(null); } });

  /* ---------- lista de secciones y búsqueda ---------- */
  const sysList = $('#syslist');
  function buildTree() {
    const groups = { mec: [], ele: [] }; TAXO.comps.forEach(c => groups[c.sys].push(c));
    sysList.innerHTML = ['mec', 'ele'].map(sid => {
      const cs = groups[sid], tot = cs.reduce((a, c) => a + c.n, 0);
      return `<div class="sys open" data-sys="${sid}"><button class="sys-head"><span class="dot" style="background:${sid === 'mec' ? '#e0a23a' : '#4aa3df'}"></span><span class="nm">${esc(TAXO.sistemas[sid])}</span><span class="ct">${cs.length} · ${tot}</span></button>
        <div class="sys-parts">${cs.map(c => `<button data-comp="${c.id}"><i style="background:${c.color}">${TAXO.comps.indexOf(c) + 1}</i>${esc(c.name)}<em>${c.n}</em></button>`).join('')}</div></div>`;
    }).join('');
    $$('.sys-head', sysList).forEach(b => b.addEventListener('click', () => b.parentElement.classList.toggle('open')));
    $$('[data-comp]', sysList).forEach(b => b.addEventListener('click', () => { select({ kind: 'comp', id: b.dataset.comp }); document.body.classList.remove('sys-open'); }));
  }
  function highlightList() {
    const comp = S.focus ? null : compOf(S.sel);
    $$('[data-comp]', sysList).forEach(b => b.classList.toggle('on', b.dataset.comp === comp));
    const on = $('[data-comp].on', sysList); if (on) on.scrollIntoView({ block: 'nearest' });
  }
  $('#sysToggle').addEventListener('click', () => document.body.classList.toggle('sys-open'));
  const q = $('#q'), qres = $('#qres'), INDEX = [];
  TAXO.comps.forEach(c => { INDEX.push({ t: c.name, sub: 'Sección · ' + c.n + ' elementos', sel: { kind: 'comp', id: c.id } }); c.items.forEach(it => INDEX.push({ t: clean(it.n), sub: 'Elemento · ' + c.name + (it.p ? ' · ' + it.p : '') + ' · ×' + it.q, sel: { kind: 'elem', id: it.key }, extra: (it.p + ' ' + it.m).toLowerCase() })); });
  TASKS.forEach(t => INDEX.push({ t: t.texto.charAt(0).toUpperCase() + t.texto.slice(1).toLowerCase(), sub: 'Tarea ' + t.codigo + ' · ' + t.fichaTitulo, task: t }));
  DATA.refs.forEach(r => INDEX.push({ t: r.desc, sub: 'Refacción · ' + (SEV_LABEL[r.sev] || '') + ' · ' + r.parte, sel: r.elems[0] ? { kind: 'elem', id: r.elems[0] } : null, tab: 'refs' }));
  INDEX.forEach(x => { x.l = (x.t + ' ' + (x.extra || '')).toLowerCase(); });
  q.addEventListener('input', () => {
    const t = q.value.trim().toLowerCase(); if (t.length < 2) { qres.classList.remove('open'); return; }
    const hits = INDEX.filter(x => x.l.includes(t)).slice(0, 30);
    qres.innerHTML = hits.map(h => `<button data-i="${INDEX.indexOf(h)}">${esc(h.t.slice(0, 90))}<small>${esc(h.sub)}</small></button>`).join('') || '<button disabled>Sin resultados</button>';
    qres.classList.add('open');
  });
  qres.addEventListener('click', e => {
    const b = e.target.closest('button[data-i]'); if (!b) return; const h = INDEX[+b.dataset.i]; qres.classList.remove('open'); q.value = ''; document.body.classList.remove('sys-open');
    if (h.task) { const pt = h.task.puntos.filter(p => p !== 'ALL'); setMode('explorar'); if (pt.length && pt[0].indexOf('comp:') !== 0) select({ kind: 'elem', id: pt[0] }, { tab: 'tareas' }); else if (pt.length) select({ kind: 'comp', id: pt[0].slice(5) }, { tab: 'tareas' }); else toast('Esta tarea aplica al equipo completo'); }
    else if (h.sel) { setMode('explorar'); select(h.sel, { tab: h.tab }); }
  });
  document.addEventListener('click', e => { if (!e.target.closest('.search')) qres.classList.remove('open'); });

  /* ============================================================
   *  Panel derecho (modo Explorar)
   * ============================================================ */
  const panelBody = $('#panelBody'), ACT = {};
  panelBody.addEventListener('click', e => { const t = e.target.closest('[data-act]'); if (!t) return; const f = ACT[t.dataset.act]; if (f) f(t.dataset, t, e); });
  const tag = (t, c) => `<span class="tag ${c || ''}">${esc(t)}</span>`;
  const sevTag = k => `<span class="tag ${SEV_CLASS[k] || ''}">${esc(SEV_LABEL[k] || k || '—')}</span>`;
  const MODE_RENDER = {};
  function renderPanel(keep) {
    const y = panelBody.scrollTop;
    panelBody.innerHTML = MODE_RENDER[S.mode] ? MODE_RENDER[S.mode]() : explorerView();
    panelBody.scrollTop = keep === true ? y : 0;
    if (MODE_RENDER[S.mode + ':after']) MODE_RENDER[S.mode + ':after']();
  }
  function explorerView() { if (!S.sel) return overview(); return S.sel.kind === 'elem' ? elemView(S.sel.id) : compView(S.sel.id); }
  function desBlockComp(compId) {
    const inRad = D.compMode === 'radial' && D.compId === compId, inSheet = D.compMode === 'sheet' && D.compId === compId;
    return `<div class="despiece"><h3 class="sec">Vista explosionada</h3>
      <div class="p-desc" style="font-size:12.5px;margin-bottom:8px">Separa los elementos de la sección para ver las piezas interiores.</div>
      <div class="btns"><button class="btn${inRad ? ' pri' : ''}" data-act="desIn" title="Separa los elementos desde el centro, en su lugar">⤢ Despiece en sitio${inRad ? ' · activo' : ''}</button>
      <button class="btn${inSheet ? ' pri' : ''}" data-act="desSep" title="Acomoda los elementos en un tablero, sin el resto de la máquina">▦ Ver por separado${inSheet ? ' · activo' : ''}</button></div>
      ${inRad ? `<label class="field"><span>Separación</span><input id="sDesK" type="range" min="15" max="220" value="${Math.round(D.k * 100)}"></label>` : ''}</div>`;
  }
  function desBlockElem(key) {
    const on = D.elem === key;
    return `<div class="despiece" style="margin-top:12px"><div class="btns"><button class="btn${on ? ' pri' : ''}" data-act="desEl" title="Separa las piezas que forman este elemento">⤢ Despiece del elemento${on ? ' · activo' : ''}</button></div>
      ${on ? `<label class="field"><span>Separación</span><input id="sDesK" type="range" min="15" max="220" value="${Math.round(D.k * 100)}"></label>` : ''}</div>`;
  }
  function bindDes() { const ks = $('#sDesK', panelBody); if (ks) ks.oninput = e => { D.k = e.target.value / 100; despiece.setK(D.k); }; }
  function rowTask(t) {
    return `<button class="row click" data-act="goTask" data-fid="${t.ficha}" data-code="${t.codigo}"><div class="top"><span>${esc(sentence(t.texto))}</span>${tag(FREQ[t.frec] || t.frec)}</div>
      <div class="sub">${esc(t.codigo)} · ${esc(t.per)} · ${esc(nivelLabel(t.nivel))} · ${t.min} min${t.paro === 'SI' ? ' ' + tag('Requiere paro', 'paro') : ''} · ${esc(t.fichaTitulo)}</div></button>`;
  }
  function sentence(s) { s = String(s || '').trim(); if (!s) return ''; s = s.toLowerCase(); s = s.charAt(0).toUpperCase() + s.slice(1); return s.replace(/\b(sprea|dossatron|itm|rpm|vac|vdc|uc?fl?\d*|plc|hmi)\b/gi, m => m.length <= 4 ? m.toUpperCase() : m.charAt(0).toUpperCase() + m.slice(1)).replace(/°c\b/g, '°C').replace(/\b(naylamid)\b/i, 'Naylamid'); }
  function rowRef(r) { return `<div class="row"><div class="top"><b>${esc(r.desc)}</b>${sevTag(r.sev)}</div><div class="sub">${esc(r.uds || '')} · ${esc(r.parte)}</div></div>`; }
  function rowFalla(f) {
    return `<div class="row"><div class="top"><b>${esc(sentence(f.desc))}</b><span class="note">${esc(f.fecha)}</span></div>
      ${f.det ? `<div class="sub">${esc(sentence(f.det))}</div>` : ''}<div class="sub" style="color:var(--amber)">OT ${esc(f.ot)} · ${esc(f.tipo === 'PreventiveMaintenance' ? 'Preventiva' : 'Correctiva')}${f.min ? ' · ' + f.min + ' min' : ''}</div></div>`;
  }
  function tabsHtml(D0) {
    const tabs = [['resumen', 'Resumen'], ['tareas', 'Tareas', D0.tareas.length], ['refs', 'Refacciones', D0.refs.length], ['fallas', 'Fallas', D0.fallas.length]];
    return `<div class="tabs">${tabs.map(t => `<button class="${S.tab === t[0] ? 'on' : ''}" data-act="tab" data-t="${t[0]}">${t[1]}${t[2] !== undefined ? `<span class="n">${t[2]}</span>` : ''}</button>`).join('')}</div>`;
  }
  function listTab(D0) {
    if (S.tab === 'tareas') return D0.tareas.length ? D0.tareas.map(rowTask).join('') : '<div class="empty">Sin tareas de la rutina mensual o anual para esta pieza.</div>';
    if (S.tab === 'refs') return D0.refs.length ? D0.refs.slice().sort((a, b) => (SEV_ORDER[b.sev] || 0) - (SEV_ORDER[a.sev] || 0)).map(rowRef).join('') : '<div class="empty">Sin refacciones enlazadas a esta pieza en el Excel.</div>';
    return D0.fallas.length ? D0.fallas.map(rowFalla).join('') : '<div class="empty">Sin fallas registradas para esta pieza en el historial.</div>';
  }
  const plural = (n, s, p) => n + ' ' + (n === 1 ? s : p);
  function titleOf(n) { let t = clean(n).split(',')[0].replace(/\s*\(.*$/, ''); if (t.length > 58) { t = t.slice(0, 56); t = t.slice(0, t.lastIndexOf(' ')) + '…'; } return t; }
  function heroHtml(c, key, title, kicker) {
    const im = key ? infoOf(key) : {}, ci = INFO.comp[c.id] || {}, foto = im.foto || ci.foto;
    return foto ? `<div class="p-hero"><img src="img/${foto}.jpg" alt="Foto de planta: ${esc(title)}"><div class="ph-txt"><div class="p-sys" style="color:${c.color}">${esc(kicker)}</div><div class="p-title${title.length > 30 ? ' long' : ''}">${esc(title)}</div></div></div>`
      : `<div class="p-head"><div class="p-sys" style="color:${c.color}">${esc(kicker)}</div><div class="p-title${title.length > 30 ? ' long' : ''}">${esc(title)}</div></div>`;
  }
  function specials(key) {
    const out = [];
    if (key.indexOf('gabinete:') === 0 && key !== 'gabinete:3') out.push(`<button class="btn pri" data-act="door">${S.door ? 'Cerrar' : 'Abrir'} la puerta</button>`);
    if (key === 'botonera:1') out.push(`<button class="btn ${S.stop ? 'ok' : 'warn'}" data-act="estop">${S.stop ? 'Restablecer el paro de emergencia' : 'Accionar el paro de emergencia'}</button>`);
    if (/^(transmision:(7|8|9|19|20|21|22|34|35)|motorreductor:\d|cubierta:(2|3)|spray:1|dossatron:1)$/.test(key)) out.push(`<button class="btn pri" data-act="run">${S.run ? '■ Detener' : '▶ Ver en operación'}</button>`);
    return out.join('');
  }
  function elemView(key) {
    const e = ELEM[key], c = COMP[e.comp], idx = c.items.indexOf(e), D0 = dataOf(key), im = infoOf(key), crit = D0.refs.filter(r => r.sev === 'CRÍTICO').length;
    let body = '';
    if (S.tab === 'resumen') {
      body = `<p class="p-desc">${esc(im.d || 'Elemento de la taxonomía del túnel.')}</p>
        <div class="badges">${tag(plural(D0.tareas.length, 'tarea', 'tareas'))}${tag(plural(D0.refs.length, 'refacción', 'refacciones'))}${crit ? tag(crit + ' crítica' + (crit > 1 ? 's' : ''), 'crit') : ''}${tag(plural(D0.fallas.length, 'OT', 'OT'))}${e.pend ? tag('Sin No. de parte', 'nuevo') : ''}${e.x ? tag('No figura en la taxonomía', 'nuevo') : ''}${im.aprox ? tag('Aproximado · no sale en las fotos', 'nuevo') : ''}</div>
        <div class="card" style="border-left:3px solid ${c.color}">
        <div class="kv"><span>Nombre completo</span><b>${esc(clean(e.n))}</b></div>
        <div class="kv"><span>Elemento</span><b>${idx + 1} de ${c.n}${e.no ? ' · No. ' + e.no + ' en la taxonomía' : ''}</b></div>
        <div class="kv"><span>Cantidad</span><b>${e.q} ${e.q === 1 ? 'pieza' : 'piezas'}${e.q_tax ? ' · la taxonomía indica ' + e.q_tax : ''}</b></div>
        <div class="kv"><span>No. de parte</span><b>${esc(e.p || '—')}</b></div>
        <div class="kv"><span>Material</span><b>${esc(e.m || '—')}</b></div>
        <div class="kv"><span>Sección</span><b>${esc(c.name)}</b></div></div>
        <div class="btns">${specials(key)}<button class="btn sm" data-act="prev">◂ Anterior</button><button class="btn sm" data-act="next">Siguiente ▸</button><button class="btn sm" data-act="toComp">Ver sección completa</button></div>
        ${desBlockElem(key)}${desBlockComp(e.comp)}
        ${im.plano ? `<h3 class="sec">Plano del manual</h3><img class="photo" src="img/${im.plano}.jpg" alt="Plano del manual" loading="lazy">` : ''}
        ${im.foto ? `<h3 class="sec">Foto de referencia</h3><img class="photo" src="img/${im.foto}.jpg" alt="Foto de referencia" loading="lazy">` : ''}`;
    } else body = listTab(D0);
    return `${heroHtml(c, key, titleOf(e.n), 'Elemento ' + (idx + 1) + ' de ' + c.n)}${tabsHtml(D0)}<div class="p-body">${body}
      ${S.tab === 'resumen' ? `<h3 class="sec">Elementos de la sección</h3>${elemTable(c, e)}` : ''}</div>`;
  }
  function elemTable(c, sel) {
    return `<div class="tbl">` + c.items.map(it => `<button class="trow${sel === it ? ' on' : ''}" data-act="elem" data-key="${it.key}"><span class="no">${it.i}</span><span class="nm">${esc(clean(it.n))}</span><span class="q">×${it.q}</span></button>`).join('') + '</div>';
  }
  function compView(id) {
    const c = COMP[id], D0 = dataOfComp(id), crit = D0.refs.filter(r => r.sev === 'CRÍTICO').length;
    let body = '';
    if (S.tab === 'resumen') {
      body = `<p class="p-desc">${esc(c.desc)}</p>
        <div class="badges">${tag(c.n + ' elementos')}${tag(c.pieces + ' piezas')}${tag(TAXO.sistemas[c.sys])}${crit ? tag(crit + ' críticas', 'crit') : ''}${tag(D0.fallas.length + ' OT')}${c.extra ? tag('Modelado por fotos', 'nuevo') : ''}</div>
        <div class="btns"><button class="btn sm${S.iso && !D.autoIso ? ' pri' : ''}" data-act="iso">Aislar sección</button><button class="btn sm" data-act="all">Vista general</button>${id === 'gabinete' ? `<button class="btn sm pri" data-act="door">${S.door ? 'Cerrar' : 'Abrir'} la puerta</button>` : ''}</div>
        ${desBlockComp(id)}
        ${(INFO.comp[id] || {}).plano ? `<h3 class="sec">Plano del manual</h3><img class="photo" src="img/${INFO.comp[id].plano}.jpg" alt="Plano del manual" loading="lazy">` : ''}
        <h3 class="sec">Elementos de la sección</h3>${elemTable(c, null)}`;
    } else body = listTab(D0);
    return `${heroHtml(c, null, c.name, TAXO.sistemas[c.sys])}${tabsHtml(D0)}<div class="p-body">${body}</div>`;
  }
  function overview() {
    const mec = TAXO.comps.filter(c => c.sys === 'mec'), ele = TAXO.comps.filter(c => c.sys === 'ele'), pcs = a => a.reduce((x, c) => x + c.pieces, 0);
    const crit = DATA.refs.filter(r => r.sev === 'CRÍTICO').length;
    return `<div class="p-head"><div class="p-sys">Vista general</div><div class="p-title">Túnel de sanitizado 01</div></div>
      <div class="p-body"><p class="p-desc">Modelo 3D hecho con las <b>fotos de planta</b> de las rutinas; la taxonomía del Excel aporta los nombres, secciones, partes y refacciones. Cada uno de los <b>${TOTAL_EL} elementos</b> está modelado y agrupado en su sección. Gíralo, toca cualquier pieza y verás qué es, qué se revisa en las rutinas, qué refacciones lleva y cómo ha fallado.</p>
      <div class="btns"><button class="btn pri" data-act="tour">▶ Recorrido por las secciones</button></div>
      <div class="kpis" style="margin:14px 0"><div class="kpi"><b>${TAXO.comps.length}</b><span>secciones</span></div><div class="kpi"><b>${TOTAL_EL}</b><span>elementos</span></div><div class="kpi"><b>${TASKS.length}</b><span>tareas (mensual y anual)</span></div><div class="kpi"><b>${DATA.fallas.length}</b><span>OT en el historial</span></div></div>
      <h3 class="sec">Prueba esto</h3>
      <div class="chips"><button class="chip" data-act="run">▶ Simular operación</button><button class="chip" data-act="door">Abrir el gabinete</button><button class="chip" data-act="xray">Ver por dentro (rayos X)</button><button class="chip" data-act="explode">Explosionar el equipo</button><button class="chip" data-act="heat" data-h="refs">Mapa de calor de refacciones</button></div>
      <h3 class="sec">Secciones</h3><div class="chips">${TAXO.comps.map(c => `<button class="chip" data-act="comp" data-id="${c.id}" style="border-left:3px solid ${c.color}">${esc(c.name)}</button>`).join('')}</div>
      <h3 class="sec">Aprende</h3>
      <button class="card click" data-act="mode" data-m="ruta"><b class="t">Ruta guiada</b><small>Recorre las rutinas mensual (${DATA.fichas[0].items.length} puntos) y anual (${DATA.fichas[1].items.length} puntos) con las claves B, BP, BCF, X y N/A, ubicando cada punto en el 3D.</small></button>
      <button class="card click" data-act="mode" data-m="practica"><b class="t">Práctica</b><small>Ubica piezas y responde preguntas generadas con tus rutinas y refacciones.</small></button>
      <button class="card click" data-act="mode" data-m="analisis"><b class="t">Análisis</b><small>Pareto de las ${DATA.fallas.length} OT, refacciones críticas (${crit}) y mapa de calor sobre el modelo.</small></button>
      <p class="note" style="margin-top:12px">Datos de <b>TUNEL SANITIZADO FORMATO.xlsx</b> y de las rutinas mensual y anual. El modelo es una representación didáctica: la tina, la campana, las cortinas, las mangueras y la caja del motorreductor se dibujaron con las fotos y lo que indicó el personal de planta; lo que no sale en ninguna foto se marca como «aproximado». Lado A = el del gabinete; lado B = el de la bomba y el motor.</p></div>`;
  }
  ACT.tab = d => { S.tab = d.t; renderPanel(); };
  ACT.elem = d => select({ kind: 'elem', id: d.key });
  ACT.comp = d => select({ kind: 'comp', id: d.id });
  ACT.toComp = () => select({ kind: 'comp', id: compOf(S.sel) });
  ACT.prev = () => { const e = ELEM[S.sel.id], c = COMP[e.comp], i = c.items.indexOf(e); select({ kind: 'elem', id: c.items[(i + c.n - 1) % c.n].key }); };
  ACT.next = () => { const e = ELEM[S.sel.id], c = COMP[e.comp], i = c.items.indexOf(e); select({ kind: 'elem', id: c.items[(i + 1) % c.n].key }); };
  ACT.iso = () => { iso(!S.iso); renderPanel(true); };
  ACT.all = () => { select(null); setView('iso'); };
  ACT.door = () => { S.autoDoor = false; setDoor(!S.door); renderPanel(true); };
  ACT.run = () => { setRun(!S.run); };
  ACT.xray = () => { S.autoXray = false; setXray(!S.xray); };
  ACT.estop = () => { setEstop(!S.stop); renderPanel(true); };
  ACT.explode = () => { animateExplode(S.exp > 0.5 ? 0 : 1); };
  ACT.heat = d => setHeat(d.h);
  ACT.mode = d => setMode(d.m);
  ACT.goTask = d => { setMode('ruta'); window.MODES && window.MODES.openTask(d.fid, d.code); };
  ACT.desIn = () => { const id = compOf(S.sel); (D.compMode === 'radial' && D.compId === id) ? desStopComp() : desStartComp(id, 'radial'); };
  ACT.desSep = () => { const id = compOf(S.sel); (D.compMode === 'sheet' && D.compId === id) ? desStopComp() : desStartComp(id, 'sheet'); };
  ACT.desEl = () => { D.elem === S.sel.id ? desStopElem(false) : desStartElem(S.sel.id); };
  const _render = renderPanel; renderPanel = function (k) { _render(k); bindDes(); };
  ACT.tour = () => {
    let i = 0; stopAuto(); const order = TAXO.comps.map(c => c.id);
    const step = () => {
      if (i >= order.length) { hideBanner(); setView('iso'); select(null, { fly: false }); toast('Recorrido terminado'); return; }
      const c = COMP[order[i]]; select({ kind: 'comp', id: c.id });
      showBanner(`<b>${i + 1}/${order.length} · ${esc(c.name)}</b><small>${esc(c.desc)}</small><small style="margin-top:6px"><a href="#" id="tourSkip" style="color:var(--amber)">Siguiente ›</a> · <a href="#" id="tourStop" style="color:var(--ink-soft)">Salir</a></small>`);
      $('#tourSkip').onclick = ev => { ev.preventDefault(); clearTimeout(tourTimer); i++; step(); };
      $('#tourStop').onclick = ev => { ev.preventDefault(); clearTimeout(tourTimer); hideBanner(); };
      tourTimer = setTimeout(() => { i++; step(); }, 5600);
    };
    step();
  };
  let tourTimer = null;
  $('#panelToggle').addEventListener('click', () => { document.body.classList.toggle('panel-off'); $('#panelToggle').textContent = document.body.classList.contains('panel-off') ? '▸' : '◂'; resize(); });

  /* ============================================================
   *  Menús desplegables (vistas y opciones) y controles de la barra
   * ============================================================ */
  const menuVista = $('#menuVista'), menuMas = $('#menuMas');
  menuVista.innerHTML = VIEWS.map(v => v.g ? `<div class="hd" role="presentation">${v.g}</div>` : `<button role="menuitemradio" aria-checked="${v.id === 'iso'}" data-v="${v.id}"><span class="ck">✓</span>${esc(v.n)}</button>`).join('');
  const chk = (id, label) => `<button role="menuitemcheckbox" aria-checked="false" data-chk="${id}"><span class="ck">✓</span>${label}</button>`;
  const rad = (grp, val, label, on) => `<button role="menuitemradio" aria-checked="${!!on}" data-${grp}="${val}"><span class="ck">✓</span>${label}</button>`;
  menuMas.innerHTML = `${chk('rot', 'Giro automático')}${chk('labels', 'Etiquetas de secciones')}${chk('door', 'Puerta del gabinete')}${chk('estop', 'Paro de emergencia')}
    <div class="sep" role="separator"></div><div class="hd" role="presentation">Mapa de calor</div>
    ${rad('heat', 'none', 'Apagado', true)}${rad('heat', 'refs', 'Severidad de refacciones')}${rad('heat', 'fallas', 'Fallas históricas (OT)')}
    <div class="sep" role="separator"></div><div class="hd" role="presentation">Calidad del modelo</div>
    ${rad('q', '1', 'Estándar', !(detailLevel > 1))}${rad('q', '1.6', 'Alta', detailLevel === 1.6)}${rad('q', '2.4', 'Máxima')}
    <div class="sep" role="separator"></div>${chk('hd', 'Más píxeles (HD)')}`;
  setChk('rot', true);
  function setChk(id, v) { $$(`[data-chk="${id}"]`).forEach(b => b.setAttribute('aria-checked', String(!!v))); }
  function closeMenus() { let was = false; $$('.dd.open').forEach(d => { d.classList.remove('open'); $('.dbtn', d).setAttribute('aria-expanded', 'false'); was = true; }); return was; }
  function openMenu(dd) { const was = dd.classList.contains('open'); closeMenus(); if (!was) { dd.classList.add('open'); $('.dbtn', dd).setAttribute('aria-expanded', 'true'); const f = $('.menu [aria-checked="true"], .menu button, .menu input', dd); if (f && f.focus) f.focus({ preventScroll: true }); } }
  $$('.dd').forEach(dd => { $('.dbtn', dd).addEventListener('click', e => { e.stopPropagation(); openMenu(dd); }); dd.addEventListener('keydown', e => {
    if (!dd.classList.contains('open')) return;
    const items = $$('.menu button', dd), i = items.indexOf(document.activeElement);
    if (e.key.indexOf('Arrow') === 0 && !items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); } else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    else if (e.key === 'Escape') { closeMenus(); $('.dbtn', dd).focus(); e.stopPropagation(); }
  }); });
  document.addEventListener('click', e => { if (!e.target.closest('.dd')) closeMenus(); });
  menuVista.addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (!b) return; stopAuto(); setView(b.dataset.v); closeMenus(); });
  menuMas.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.chk) {
      const id = b.dataset.chk;
      if (id === 'rot') { controls.autoRotate = !controls.autoRotate; setChk('rot', controls.autoRotate); }
      else if (id === 'labels') { S.labels = !S.labels; setChk('labels', S.labels); $('#labels').style.display = S.labels ? 'block' : 'none'; }
      else if (id === 'door') { S.autoDoor = false; setDoor(!S.door); if (S.mode === 'explorar') renderPanel(true); }
      else if (id === 'estop') setEstop(!S.stop);
      else if (id === 'hd') { hd = !hd; setChk('hd', hd); setPixelRatio(); }
    } else if (b.dataset.heat) setHeat(b.dataset.heat);
    else if (b.dataset.q) { $$('[data-q]', menuMas).forEach(x => x.setAttribute('aria-checked', String(x === b))); rebuild(parseFloat(b.dataset.q)); }
    closeMenus();
  });
  function setHeat(h) { S.heat = h; $$('[data-heat]', menuMas).forEach(x => x.setAttribute('aria-checked', String(x.dataset.heat === h))); refresh(); if (S.mode === 'analisis') renderPanel(true); }
  function iso(v) { S.iso = v; $('#bIso').classList.toggle('on', v); refresh(); }
  function setRun(v) {
    if (v && S.stop) { toast('Restablece primero el paro de emergencia'); return; }
    if (v && (D.compMode || D.elem)) desStopAll(false);
    S.run = v; model.setRunning(v); $('#bRun').classList.toggle('on', v); $('#bRun').textContent = v ? '■ Detener' : '▶ Operación'; if (S.mode === 'explorar' && S.sel) renderPanel(true);
  }
  function setEstop(v) {
    S.stop = v; model.setEstop(v); setChk('estop', v); if (v) toast('Paro de emergencia accionado: el túnel se detiene'); else toast('Paro de emergencia restablecido');
    if (S.mode === 'explorar' && S.sel) renderPanel(true);
  }
  $('#bRun').addEventListener('click', () => setRun(!S.run));
  $('#bXray').addEventListener('click', () => { S.autoXray = false; viewXray = false; setXray(!S.xray); });
  $('#bIso').addEventListener('click', () => { D.autoIso = false; if (!S.sel && !S.focus && !S.iso) toast('Selecciona una pieza para aislarla'); iso(!S.iso); renderPanel(true); });
  $('#bDes').addEventListener('click', () => {
    if (!S.sel) { toast('Selecciona primero una sección o un elemento'); return; }
    const id = compOf(S.sel); if (D.compMode === 'radial' && D.compId === id) desStopComp(); else desStartComp(id, 'radial');
  });
  function animateExplode(to) {
    const from = S.exp, t0 = performance.now(); if (to > from && !S.sel) setView('iso');
    (function step() { const k = Math.min(1, (performance.now() - t0) / 900), v = from + (to - from) * ease(k); S.exp = v; model.setExplode(v); $('#sExp').value = Math.round(v * 100); $('#vExp').textContent = Math.round(v * 100) + ' %'; syncExp(); if (k < 1) requestAnimationFrame(step); })();
    stopAuto();
  }
  $('#sExp').addEventListener('input', e => { S.exp = e.target.value / 100; model.setExplode(S.exp); $('#vExp').textContent = e.target.value + ' %'; syncExp(); if (S.exp > 0.02) stopAuto(); });
  function syncExp() { $('#bExp').classList.toggle('on', S.exp > 0.02 || S.cut > 0.02); }
  $('#sCut').addEventListener('input', e => { S.cut = e.target.value / 100; cutPlane.constant = S.cut === 0 ? 100 : 0.72 - S.cut * 1.5; $('#vCut').textContent = e.target.value + ' %'; syncExp(); });
  function rebuild(detail) {
    detailLevel = detail; const ld = $('#loading'); $('#loadTxt').textContent = 'Reconstruyendo la malla…'; ld.classList.remove('done');
    setTimeout(() => { mountModel(detail); renderPanel(); highlightList(); requestAnimationFrame(() => ld.classList.add('done')); }, 60);
  }

  /* ---------- etiquetas de sección ---------- */
  const labelsEl = $('#labels'); labelsEl.style.display = 'none';
  const pins = TAXO.comps.map((c, k) => { const d = document.createElement('div'); d.className = 'lbl'; d.innerHTML = `<i style="background:${c.color}">${k + 1}</i><span>${esc(c.name)}</span>`; d.onclick = () => select({ kind: 'comp', id: c.id }); labelsEl.appendChild(d); return { d, c }; });
  const v3 = new THREE.Vector3();
  function updateLabels() {
    if (!S.labels) return; const w = canvas.clientWidth, h = canvas.clientHeight;
    pins.forEach(p => { const ci = model.compInfo[p.c.id]; v3.copy(ci.box.getCenter(V3(0, 0, 0))); v3.y = ci.box.max.y; v3.project(camera); const vis = v3.z < 1 && Math.abs(v3.x) < 1.1 && Math.abs(v3.y) < 1.1 && !D.compMode; p.d.style.display = vis ? 'flex' : 'none'; p.d.style.left = ((v3.x + 1) / 2 * w) + 'px'; p.d.style.top = ((1 - v3.y) / 2 * h) + 'px'; });
  }

  /* ---------- modos ---------- */
  function setMode(m) {
    if (S.mode === m && m !== 'explorar') return;
    hideBanner(); clearTimeout(tourTimer);
    if (window.MODES && window.MODES.leave) window.MODES.leave(S.mode, m);
    S.mode = m; S.onPick = null;
    $$('#modes button').forEach(b => b.classList.toggle('on', b.dataset.mode === m));
    document.body.dataset.mode = m;
    if (m !== 'explorar') { desStopAll(true); S.sel = null; S.focus = null; refresh(); highlightList(); }
    document.body.classList.remove('panel-off'); $('#panelToggle').textContent = '◂';
    if (window.MODES && window.MODES.enter) window.MODES.enter(m);
    renderPanel(); resize();
  }
  $$('#modes button').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));

  /* ---------- tamaño y ciclo de render ---------- */
  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.fov = w / h < 1.1 ? 2 * Math.atan(Math.min(0.5 / (w / h), 0.78)) * 180 / Math.PI : 34; camera.updateProjectionMatrix(); applyOffset();
    document.documentElement.style.setProperty('--dockH', $('#dock').offsetHeight + 'px');
  }
  function applyOffset() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (window.matchMedia('(max-width: 900px)').matches || !w) { camera.clearViewOffset(); return; }
    const R = document.body.classList.contains('panel-off') ? 10 : 410, Lw = 270;
    camera.setViewOffset(w, h, (R - Lw) / 2, 0, w, h);
  }
  window.addEventListener('resize', resize);
  const clock = new THREE.Clock(), fpsLog = [];
  let fpsDone = !!navigator.webdriver;
  function loop() {
    requestAnimationFrame(loop);
    const raw = clock.getDelta(), dt = Math.min(raw, 0.05), t = performance.now();
    if (!fpsDone && t > 2500) { fpsLog.push(raw); if (fpsLog.length >= 60) { fpsDone = true; fpsLog.sort((a, b) => a - b); const med = fpsLog[30]; if (med > 0.05 && detailLevel > 1) { $$('[data-q]', menuMas).forEach(x => x.setAttribute('aria-checked', String(x.dataset.q === '1'))); rebuild(1); toast('Malla ajustada a Estándar para mantener la fluidez. Puedes subirla en Más.'); } } }
    if (tween) { const k = Math.min(1, (t - tween.t0) / tween.ms), e = ease(k); camera.position.lerpVectors(tween.p0, tween.p1, e); controls.target.lerpVectors(tween.g0, tween.g1, e); if (k >= 1) tween = null; }
    controls.update(); model.update(dt); despiece.update(dt);
    const kk = 0.5 + 0.22 * Math.sin(t / 220); hiMats.forEach(m => { m.emissiveIntensity = kk; });
    updateLabels(); updatePins(); renderer.render(scene, camera);
  }

  /* ---------- API compartida con los modos y arranque ---------- */
  const TS = window.TS = {
    S, D, COMP, ELEM, TAXO, DATA, INFO, TASKS, ACT, MODE_RENDER, $, $$, esc, store, nice, clean, sentence, tag, sevTag, nivelLabel, FREQ, SEV_ORDER, SEV_LABEL, SEV_CLASS, SEV_HEX,
    tasksFor, refsFor, fallasFor, tasksForComp, refsForComp, fallasForComp, dataOf, dataOfComp, infoOf, select, setFocus, focusKeys, setView, flyTo, stopAuto, toast, showBanner, hideBanner, refresh, renderPanel: (k) => renderPanel(k),
    setRun, setEstop, setDoor, setXray, setHeat, setMode, iso, V3, camera, controls, renderer, scene, get model() { return model; }, set model(v) { model = v; }, get despiece() { return despiece; }, set despiece(v) { despiece = v; }, rebuild, desStartComp, desStopComp, desStartElem, desStopElem
  };
  $('#loadTxt').textContent = 'Construyendo modelo 3D…';
  buildTree(); resize(); setPixelRatio();
  camera.position.copy(viewPos(VIEWS[1]));
  setTimeout(() => {   // deja pintar la pantalla de carga antes de generar la malla
    mountModel(detailLevel); renderPanel();
    if (SMALL) document.body.classList.add('panel-off');
    $('#panelToggle').textContent = SMALL ? '▸' : '◂';
    requestAnimationFrame(() => { $('#loading').classList.add('done'); loop(); if (window.MODES && window.MODES.ready) window.MODES.ready(); });
    window.__ts = TS;
  }, 30);
})();
