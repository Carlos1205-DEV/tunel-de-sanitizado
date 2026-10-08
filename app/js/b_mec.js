/* BOQUILLA DE ASPERSIÓN (Unijet) · MOTORREDUCTOR WEG 0.5 HP + REDUCTOR SIN FIN 40:1 (en la caja inox del lado B) + SOLENOIDE 3/4" (dentro del gabinete)
 * · BOMBA DOSSATRON D14MZ2-D (abrazada al borde de la tina, lado B) · BOTONERA BM13 (paro de emergencia en la puerta del gabinete).
 * Referencia: fotos 3, 4, 6, 7 y 10 de la rutina mensual, dibujos del manual (imágenes 49–54 del Excel) y respuestas del usuario. */
(function () {
  'use strict';
  window.MODEL_BUILDERS.push(function (K) {
    const { THREE, PI, TAU, el, box, rbox, cyl, torus, sphere, lathe, extrude, mesh, bolts, nuts, washers, pipe, hose, spin, anim, state } = K;
    const L = K.L, P = K.parts;
    const grp = (parent, x, y, z) => { const o = new THREE.Group(); o.position.set(x, y, z); parent.add(o); return o; };

    /* ---------- solenoide de agua con bobina (eje del flujo en X) ---------- */
    P.solenoid = function (s) {
      const g = new THREE.Group();
      g.add(rbox(0.07 * s, 0.05 * s, 0.05 * s, 0.008 * s, 'brass', { pos: [0, 0, 0] }));
      [-1, 1].forEach(k => {
        g.add(cyl(0.0185 * s, 0.0185 * s, 0.026 * s, 'brass', { axis: 'x', pos: [k * 0.047 * s, 0, 0], seg: 6 }));
        g.add(cyl(0.0125 * s, 0.0125 * s, 0.03 * s, 'brass', { axis: 'x', pos: [k * 0.073 * s, 0, 0], seg: 20 }));
      });
      g.add(cyl(0.015 * s, 0.015 * s, 0.03 * s, 'brass', { pos: [0, 0.04 * s, 0], seg: 24 }));
      g.add(cyl(0.0255 * s, 0.0255 * s, 0.062 * s, 'black', { pos: [0, 0.086 * s, 0], seg: 36 }));
      g.add(cyl(0.0265 * s, 0.0265 * s, 0.006 * s, 'steelDark', { pos: [0, 0.058 * s, 0], seg: 36 }));
      g.add(cyl(0.0265 * s, 0.0265 * s, 0.006 * s, 'steelDark', { pos: [0, 0.115 * s, 0], seg: 36 }));
      g.add(cyl(0.011 * s, 0.011 * s, 0.014 * s, 'brass', { pos: [0, 0.124 * s, 0], seg: 6 }));
      g.add(rbox(0.036 * s, 0.03 * s, 0.026 * s, 0.004 * s, 'black', { pos: [0.032 * s, 0.098 * s, 0] }));
      g.add(cyl(0.0042 * s, 0.0042 * s, 0.01 * s, 'steel', { axis: 'x', pos: [0.054 * s, 0.098 * s, 0], seg: 12 }));
      g.add(bolts([[0, 0.025 * s, 0.0265 * s]], 0.005 * s, 0.01 * s, 'z', { mat: 'steel' }));
      return g;
    };

    /* ---------- SPREA · boquilla hidráulica de niebla Unijet 1/8" SF-CE3 ---------- */
    {
      const g1 = el('spray', 1), N = L.nozzle, o = grp(g1, N.x, N.y, N.z);
      o.add(cyl(0.0058, 0.0058, 0.034, 'steel', { pos: [0, 0.047, 0], seg: 16 }));
      o.add(cyl(0.0098, 0.0098, 0.016, 'brass', { pos: [0, 0.018, 0], seg: 6 }));
      o.add(lathe([[0.0, 0.0], [0.0075, 0.0], [0.0095, 0.004], [0.0095, 0.012], [0.0075, 0.016], [0.0, 0.016]], 'steelDark', { pos: [0, -0.02, 0], seg: 28 }));
      o.add(cyl(0.0065, 0.0065, 0.012, 'brass', { pos: [0, -0.002, 0], seg: 20 }));
      o.add(cyl(0.0022, 0.0022, 0.004, 'black', { pos: [0, -0.0205, 0], seg: 12 }));
      for (let i = 0; i < 8; i++) { const a = i * TAU / 8; o.add(box(0.0016, 0.012, 0.0016, 'steel', { pos: [Math.cos(a) * 0.0088, -0.0105, Math.sin(a) * 0.0088], cast: false })); }
      // niebla de aspersión (cono de partículas), solo con agua abierta
      const n = 520, geom = new THREE.BufferGeometry(), arr = new Float32Array(n * 3); geom.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      const dot = K.canvasTex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(w / 2, h / 2, 1, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
      const pm = new THREE.PointsMaterial({ color: 0xdff0ff, size: 0.02, map: dot, transparent: true, opacity: 0.55, depthWrite: false, sizeAttenuation: true });
      const pts = new THREE.Points(geom, pm); pts.frustumCulled = false; pts.visible = false; pts.userData.mist = true; pts.userData.floor = true; K.root.add(pts);
      const P0 = [N.x, N.y - 0.022, N.z], yEnd = 0.938, parts = [];
      for (let i = 0; i < n; i++) parts.push({ a: Math.random() * TAU, k: 0.18 + Math.random() * 0.82, t: Math.random(), v: 0.35 + Math.random() * 0.45 });
      anim.push((dt, st) => {
        pts.visible = st.flow > 0.05; pm.opacity = 0.55 * Math.min(1, st.flow); if (!pts.visible) return;
        const H = P0[1] - yEnd;
        for (let i = 0; i < n; i++) {
          const p = parts[i]; p.t += dt * p.v * 1.4; if (p.t > 1) { p.t -= 1; p.a = Math.random() * TAU; p.k = 0.18 + Math.random() * 0.82; }
          const r = 0.005 + p.k * 0.17 * Math.pow(p.t, 0.8), y = P0[1] - H * p.t;
          arr[i * 3] = P0[0] + Math.cos(p.a) * r; arr[i * 3 + 1] = y; arr[i * 3 + 2] = P0[2] + Math.sin(p.a) * r;
        }
        geom.attributes.position.needsUpdate = true;
      });
    }

    /* ---------- MOTORREDUCTOR (dentro de la caja del lado B) · 1 motor WEG, 2 reductor sin fin, 3 solenoide (dentro del gabinete) ---------- */
    {
      const g1 = el('motorreductor', 1), g2 = el('motorreductor', 2), g3 = el('motorreductor', 3), M = L.motor, ys = L.ys;
      // reductor de carcasa de aluminio: salida hueca en Z (hacia el cople), entrada (brida NEMA C56) hacia abajo, posición V6 del reductor
      g2.add(rbox(0.13, 0.15, 0.14, 0.022, 'alum', { pos: [M.x, ys, M.z] }));
      g2.add(cyl(0.05, 0.05, 0.012, 'alum', { axis: 'z', pos: [M.x, ys, M.z + 0.076], seg: 44 }));
      g2.add(cyl(0.05, 0.05, 0.012, 'alum', { axis: 'z', pos: [M.x, ys, M.z - 0.076], seg: 44 }));
      g2.add(torus(0.0285, 0.0045, 'black', { axis: 'z', pos: [M.x, ys, M.z + 0.083], seg: 32 }));             // retén de salida
      g2.add(cyl(0.0125, 0.0125, 0.09, 'steel', { axis: 'z', pos: [M.x, ys, M.z + 0.115], seg: 32 }));         // flecha hueca / eje de salida
      g2.add(cyl(0.0295, 0.0295, 0.018, 'alum', { pos: [M.x, ys - 0.074, M.z], seg: 40 }));                   // brida de entrada
      const fb = []; for (let i = 0; i < 4; i++) fb.push([M.x + Math.cos(i * PI / 2 + PI / 4) * 0.0445, ys - 0.07, M.z + Math.sin(i * PI / 2 + PI / 4) * 0.0445]);
      g2.add(bolts(fb, 0.0075, 0.014, 'ny', { mat: 'steel' }));
      g2.add(cyl(0.0115, 0.0115, 0.024, 'brass', { pos: [M.x - 0.02, ys + 0.087, M.z - 0.02], seg: 16 }));        // tapón de aceite
      g2.add(cyl(0.0085, 0.0085, 0.02, 'brass', { pos: [M.x - 0.03, ys - 0.082, M.z + 0.03], seg: 16 }));         // tapón de drenaje
      g2.add(rbox(0.05, 0.03, 0.04, 0.005, 'alum', { pos: [M.x, 0.8285, M.z] }));                                // pata para el brazo de reacción
      g2.add(K.label('REDUCTOR 40:1\n43.8 RPM', 0.07, 0.04, { bg: '#d8dde2', fg: '#111', fs: 20, pos: [M.x - 0.0, ys + 0.0, M.z + 0.0702 + 0.0] }));
      const o = grp(g2, M.x, ys, 0); spin(o, 'z', -1); o.add(cyl(0.0125, 0.0125, 0.085, 'steel', { axis: 'z', pos: [0, 0, M.z + 0.118 - 0.0], seg: 32 }));
      // motor trifásico WEG TEFC con carcasa de lámina rolada, colgado hacia abajo del reductor (se construye con el eje en +X y se gira 90°)
      const mo = grp(g1, M.x, ys, M.z); mo.rotation.z = -PI / 2;
      const mx = 0.083;
      mo.add(cyl(0.062, 0.062, 0.19, 'weg', { axis: 'x', pos: [mx + 0.105, 0, 0], seg: 48 }));
      for (let i = 0; i < 3; i++) mo.add(torus(0.0625, 0.0032, 'weg', { axis: 'x', pos: [mx + 0.04 + i * 0.065, 0, 0], seg: 48 }));
      mo.add(cyl(0.064, 0.064, 0.012, 'weg', { axis: 'x', pos: [mx + 0.006, 0, 0], seg: 48 }));
      mo.add(lathe([[0.0, 0.0], [0.058, 0.0], [0.063, 0.006], [0.063, 0.045], [0.052, 0.058], [0.0, 0.058]], 'black', { axis: 'x', pos: [mx + 0.2, 0, 0], seg: 48 }));
      for (let i = 0; i < 12; i++) { const a = i * TAU / 12; mo.add(box(0.012, 0.0052, 0.0026, 'steelDark', { pos: [mx + 0.255, Math.cos(a) * 0.045, Math.sin(a) * 0.045], rot: [-a, 0, 0], cast: false })); }
      mo.add(rbox(0.07, 0.044, 0.062, 0.007, 'black', { pos: [mx + 0.105, 0.077, 0] }));                         // caja de conexiones
      mo.add(cyl(0.011, 0.011, 0.022, 'steelDark', { pos: [mx + 0.105, 0.108, 0], seg: 20 }));
      mo.add(K.label('WEG 0.5 HP\n4P 230/460V', 0.08, 0.045, { bg: '#e0e3e6', fg: '#0d2f66', fs: 22, pos: [mx + 0.105, 0.0, -0.0625], rot: [0, PI, 0] }));
      // solenoide de 3/4" (agua) · bobina 220 VAC: va en el fondo del gabinete (foto 4)
      const cb = L.cab, cbBot = cb.y - cb.h / 2, sol = grp(g3, cb.x + 0.075, cbBot + 0.0215, cb.z + 0.01);
      L.sol1 = [sol.position.x, sol.position.y, sol.position.z];
      sol.add(P.solenoid(0.7));
      const blue = pts => g3.add(hose(pts, 0.0072, 'cableBlue', { tension: 0.35, radial: 12 }));
      const sx0 = L.sol1[0], sy0 = L.sol1[1], sz0 = L.sol1[2], pr = 0.088 * 0.7;
      blue([[cb.x - 0.07, cbBot - 0.012, cb.z + 0.03], [cb.x - 0.07, cbBot + 0.02, cb.z + 0.03], [sx0 - pr, sy0, sz0]]);
      blue([[sx0 + pr, sy0, sz0], [sx0 + pr + 0.02, sy0 + 0.04, sz0 + 0.012], [sx0 - 0.01, sy0 + 0.085, sz0 + 0.02], [cb.x - 0.02, sy0 + 0.07, sz0 + 0.02], [cb.x - 0.02, sy0 + 0.02, cb.z + 0.03], [cb.x - 0.02, cbBot - 0.012, cb.z + 0.03]]);
    }

    /* ---------- solenoide del túnel (transmision:33, sin número de parte en el manual): válvula de la línea hacia la campana (aproximado) ---------- */
    {
      const s2 = L.sol2, sg = grp(el('transmision', 33), s2[0], s2[1], s2[2]); const v = P.solenoid(0.8); v.rotation.z = -PI / 2; sg.add(v);
    }

    /* ---------- BOMBA DOSSATRON D14MZ2-D abrazada al borde de la tina, lado B (fotos 7 y 10) ---------- */
    {
      const g1 = el('dossatron', 1), d = L.dos, Y = L.dosY, o = grp(g1, d.x, 0, d.z), wallLoc = -(L.tray.zW + L.tray.t / 2) - d.z;   // z local de la cara exterior de la tina
      const ty = Y.tee;
      // te de PVC gris con uniones y púas (entrada de agua a la izquierda, salida a la derecha)
      o.add(cyl(0.0235, 0.0235, 0.11, 'pvcGray', { axis: 'x', pos: [0, ty, 0], seg: 32 }));
      [-1, 1].forEach(s => { o.add(cyl(0.031, 0.031, 0.02, 'pvcGray', { axis: 'x', pos: [s * 0.058, ty, 0], seg: 6 })); o.add(cyl(0.0125, 0.0125, 0.034, 'pvcGray', { axis: 'x', pos: [s * 0.083, ty, 0], seg: 20 })); });
      o.add(cyl(0.0285, 0.0285, 0.05, 'pvcGray', { pos: [0, ty + 0.035, 0], seg: 32 }));
      o.add(cyl(0.034, 0.034, 0.02, 'pvcGray', { pos: [0, ty + 0.07, 0], seg: 6 }));                              // tuerca de unión
      // cuerpo negro nervado (motor hidráulico) y anillo blanco
      o.add(cyl(0.035, 0.035, 0.11, 'black', { pos: [0, Y.housing + 0.055, 0], seg: 40 }));
      for (let i = 0; i < 4; i++) o.add(torus(0.0352, 0.0011, 'black', { axis: 'y', pos: [0, Y.housing + 0.02 + i * 0.024, 0], seg: 40 }));
      o.add(cyl(0.0425, 0.0425, 0.014, 'white', { pos: [0, Y.housing + 0.117, 0], seg: 40 }));
      // domo azul con su tapa negra
      const dy0 = Y.housing + 0.124;
      o.add(lathe([[0.0425, 0.0], [0.0575, 0.008], [0.0585, 0.09], [0.0562, 0.112], [0.046, 0.152], [0.022, 0.178], [0.0, 0.185]], 'dosBlue', { pos: [0, dy0, 0], seg: 56 }));
      o.add(cyl(0.0195, 0.0195, 0.03, 'black', { pos: [0, dy0 + 0.198, 0], seg: 32 }));
      o.add(cyl(0.0135, 0.0135, 0.008, 'steelDark', { pos: [0, dy0 + 0.217, 0], seg: 24 }));
      o.add(K.label('DOSATRON\nD14MZ2', 0.07, 0.045, { bg: '#1a3cae', fg: '#e6eeff', fs: 26, pos: [0, dy0 + 0.08, -0.0594], rot: [0, PI, 0] }));
      // púas del cuerpo negro: succión (a la izquierda) y manguera transparente reforzada (a la derecha)
      o.add(cyl(0.007, 0.007, 0.026, 'pvcGray', { axis: 'x', pos: [-0.046, 0.69, 0], seg: 14 }));
      o.add(cyl(0.0125, 0.0125, 0.03, 'pvcGray', { axis: 'x', pos: [0.046, 0.715, -0.005], seg: 20 }));
      o.add(cyl(0.012, 0.012, 0.03, 'pvcGray', { pos: [0.01, ty - 0.02, 0], seg: 20 }));                           // salida del drenaje crema
      // abrazadera de acero inoxidable al cuello del domo y soporte atornillado a la pared de la tina
      o.add(torus(0.0595, 0.004, 'steel', { axis: 'y', pos: [0, Y.clamp, 0], seg: 40 }));
      o.add(rbox(0.03, 0.016, wallLoc - 0.0595 - 0.002, 0.003, 'inox', { pos: [0, Y.clamp, (wallLoc + 0.0595) / 2] }));
      o.add(rbox(0.05, 0.11, 0.004, 0.002, 'inox', { pos: [0, 0.83, wallLoc - 0.002] }));
      o.add(bolts([[-0.013, 0.855, wallLoc - 0.004], [-0.013, 0.805, wallLoc - 0.004]], 0.006, 0.014, 'nz', { mat: 'steel' }));
      o.add(bolts([[0.013, 0.855, wallLoc - 0.004], [0.013, 0.805, wallLoc - 0.004]], 0.006, 0.014, 'nz', { mat: 'steel' }));
      // abrazaderas de manguera en las púas
      [[-0.052, 0.69, 0, PI / 2], [0.058, 0.715, -0.005, PI / 2], [-0.108, ty, 0, PI / 2], [0.108, ty, 0, PI / 2]].forEach((c, i) => { const cl = P.hoseClamp(i === 0 ? 0.0075 : 0.0132); cl.position.set(c[0], c[1], c[2]); cl.rotation.z = c[3]; o.add(cl); });
    }

    /* ---------- BOTONERA BM13 · paro de emergencia con 2 placas, varilla y tornillería inoxidable, montada en la puerta del gabinete (foto 3) ---------- */
    {
      const gs = [], fol = [];
      for (let i = 1; i <= 11; i++) { gs[i] = el('botonera', i); fol[i] = new THREE.Group(); fol[i].userData.follow = true; gs[i].add(fol[i]); }
      K.doorFollowers = fol.slice(1);
      const cb = L.cab, x = cb.x + 0.01, y = cb.y - 0.084, zf = cb.z + cb.d / 2 + 0.01;   // cara exterior de la puerta cerrada
      const rp = (w, h, ho) => K.hullShape([[-w / 2 + 0.008, -h / 2 + 0.008, 0.008], [w / 2 - 0.008, -h / 2 + 0.008, 0.008], [-w / 2 + 0.008, h / 2 - 0.008, 0.008], [w / 2 - 0.008, h / 2 - 0.008, 0.008]], ho);
      const qs = [[-0.02, -0.02], [0.02, 0.02], [-0.02, 0.02], [0.02, -0.02]];
      const zP2 = zf + 0.002, zRod0 = zf + 0.004, zRod1 = zf + 0.012, zP1 = zf + 0.014;
      fol[3].add(extrude(rp(0.056, 0.056, qs.map(q => [q[0], q[1], 0.0045])), 0.004, 'inox', { seg: 8, pos: [x, y, zP2] }));          // placa 2: sobre la puerta
      fol[2].add(extrude(rp(0.056, 0.056, qs.map(q => [q[0], q[1], 0.0045])), 0.004, 'inox', { seg: 8, pos: [x, y, zP1] }));          // placa 1: sostiene el pulsador
      fol[4].add(cyl(0.0095, 0.0095, zRod1 - zRod0, 'steel', { axis: 'z', pos: [x, y, (zRod0 + zRod1) / 2], seg: 24 }));               // varilla
      // pulsador: cuerpo negro, collarín amarillo y hongo rojo
      const zb = zP1 + 0.002;
      fol[1].add(cyl(0.0225, 0.0225, 0.012, 'black', { axis: 'z', pos: [x, y, zb + 0.006], seg: 40 }));
      fol[1].add(cyl(0.0245, 0.0245, 0.006, 'yellow', { axis: 'z', pos: [x, y, zb + 0.015], seg: 40 }));
      const cap = lathe([[0.0, 0.0], [0.0205, 0.0], [0.0232, 0.006], [0.0238, 0.016], [0.0205, 0.0225], [0.0, 0.0245]], 'estop', { axis: 'z', pos: [x, y, zb + 0.018], seg: 48 });
      fol[1].add(cap); K.estopCap = cap; K.estopCapZ = cap.position.z;
      // tornillería (nombres de la taxonomía): 7 tornillos de botón ×4, 8 rondanas planas ×8, 9 tuercas ×4, 10 allen ×2, 5/6 rondanas ×2, 11 tuercas de bellota ×2
      const bp = qs.map(q => [x + q[0], y + q[1]]);
      fol[7].add(bolts(bp.map(q => [q[0], q[1], zP1 + 0.002]), 0.0064, 0.022, 'z', { mat: 'steel' }));
      fol[8].add(washers(bp.map(q => [q[0], q[1], zP1 + 0.0035]), 0.0064, 'z', { mat: 'steel' }));
      fol[8].add(washers(bp.map(q => [q[0], q[1], zP1 - 0.0045]), 0.0064, 'z', { mat: 'steel' }));
      fol[9].add(nuts(bp.map(q => [q[0], q[1], zP1 - 0.0095]), 0.0064, 'z', { mat: 'steel' }));
      fol[10].add(bolts([[x - 0.02, y - 0.02, zP2 + 0.0025], [x + 0.02, y + 0.02, zP2 + 0.0025]], 0.0079, 0.019, 'z', { mat: 'steel' }));
      fol[5].add(washers([[x, y, zRod0 + 0.0015], [x, y, zRod1 - 0.0015]], 0.0079, 'z', { mat: 'steel' }));
      fol[6].add(washers([[x, y, zRod0 + 0.0045], [x, y, zRod1 - 0.0045]], 0.0079, 'z', { mat: 'steelDark' }));
      [[zRod0 - 0.0075, -1], [zRod1 + 0.0075 + 0.002, 1]].forEach(([z, s]) => { const o = grp(fol[11], x, y, z); o.add(nuts([[0, 0, 0]], 0.0079, 'z', { mat: 'steel' })); o.add(sphere(0.0069, 'steel', { pos: [0, 0, s * 0.0052], scl: [1, 1, 0.8] })); });
      K.setEstopLook = v => { if (K.estopCap) K.estopCap.position.z = K.estopCapZ - (v ? 0.006 : 0); };
    }
  });
})();
