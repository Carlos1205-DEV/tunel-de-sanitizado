/* CAMPANA, CORTINAS (HAWAIANAS), TANQUE COLECTOR, GARRAFA, MANGUERAS Y BOMBA DE RECIRCULACIÓN.
 * Son piezas que no figuran en la taxonomía del Excel pero salen en las rutinas, las fotos y el historial de fallas.
 * Referencia: fotos de la rutina mensual (imágenes 1, 5, 6, 7, 10, 11) y ensamble general (imagen 57). */
(function () {
  'use strict';
  window.MODEL_BUILDERS.push(function (K) {
    const { THREE, PI, TAU, el, box, rbox, cyl, torus, sphere, lathe, extrude, mesh, bolts, nuts, washers, hose, pipe, spin, anim, state } = K;
    const L = K.L, P = K.parts, H = L.hood, S = L.sump, C = 'cubierta', g = i => el(C, i);
    const hcx = (H.x0 + H.x1) / 2, hl = H.x1 - H.x0, hh = H.y1 - H.y0, hcy = (H.y0 + H.y1) / 2, t = 0.012;

    /* ---------- 1 · CAMPANA (cubierta de acero inoxidable con ventanas de entrada y salida) ---------- */
    {
      const g1 = g(1);
      g1.add(rbox(hl, t, H.hw * 2, 0.003, 'panel', { pos: [hcx, H.y1 - t / 2, 0], shell: true }));
      [-1, 1].forEach(b => g1.add(rbox(hl, hh, t, 0.003, 'panel', { pos: [hcx, hcy, b * (H.hw - t / 2)], shell: true })));
      // testeros con ventana
      const wy = (H.winY0 + H.winY1) / 2 - hcy, wh = H.winY1 - H.winY0;
      [H.x0 + t / 2, H.x1 - t / 2].forEach(x => {
        const sh = new THREE.Shape(); sh.moveTo(-H.hw, -hh / 2); sh.lineTo(H.hw, -hh / 2); sh.lineTo(H.hw, hh / 2); sh.lineTo(-H.hw, hh / 2); sh.closePath();
        const hole = new THREE.Path(), w2 = H.winW / 2, r = 0.012;
        hole.moveTo(-w2 + r, wy - wh / 2); hole.lineTo(w2 - r, wy - wh / 2); hole.quadraticCurveTo(w2, wy - wh / 2, w2, wy - wh / 2 + r); hole.lineTo(w2, wy + wh / 2 - r); hole.quadraticCurveTo(w2, wy + wh / 2, w2 - r, wy + wh / 2); hole.lineTo(-w2 + r, wy + wh / 2); hole.quadraticCurveTo(-w2, wy + wh / 2, -w2, wy + wh / 2 - r); hole.lineTo(-w2, wy - wh / 2 + r); hole.quadraticCurveTo(-w2, wy - wh / 2, -w2 + r, wy - wh / 2); sh.holes.push(hole);
        const m = extrude(sh, t, 'panel', { seg: 8, shell: true }); m.rotation.y = PI / 2; m.position.set(x, hcy, 0); g1.add(m);
      });
      // manija horizontal en la cara frontal
      [-0.12, 0.22].forEach(x => g1.add(cyl(0.0065, 0.0065, 0.04, 'steel', { axis: 'z', pos: [x, 1.03, H.hw + 0.016], seg: 14 })));
      g1.add(cyl(0.0085, 0.0085, 0.38, 'steel', { axis: 'x', pos: [hcx + 0.05, 1.03, H.hw + 0.036], seg: 20 }));
      [-0.14, 0.24].forEach(x => g1.add(sphere(0.0105, 'steel', { pos: [hcx + 0.05 + (x > 0 ? 0.19 : -0.19), 1.03, H.hw + 0.036] })));
      // tornillería perimetral (cabeza hexagonal M5)
      const sc = []; for (let i = 0; i < 14; i++) { const x = H.x0 + 0.04 + i * (hl - 0.08) / 13; sc.push([x, H.y1 - 0.016, H.hw + 0.0005], [x, H.y0 + 0.02, H.hw + 0.0005]); }
      g1.add(bolts(sc.map(p => [p[0], p[1], p[2]]), 0.0055, 0.01, 'z', { mat: 'steel' }));
      const sb = sc.map(p => [p[0], p[1], -p[2]]); g1.add(bolts(sb, 0.0055, 0.01, 'nz', { mat: 'steel' }));
    }

    /* ---------- 2 y 3 · CORTINAS HAWAIANAS (7 tiras de PVC transparente en dos hileras por lado) ---------- */
    {
      const sway = [];
      const make = (gi, xs) => {
        const grpE = g(gi);
        xs.forEach((x, row) => {
          const rod = cyl(0.0042, 0.0042, H.winW + 0.03, 'steel', { axis: 'z', pos: [x, 1.14, 0], seg: 12 }); grpE.add(rod);
          [-1, 1].forEach(b => grpE.add(rbox(0.012, 0.03, 0.008, 0.002, 'steelDark', { pos: [x, 1.15, b * (H.winW / 2 + 0.014)] })));
          for (let i = 0; i < 7; i++) {
            const z = (i - 3) * 0.0585 + (row ? 0.029 : 0), pv = new THREE.Group(); pv.position.set(x, 1.1325, z); grpE.add(pv);
            const sh = new THREE.Shape(), w = 0.0565, h = 0.185, r = 0.004;
            sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(w / 2, -h + r); sh.quadraticCurveTo(w / 2, -h, w / 2 - r, -h); sh.lineTo(-w / 2 + r, -h); sh.quadraticCurveTo(-w / 2, -h, -w / 2, -h + r); sh.closePath();
            const m = extrude(sh, 0.0028, 'pvcClear', { seg: 4, cast: false }); m.rotation.y = PI / 2; pv.add(m);
            pv.add(cyl(0.0058, 0.0058, 0.012, 'steel', { axis: 'z', pos: [0, 0.002, 0], seg: 10 }));   // ojal
            pv.rotation.z = -0.07 - row * 0.03; sway.push({ pv, base: pv.rotation.z, ph: Math.random() * 6.28 + i });
          }
        });
      };
      make(2, [H.x0 + 0.035, H.x0 + 0.075]);
      make(3, [H.x1 - 0.075, H.x1 - 0.035]);
      anim.push((dt, st) => { const k = st.speed / 4.59; if (k > 0.01 || sway._on) { sway._on = k > 0.01; sway.forEach(s => { s.pv.rotation.z = s.base + Math.sin(st.t * 2.2 + s.ph) * 0.045 * k - 0.05 * k; }); } });
    }

    /* ---------- 4 · TANQUE COLECTOR (charola de acero inoxidable con fondo inclinado) ---------- */
    {
      const g4 = g(4), len = S.x1 - S.x0, cx = (S.x0 + S.x1) / 2, dz = S.z1 - 0.2, dy = S.yTop - S.yBot, wl = Math.hypot(dz, dy), th = Math.atan2(dy, dz), tt = 0.003;
      g4.add(rbox(len, tt, 0.40, 0.0012, 'panel', { pos: [cx, S.yBot + tt / 2, 0] }));
      [-1, 1].forEach(b => {
        const w = rbox(len, tt, wl, 0.0012, 'panel', { pos: [cx, (S.yTop + S.yBot) / 2, b * (0.2 + dz / 2)] }); w.rotation.x = -b * th; g4.add(w);
        g4.add(rbox(len, 0.014, 0.03, 0.004, 'panel', { pos: [cx, S.yTop - 0.004, b * (S.z1 + 0.012)] }));                // reborde
      });
      [S.x0, S.x1].forEach(x => {
        const sh = new THREE.Shape(); sh.moveTo(-0.2, S.yBot); sh.lineTo(0.2, S.yBot); sh.lineTo(S.z1, S.yTop); sh.lineTo(-S.z1, S.yTop); sh.closePath();
        const m = extrude(sh, tt, 'panel', { seg: 4 }); m.rotation.y = PI / 2; m.position.x = x; g4.add(m);
      });
      // boquilla de drenaje, escuadras de soporte
      g4.add(cyl(0.016, 0.016, 0.03, 'steel', { pos: [0.05, S.yBot - 0.012, 0], seg: 24 }));
      g4.add(lathe([[0.0, 0.0], [0.016, 0.0], [0.0185, 0.006], [0.0185, 0.014], [0.0, 0.014]], 'steelDark', { pos: [0.05, S.yBot + 0.002, 0], seg: 24 }));
      [-1, 1].forEach(b => [-0.25, 0.35].forEach(x => { g4.add(rbox(0.04, 0.006, 0.1, 0.002, 'steelDark', { pos: [x, 0.797, b * 0.262] })); g4.add(rbox(0.04, 0.05, 0.006, 0.002, 'steelDark', { pos: [x, 0.772, b * (S.z1 - 0.003)] })); }));
    }

    /* ---------- 5 · MANGUERA DE DRENAJE (corrugada blanca) ---------- */
    {
      const g5 = g(5);
      g5.add(K.ribbed([[0.05, S.yBot - 0.02, 0], [0.05, 0.43, 0.02], [0.06, 0.38, 0.30], [0.22, 0.18, 0.56], [0.44, 0.035, 0.78]], 0.016, 'whiteHose', 0.016));
      g5.add(P.hoseClamp(0.016).translateX(0.05).translateY(S.yBot - 0.022).translateZ(0.0));
    }

    /* ---------- 6 · GARRAFA DE SANITIZANTE Y MANGUERA DE SUCCIÓN ---------- */
    {
      const g6 = g(6), j = L.jug, d = L.dos;
      const jg = new THREE.Group(); jg.position.set(j.x, 0, j.z); g6.add(jg);
      jg.add(rbox(0.28, 0.36, 0.24, 0.03, 'jug', { pos: [0, 0.18, 0], cast: true }));
      jg.add(rbox(0.25, 0.20, 0.215, 0.02, 'blueLight', { pos: [0, 0.11, 0], mat: { transparent: true, opacity: 0.35, depthWrite: false, metalness: 0, roughness: 0.2 } }));
      jg.add(cyl(0.03, 0.03, 0.035, 'jug', { pos: [0.05, 0.3775, 0.0], seg: 28 }));
      jg.add(cyl(0.034, 0.034, 0.025, 'blue', { pos: [0.05, 0.405, 0], seg: 28 }));
      jg.add(torus(0.045, 0.0075, 'jug', { axis: 'y', pos: [-0.07, 0.36, 0], arc: PI, rot: [0, 0, 0], seg: 24 }));
      jg.add(rbox(0.012, 0.045, 0.1, 0.004, 'jug', { pos: [-0.07, 0.3715, 0] }));
      jg.add(K.label('SANITIZANTE\n20 L', 0.16, 0.07, { bg: '#eaf1fb', fg: '#0d3b8c', fs: 30, pos: [0, 0.2, 0.1206] }));
      // manguera de succión transparente (de la bomba Dossatron a la garrafa)
      g6.add(K.ribbed([[d.x + 0.045, 0.43, d.z + 0.01], [d.x + 0.03, 0.34, d.z + 0.07], [j.x + 0.12, 0.36, j.z - 0.16], [j.x + 0.05, 0.42, j.z], [j.x + 0.05, 0.14, j.z]], 0.0105, 'hoseClear', 0.012));
    }

    /* ---------- 7 · MANGUERAS, TUBERÍA DE AGUA Y CONDUIT ---------- */
    {
      const g7 = g(7), d = L.dos, s1 = L.sol1, s2 = L.sol2, N = L.nozzle, cb = L.cab;
      const blue = (pts, r) => g7.add(hose(pts, r || 0.0085, 'cableBlue', { tension: 0.35, radial: 14 }));
      blue([[-1.02, 0.01, 0.62], [-1.02, 0.30, 0.55], [-0.95, 0.47, 0.45], [s1[0] - 0.05, s1[1], s1[2] - 0.0]], 0.0085);     // alimentación de agua
      blue([[s1[0] + 0.05, s1[1], s1[2]], [d.x - 0.18, d.y, d.z], [d.x - 0.09, d.y, d.z]], 0.0085);                         // solenoide → Dossatron
      blue([[d.x + 0.09, d.y, d.z], [d.x + 0.16, d.y + 0.05, d.z - 0.06], [-0.24, 0.60, 0.34], [s2[0] - 0.04, s2[1] - 0.02, s2[2] + 0.02]], 0.0085);   // Dossatron → solenoide del túnel
      blue([[s2[0] + 0.03, s2[1] + 0.02, s2[2]], [-0.15, 0.97, 0.29], [-0.05, 1.12, 0.26]], 0.0085);                         // solenoide → campana
      // tubería de acero inoxidable dentro de la campana hasta la boquilla
      g7.add(pipe([[-0.05, 1.12, 0.26], [N.x, 1.17, 0.18], [N.x, 1.17, 0.0], [N.x, N.y + 0.04, 0.0]], 0.0063, 'steel', { bend: 0.02, radial: 14 }));
      g7.add(cyl(0.0095, 0.0095, 0.03, 'steel', { axis: 'z', pos: [-0.05, 1.12, 0.256], seg: 14 }));                              // pasamuros
      // conduit flexible: gabinete → motor y gabinete → electroválvula
      const cd = (pts, r) => g7.add(hose(pts, r, 'conduit', { tension: 0.3, radial: 14, res: 90 }));
      cd([[cb.x - 0.02, cb.y - cb.h / 2 - 0.005, cb.z + 0.03], [cb.x - 0.02, 0.20, cb.z + 0.06], [cb.x + 0.18, 0.04, 0.10], [cb.x + 0.12, 0.04, -0.45], [0.82, 0.30, -0.70], [0.77, 0.96, -0.70]], 0.0105);
      cd([[cb.x - 0.07, cb.y - cb.h / 2 - 0.005, cb.z + 0.03], [cb.x - 0.07, 0.20, cb.z + 0.12], [0.1, 0.05, 0.62], [-0.55, 0.05, 0.56], [s1[0] + 0.01, s1[1] + 0.13, s1[2] + 0.02]], 0.0085);
      // abrazaderas
      [[d.x - 0.09, d.y, d.z], [d.x + 0.09, d.y, d.z]].forEach(p => { const c = P.hoseClamp(0.0095); c.rotation.z = PI / 2; c.position.set(p[0], p[1], p[2]); g7.add(c); });
    }

    /* ---------- 8 · BOMBA DE RECIRCULACIÓN DE AGUA (no está en la taxonomía; aparece en la rutina anual) ---------- */
    {
      const g8 = g(8), x = 0.12, y = 0.321;
      g8.add(rbox(0.24, 0.008, 0.16, 0.002, 'steelDark', { pos: [x + 0.01, y + 0.004, 0] }));
      g8.add(cyl(0.052, 0.052, 0.17, 'weg', { axis: 'x', pos: [x + 0.09, y + 0.07, 0], seg: 40 }));
      for (let i = 0; i < 6; i++) g8.add(torus(0.0535, 0.0035, 'weg', { axis: 'x', pos: [x + 0.03 + i * 0.026, y + 0.07, 0], seg: 40 }));
      g8.add(cyl(0.055, 0.05, 0.05, 'black', { axis: 'x', pos: [x + 0.2, y + 0.07, 0], seg: 36 }));
      g8.add(rbox(0.06, 0.04, 0.05, 0.006, 'black', { pos: [x + 0.1, y + 0.145, 0] }));
      g8.add(lathe([[0.0, -0.03], [0.06, -0.03], [0.074, 0.0], [0.074, 0.03], [0.05, 0.05], [0.0, 0.055]], 'steel', { axis: 'x', pos: [x - 0.04, y + 0.07, 0], seg: 44 }));
      g8.add(cyl(0.017, 0.017, 0.09, 'steel', { pos: [x - 0.04, y + 0.15, 0.0], seg: 20 }));
      g8.add(cyl(0.02, 0.02, 0.1, 'steel', { pos: [x - 0.045, y + 0.07, 0.08], axis: 'z', seg: 20 }));
      g8.add(pipe([[x - 0.04, y + 0.19, 0], [x - 0.04, 0.46, 0], [0.05, 0.50, 0]], 0.017, 'steel', { bend: 0.03, radial: 20 }));
      [[x - 0.06, 0.057], [x - 0.06, -0.057], [x + 0.18, 0.057], [x + 0.18, -0.057]].forEach(p => g8.add(cyl(0.006, 0.006, 0.016, 'steel', { pos: [p[0], y + 0.016, p[1]], seg: 10 })));
    }
  });
})();
