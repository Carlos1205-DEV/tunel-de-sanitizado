/* CAMPANA, CORTINAS, TINA, MANGUERAS, GARRAFA Y CAJA DEL MOTORREDUCTOR.
 * Son piezas que no figuran en la taxonomía del Excel pero salen en las rutinas y en las fotos de planta.
 * Referencia: fotos 1, 5, 6, 7, 9, 10 y 11 de la rutina mensual y las respuestas del usuario (gabinete A1, Dossatron B2, motor B3). */
(function () {
  'use strict';
  window.MODEL_BUILDERS.push(function (K) {
    const { THREE, PI, TAU, el, box, rbox, cyl, torus, sphere, lathe, extrude, mesh, bolts, nuts, washers, hose, pipe, spin, anim, state } = K;
    const L = K.L, P = K.parts, H = L.hood, T = L.tray, C = 'cubierta', g = i => el(C, i), ys = L.ys, sx = L.sx;
    const hcx = (H.x0 + H.x1) / 2, hl = H.x1 - H.x0, hh = H.y1 - H.y0, hcy = (H.y0 + H.y1) / 2, t = H.t, tt = T.t;
    const grp = (parent, x, y, z) => { const o = new THREE.Group(); o.position.set(x, y, z); parent.add(o); return o; };

    /* ---------- 1 · CAMPANA (caja de acero inoxidable apoyada sobre la tina, con boca de entrada y de salida) ---------- */
    {
      const g1 = g(1);
      g1.add(rbox(hl, t, H.hw * 2, 0.003, 'inox', { pos: [hcx, H.y1 - t / 2, 0], shell: true }));
      [-1, 1].forEach(b => g1.add(rbox(hl, hh, t, 0.003, 'inox', { pos: [hcx, hcy, b * (H.hw - t / 2)], shell: true })));
      // testeros con la boca por donde pasa la banda
      const wy = (H.winY0 + H.winY1) / 2 - hcy, wh = H.winY1 - H.winY0;
      [H.x0 + t / 2, H.x1 - t / 2].forEach(x => {
        const sh = new THREE.Shape(); sh.moveTo(-H.hw, -hh / 2); sh.lineTo(H.hw, -hh / 2); sh.lineTo(H.hw, hh / 2); sh.lineTo(-H.hw, hh / 2); sh.closePath();
        sh.holes.push(K.rrectHole(0, wy, H.winW, wh, 0.012));
        const m = extrude(sh, t, 'inox', { seg: 8, shell: true }); m.rotation.y = PI / 2; m.position.set(x, hcy, 0); g1.add(m);
      });
      // asas en U de las dos caras (fotos 6 y 7)
      [-1, 1].forEach(b => {
        const hx = b * 0.16, hy = 1.06, zf = b * H.hw;
        [-1, 1].forEach(s => g1.add(cyl(0.0065, 0.0065, 0.04, 'steel', { axis: 'z', pos: [hx + s * 0.075, hy, zf + b * 0.02], seg: 14 })));
        g1.add(cyl(0.0085, 0.0085, 0.15, 'steel', { axis: 'x', pos: [hx, hy, zf + b * 0.04], seg: 20 }));
        [-1, 1].forEach(s => g1.add(sphere(0.0095, 'steel', { pos: [hx + s * 0.075, hy, zf + b * 0.04] })));
      });
      // tornillería perimetral (cabeza hexagonal M5)
      const sc = []; for (let i = 0; i < 14; i++) { const x = H.x0 + 0.04 + i * (hl - 0.08) / 13; sc.push([x, H.y1 - 0.016], [x, H.y0 + 0.02]); }
      g1.add(bolts(sc.map(p => [p[0], p[1], H.hw + 0.0005]), 0.0055, 0.01, 'z', { mat: 'steel' }));
      g1.add(bolts(sc.map(p => [p[0], p[1], -H.hw - 0.0005]), 0.0055, 0.01, 'nz', { mat: 'steel' }));
    }

    /* ---------- 2 y 3 · CORTINAS DE PVC (tiras anchas colgadas de una varilla con ménsulas, dos hileras por boca; fotos 6 y 11) ---------- */
    {
      const sway = [], W = H.winW, rodY = 1.112;
      const make = (gi, e) => {
        const gE = g(gi);
        [{ dx: 0.016, zs: [-0.1425, -0.0475, 0.0475, 0.1425] }, { dx: 0.052, zs: [-0.095, 0, 0.095] }].forEach((row, ri) => {
          const x = e * (H.x1 + row.dx);
          gE.add(cyl(0.0042, 0.0042, W + 0.03, 'steel', { axis: 'z', pos: [x, rodY, 0], seg: 12 }));
          [-1, 1].forEach(b => {
            const zb = b * (W / 2 + 0.014);
            gE.add(rbox(0.004, 0.032, 0.022, 0.0015, 'steelDark', { pos: [e * (H.x1 + 0.002), rodY, zb] }));                            // ménsula atornillada a la campana
            gE.add(cyl(0.0042, 0.0042, row.dx + 0.002, 'steel', { axis: 'x', pos: [e * (H.x1 + row.dx / 2 + 0.001), rodY, zb], seg: 10 }));
            gE.add(bolts([[e * (H.x1 + 0.004), rodY, zb]], 0.005, 0.008, e > 0 ? 'x' : 'nx', { mat: 'steel' }));
          });
          row.zs.forEach((z, i) => {
            const pv = new THREE.Group(); pv.position.set(x, rodY - 0.004, z); gE.add(pv);
            const sh = new THREE.Shape(), w = 0.0935, h = 0.175, r = 0.005;
            sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(w / 2, -h + r); sh.quadraticCurveTo(w / 2, -h, w / 2 - r, -h); sh.lineTo(-w / 2 + r, -h); sh.quadraticCurveTo(-w / 2, -h, -w / 2, -h + r); sh.closePath();
            const m = extrude(sh, 0.0028, 'pvcClear', { seg: 4, cast: false }); m.rotation.y = PI / 2; pv.add(m);
            pv.add(cyl(0.0058, 0.0058, 0.012, 'steel', { axis: 'z', pos: [0, 0.002, 0], seg: 10 }));            // ojal por donde pasa la varilla
            pv.rotation.z = 0.04 + ri * 0.04; sway.push({ pv, base: pv.rotation.z, ph: Math.random() * 6.28 + i });
          });
        });
      };
      make(2, -1);
      make(3, 1);
      anim.push((dt, st) => { const k = st.speed / 4.59; if (k > 0.01 || sway._on) { sway._on = k > 0.01; sway.forEach(s => { s.pv.rotation.z = s.base + Math.sin(st.t * 2.2 + s.ph) * 0.04 * k + 0.04 * k; }); } });
    }

    /* ---------- 4 · TINA (charola de acero inoxidable con fondo inclinado): la banda corre dentro y la campana se apoya en su labio ---------- */
    {
      const g4 = g(4), len = T.x1 - T.x0, cx = (T.x0 + T.x1) / 2, dz = T.zW - T.zB, dy = T.yS - T.yBot, wl = Math.hypot(dz, dy), th = Math.atan2(dy, dz);
      const pan = (w, h, d, o) => rbox(w, h, d, 0.0012, 'inox', Object.assign({ shell: true }, o));
      g4.add(pan(len, tt, 2 * T.zB + 0.006, { pos: [cx, T.yBot + tt / 2, 0] }));
      const yv = (T.yS + T.yTop) / 2, holes = [[-sx, ys - yv, 0.0175], [sx, ys - yv, 0.0175]];
      [-1, 1].forEach(b => {
        const w = pan(len, tt, wl + 0.004, { pos: [cx, (T.yS + T.yBot) / 2, b * (T.zB + T.zW) / 2] }); w.rotation.x = -b * th; g4.add(w);   // pared inclinada
        g4.add(extrude(K.plateShape(len, T.yTop - T.yS, holes, []), tt, 'inox', { seg: 24, shell: true, pos: [cx, yv, b * T.zW] }));       // pared vertical con los agujeros de las flechas
        g4.add(pan(len, 0.003, T.lip, { pos: [cx, T.yTop + 0.0015, b * (T.zW - tt / 2 + T.lip / 2)] }));                                    // labio horizontal
        g4.add(pan(len, 0.014, 0.003, { pos: [cx, T.yTop - 0.0055, b * (T.zW - tt / 2 + T.lip - 0.0015)] }));                              // doblez hacia abajo
        g4.add(cyl(0.0105, 0.0105, 0.004, 'steelDark', { axis: 'z', pos: [-sx, ys, b * (T.zW + 0.0035)], seg: 28 }));                      // anillo de sello en cada paso de flecha
        g4.add(cyl(0.0105, 0.0105, 0.004, 'steelDark', { axis: 'z', pos: [sx, ys, b * (T.zW + 0.0035)], seg: 28 }));
      });
      // testeros (el de la entrada tiene los 4 agujeros por donde salen las varillas blancas)
      [T.x0, T.x1].forEach((x, ei) => {
        const s = new THREE.Shape(), u = T.zW, ub = T.zB;
        s.moveTo(-u, T.yTop); s.lineTo(-u, T.yS); s.lineTo(-ub, T.yBot); s.lineTo(ub, T.yBot); s.lineTo(u, T.yS); s.lineTo(u, T.yTop); s.closePath();
        if (ei === 0) L.rod.zs.forEach(z => { const p = new THREE.Path(); p.absarc(-z, L.rod.y, 0.0145, 0, TAU, true); s.holes.push(p); });
        const m = extrude(s, tt, 'inox', { seg: 16, shell: true }); m.rotation.y = PI / 2; m.position.set(ei === 0 ? x + tt / 2 : x - tt / 2, 0, 0); g4.add(m);
        g4.add(pan(T.lip, 0.003, 2 * (T.zW - tt / 2 + T.lip), { pos: [ei === 0 ? x + T.lip / 2 : x - T.lip / 2, T.yTop + 0.0015, 0] }));
      });
      // boquilla de drenaje en el fondo
      g4.add(cyl(0.016, 0.016, 0.03, 'steel', { pos: [0.05, T.yBot - 0.012, 0], seg: 24 }));
      g4.add(lathe([[0.0, 0.0], [0.016, 0.0], [0.0185, 0.006], [0.0185, 0.014], [0.0, 0.014]], 'steelDark', { pos: [0.05, T.yBot + 0.002, 0], seg: 24 }));
      // niple lateral (lado B) donde termina la manguera transparente reforzada de la Dossatron (foto 7)
      const sy = 0.64, sz = -(L.wallZ(sy) + tt / 2), snx = -0.21;
      g4.add(cyl(0.0155, 0.0155, 0.05, 'steelDark', { axis: 'z', pos: [snx, sy, sz - 0.0235], seg: 24 }));
      g4.add(cyl(0.0125, 0.0125, 0.02, 'steel', { axis: 'z', pos: [snx, sy, sz - 0.0585], seg: 20 }));
      g4.add(torus(0.0145, 0.003, 'steel', { axis: 'z', pos: [snx, sy, sz - 0.0105], seg: 24 }));
    }

    /* ---------- 5 · MANGUERAS DE DRENAJE (corrugada blanca del fondo de la tina y crema de la Dossatron; fotos 5 y 10) ---------- */
    {
      const g5 = g(5), d = L.dos, Y = L.dosY;
      g5.add(K.ribbed([[0.05, T.yBot - 0.02, 0], [0.05, 0.43, -0.02], [0.07, 0.25, -0.17], [0.22, 0.07, -0.42], [0.31, 0.03, -0.62], [0.34, 0.03, -0.92]], 0.016, 'whiteHose', 0.016));
      g5.add(P.hoseClamp(0.016).translateX(0.05).translateY(T.yBot - 0.022).translateZ(0.0));
      g5.add(K.ribbed([[d.x + 0.01, Y.tee - 0.02, d.z], [d.x + 0.01, 0.50, d.z - 0.005], [d.x + 0.02, 0.15, d.z - 0.012], [d.x + 0.13, 0.04, d.z - 0.012], [0.22, 0.03, -0.47], [0.30, 0.03, -0.74]], 0.0125, 'creamHose', 0.013));
    }

    /* ---------- 6 · GARRAFA DE SANITIZANTE (en el piso, B2) Y TUBO DE SUCCIÓN AZUL ---------- */
    {
      const g6 = g(6), j = L.jug, d = L.dos, Y = L.dosY;
      const jg = new THREE.Group(); jg.position.set(j.x, 0, j.z); g6.add(jg);
      jg.add(rbox(0.28, 0.36, 0.24, 0.03, 'jug', { pos: [0, 0.18, 0], cast: true }));
      jg.add(cyl(0.03, 0.03, 0.035, 'jug', { pos: [0.05, 0.3775, 0.0], seg: 28 }));
      jg.add(torus(0.032, 0.0045, 'jug', { axis: 'y', pos: [0.05, 0.395, 0], seg: 28 }));                                  // boca abierta (foto 10)
      jg.add(torus(0.045, 0.0075, 'jug', { axis: 'y', pos: [-0.07, 0.36, 0], arc: PI, rot: [0, 0, 0], seg: 24 }));
      jg.add(rbox(0.012, 0.045, 0.1, 0.004, 'jug', { pos: [-0.07, 0.3715, 0] }));
      jg.add(rbox(0.06, 0.03, 0.002, 0.001, 'white', { pos: [0.02, 0.05, 0.121] }));                                       // etiqueta pequeña
      // tubo de succión azul: del cuerpo negro de la bomba a la boca de la garrafa
      g6.add(hose([[d.x - 0.052, 0.69, d.z], [d.x - 0.082, 0.64, d.z - 0.02], [d.x - 0.06, 0.52, d.z - 0.09], [j.x + 0.03, 0.43, j.z], [j.x + 0.05, 0.28, j.z + 0.005], [j.x + 0.05, 0.10, j.z + 0.01]], 0.0042, 'cableBlue', { tension: 0.4, radial: 10 }));
    }

    /* ---------- 7 · MANGUERAS AZULES, MANGUERA TRANSPARENTE REFORZADA, TUBERÍA DE LA CAMPANA Y CONDUIT ---------- */
    {
      const g7 = g(7), d = L.dos, Y = L.dosY, cb = L.cab, S2 = L.sol2, N = L.nozzle, cbBot = cb.y - cb.h / 2;
      const blue = (pts, r) => g7.add(hose(pts, r || 0.0085, 'cableBlue', { tension: 0.35, radial: 14 }));
      // agua de la red → gabinete (entra por el fondo, hacia la electroválvula)
      blue([[-1.05, 0.012, 0.70], [-0.75, 0.02, 0.58], [-0.52, 0.12, 0.44], [-0.45, 0.30, 0.36], [cb.x - 0.07, 0.50, cb.z + 0.03], [cb.x - 0.07, cbBot + 0.012, cb.z + 0.03]]);
      // gabinete → Dossatron: baja al piso, cruza bajo la tina y sube por el lado B hasta el te de PVC
      blue([[cb.x - 0.02, cbBot + 0.012, cb.z + 0.03], [cb.x - 0.02, 0.40, cb.z + 0.05], [-0.33, 0.12, 0.30], [-0.28, 0.03, 0.18], [-0.24, 0.025, -0.06], [-0.19, 0.03, -0.26], [-0.158, 0.12, -0.30], [-0.155, 0.45, -0.30], [-0.152, 0.56, -0.305], [d.x - 0.092, Y.tee, d.z]]);
      // Dossatron → solenoide de la línea → campana
      blue([[d.x + 0.092, Y.tee, d.z], [d.x + 0.10, 0.65, d.z + 0.012], [S2[0], S2[1] - 0.075, S2[2]]]);
      blue([[S2[0], S2[1] + 0.075, S2[2]], [S2[0] + 0.005, 0.95, -0.262], [S2[0] + 0.01, 1.04, -0.250], [S2[0] + 0.01, 1.12, -0.244]]);
      g7.add(cyl(0.0095, 0.0095, 0.03, 'steel', { axis: 'z', pos: [S2[0] + 0.01, 1.12, -H.hw - 0.002], seg: 14 }));                            // pasamuros de la campana
      g7.add(pipe([[S2[0] + 0.01, 1.12, -H.hw + t + 0.002], [S2[0] + 0.01, 1.17, -0.17], [N.x, 1.17, 0.0]], 0.0063, 'steel', { bend: 0.02, radial: 14 }));   // tubería inox hasta la boquilla
      // manguera transparente reforzada (foto 7): de la bomba rodea la garrafa y llega al niple lateral de la tina
      const cl = [[d.x + 0.052, 0.715, d.z - 0.005], [0.07, 0.69, -0.345], [0.125, 0.55, -0.42], [0.125, 0.36, -0.58], [0.04, 0.31, -0.64], [-0.16, 0.31, -0.64], [-0.275, 0.38, -0.52], [-0.28, 0.52, -0.36], [-0.245, 0.62, -0.27], [-0.21, 0.64, -0.236]];
      g7.add(K.ribbed(cl, 0.0125, 'hoseClear', 0.012));
      const c1 = P.hoseClamp(0.0125); c1.position.set(d.x + 0.052, 0.715, d.z - 0.005); c1.rotation.z = PI / 2; g7.add(c1);
      const c2 = P.hoseClamp(0.0125); c2.position.set(-0.21, 0.64, -0.236); c2.rotation.x = PI / 2; g7.add(c2);
      // cable negro con clavija que cuelga junto a la bomba (foto 10)
      g7.add(hose([[S2[0] + 0.10, S2[1] - 0.012, S2[2]], [0.15, 0.62, -0.29], [0.125, 0.46, -0.30], [0.115, 0.41, -0.30]], 0.0028, 'cable', { radial: 8 }));
      g7.add(rbox(0.02, 0.04, 0.018, 0.004, 'black', { pos: [0.115, 0.385, -0.30] }));
      // conduit gris: gabinete → caja del motorreductor (cruza bajo la tina, foto 3)
      g7.add(hose([[cb.x + 0.07, cbBot + 0.012, cb.z + 0.03], [cb.x + 0.07, 0.40, cb.z + 0.08], [-0.20, 0.10, 0.34], [-0.10, 0.04, 0.12], [0.25, 0.04, -0.15], [0.42, 0.06, -0.30], [0.47, 0.30, -0.40], [0.47, 0.50, -0.425]], 0.0105, 'conduit', { tension: 0.3, radial: 14, res: 90 }));
    }

    /* ---------- 8 · CAJA DE ACERO INOXIDABLE DEL MOTORREDUCTOR (lado B, salida: cubre el motor, el cople y la flecha; B3) ---------- */
    {
      const g8 = g(8), B = L.box, w = B.x1 - B.x0, h = B.y1 - B.y0, dd = B.z0 - B.z1, cx = (B.x0 + B.x1) / 2, cy = (B.y0 + B.y1) / 2, cz = (B.z0 + B.z1) / 2, tb = 0.004;
      const pan = (a, b, c, o) => rbox(a, b, c, 0.0015, 'inox', Object.assign({ shell: true }, o));
      g8.add(pan(w, tb, dd, { pos: [cx, B.y0 + tb / 2, cz] }));                                    // fondo
      g8.add(pan(w + 0.01, tb, dd + 0.01, { pos: [cx, B.y1 - tb / 2, cz] }));                      // tapa con ligero volado
      [B.x0 + tb / 2, B.x1 - tb / 2].forEach(x => g8.add(pan(tb, h, dd, { pos: [x, cy, cz] })));    // costados
      g8.add(pan(w, h, tb, { pos: [cx, cy, B.z1 + tb / 2] }));                                     // pared lejana
      // pared cercana a la tina, con el paso de la flecha
      const near = extrude(K.plateShape(w, h, [[0, ys - cy, 0.02]], []), tb, 'inox', { seg: 24, shell: true, pos: [cx, cy, B.z0 - tb / 2] }); g8.add(near);
      g8.add(torus(0.0215, 0.003, 'rubber', { axis: 'z', pos: [cx, ys, B.z0 + 0.0015], seg: 28 }));
      // tornillería de la tapa y entrada del conduit
      const sc = []; for (let i = 0; i < 6; i++) { const u = B.x0 + 0.03 + i * (w - 0.06) / 5; sc.push([u, B.y1 + 0.0005, B.z0 - 0.012], [u, B.y1 + 0.0005, B.z1 + 0.012]); }
      g8.add(bolts(sc, 0.0055, 0.01, 'y', { mat: 'steel' }));
      g8.add(cyl(0.011, 0.011, 0.018, 'black', { axis: 'z', pos: [0.47, 0.50, B.z0 + 0.0095], seg: 6 }));
      // soportes: dos brazos planos hacia la pata del lado B y una pata propia en la esquina lejana
      [0.50, 0.80].forEach(y => g8.add(rbox(0.04, 0.006, 0.162, 0.002, 'steelDark', { pos: [L.legX, y, -0.351] })));
      g8.add(rbox(0.04, B.y0 - 0.10, 0.04, 0.004, 'brushed', { pos: [B.x1 - 0.03, 0.10 + (B.y0 - 0.10) / 2, B.z1 + 0.03] }));
      g8.add(K.level(B.x1 - 0.03, 0, B.z1 + 0.03, 0.034, 0.12));
    }
  });
})();
