/* GABINETE ELÉCTRICO (15 elementos de la taxonomía) con pedestal, puerta articulada y desconectador lateral.
 * Referencia: imagen 56 del Excel (componentes rotulados) y fotos 2, 3 y 4 de la rutina mensual. */
(function () {
  'use strict';
  window.MODEL_BUILDERS.push(function (K) {
    const { THREE, PI, TAU, el, box, rbox, cyl, torus, sphere, lathe, extrude, mesh, bolts, nuts, hose, anim, geo, inst } = K;
    const L = K.L, C = 'gabinete', cb = L.cab, W = cb.w, H = cb.h, D = cb.d, cx = cb.x, cy = cb.y, cz = cb.z;
    const zp = cz - D / 2 + 0.0095;                       // frente de la placa de montaje
    const at = (u, v, w) => [cx + u, cy + v, zp + (w || 0)];
    const g = i => el(C, i);
    K.elemDoor = {}; ['1', '2', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'].forEach(i => { K.elemDoor[C + ':' + i] = 'main'; });
    const grp = (p, a) => { const o = new THREE.Group(); o.position.set(a[0], a[1], a[2]); p.add(o); return o; };
    const led = (p, x, y, z, hex, em) => p.add(box(0.004, 0.004, 0.002, 'green', { pos: [x, y, z], mat: { color: hex, emissive: em }, cast: false }));
    const screws = (p, list, ax) => p.add(bolts(list, 0.004, 0.005, ax || 'z', { mat: 'steel' }));

    /* ---------- caja, placa de montaje y pedestal (sin número en la taxonomía) ---------- */
    {
      const gC = K.extra(C, 'caja'), t = 0.003;
      gC.add(rbox(W, H, t, 0.0015, 'cabinet', { pos: [cx, cy, cz - D / 2 + t / 2], shell: true }));
      [-1, 1].forEach(s => gC.add(rbox(t, H, D, 0.0015, 'cabinet', { pos: [cx + s * (W / 2 - t / 2), cy, cz], shell: true })));
      gC.add(rbox(W, t, D, 0.0015, 'cabinet', { pos: [cx, cy + H / 2 - t / 2, cz], shell: true }));
      gC.add(rbox(W, t, D, 0.0015, 'cabinet', { pos: [cx, cy - H / 2 + t / 2, cz], shell: true }));
      [[0, H / 2 - 0.009, W, 0.018], [0, -H / 2 + 0.009, W, 0.018]].forEach(q => gC.add(rbox(q[2], q[3], 0.012, 0.002, 'steelDark', { pos: [cx + q[0], cy + q[1], cz + D / 2 - 0.006] })));
      [-1, 1].forEach(s => gC.add(rbox(0.018, H - 0.036, 0.012, 0.002, 'steelDark', { pos: [cx + s * (W / 2 - 0.009), cy, cz + D / 2 - 0.006] })));
      gC.add(rbox(W - 0.03, H - 0.03, 0.003, 0.001, 'lightGray', { pos: [cx, cy, cz - D / 2 + t + 0.0015 + 0.0001] }));
      // pedestal
      const gS = K.extra(C, 'pedestal'), top = cy - H / 2;
      [-1, 1].forEach(s => { gS.add(rbox(0.03, top - 0.02, 0.03, 0.003, 'brushed', { pos: [cx + s * 0.15, (top + 0.02) / 2, cz - 0.02] })); gS.add(rbox(0.07, 0.008, 0.07, 0.003, 'steelDark', { pos: [cx + s * 0.15, 0.004, cz - 0.02] })); });
      gS.add(rbox(0.34, 0.025, 0.03, 0.003, 'brushed', { pos: [cx, 0.30, cz - 0.02] }));
      gS.add(rbox(0.36, 0.012, 0.09, 0.003, 'steelDark', { pos: [cx, top - 0.006, cz - 0.02] }));
      [-1, 1].forEach(s => gS.add(cyl(0.02, 0.02, 0.012, 'black', { pos: [cx + s * 0.15, 0.0, cz - 0.02], seg: 20 })));
    }

    /* ---------- puerta con 3 operadores (verde, rojo, selector), empaque y cierre ---------- */
    {
      const gD = K.extra(C, 'puerta'), piv = new THREE.Group(); piv.position.set(cx - W / 2, cy, cz + D / 2 - 0.004); gD.add(piv);
      const dw = W - 0.006, dh = H - 0.006;
      piv.add(rbox(dw, dh, 0.014, 0.003, 'cabinet', { pos: [dw / 2 + 0.003, 0, 0.007], shell: true }));
      // empaque perimetral
      [[dw - 0.03, 0.006, 0.0, dh / 2 - 0.015], [dw - 0.03, 0.006, 0.0, -dh / 2 + 0.015]].forEach(q => piv.add(box(q[0], q[1], 0.006, 'epdm', { pos: [dw / 2 + 0.003, q[3], -0.002], cast: false })));
      [-1, 1].forEach(s => piv.add(box(0.006, dh - 0.03, 0.006, 'epdm', { pos: [dw / 2 + 0.003 + s * (dw / 2 - 0.015), 0, -0.002], cast: false })));
      // operadores (en la cara exterior)
      const ox = dw * 0.62;
      [[0.105, 'green', 0x16b04a], [0.035, 'red', 0xc8302c]].forEach(q => {
        piv.add(cyl(0.0125, 0.0125, 0.006, 'black', { axis: 'z', pos: [ox, q[0], 0.017], seg: 28 }));
        piv.add(cyl(0.0105, 0.0105, 0.012, q[1], { axis: 'z', pos: [ox, q[0], 0.022], seg: 28, mat: { emissive: q[1] === 'green' ? 0x083a1a : 0x330c0a } }));
      });
      K.pilotDoor = piv.children[piv.children.length - 3];
      piv.add(cyl(0.0125, 0.0125, 0.006, 'black', { axis: 'z', pos: [ox, -0.035, 0.017], seg: 28 }));
      piv.add(cyl(0.0085, 0.0085, 0.02, 'black', { axis: 'z', pos: [ox, -0.035, 0.026], seg: 24 }));
      piv.add(rbox(0.026, 0.008, 0.008, 0.002, 'black', { pos: [ox, -0.035, 0.037], rot: [0, 0, 0.5] }));
      piv.add(K.label('MARCHA', 0.04, 0.012, { bg: '#e9ecee', fg: '#111', fs: 22, pos: [ox + 0.0, 0.0685 + 0.0, 0.0145] }));
      piv.add(K.label('PARO', 0.04, 0.012, { bg: '#e9ecee', fg: '#111', fs: 22, pos: [ox, 0.0, 0.0145] }));
      // cierre de cuarto de vuelta
      piv.add(cyl(0.011, 0.011, 0.012, 'steel', { axis: 'z', pos: [dw - 0.025, 0.0, 0.019], seg: 24 }));
      piv.add(rbox(0.02, 0.006, 0.006, 0.001, 'steelDark', { pos: [dw - 0.025, 0.0, 0.026] }));
      // cara interior: 3 bloques de contactos con cables hacia la placa
      [0.105, 0.035, -0.035].forEach((v, i) => {
        piv.add(rbox(0.032, 0.022, 0.026, 0.003, 'black', { pos: [ox, v, -0.014] }));
        piv.add(rbox(0.032, 0.006, 0.01, 0.002, i === 0 ? 'green' : i === 1 ? 'red' : 'steelDark', { pos: [ox, v, -0.03] }));
        piv.add(hose([[ox - 0.012, v + 0.011, -0.02], [ox - 0.03, v + 0.05, -0.04], [0.05, 0.12, -0.03], [0.02, 0.15, -0.02]], 0.0017, 'cableGray', { radial: 6 }));
      });
      // cable de puesta a tierra de la puerta
      piv.add(hose([[0.02, -0.12, 0.0], [0.04, -0.2, -0.05], [-0.01, -0.17, -0.07]], 0.0021, 'green', { radial: 6 }));
      K.doors = { main: { pivot: piv, max: -1.95 } };
      anim.push((dt, st) => { st.doors.main += (st.doorT.main - st.doors.main) * Math.min(1, dt * 4); piv.rotation.y = K.doors.main.max * st.doors.main; });
    }

    /* ---------- 1 y 2 · INTERRUPTORES TÉRMICOS 3×10 A y 3×20 A ---------- */
    const breaker = (gp, u, v, amp) => {
      const o = grp(gp, at(u, v, 0)), w = 0.026 * 3 / 1.5 * 0.7;
      o.add(rbox(0.054, 0.09, 0.056, 0.004, 'abLight', { pos: [0, 0, 0.028] }));
      o.add(rbox(0.054, 0.02, 0.016, 0.003, 'black', { pos: [0, 0.0, 0.058] }));
      [-1, 0, 1].forEach(k => { o.add(rbox(0.012, 0.034, 0.014, 0.002, 'black', { pos: [k * 0.0175, 0.0, 0.062] })); o.add(rbox(0.0085, 0.012, 0.008, 0.0015, 'abLight', { pos: [k * 0.0175, 0.012, 0.07] })); });
      [-1, 0, 1].forEach(k => { o.add(rbox(0.012, 0.008, 0.012, 0.0015, 'steelDark', { pos: [k * 0.0175, 0.044, 0.03] })); o.add(rbox(0.012, 0.008, 0.012, 0.0015, 'steelDark', { pos: [k * 0.0175, -0.044, 0.03] })); });
      screws(o, [-1, 0, 1].map(k => [k * 0.0175, 0.0484, 0.03]), 'y'); screws(o, [-1, 0, 1].map(k => [k * 0.0175, -0.0484, 0.03]), 'ny');
      o.add(K.label(amp + ' A', 0.04, 0.015, { bg: '#f0f1f2', fg: '#111', fs: 30, pos: [0, -0.0285, 0.0575] }));
    };
    breaker(g(1), -0.145, 0.085, '3×10'); breaker(g(2), -0.088, 0.085, '3×20');

    /* ---------- 3 · BOTÓN LATERAL DESCONECTADOR TIPO PUERTA (en el costado derecho) ---------- */
    {
      const o = grp(g(3), [cx + W / 2, cy + 0.05, cz + 0.0]);
      o.add(rbox(0.014, 0.07, 0.06, 0.004, 'black', { pos: [0.007, 0, 0] }));
      o.add(cyl(0.024, 0.024, 0.016, 'black', { axis: 'x', pos: [0.022, 0, 0], seg: 36 }));
      o.add(rbox(0.016, 0.02, 0.072, 0.005, 'red', { pos: [0.036, 0, 0] }));
      o.add(rbox(0.006, 0.026, 0.078, 0.005, 'yellow', { pos: [0.03, 0, 0] }));
      screws(o, [[0.0, 0.03, 0.026], [0.0, -0.03, -0.026]], 'x');
    }

    /* ---------- 4 · CONTACTOR · 5 · GUARDAMOTOR ---------- */
    {
      const o = grp(g(4), at(-0.145, -0.075, 0));
      o.add(rbox(0.05, 0.078, 0.07, 0.004, 'ab', { pos: [0, 0, 0.035] }));
      o.add(rbox(0.046, 0.02, 0.012, 0.003, 'abLight', { pos: [0, 0.0, 0.072] }));
      o.add(rbox(0.018, 0.012, 0.01, 0.002, 'blueLight', { pos: [0.01, -0.012, 0.075] }));
      [-1, 0, 1].forEach(k => { o.add(rbox(0.012, 0.01, 0.014, 0.002, 'steelDark', { pos: [k * 0.0155, 0.043, 0.035] })); o.add(rbox(0.012, 0.01, 0.014, 0.002, 'steelDark', { pos: [k * 0.0155, -0.043, 0.035] })); });
      screws(o, [-1, 0, 1].map(k => [k * 0.0155, 0.0485, 0.035]), 'y'); screws(o, [-1, 0, 1].map(k => [k * 0.0155, -0.0485, 0.035]), 'ny');
      o.add(K.label('KM1', 0.026, 0.01, { bg: '#e9ecee', fg: '#111', fs: 24, pos: [-0.008, 0.015, 0.0732] }));
      const o5 = grp(g(5), at(-0.088, -0.075, 0));
      o5.add(rbox(0.045, 0.085, 0.064, 0.004, 'abLight', { pos: [0, 0, 0.032] }));
      o5.add(cyl(0.017, 0.017, 0.012, 'black', { axis: 'z', pos: [0, 0.012, 0.07], seg: 32 }));
      o5.add(rbox(0.006, 0.015, 0.008, 0.0015, 'red', { pos: [0, 0.019, 0.078], rot: [0, 0, 0.4] }));
      o5.add(rbox(0.04, 0.012, 0.012, 0.002, 'black', { pos: [0, -0.02, 0.068] }));
      [-1, 0, 1].forEach(k => { o5.add(rbox(0.011, 0.01, 0.014, 0.002, 'steelDark', { pos: [k * 0.0135, 0.0475, 0.032] })); o5.add(rbox(0.011, 0.01, 0.014, 0.002, 'steelDark', { pos: [k * 0.0135, -0.0475, 0.032] })); });
      screws(o5, [-1, 0, 1].map(k => [k * 0.0135, 0.0528, 0.032]), 'y'); screws(o5, [-1, 0, 1].map(k => [k * 0.0135, -0.0528, 0.032]), 'ny');
    }

    /* ---------- 6 · FUENTE DE ALIMENTACIÓN · 7/8 · CLEMAS RELEVADOR FINDER · 9 · RELEVADOR DE 14 PINES ---------- */
    {
      const o = grp(g(6), at(-0.032, 0.085, 0));
      o.add(rbox(0.062, 0.09, 0.062, 0.004, 'abLight', { pos: [0, 0, 0.031] }));
      o.add(rbox(0.05, 0.03, 0.006, 0.002, 'black', { pos: [0, 0.015, 0.064] }));
      led(o, 0.016, -0.018, 0.0645, 0x33ff77, 0x0a5a22); o.add(cyl(0.004, 0.004, 0.008, 'yellow', { axis: 'z', pos: [-0.012, -0.022, 0.066], seg: 12 }));
      [-1, 0, 1].forEach(k => { o.add(rbox(0.012, 0.008, 0.012, 0.0015, 'steelDark', { pos: [k * 0.0175, 0.046, 0.03] })); o.add(rbox(0.012, 0.008, 0.012, 0.0015, 'steelDark', { pos: [k * 0.0175, -0.046, 0.03] })); });
      o.add(K.label('24 VDC', 0.04, 0.012, { bg: '#e0e3e6', fg: '#111', fs: 24, pos: [0, -0.002, 0.0642] }));
      [[g(7), 0.014, 0x2e5fb7], [g(8), 0.034, 0x25324a]].forEach(([gp, u, col]) => {
        const p = grp(gp, at(u, 0.085, 0));
        p.add(rbox(0.016, 0.07, 0.034, 0.002, 'ab', { pos: [0, 0, 0.017] }));
        p.add(rbox(0.0155, 0.052, 0.034, 0.003, 'glass', { pos: [0, 0.01, 0.051] }));
        p.add(rbox(0.012, 0.046, 0.026, 0.002, 'abLight', { pos: [0, 0.01, 0.052], mat: { color: col, metalness: 0.2, roughness: 0.5 } }));
        p.add(rbox(0.0155, 0.01, 0.01, 0.002, 'steelDark', { pos: [0, -0.04, 0.018] })); p.add(rbox(0.0155, 0.01, 0.01, 0.002, 'steelDark', { pos: [0, 0.04, 0.018] }));
      });
      const r = grp(g(9), at(0.076, 0.085, 0));
      r.add(rbox(0.05, 0.05, 0.026, 0.003, 'black', { pos: [0, 0, 0.013] }));
      r.add(rbox(0.04, 0.04, 0.034, 0.002, 'glass', { pos: [0, 0, 0.043] }));
      r.add(rbox(0.032, 0.03, 0.026, 0.002, 'abLight', { pos: [0, 0, 0.043], mat: { color: 0xc9a24a, metalness: 0.4, roughness: 0.5 } }));
      for (let i = 0; i < 7; i++) { r.add(box(0.0022, 0.006, 0.01, 'steel', { pos: [-0.018 + i * 0.006, 0.026, 0.0155], cast: false })); r.add(box(0.0022, 0.006, 0.01, 'steel', { pos: [-0.018 + i * 0.006, -0.026, 0.0155], cast: false })); }
    }

    /* ---------- 10 · VARIADOR DE FRECUENCIA ---------- */
    {
      const o = grp(g(10), at(0.148, 0.05, 0));
      o.add(rbox(0.082, 0.14, 0.074, 0.005, 'abLight', { pos: [0, 0, 0.037] }));
      o.add(rbox(0.07, 0.034, 0.008, 0.003, 'black', { pos: [0, 0.03, 0.076] }));
      o.add(box(0.05, 0.016, 0.002, 'green', { pos: [0, 0.03, 0.0805], mat: { color: 0x113a22, emissive: 0x0a3a1c }, cast: false }));
      for (let i = 0; i < 4; i++) o.add(rbox(0.012, 0.01, 0.006, 0.002, 'black', { pos: [-0.027 + i * 0.018, 0.0, 0.0775] }));
      o.add(cyl(0.011, 0.011, 0.008, 'steelDark', { axis: 'z', pos: [0.022, -0.017, 0.0775], seg: 24 }));
      for (let i = 0; i < 9; i++) o.add(box(0.07, 0.0022, 0.004, 'steelDark', { pos: [0, -0.04 - i * 0.0036, 0.0755], cast: false }));
      o.add(K.label('VFD', 0.04, 0.012, { bg: '#e0e3e6', fg: '#111', fs: 26, pos: [0, 0.058, 0.0752] }));
      for (let i = 0; i < 6; i++) o.add(rbox(0.01, 0.012, 0.012, 0.0015, 'steelDark', { pos: [-0.028 + i * 0.011, -0.0725, 0.036] }));
    }

    /* ---------- 11 · CLEMA DE TIERRA · 12 · CLEMAS DE PASO 2.5 mm · 13 · RIEL DIN · 14 · CANALETA ---------- */
    {
      const g11 = g(11), g12 = g(12), g13 = g(13), g14 = g(14), g15 = g(15);
      [0.085, -0.075].forEach(v => g13.add(rbox(0.35, 0.035, 0.007, 0.001, 'steelDark', { pos: at(0, v, 0.004) })));
      g14.add(rbox(0.35, 0.04, 0.04, 0.003, 'abLight', { pos: at(0, -0.003, 0.02) }));
      const sl = []; for (let i = 0; i < 40; i++) sl.push({ p: [cx - 0.1725 + i * 0.0088, cy - 0.003, zp + 0.0405], s: 1 });
      g14.add(inst(geo('slot', () => new THREE.BoxGeometry(0.0034, 0.03, 0.002)), 'steelDark', sl, { cast: false }));
      for (let i = 0; i < 12; i++) { const x = -0.04 + i * 0.0062, tg = i === 0 || i === 11; (tg ? g11 : g12).add(rbox(0.0056, 0.044, 0.034, 0.001, tg ? 'yellow' : 'gray', { pos: at(x, -0.075, 0.017 + 0.0) })); }
      g12.add(K.label('2.5 mm²', 0.04, 0.008, { bg: '#e9ecee', fg: '#111', fs: 22, pos: at(0.01, -0.107, 0.0345) }));
      screws(g12, Array.from({ length: 10 }, (_, i) => at(-0.0338 + i * 0.0062, -0.0525, 0.0345)), 'z');
      // glándulas en el fondo
      for (let i = 0; i < 4; i++) { const x = -0.12 + i * 0.075; g15.add(cyl(0.011, 0.011, 0.018, 'black', { pos: [cx + x, cy - H / 2 - 0.008, cz - 0.02], seg: 6 })); g15.add(cyl(0.0085, 0.0085, 0.024, 'black', { pos: [cx + x, cy - H / 2 - 0.028, cz - 0.02], seg: 20 })); g15.add(cyl(0.0105, 0.0105, 0.01, 'black', { pos: [cx + x, cy - H / 2 - 0.045, cz - 0.02], seg: 20 })); }
    }

    /* ---------- cableado (fases, control y tierra) ---------- */
    {
      const gW = K.extra(C, 'cables');
      const w = (m, r, pts) => gW.add(hose(pts, r, m, { tension: 0.4, radial: 6, res: 60 }));
      w('cable', 0.0018, [at(-0.145, 0.133, 0.03), at(-0.14, 0.15, 0.03), at(-0.12, 0.15, 0.025), at(-0.12, 0.02, 0.03)]);
      w('cableBlue', 0.0018, [at(-0.088, 0.133, 0.03), at(-0.09, 0.15, 0.028), at(-0.12, 0.15, 0.028)]);
      w('red', 0.0016, [at(-0.032, 0.131, 0.03), at(-0.04, 0.15, 0.032), at(0.05, 0.15, 0.03), at(0.13, 0.14, 0.03)]);
      w('cableGray', 0.0016, [at(0.014, 0.05, 0.02), at(0.014, 0.0, 0.03), at(-0.02, -0.045, 0.03)]);
      w('green', 0.002, [at(-0.04, -0.12, 0.018), at(-0.09, -0.15, 0.02), at(-0.17, -0.1, 0.02), at(-0.17, 0.1, 0.02)]);
      w('cable', 0.0018, [at(-0.145, -0.118, 0.03), at(-0.145, -0.14, 0.03), at(-0.14, -0.15, -0.01)]);
      w('cableBlue', 0.0017, [at(-0.088, -0.118, 0.03), at(-0.088, -0.14, 0.03), at(-0.07, -0.15, -0.01)]);
      w('cableGray', 0.0017, [at(0.12, 0.123, 0.03), at(0.1, 0.15, 0.03), at(0.06, 0.15, 0.03)]);
    }
  });
})();
