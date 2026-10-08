/* TRANSMISIÓN, BANDA Y ESTRUCTURA — 35 elementos de la taxonomía (despiece oficial, imagen 55 del Excel).
 * Banda modular Serie 900 flush grid 330 mm × 2.7 m, 10 sprockets de 12 dientes, flechas, chumaceras UCFL205,
 * guías de desgaste, rodillos de retorno, acoplamientos de mordaza y tornillería. */
(function () {
  'use strict';
  window.MODEL_BUILDERS.push(function (K) {
    const { THREE, PI, TAU, el, box, rbox, cyl, torus, sphere, lathe, extrude, mesh, bolts, nuts, washers, explode, spin, anim, state, geo } = K;
    const L = K.L, P = K.parts, C = 'transmision', ys = L.ys, sx = L.sx, bz = L.bearZ, bx = 'brushed';
    const g = i => el(C, i);
    const ZS = [-0.15, -0.075, 0, 0.075, 0.15];        // posición de los 5 sprockets sobre cada flecha
    const grp = (parent, x, y, z) => { const o = new THREE.Group(); o.position.set(x, y, z); parent.add(o); return o; };

    /* ---------- 1 · ESTRUCTURA DEL TÚNEL (armazón de tubo inoxidable, patas, guías soldadas) ---------- */
    {
      const g1 = g(1);
      [-1, 1].forEach(a => [-1, 1].forEach(b => {
        g1.add(rbox(0.04, 0.70, 0.04, 0.004, bx, { pos: [a * L.legX, 0.45, b * L.railZ] }));
        g1.add(K.level(a * L.legX, 0, b * L.railZ, 0.034, 0.12));
      }));
      [-1, 1].forEach(b => {
        g1.add(rbox(1.30, 0.04, 0.04, 0.004, bx, { pos: [0, 0.82, b * L.railZ] }));
        g1.add(rbox(1.04, 0.03, 0.03, 0.003, 'steelDark', { pos: [0, 0.30, b * L.railZ] }));
        g1.add(rbox(1.16, 0.06, 0.004, 0.0015, 'steel', { pos: [0, 0.93, b * 0.178] }));            // guía lateral soldada
        [-0.17, 0.17].forEach(x => g1.add(rbox(0.04, 0.06, 0.02, 0.002, bx, { pos: [x, 0.87, b * 0.19] })));
      });
      [-1, 1].forEach(a => {
        g1.add(rbox(0.04, 0.04, 0.41, 0.004, bx, { pos: [a * L.legX, 0.80, 0] }));
        g1.add(rbox(0.03, 0.03, 0.41, 0.003, 'steelDark', { pos: [a * L.legX, 0.30, 0] }));
      });
      g1.add(rbox(0.46, 0.012, 0.36, 0.003, 'steelDark', { pos: [0.10, 0.315, 0] }));                // estante inferior
      // brazo de reacción del reductor
      g1.add(rbox(0.03, 0.03, 0.56, 0.003, bx, { pos: [sx, 0.78, -0.485] }));
      g1.add(rbox(0.03, 0.05, 0.03, 0.003, bx, { pos: [sx, 0.805, -0.215] }));
      // patas del lado de la banda: soportes de la campana (escuadras)
      [-1, 1].forEach(b => [-0.28, 0.38].forEach(x => g1.add(rbox(0.04, 0.012, 0.05, 0.002, bx, { pos: [x, 0.846, b * 0.205] }))));
    }

    /* ---------- 3 · PLACAS SOPORTE (4) · 2 · PERNOS (8) · 16 · TUERCAS (8) ---------- */
    {
      const g2 = g(2), g3 = g(3), g16 = g(16), nl = [];
      [-1, 1].forEach(a => [-1, 1].forEach(b => {
        const pl = extrude(K.hullShape([[-0.043, -0.053, 0.012], [0.043, -0.053, 0.012], [-0.043, 0.053, 0.012], [0.043, 0.053, 0.012]], [[-0.03, 0, 0.0072], [0.03, 0, 0.0072]]), 0.006, 'steel', { seg: 8, pos: [a * L.legX, 0.74, b * 0.228] });
        g3.add(pl);
        [-1, 1].forEach(k => {
          g2.add(cyl(0.0063, 0.0063, 0.032, 'steel', { axis: 'z', pos: [a * L.legX + k * 0.03, 0.74, b * 0.2325], seg: 14 }));
          nl.push([a * L.legX + k * 0.03, 0.74, b * 0.2353]);
        });
      }));
      g16.add(nuts(nl.filter(p => p[2] > 0), 0.0127, 'z', { mat: 'steel' }));
      g16.add(nuts(nl.filter(p => p[2] < 0), 0.0127, 'nz', { mat: 'steel' }));
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
        [-1, 1].forEach(s => o.add(cyl(0.0190, 0.0126, 0.008, 'steelDark', { axis: 'z', pos: [0, 0, s * 0.204], seg: 32, rot: s > 0 ? [0, 0, 0] : [0, 0, 0] })));
        spin(o, 'z', -1); return o;
      };
      sh(g8, -1, -0.30, 0.30);
      sh(g9, 1, -0.3515, 0.30);
      const o7 = grp(g7, sx, ys, 0); o7.add(cyl(0.0125, 0.0125, 0.14, 'steel', { axis: 'z', pos: [0, 0, -0.445], seg: 32 })); spin(o7, 'z', -1);
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
      const o = grp(g31, sx, ys, -0.47); o.add(P.collar(0.0124, 0.021, 0.008)); spin(o, 'z', -1);
    }

    /* ---------- 21 · CHUMACERAS UCFL205 ×4 · 10/11 · PLACAS · 13 · RONDANAS · 23–26 · TORNILLERÍA ---------- */
    {
      const g21 = g(21), g10 = g(10), g11 = g(11), g13 = g(13), g23 = g(23), g24 = g(24), g25 = g(25), g26 = g(26);
      const hs = 0.0477, bl = [], fl = [], lk = [], nu = [], sp = [];
      [-1, 1].forEach(a => [-1, 1].forEach(b => {
        const cap = (b > 0) || (a < 0);   // la flecha motriz atraviesa la chumacera trasera (sin tapa)
        const bg = grp(g21, a * sx, ys, b * bz); if (b < 0) bg.rotation.y = PI; bg.add(P.ucfl205(cap));
        // placa de la chumacera (escuadra apoyada sobre el larguero): 1 → frontal, 2 → trasera
        const gp = b > 0 ? g10 : g11, zp = b * 0.228;
        gp.add(extrude(K.hullShape([[-0.047, -0.047, 0.012], [0.047, -0.047, 0.012], [-0.047, 0.047, 0.012], [0.047, 0.047, 0.012]], [[-hs, 0, 0.0072], [hs, 0, 0.0072], [0, 0, 0.0262]]), 0.006, 'steelDark', { seg: 8, pos: [a * sx, ys, zp] }));
        gp.add(rbox(0.094, 0.006, 0.042, 0.002, 'steelDark', { pos: [a * sx, 0.843, b * 0.2065] }));
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
      nu.forEach(p => {   // tuerca de bellota (hexágono + domo hacia el interior del bastidor)
        const b = p[2] > 0 ? 1 : -1, o = grp(g26, p[0], p[1], b * 0.2187);
        o.add(nuts([[0, 0, 0]], 0.0127, b > 0 ? 'z' : 'nz', { mat: 'steel' }));
        o.add(sphere(0.0105, 'steel', { pos: [0, 0, -b * 0.0062], scl: [1, 1, 0.8] }));
      });
    }

    /* ---------- 12 · GUÍAS DE DESGASTE ×5 · 15 · SOPORTES ×3 ---------- */
    {
      const g12 = g(12), g15 = g(15);
      [-0.13, -0.065, 0, 0.065, 0.13].forEach(z => {
        g12.add(cyl(0.012, 0.012, 1.12, 'naylamid', { axis: 'x', pos: [0, 0.9135, z], seg: 28 }));
        [-1, 1].forEach(s => g12.add(cyl(0.012, 0.0085, 0.01, 'naylamid', { axis: 'x', pos: [s * 0.565, 0.9135, z], seg: 24 })));
      });
      [-0.35, 0, 0.35].forEach(x => {
        g15.add(rbox(0.03, 0.0615, 0.41, 0.003, 'steelDark', { pos: [x, 0.8708, 0] }));
        [-1, 1].forEach(b => g15.add(rbox(0.05, 0.02, 0.02, 0.002, 'steelDark', { pos: [x, 0.8535, b * 0.195] })));
      });
    }

    /* ---------- 17 · RODILLOS DE RETORNO ×2 · 18 · SOPORTES ×4 ---------- */
    {
      const g17 = g(17), g18 = g(18);
      [-0.30, 0.30].forEach(x => {
        const ro = grp(g17, x, 0.8055, 0); ro.add(cyl(0.021, 0.021, 0.34, 'naylamid', { axis: 'z', seg: 32 })); ro.add(cyl(0.0062, 0.0062, 0.37, 'steel', { axis: 'z', seg: 16 })); spin(ro, 'z', -0.5);
        [-1, 1].forEach(b => {
          g18.add(rbox(0.034, 0.078, 0.006, 0.002, 'steelDark', { pos: [x, 0.812, b * 0.1835] }));
          g18.add(rbox(0.034, 0.012, 0.03, 0.002, 'steelDark', { pos: [x, 0.846, b * 0.1985] }));
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

    /* ---------- 34 · MAZAS DEL COPLE (×2) · 35 · ELEMENTO DE BUNA · 22 · COPLE MORDAZA ML099 ---------- */
    {
      const g34 = g(34), g35 = g(35), g22 = g(22), g7s = g(7);
      const cpl = (hubA, hubB, spd, zA0, zB0, zS, r, len) => {
        const a = grp(hubA, sx, ys, 0), b = grp(hubB, sx, ys, 0), sp = grp(spd, sx, ys, 0);
        const ha = P.jawHub(r, len, -1); ha.position.z = zA0; a.add(ha);
        const hb = P.jawHub(r, len, 1); hb.position.z = zB0; b.add(hb);
        const s = P.jawSpider(r * 0.97, 0.016); s.position.z = zS; sp.add(s);
        [a, b, sp].forEach(o => spin(o, 'z', -1)); return [a, b, sp];
      };
      cpl(g34, g34, g35, -0.318, -0.366, -0.358, 0.030, 0.032);
      cpl(g22, g22, g22, -0.500, -0.548, -0.540, 0.030, 0.032);
      // opresores de Ø1/4" en las mazas
      const g30 = g(30), o30 = grp(g30, sx, ys, 0); spin(o30, 'z', -1);
      [-0.334, -0.382].forEach(z => o30.add(cyl(0.0036, 0.0036, 0.012, 'black', { pos: [0, 0.0334, z], seg: 10 })));
      // cuñas del acoplamiento y del eje del reductor
      const g5 = g(5), o5 = grp(g5, sx, ys, 0); spin(o5, 'z', -1);
      [-0.395, -0.520].forEach(z => o5.add(rbox(0.0085, 0.0085, 0.032, 0.0012, 'steelDark', { pos: [0, 0.0125 + 0.0, z] })));
      const g4 = g(4), o4 = grp(g4, sx, ys, 0); spin(o4, 'z', -1); o4.add(rbox(0.0085, 0.0085, 0.036, 0.0012, 'steelDark', { pos: [0, 0.0125, -0.605] }));
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
