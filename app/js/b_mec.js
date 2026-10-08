/* BOQUILLA DE ASPERSIÓN (Unijet) · MOTORREDUCTOR WEG 0.5 HP + REDUCTOR SIN FIN 40:1 + SOLENOIDE 3/4" · BOMBA DOSSATRON D14MZ2-D · BOTONERA BM13.
 * Referencia: imágenes 49–54 del Excel (nomenclatura de cada componente) y fotos 7 y 10 de la rutina mensual. */
(function () {
  'use strict';
  window.MODEL_BUILDERS.push(function (K) {
    const { THREE, PI, TAU, el, box, rbox, cyl, torus, sphere, lathe, extrude, mesh, bolts, nuts, washers, pipe, spin, anim, state } = K;
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

    /* ---------- MOTORREDUCTOR · 1 motor WEG, 2 reductor sin fin, 3 solenoide ---------- */
    {
      const g1 = el('motorreductor', 1), g2 = el('motorreductor', 2), g3 = el('motorreductor', 3), M = L.motor, ys = L.ys;
      // reductor de carcasa de aluminio: salida en Z, entrada (brida NEMA C56) en +X
      g2.add(rbox(0.13, 0.15, 0.14, 0.022, 'alum', { pos: [M.x, ys, M.z] }));
      g2.add(cyl(0.05, 0.05, 0.012, 'alum', { axis: 'z', pos: [M.x, ys, M.z + 0.076], seg: 44 }));
      g2.add(cyl(0.05, 0.05, 0.012, 'alum', { axis: 'z', pos: [M.x, ys, M.z - 0.076], seg: 44 }));
      g2.add(torus(0.0285, 0.0045, 'black', { axis: 'z', pos: [M.x, ys, M.z + 0.083], seg: 32 }));             // retén de salida
      g2.add(cyl(0.0125, 0.0125, 0.09, 'steel', { axis: 'z', pos: [M.x, ys, M.z + 0.115], seg: 32 }));         // flecha hueca / eje de salida
      g2.add(cyl(0.0295, 0.0295, 0.018, 'alum', { axis: 'x', pos: [M.x + 0.074, ys, M.z], seg: 40 }));
      const fb = []; for (let i = 0; i < 4; i++) fb.push([M.x + 0.07, ys + Math.cos(i * PI / 2 + PI / 4) * 0.0445, M.z + Math.sin(i * PI / 2 + PI / 4) * 0.0445]);
      g2.add(bolts(fb, 0.0075, 0.014, 'x', { mat: 'steel' }));
      g2.add(cyl(0.0115, 0.0115, 0.024, 'brass', { pos: [M.x - 0.02, ys + 0.087, M.z - 0.02], seg: 16 }));        // tapón de aceite
      g2.add(cyl(0.0085, 0.0085, 0.02, 'brass', { pos: [M.x - 0.03, ys - 0.082, M.z + 0.03], seg: 16 }));         // tapón de drenaje
      g2.add(rbox(0.05, 0.03, 0.04, 0.005, 'alum', { pos: [M.x, 0.8285, M.z] }));                                // pata para el brazo de reacción
      g2.add(K.label('REDUCTOR 40:1\n43.8 RPM', 0.07, 0.04, { bg: '#d8dde2', fg: '#111', fs: 20, pos: [M.x - 0.0, ys + 0.0, M.z + 0.0702 + 0.0] }));
      const o = grp(g2, M.x, ys, 0); spin(o, 'z', -1); o.add(cyl(0.0125, 0.0125, 0.085, 'steel', { axis: 'z', pos: [0, 0, M.z + 0.118 - 0.0], seg: 32 }));
      // motor trifásico WEG TEFC con carcasa de lámina rolada
      const mx = M.x + 0.083;
      g1.add(cyl(0.062, 0.062, 0.19, 'weg', { axis: 'x', pos: [mx + 0.105, ys, M.z], seg: 48 }));
      for (let i = 0; i < 3; i++) g1.add(torus(0.0625, 0.0032, 'weg', { axis: 'x', pos: [mx + 0.04 + i * 0.065, ys, M.z], seg: 48 }));
      g1.add(cyl(0.064, 0.064, 0.012, 'weg', { axis: 'x', pos: [mx + 0.006, ys, M.z], seg: 48 }));
      g1.add(lathe([[0.0, 0.0], [0.058, 0.0], [0.063, 0.006], [0.063, 0.045], [0.052, 0.058], [0.0, 0.058]], 'black', { axis: 'x', pos: [mx + 0.2, ys, M.z], seg: 48 }));
      for (let i = 0; i < 12; i++) { const a = i * TAU / 12; g1.add(box(0.012, 0.0052, 0.0026, 'steelDark', { pos: [mx + 0.255, ys + Math.cos(a) * 0.045, M.z + Math.sin(a) * 0.045], rot: [-a, 0, 0], cast: false })); }
      g1.add(rbox(0.07, 0.044, 0.062, 0.007, 'black', { pos: [mx + 0.105, ys + 0.077, M.z] }));                   // caja de conexiones
      g1.add(cyl(0.011, 0.011, 0.022, 'steelDark', { pos: [mx + 0.105, ys + 0.108, M.z], seg: 20 }));
      g1.add(K.label('WEG 0.5 HP\n4P 230/460V', 0.08, 0.045, { bg: '#e0e3e6', fg: '#0d2f66', fs: 22, pos: [mx + 0.105, ys + 0.02, M.z - 0.0], rot: [0, -PI / 2, 0] }));
      g1.children[g1.children.length - 1].position.set(mx + 0.105, ys + 0.02, M.z - 0.0);
      g1.add(rbox(0.12, 0.012, 0.13, 0.003, 'weg', { pos: [mx + 0.105, ys - 0.062, M.z], cast: false }));
      // solenoide de 3/4" (agua) · bobina 220 VAC
      const s1 = L.sol1, sg = grp(g3, s1[0], s1[1], s1[2]); sg.add(P.solenoid(1));
    }

    /* ---------- solenoide del túnel (transmisión:33, sin número de parte en el manual): válvula de la línea hacia la campana ---------- */
    {
      const s2 = L.sol2, sg = grp(el('transmision', 33), s2[0], s2[1], s2[2]); const v = P.solenoid(0.8); v.rotation.y = 0.0; sg.add(v);
    }

    /* ---------- BOMBA DOSSATRON D14MZ2-D (dosificadora accionada por la presión del agua) ---------- */
    {
      const g1 = el('dossatron', 1), d = L.dos, o = grp(g1, d.x, d.y, d.z);
      // pedestal de apoyo
      g1.add(rbox(0.20, 0.008, 0.20, 0.003, 'steelDark', { pos: [d.x, 0.016, d.z] }));
      g1.add(rbox(0.035, 0.37, 0.035, 0.004, 'brushed', { pos: [d.x, 0.205, d.z] }));
      g1.add(rbox(0.17, 0.008, 0.17, 0.003, 'steelDark', { pos: [d.x, 0.394, d.z] }));
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(k => g1.add(cyl(0.022, 0.022, 0.012, 'black', { pos: [d.x + k[0] * 0.08, 0.006, d.z + k[1] * 0.08], seg: 20 })));
      // te de PVC con uniones
      o.add(cyl(0.0235, 0.0235, 0.11, 'pvcGray', { axis: 'x', pos: [0, -0.0, 0], seg: 32 }));
      [-1, 1].forEach(s => { o.add(cyl(0.031, 0.031, 0.02, 'pvcGray', { axis: 'x', pos: [s * 0.058, 0, 0], seg: 6 })); o.add(cyl(0.0125, 0.0125, 0.034, 'pvcGray', { axis: 'x', pos: [s * 0.083, 0, 0], seg: 20 })); });
      o.add(cyl(0.0285, 0.0285, 0.06, 'pvcGray', { pos: [0, 0.04, 0], seg: 32 }));
      o.add(lathe([[0.0285, 0.0], [0.04, 0.012], [0.0525, 0.035], [0.0525, 0.115], [0.049, 0.13]], 'pvcGray', { pos: [0, 0.07, 0], seg: 48 }));
      o.add(cyl(0.0545, 0.0545, 0.014, 'black', { pos: [0, 0.207, 0], seg: 48 }));
      o.add(lathe([[0.0485, 0.0], [0.0575, 0.008], [0.0585, 0.09], [0.0562, 0.112], [0.046, 0.152], [0.022, 0.18], [0.0, 0.1865]], 'dosBlue', { pos: [0, 0.214, 0], seg: 56 }));
      o.add(cyl(0.0195, 0.0195, 0.03, 'black', { pos: [0, 0.414, 0], seg: 32 }));
      o.add(cyl(0.0135, 0.0135, 0.008, 'steelDark', { pos: [0, 0.4325, 0], seg: 24 }));
      o.add(K.label('DOSATRON\nD14MZ2', 0.07, 0.045, { bg: '#e9eef8', fg: '#0d3b8c', fs: 26, pos: [0, 0.29, 0.0592] }));
      // toma de succión (barbo) hacia la garrafa
      o.add(cyl(0.0105, 0.0105, 0.04, 'pvcGray', { axis: 'x', pos: [0.05, -0.04, 0.0], seg: 16 }));
      o.add(cyl(0.0075, 0.0075, 0.03, 'pvcGray', { pos: [0.045, -0.015, 0.0], seg: 16 }));
      o.add(cyl(0.0138, 0.0138, 0.02, 'pvcGray', { pos: [0.045, 0.035, 0.0], seg: 20 }));
      const cl = P.hoseClamp(0.0098); cl.position.set(0.048, -0.04, 0); g1.add(cl); cl.parent.remove(cl); o.add(cl); cl.rotation.z = PI / 2;
      // abrazadera de sujeción al pedestal
      g1.add(torus(0.0295, 0.0035, 'steel', { axis: 'y', pos: [d.x, 0.425, d.z], seg: 28 }));
    }

    /* ---------- BOTONERA BM13 · paro de emergencia con 2 placas, varilla y tornillería inoxidable ---------- */
    {
      const g1 = el('botonera', 1), g2 = el('botonera', 2), g3 = el('botonera', 3), g4 = el('botonera', 4), g5 = el('botonera', 5), g6 = el('botonera', 6), g7 = el('botonera', 7), g8 = el('botonera', 8), g9 = el('botonera', 9), g10 = el('botonera', 10), g11 = el('botonera', 11);
      const x = 0.52, y = 0.56, zA = 0.2325, zB = 0.40;                 // placa 2 sobre la pata · placa 1 en el extremo de la varilla
      const rp = (w, h, ho) => K.hullShape([[-w / 2 + 0.008, -h / 2 + 0.008, 0.008], [w / 2 - 0.008, -h / 2 + 0.008, 0.008], [-w / 2 + 0.008, h / 2 - 0.008, 0.008], [w / 2 - 0.008, h / 2 - 0.008, 0.008]], ho);
      g3.add(extrude(rp(0.07, 0.07, [[-0.022, -0.022, 0.0042], [0.022, 0.022, 0.0042], [-0.022, 0.022, 0.0042], [0.022, -0.022, 0.0042]]), 0.005, 'steel', { seg: 8, pos: [x, y, zA] }));
      g2.add(extrude(rp(0.07, 0.07, [[-0.024, -0.024, 0.0045], [0.024, 0.024, 0.0045], [-0.024, 0.024, 0.0045], [0.024, -0.024, 0.0045]]), 0.005, 'steel', { seg: 8, pos: [x, y, zB + 0.0025] }));
      g4.add(cyl(0.0095, 0.0095, zB - zA - 0.005, 'steel', { axis: 'z', pos: [x, y, (zA + zB) / 2 + 0.0], seg: 24 }));
      // pulsador con hongo rojo
      const bz = zB + 0.005 + 0.03;
      g1.add(rbox(0.07, 0.085, 0.06, 0.012, 'abLight', { pos: [x, y, bz] }));
      g1.add(cyl(0.0295, 0.0295, 0.022, 'black', { pos: [x, y + 0.0535, bz], seg: 40 }));
      g1.add(lathe([[0.0, 0.0], [0.0265, 0.0], [0.0335, 0.006], [0.0345, 0.016], [0.0295, 0.0235], [0.0, 0.0255]], 'red', { pos: [x, y + 0.062, bz], seg: 48 }));
      g1.add(K.label('PARO DE\nEMERGENCIA', 0.06, 0.03, { bg: '#f3d317', fg: '#111', fs: 20, pos: [x, y - 0.012, bz + 0.0306] }));
      K.estopCap = g1.children[g1.children.length - 2];
      // tornillería (nombres de la taxonomía): 7 tornillos de botón ×4, 8 rondanas planas ×8, 9 tuercas ×4, 10 allen ×2, 5/6 rondanas ×2, 11 tuercas de bellota ×2
      const bp = [[-0.024, -0.024], [0.024, 0.024], [-0.024, 0.024], [0.024, -0.024]].map(q => [x + q[0], y + q[1]]);
      g7.add(bolts(bp.map(q => [q[0], q[1], zB - 0.0035]), 0.0064, 0.057, 'nz', { mat: 'steel' }));
      g8.add(washers(bp.map(q => [q[0], q[1], zB - 0.0000]), 0.0064, 'z', { mat: 'steel' }));
      g8.add(washers(bp.map(q => [q[0], q[1], zB + 0.0505]), 0.0064, 'z', { mat: 'steel' }));
      g9.add(nuts(bp.map(q => [q[0], q[1], zB + 0.0545]), 0.0064, 'z', { mat: 'steel' }));
      g10.add(bolts([[x - 0.022, y - 0.022, zA - 0.0075 + 0.0], [x + 0.022, y + 0.022, zA - 0.0075]].map(p => [p[0], p[1], zA + 0.0025 + 0.0]).map(p => [p[0], p[1], zA + 0.0025]), 0.0079, 0.019, 'z', { mat: 'steel' }));
      g5.add(washers([[x, y, zA + 0.0025 + 0.0015], [x, y, zB - 0.0025 - 0.0015]], 0.0079, 'z', { mat: 'steel' }));
      g6.add(washers([[x, y, zA + 0.0025 + 0.0045], [x, y, zB - 0.0025 - 0.0045]], 0.0079, 'z', { mat: 'steelDark' }));
      [zA, zB].forEach((z, i) => { const s = i ? -1 : 1, o = grp(g11, x, y, z + (i ? -0.0025 : 0.0025) + s * 0.0075); o.add(nuts([[0, 0, 0]], 0.0079, 'z', { mat: 'steel' })); o.add(sphere(0.0069, 'steel', { pos: [0, 0, s * 0.0052], scl: [1, 1, 0.8] })); });
      K.setEstopLook = v => { if (K.estopCap) K.estopCap.position.y = (v ? -0.006 : 0) + y + 0.062; };
    }
  });
})();
