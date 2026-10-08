/* TRANSMISIÓN, BANDA Y ESTRUCTURA — 35 elementos de la taxonomía (despiece oficial, imagen 55 del Excel).
 * Banda modular Serie 900 flush grid 330 mm × 2.7 m, 10 sprockets de 12 dientes, flechas, chumaceras UCFL205 de carcasa blanca,
 * 4 varillas blancas de desgaste (foto 8), rodillos de retorno, acoplamientos de mordaza negros (foto 9) y tornillería.
 * La estructura sigue las fotos de planta: patas de tubo rectangular atornilladas a la tina (foto 5) y varillas inox laterales. */
(function () {
  'use strict';
  window.MODEL_BUILDERS.push(function (K) {
    const { THREE, PI, TAU, el, box, rbox, cyl, torus, sphere, lathe, extrude, mesh, bolts, nuts, washers, explode, spin, anim, state, geo, pipe } = K;
    const L = K.L, P = K.parts, C = 'transmision', ys = L.ys, sx = L.sx, bz = L.bearZ, bx = 'brushed';
    const g = i => el(C, i);
    const ZS = [-0.15, -0.075, 0, 0.075, 0.15];        // posición de los 5 sprockets sobre cada flecha
    const grp = (parent, x, y, z) => { const o = new THREE.Group(); o.position.set(x, y, z); parent.add(o); return o; };

    /* ---------- 1 · ESTRUCTURA DEL TÚNEL (patas de tubo rectangular con niveladores, travesaños planos, guías laterales) ---------- */
    {
      const g1 = g(1), lx = L.legX, lz = L.legZ, y0 = 0.10, y1 = 0.89, lh = y1 - y0;
      [-1, 1].forEach(a => [-1, 1].forEach(b => {
        g1.add(rbox(0.04, lh, 0.04, 0.004, bx, { pos: [a * lx, y0 + lh / 2, b * lz] }));
        g1.add(K.level(a * lx, 0, b * lz, 0.034, 0.12));
      }));
      // travesaños planos a media altura (foto 5)
      [-1, 1].forEach(b => g1.add(rbox(2 * lx + 0.04, 0.012, 0.05, 0.002, 'steelDark', { pos: [0, 0.30, b * lz] })));
      [-1, 1].forEach(a => g1.add(rbox(0.05, 0.012, 2 * lz, 0.002, 'steelDark', { pos: [a * lx, 0.288, 0] })));
      // guías laterales ranuradas junto a los bordes de la banda (foto 1)
      [-1, 1].forEach(b => {
        const slots = []; for (let k = 0; k < 9; k++) slots.push([-0.48 + k * 0.12, 0, 0.012, 0.034]);
        g1.add(extrude(K.plateShape(1.16, 0.06, [], slots), 0.004, 'inox', { seg: 8, pos: [0, 0.93, b * 0.178] }));
      });
      // varillas inox laterales en J con rodillo blanco de Naylamid en la punta (fotos 1, 6 y 9)
      [-1, 1].forEach(e => [-1, 1].forEach(b => {
        const xl = e * 0.60, xe = e * 0.455, zl = b * 0.2345, zr = b * 0.192;
        g1.add(pipe([[xl, 0.9, zl], [xl, 0.978, zl], [xl, 0.978, zr], [xe, 0.978, zr]], 0.0042, 'steel', { bend: 0.022, radial: 12 }));
        g1.add(cyl(0.0105, 0.0105, 0.034, 'naylamid', { axis: 'x', pos: [xe - e * 0.0, 0.978, zr], seg: 24 }));
        g1.add(rbox(0.045, 0.004, 0.03, 0.002, 'steelDark', { pos: [xl, 0.9, zl] }));
        g1.add(bolts([[xl - 0.012, 0.902, zl], [xl + 0.012, 0.902, zl]], 0.005, 0.012, 'y', { mat: 'steel' }));
      }));
      // brazo de reacción del reductor (dentro de la caja del motor, B3)
      g1.add(rbox(0.03, 0.03, 0.225, 0.003, bx, { pos: [sx, 0.78, -0.5475] }));
      g1.add(rbox(0.03, 0.05, 0.03, 0.003, bx, { pos: [sx, 0.805, -0.445] }));
    }

    /* ---------- 3 · PLACAS SOPORTE (4) · 2 · PERNOS (8) · 16 · TUERCAS (8): sujetan cada pata a la tina (foto 5) ---------- */
    {
      const g2 = g(2), g3 = g(3), g16 = g(16), lx = L.legX, zp = L.legZ + 0.023;
      [-1, 1].forEach(a => [-1, 1].forEach(b => {
        const pl = extrude(K.hullShape([[-0.025, -0.053, 0.012], [0.025, -0.053, 0.012], [-0.025, 0.053, 0.012], [0.025, 0.053, 0.012]], [[0, -0.025, 0.0072], [0, 0.025, 0.0072]]), 0.006, 'inox', { seg: 8, pos: [a * lx, 0.84, b * zp] });
        g3.add(pl);
        [-1, 1].forEach(k => {
          g2.add(bolts([[a * lx, 0.84 + k * 0.025, b * (zp + 0.003)]], 0.0127, 0.075, b > 0 ? 'z' : 'nz', { mat: 'steel' }));
          g16.add(nuts([[a * lx, 0.84 + k * 0.025, b * 0.2185]], 0.0127, 'z', { mat: 'steel' }));
        });
      }));
    }

    /* ---------- 8 · FLECHA CONDUCIDA · 9 · FLECHA MOTRIZ · 7 · FLECHA MOTOR ---------- */
    const shaftRot = [];
    {
      const g8 = g(8), g9 = g(9), g7 = g(7);
      const sh = (parent, a, z0, z1) => {   // flecha escalonada: Ø38.1 al centro, Ø25 en los muñones (z0 a z1, con z0 ≤ -0.2 ≤ 0.2 ≤ z1)
        const o = grp(parent, a * sx, ys, 0); shaftRot.push(o);
        o.add(cyl(0.01905, 0.01905, 0.40, 'steel', { axis: 'z', seg: 40 }));
        o.add(cyl(0.0125, 0.0125, z1 - 0.2, 'steel', { axis: 'z', pos: [0, 0, (z1 + 0.2) / 2], seg: 32 }));
        o.add(cyl(0.0125, 0.0125, -0.2 - z0, 'steel', { axis: 'z', pos: [0, 0, (z0 - 0.2) / 2], seg: 32 }));
        [-1, 1].forEach(s => o.add(cyl(0.0190, 0.0126, 0.008, 'steelDark', { axis: 'z', pos: [0, 0, s * 0.204], seg: 32 })));
        spin(o, 'z', -1); return o;
      };
      sh(g8, -1, -0.30, 0.30);
      sh(g9, 1, -0.3515, 0.30);
      const o7 = grp(g7, sx, ys, 0); o7.add(cyl(0.0125, 0.0125, 0.102, 'steel', { axis: 'z', pos: [0, 0, -0.426], seg: 32 })); spin(o7, 'z', -1);
    }

    /* ---------- 20 · SPROCKETS ×10 · 6 · CUÑAS ×10 · 32 · ANILLOS SH-150 ×4 · 31 · ANILLO SH-98 ×1 ---------- */
    {
      const g20 = g(20), g6 = g(6), g32 = g(32), g31 = g(31);
      [-1, 1].forEach(a => {
        ZS.forEach(z => {
          const o = grp(g20, a * sx, ys, z); o.add(P.sprocket900(0.0254)); spin(o, 'z', -1);
          const k = grp(g6, a * sx, ys, z); k.add(rbox(0.0095, 0.0095, 0.036, 0.0015, 'steelDark', { pos: [0, 0.0197, 0] })); spin(k, 'z', -1);
        });
        [-1, 1].forEach(s => { const o = grp(g32, a * sx, ys, s * 0.1895); o.add(P.collar(0.0192, 0.0268, 0.008)); o.add(cyl(0.0034, 0.0034, 0.014, 'black', { pos: [0, 0.0268, 0], seg: 10 })); spin(o, 'z', -1); });
      });
      const o = grp(g31, sx, ys, -0.414); o.add(P.collar(0.0124, 0.021, 0.008)); spin(o, 'z', -1);
    }

    /* ---------- 21 · CHUMACERAS UCFL205 ×4 (carcasa blanca) · 10/11 · PLACAS · 13 · RONDANAS · 23–26 · TORNILLERÍA ---------- */
    {
      const g21 = g(21), g10 = g(10), g11 = g(11), g13 = g(13), g23 = g(23), g24 = g(24), g25 = g(25), g26 = g(26);
      const hs = 0.0477, bl = [], fl = [], lk = [], nu = [], sp = [];
      [-1, 1].forEach(a => [-1, 1].forEach(b => {
        const cap = false;   // en las fotos 1, 6, 9 y 11 las chumaceras no llevan domo: la punta de la flecha asoma
        const bg = grp(g21, a * sx, ys, b * bz); if (b < 0) bg.rotation.y = PI; bg.add(P.ucfl205(cap));
        // placa de la chumacera, atornillada a la pared de la tina: 1 → lado A, 2 → lado B
        const gp = b > 0 ? g10 : g11, zp = b * 0.228;
        gp.add(extrude(K.hullShape([[-0.047, -0.047, 0.012], [0.047, -0.047, 0.012], [-0.047, 0.047, 0.012], [0.047, 0.047, 0.012]], [[-hs, 0, 0.0072], [hs, 0, 0.0072], [0, 0, 0.0262]]), 0.006, 'inox', { seg: 8, pos: [a * sx, ys, zp] }));
        [-1, 1].forEach(k => {
          const x = a * sx + k * hs, zf = b * (bz + 0.006);
          fl.push([x, ys, zf + b * 0.0014]); lk.push([x, ys, zf + b * 0.0042]);
          sp.push([x, ys, b * 0.2230]);
          nu.push([x, ys, b * 0.2185]);
          bl.push([x, ys, zf + b * 0.0056]);
        });
      }));
      const half = (arr, s) => arr.filter(p => (p[2] > 0) === (s > 0));
      [1, -1].forEach(s => {
        const ax = s > 0 ? 'z' : 'nz';
        g25.add(bolts(half(bl, s), 0.0127, 0.0318, ax, { mat: 'steel' }));
        g23.add(washers(half(fl, s), 0.0127, ax, { mat: 'steel' }));
        g24.add(washers(half(lk, s), 0.0127, ax, { mat: 'steelDark' }));
        g13.add(washers(half(sp, s), 0.0155, ax, { mat: 'steelDark' }));
      });
      nu.forEach(p => {   // tuerca de bellota (hexágono + domo hacia el interior de la tina)
        const b = p[2] > 0 ? 1 : -1, o = grp(g26, p[0], p[1], b * 0.2187);
        o.add(nuts([[0, 0, 0]], 0.0127, b > 0 ? 'z' : 'nz', { mat: 'steel' }));
        o.add(sphere(0.0105, 'steel', { pos: [0, 0, -b * 0.0062], scl: [1, 1, 0.8] }));
      });
    }

    /* ---------- 12 · GUÍAS DE DESGASTE: 4 varillas blancas de Naylamid (foto 8) · 15 · SOPORTES ×3 (placa con muescas + 2 travesaños) ---------- */
    {
      const g12 = g(12), g15 = g(15), R = L.rod, px = R.plateX;
      R.zs.forEach(z => {
        const b0 = px + 0.006;
        g12.add(cyl(R.r, R.r, R.x1 - b0, 'naylamid', { axis: 'x', pos: [(b0 + R.x1) / 2, R.y, z], seg: 32 }));                 // cuerpo bajo la banda
        g12.add(cyl(R.r * 1.04, R.r * 1.04, 0.004, 'naylamid', { axis: 'x', pos: [b0 + 0.002, R.y, z], seg: 32 }));              // collarín
        g12.add(cyl(0.0095, 0.0095, 0.014, 'naylamid', { axis: 'x', pos: [px, R.y, z], seg: 24 }));                              // cuello en la muesca
        g12.add(cyl(R.r, R.r, 0.016, 'naylamid', { axis: 'x', pos: [px - 0.0155, R.y, z], seg: 32 }));                          // cabeza
        g12.add(sphere(R.r * 0.99, 'naylamid', { pos: [px - 0.0235, R.y, z], scl: [0.55, 1, 1] }));                              // extremo redondeado
      });
      // placa inox con muescas en U donde descansa el cuello de cada varilla
      {
        const W = 0.29, H = 0.10, yc = R.y - 0.001, nw = 0.0195, s = new THREE.Shape(), zs = R.zs.slice().sort((a, b) => a - b), top = H / 2;
        s.moveTo(-W / 2, -H / 2); s.lineTo(W / 2, -H / 2); s.lineTo(W / 2, top);
        zs.forEach(zk => {   // el eje X de la forma queda hacia -Z del mundo: la arista superior se recorre de mayor a menor X de la forma
          const u = -zk;
          s.lineTo(u + nw / 2, top); s.lineTo(u + nw / 2, 0.001); s.absarc(u, 0.001, nw / 2, 0, PI, true); s.lineTo(u - nw / 2, top);
        });
        s.lineTo(-W / 2, top); s.closePath();
        const m = extrude(s, 0.004, 'inox', { seg: 12 }); m.rotation.y = PI / 2; m.position.set(px, yc, 0); g15.add(m);
        g15.add(rbox(0.03, 0.004, W, 0.0015, 'inox', { pos: [px + 0.015, yc - H / 2 + 0.002, 0] }));                            // pestaña inferior doblada
        [-1, 1].forEach(sd => g15.add(bolts([[px + 0.015, yc - H / 2 + 0.0045, sd * 0.1]], 0.006, 0.012, 'y', { mat: 'steel' })));
      }
      // dos travesaños bajo la banda (no se ven en las fotos: aproximados)
      [-0.05, 0.52].forEach(x => {
        g15.add(rbox(0.03, 0.0615, 0.443, 0.003, 'steelDark', { pos: [x, 0.8668, 0] }));
        [-1, 1].forEach(b => g15.add(rbox(0.05, 0.02, 0.02, 0.002, 'steelDark', { pos: [x, 0.8535, b * 0.2115] })));
      });
    }

    /* ---------- 17 · RODILLOS DE RETORNO ×2 · 18 · SOPORTES ×4 (no se ven en las fotos: aproximados) ---------- */
    {
      const g17 = g(17), g18 = g(18);
      [-0.30, 0.30].forEach(x => {
        const ro = grp(g17, x, 0.8055, 0); ro.add(cyl(0.021, 0.021, 0.34, 'naylamid', { axis: 'z', seg: 32 })); ro.add(cyl(0.0062, 0.0062, 0.37, 'steel', { axis: 'z', seg: 16 })); spin(ro, 'z', -0.5);
        [-1, 1].forEach(b => {
          g18.add(rbox(0.034, 0.078, 0.006, 0.002, 'steelDark', { pos: [x, 0.812, b * 0.1835] }));
          g18.add(rbox(0.034, 0.012, 0.04, 0.002, 'steelDark', { pos: [x, 0.846, b * 0.2025] }));
          g18.add(cyl(0.0095, 0.0095, 0.012, 'steel', { axis: 'z', pos: [x, 0.8055, b * 0.1905], seg: 16 }));
        });
      });
    }

    /* ---------- 19 · BANDA MODULAR SERIE 900 FLUSH GRID (330 mm × 2.7 m): 106 módulos con rejilla y varillas ---------- */
    {
      const g19 = g(19), n = 106, Pper = 2 * L.Lc + TAU * L.R, pitch = Pper / n, t = 0.009, w = L.bw, R = L.R, Lc = L.Lc, A = PI * R;
      const plateGeo = geo('beltPlate', () => {
        const s = new THREE.Shape(), hw = pitch / 2 - 0.0006; s.moveTo(-hw, -w / 2); s.lineTo(hw, -w / 2); s.lineTo(hw, w / 2); s.lineTo(-hw, w / 2); s.closePath();
        const nO = 13, ow = w / nO, rr = 0.0022, hx = 0.0056, hz = ow * 0.31;
        for (let i = 0; i < nO; i++) {
          const zc = -w / 2 + ow * (i + 0.5), p = new THREE.Path(), a = hx - rr, b = hz - rr;   // abertura redondeada (sentido horario por ser agujero)
          p.moveTo(-a, zc - hz); p.lineTo(-hx, zc - b); p.lineTo(-hx, zc + b); p.lineTo(-a, zc + hz); p.lineTo(a, zc + hz); p.lineTo(hx, zc + b); p.lineTo(hx, zc - b); p.lineTo(a, zc - hz); p.closePath();
          s.holes.push(p);
        }
        const e = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false }); e.translate(0, 0, -t / 2); e.rotateX(-PI / 2); return e;
      });
      const rodGeo = geo('beltRod', () => K.merge([new THREE.CylinderGeometry(0.0033, 0.0033, w + 0.004, 12).rotateX(PI / 2), new THREE.CylinderGeometry(0.0046, 0.0046, 0.004, 14).rotateX(PI / 2).translate(0, 0, w / 2 + 0.002), new THREE.CylinderGeometry(0.0046, 0.0046, 0.004, 14).rotateX(PI / 2).translate(0, 0, -w / 2 - 0.002)]));
      const plates = new THREE.InstancedMesh(plateGeo, K.mat('beltBlue'), n), rods = new THREE.InstancedMesh(rodGeo, K.mat('beltRod'), n);
      [plates, rods].forEach(m => { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; g19.add(m); });
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), ps = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1), zA = new THREE.Vector3(0, 0, 1);
      function at(s) {   // posición y rumbo sobre el perímetro (arriba hacia +X, retorno hacia -X)
        if (s < Lc) return [-Lc / 2 + s, ys + R, 0];
        if (s < Lc + A) { const f = (s - Lc) / R, a = PI / 2 - f; return [Lc / 2 + R * Math.cos(a), ys + R * Math.sin(a), -f]; }
        if (s < 2 * Lc + A) return [Lc / 2 - (s - Lc - A), ys - R, -PI];
        const f = (s - 2 * Lc - A) / R, a = -PI / 2 - f; return [-Lc / 2 + R * Math.cos(a), ys + R * Math.sin(a), -PI - f];
      }
      function place(off) {
        for (let i = 0; i < n; i++) {
          const s = (((i * pitch + off) % Pper) + Pper) % Pper, p = at(s);
          q.setFromAxisAngle(zA, p[2]); ps.set(p[0], p[1], 0); m4.compose(ps, q, one); plates.setMatrixAt(i, m4);
          ps.set(p[0] + Math.cos(p[2]) * pitch / 2, p[1] + Math.sin(p[2]) * pitch / 2, 0); m4.compose(ps, q, one); rods.setMatrixAt(i, m4);
        }
        plates.instanceMatrix.needsUpdate = true; rods.instanceMatrix.needsUpdate = true;
      }
      let off = 0; place(0);
      anim.push((dt, st) => { if (st.speed > 0.002) { off += st.speed * R * dt; place(off); } });
      K.belt = { place, n };
    }

    /* ---------- 34 · MAZAS DEL COPLE (×2) · 35 · ELEMENTO DE BUNA · 22 · COPLE MORDAZA ML099 (mazas negras, foto 9) ---------- */
    {
      const g34 = g(34), g35 = g(35), g22 = g(22);
      const cpl = (hubA, hubB, spd, zA0, zB0, zS, r, len) => {
        const a = grp(hubA, sx, ys, 0), b = grp(hubB, sx, ys, 0), sp = grp(spd, sx, ys, 0);
        const ha = P.jawHub(r, len, -1); ha.position.z = zA0; a.add(ha);
        const hb = P.jawHub(r, len, 1); hb.position.z = zB0; b.add(hb);
        const s = P.jawSpider(r * 0.97, 0.016); s.position.z = zS; sp.add(s);
        [a, b, sp].forEach(o => spin(o, 'z', -1)); return [a, b, sp];
      };
      cpl(g34, g34, g35, -0.318, -0.366, -0.358, 0.030, 0.032);     // cople visible junto a la chumacera (fuera de la caja)
      cpl(g22, g22, g22, -0.462, -0.510, -0.502, 0.030, 0.032);     // cople del reductor (dentro de la caja)
      // opresores de Ø1/4" en las mazas
      const g30 = g(30), o30 = grp(g30, sx, ys, 0); spin(o30, 'z', -1);
      [-0.302, -0.382].forEach(z => o30.add(cyl(0.0036, 0.0036, 0.012, 'black', { pos: [0, 0.0334, z], seg: 10 })));
      // cuñas del acoplamiento y del eje del reductor
      const g5 = g(5), o5 = grp(g5, sx, ys, 0); spin(o5, 'z', -1);
      [-0.382, -0.446].forEach(z => o5.add(rbox(0.0085, 0.0085, 0.032, 0.0012, 'steelDark', { pos: [0, 0.0125 + 0.0, z] })));
      const g4 = g(4), o4 = grp(g4, sx, ys, 0); spin(o4, 'z', -1); o4.add(rbox(0.0085, 0.0085, 0.036, 0.0012, 'steelDark', { pos: [0, 0.0125, -0.526] }));
    }

    /* ---------- 14 · RONDANA REDUCTOR · 27–29 · TORNILLERÍA 5/16" DEL BRAZO DE REACCIÓN ---------- */
    {
      const g14 = g(14), g27 = g(27), g28 = g(28), g29 = g(29), x = sx, z = L.motor.z;
      g14.add(washers([[x, 0.8013, z]], 0.0222, 'y', { mat: 'steelDark' }));     // espaciador entre el brazo y la pata del reductor
      g27.add(washers([[x, 0.7632, z]], 0.0079, 'y', { mat: 'steel' }));
      g28.add(washers([[x, 0.7607, z]], 0.0079, 'y', { mat: 'steelDark' }));
      g29.add(bolts([[x, 0.7578, z]], 0.0079, 0.05, 'ny', { mat: 'steel' }));
    }
  });
})();
