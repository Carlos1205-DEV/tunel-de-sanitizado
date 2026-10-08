/* GABINETE ELÉCTRICO (15 elementos de la taxonomía) en A1: caja de acero inoxidable sobre un solo poste y sujeta a la tina con una ménsula,
 * puerta con bisagra a la izquierda, piloto bicolor, botón rojo, cerradura de llave y paro BM13; desconectador rojo/amarillo en el costado IZQUIERDO.
 * Referencia: fotos 2, 3, 4 y 6 de la rutina mensual (componentes Eaton). Lo que no se ve en las fotos (variador, fuente, relevadores) va aproximado. */
(function () {
  'use strict';
  window.MODEL_BUILDERS.push(function (K) {
    const { THREE, PI, TAU, el, box, rbox, cyl, torus, sphere, lathe, extrude, mesh, bolts, nuts, hose, anim, geo, inst } = K;
    const L = K.L, C = 'gabinete', cb = L.cab, W = cb.w, H = cb.h, D = cb.d, cx = cb.x, cy = cb.y, cz = cb.z, S = 0.72;   // S: escala de los equipos (el gabinete real es chico)
    const zp = cz - D / 2 + 0.0095;                       // frente de la placa de montaje
    const at = (u, v, w) => [cx + u, cy + v, zp + (w || 0)];
    const g = i => el(C, i);
    K.elemDoor = {}; ['1', '2', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'].forEach(i => { K.elemDoor[C + ':' + i] = 'main'; });
    K.elemDoor['motorreductor:3'] = 'main';             // el solenoide va dentro del gabinete: al elegirlo se abre la puerta
    const grp = (p, a) => { const o = new THREE.Group(); o.position.set(a[0], a[1], a[2]); p.add(o); return o; };
    const dev = (p, u, v) => { const o = grp(p, at(u, v, 0)); o.scale.setScalar(S); return o; };      // equipo escalado sobre la placa
    const led = (p, x, y, z, hex, em) => p.add(box(0.004, 0.004, 0.002, 'green', { pos: [x, y, z], mat: { color: hex, emissive: em }, cast: false }));
    const screws = (p, list, ax) => p.add(bolts(list, 0.004, 0.005, ax || 'z', { mat: 'steel' }));
    const cbBot = cy - H / 2;

    /* ---------- caja, placa de montaje, poste y ménsula (sin número en la taxonomía) ---------- */
    {
      const gC = K.extra(C, 'caja'), t = 0.003;
      gC.add(rbox(W, H, t, 0.0015, 'inox', { pos: [cx, cy, cz - D / 2 + t / 2], shell: true }));
      [-1, 1].forEach(s => gC.add(rbox(t, H, D, 0.0015, 'inox', { pos: [cx + s * (W / 2 - t / 2), cy, cz], shell: true })));
      gC.add(rbox(W + 0.012, 0.004, D + 0.012, 0.0015, 'inox', { pos: [cx, cy + H / 2 + 0.002, cz + 0.003], shell: true }));   // tapa superior con volado (foto 3)
      gC.add(rbox(W, t, D, 0.0015, 'inox', { pos: [cx, cy - H / 2 + t / 2, cz], shell: true }));
      [[0, H / 2 - 0.009, W, 0.018], [0, -H / 2 + 0.009, W, 0.018]].forEach(q => gC.add(rbox(q[2], q[3], 0.012, 0.002, 'steelDark', { pos: [cx + q[0], cy + q[1], cz + D / 2 - 0.006] })));
      [-1, 1].forEach(s => gC.add(rbox(0.018, H - 0.036, 0.012, 0.002, 'steelDark', { pos: [cx + s * (W / 2 - 0.009), cy, cz + D / 2 - 0.006] })));
      gC.add(rbox(W - 0.03, H - 0.03, 0.003, 0.001, 'lightGray', { pos: [cx, cy, cz - D / 2 + t + 0.0015 + 0.0001] }));
      // un solo poste central (fotos 4 y 6) con placa de piso y niveladores
      const gS = K.extra(C, 'pedestal'), postX = cx - 0.04, postZ = cz - 0.01;
      gS.add(rbox(0.035, cbBot - 0.012, 0.035, 0.004, 'brushed', { pos: [postX, 0.012 + (cbBot - 0.012) / 2, postZ] }));
      gS.add(rbox(0.1, 0.008, 0.1, 0.003, 'steelDark', { pos: [postX, 0.006, postZ] }));
      gS.add(bolts([[-1, -1], [1, -1], [-1, 1], [1, 1]].map(k => [postX + k[0] * 0.037, 0.01, postZ + k[1] * 0.037]), 0.008, 0.01, 'y', { mat: 'steel' }));
      gS.add(rbox(0.07, 0.01, 0.07, 0.003, 'steelDark', { pos: [postX, cbBot - 0.005, postZ] }));
      // ménsula atornillada a la pared de la tina que sujeta la tapa del gabinete (foto 6)
      const bx = cx + 0.05, wz = L.tray.zW + L.tray.t / 2;
      gS.add(rbox(0.06, 0.1, 0.006, 0.002, 'inox', { pos: [bx, 0.80, wz + 0.003] }));
      gS.add(bolts([[bx - 0.015, 0.825, wz + 0.006], [bx + 0.015, 0.775, wz + 0.006]], 0.0079, 0.014, 'z', { mat: 'steel' }));
      gS.add(rbox(0.03, 0.05, 0.006, 0.002, 'inox', { pos: [bx, cy + H / 2 + 0.018, wz + 0.009] }));
      gS.add(rbox(0.03, 0.006, 0.045, 0.002, 'inox', { pos: [bx, cy + H / 2 + 0.007, cz - D / 2 + 0.0] }));
    }

    /* ---------- puerta con bisagra a la IZQUIERDA: piloto bicolor, botón rojo, cerradura de llave (fotos 2 y 3) ---------- */
    {
      const gD = K.extra(C, 'puerta'), piv = new THREE.Group(); piv.position.set(cx - W / 2, cy, cz + D / 2 - 0.004); gD.add(piv);
      const dw = W - 0.006, dh = H - 0.006, ox = dw / 2 + 0.003 + 0.01;
      piv.add(rbox(dw, dh, 0.014, 0.003, 'inox', { pos: [dw / 2 + 0.003, 0, 0.007], shell: true }));
      // empaque perimetral
      [[dw - 0.03, 0.006, 0.0, dh / 2 - 0.015], [dw - 0.03, 0.006, 0.0, -dh / 2 + 0.015]].forEach(q => piv.add(box(q[0], q[1], 0.006, 'epdm', { pos: [dw / 2 + 0.003, q[3], -0.002], cast: false })));
      [-1, 1].forEach(s => piv.add(box(0.006, dh - 0.03, 0.006, 'epdm', { pos: [dw / 2 + 0.003 + s * (dw / 2 - 0.015), 0, -0.002], cast: false })));
      // piloto doble (verde arriba, rojo abajo)
      const py = 0.0425;
      piv.add(rbox(0.026, 0.042, 0.005, 0.005, 'steelDark', { pos: [ox, py, 0.0165] }));
      piv.add(rbox(0.019, 0.0175, 0.006, 0.003, 'green', { pos: [ox, py + 0.0092, 0.019], mat: { emissive: 0x083a1a } }));
      piv.add(rbox(0.019, 0.0175, 0.006, 0.003, 'red', { pos: [ox, py - 0.0092, 0.019], mat: { emissive: 0x330c0a } }));
      K.pilotDoor = piv.children[piv.children.length - 2];
      // botón rojo al ras
      piv.add(cyl(0.0135, 0.0135, 0.004, 'steelDark', { axis: 'z', pos: [ox, -0.014, 0.016], seg: 28 }));
      piv.add(cyl(0.0108, 0.0108, 0.008, 'red', { axis: 'z', pos: [ox, -0.014, 0.019], seg: 28, mat: { emissive: 0x330c0a } }));
      // cerradura de llave a la derecha
      const lx = dw + 0.003 - 0.045;
      piv.add(rbox(0.032, 0.024, 0.004, 0.003, 'steel', { pos: [lx, 0.012, 0.016] }));
      piv.add(cyl(0.0068, 0.0068, 0.006, 'steelDark', { axis: 'z', pos: [lx, 0.012, 0.019], seg: 20 }));
      piv.add(rbox(0.009, 0.0017, 0.002, 0.0005, 'black', { pos: [lx, 0.012, 0.0225] }));
      // cierre de leva por dentro (foto 2)
      piv.add(cyl(0.011, 0.011, 0.012, 'steel', { axis: 'z', pos: [lx, 0.012, -0.012], seg: 24 }));
      piv.add(rbox(0.03, 0.007, 0.004, 0.0015, 'steelDark', { pos: [lx - 0.014, 0.012, -0.019] }));
      // cara interior: 3 bloques de contactos (piloto, botón y paro BM13) con cables hacia la placa
      [[py, 'green'], [-0.014, 'red'], [-0.084, 'yellow']].forEach(([v, col], i) => {
        piv.add(rbox(0.032, 0.022, 0.026, 0.003, 'black', { pos: [ox, v, -0.014] }));
        piv.add(rbox(0.032, 0.006, 0.01, 0.002, col, { pos: [ox, v, -0.03] }));
        piv.add(hose([[ox - 0.012, v + 0.011, -0.02], [ox - 0.03, v + 0.04, -0.04], [0.05, 0.1, -0.03], [0.02, 0.13, -0.02]], 0.0017, 'cableGray', { radial: 6 }));
      });
      // cable de puesta a tierra de la puerta
      piv.add(hose([[0.02, -0.09, 0.0], [0.04, -0.14, -0.05], [-0.01, -0.12, -0.07]], 0.0021, 'green', { radial: 6 }));
      K.doors = { main: { pivot: piv, max: -1.95 } };
      anim.push((dt, st) => {
        st.doors.main += (st.doorT.main - st.doors.main) * Math.min(1, dt * 4);
        const a = K.doors.main.max * st.doors.main; piv.rotation.y = a;
        // el paro BM13 va montado en la puerta: sus piezas giran con ella alrededor de la bisagra
        const px = piv.position.x, pz = piv.position.z, c = Math.cos(a), s = Math.sin(a);
        (K.doorFollowers || []).forEach(f => { f.rotation.y = a; f.position.set(px - (px * c + pz * s), 0, pz - (-px * s + pz * c)); });
      });
    }

    /* ---------- 1 y 2 · INTERRUPTORES TÉRMICOS 3×10 A y 3×20 A ---------- */
    const breaker = (gp, u, v, amp) => {
      const o = dev(gp, u, v);
      o.add(rbox(0.054, 0.09, 0.056, 0.004, 'abLight', { pos: [0, 0, 0.028] }));
      o.add(rbox(0.054, 0.02, 0.016, 0.003, 'black', { pos: [0, 0.0, 0.058] }));
      o.add(rbox(0.054, 0.007, 0.004, 0.001, 'red', { pos: [0, 0.027, 0.0575] }));                  // franja roja de los Eaton (foto 4)
      [-1, 0, 1].forEach(k => { o.add(rbox(0.012, 0.034, 0.014, 0.002, 'black', { pos: [k * 0.0175, 0.0, 0.062] })); o.add(rbox(0.0085, 0.012, 0.008, 0.0015, 'abLight', { pos: [k * 0.0175, 0.012, 0.07] })); });
      [-1, 0, 1].forEach(k => { o.add(rbox(0.012, 0.008, 0.012, 0.0015, 'steelDark', { pos: [k * 0.0175, 0.044, 0.03] })); o.add(rbox(0.012, 0.008, 0.012, 0.0015, 'steelDark', { pos: [k * 0.0175, -0.044, 0.03] })); });
      screws(o, [-1, 0, 1].map(k => [k * 0.0175, 0.0484, 0.03]), 'y'); screws(o, [-1, 0, 1].map(k => [k * 0.0175, -0.0484, 0.03]), 'ny');
      o.add(K.label(amp + ' A', 0.04, 0.015, { bg: '#f0f1f2', fg: '#111', fs: 30, pos: [0, -0.0285, 0.0575] }));
    };
    breaker(g(1), -0.074, 0.04, '3×10'); breaker(g(2), -0.032, 0.04, '3×20');

    /* ---------- 3 · BOTÓN LATERAL DESCONECTADOR TIPO PUERTA (en el costado IZQUIERDO, rojo con base amarilla; fotos 3 y 6) ---------- */
    {
      const o = grp(g(3), [cx - W / 2, cy + 0.015, cz + D / 2 - 0.05]);
      o.add(rbox(0.006, 0.07, 0.07, 0.003, 'yellow', { pos: [-0.003, 0, 0] }));
      o.add(cyl(0.022, 0.022, 0.016, 'black', { axis: 'x', pos: [-0.014, 0, 0], seg: 36 }));
      const h = new THREE.Group(); h.position.set(-0.03, 0, 0); h.rotation.x = 0.7; o.add(h);
      h.add(rbox(0.016, 0.02, 0.078, 0.005, 'red', { pos: [0, 0, 0] }));
      h.add(cyl(0.012, 0.012, 0.008, 'red', { axis: 'x', pos: [0.0, 0, 0], seg: 24 }));
      screws(o, [[-0.006, 0.028, 0.026], [-0.006, -0.028, -0.026]], 'nx');
    }

    /* ---------- 4 · CONTACTOR · 5 · GUARDAMOTOR (Eaton) ---------- */
    {
      const o = dev(g(4), 0.012, 0.04);
      o.add(rbox(0.05, 0.078, 0.07, 0.004, 'abLight', { pos: [0, 0, 0.035] }));
      o.add(rbox(0.046, 0.02, 0.012, 0.003, 'ab', { pos: [0, 0.0, 0.072] }));
      o.add(rbox(0.018, 0.012, 0.01, 0.002, 'blueLight', { pos: [0.01, -0.012, 0.075] }));
      [-1, 0, 1].forEach(k => { o.add(rbox(0.012, 0.01, 0.014, 0.002, 'steelDark', { pos: [k * 0.0155, 0.043, 0.035] })); o.add(rbox(0.012, 0.01, 0.014, 0.002, 'steelDark', { pos: [k * 0.0155, -0.043, 0.035] })); });
      screws(o, [-1, 0, 1].map(k => [k * 0.0155, 0.0485, 0.035]), 'y'); screws(o, [-1, 0, 1].map(k => [k * 0.0155, -0.0485, 0.035]), 'ny');
      o.add(K.label('KM1', 0.026, 0.01, { bg: '#e9ecee', fg: '#111', fs: 24, pos: [-0.008, 0.015, 0.0732] }));
      const o5 = dev(g(5), 0.052, 0.04);
      o5.add(rbox(0.045, 0.085, 0.064, 0.004, 'abLight', { pos: [0, 0, 0.032] }));
      o5.add(cyl(0.017, 0.017, 0.012, 'black', { axis: 'z', pos: [0, 0.012, 0.07], seg: 32 }));                       // perilla negra
      o5.add(rbox(0.006, 0.015, 0.008, 0.0015, 'red', { pos: [0, 0.019, 0.078], rot: [0, 0, 0.4] }));
      o5.add(rbox(0.04, 0.012, 0.012, 0.002, 'black', { pos: [0, -0.02, 0.068] }));
      [-1, 0, 1].forEach(k => { o5.add(rbox(0.011, 0.01, 0.014, 0.002, 'steelDark', { pos: [k * 0.0135, 0.0475, 0.032] })); o5.add(rbox(0.011, 0.01, 0.014, 0.002, 'steelDark', { pos: [k * 0.0135, -0.0475, 0.032] })); });
      screws(o5, [-1, 0, 1].map(k => [k * 0.0135, 0.0528, 0.032]), 'y'); screws(o5, [-1, 0, 1].map(k => [k * 0.0135, -0.0528, 0.032]), 'ny');
    }

    /* ---------- 6 · FUENTE DE ALIMENTACIÓN · 7/8 · CLEMAS RELEVADOR FINDER · 9 · RELEVADOR DE 14 PINES (no se ven en las fotos: aproximados) ---------- */
    {
      const o = dev(g(6), -0.118, 0.04);
      o.add(rbox(0.062, 0.09, 0.062, 0.004, 'abLight', { pos: [0, 0, 0.031] }));
      o.add(rbox(0.05, 0.03, 0.006, 0.002, 'black', { pos: [0, 0.015, 0.064] }));
      led(o, 0.016, -0.018, 0.0645, 0x33ff77, 0x0a5a22); o.add(cyl(0.004, 0.004, 0.008, 'yellow', { axis: 'z', pos: [-0.012, -0.022, 0.066], seg: 12 }));
      [-1, 0, 1].forEach(k => { o.add(rbox(0.012, 0.008, 0.012, 0.0015, 'steelDark', { pos: [k * 0.0175, 0.046, 0.03] })); o.add(rbox(0.012, 0.008, 0.012, 0.0015, 'steelDark', { pos: [k * 0.0175, -0.046, 0.03] })); });
      o.add(K.label('24 VDC', 0.04, 0.012, { bg: '#e0e3e6', fg: '#111', fs: 24, pos: [0, -0.002, 0.0642] }));
      [[g(7), 0.116, 0x2e5fb7], [g(8), 0.131, 0x25324a]].forEach(([gp, u, col]) => {
        const p = dev(gp, u, 0.04);
        p.add(rbox(0.016, 0.07, 0.034, 0.002, 'ab', { pos: [0, 0, 0.017] }));
        p.add(rbox(0.0155, 0.052, 0.034, 0.003, 'glass', { pos: [0, 0.01, 0.051] }));
        p.add(rbox(0.012, 0.046, 0.026, 0.002, 'abLight', { pos: [0, 0.01, 0.052], mat: { color: col, metalness: 0.2, roughness: 0.5 } }));
        p.add(rbox(0.0155, 0.01, 0.01, 0.002, 'steelDark', { pos: [0, -0.04, 0.018] })); p.add(rbox(0.0155, 0.01, 0.01, 0.002, 'steelDark', { pos: [0, 0.04, 0.018] }));
      });
      const r = dev(g(9), 0.088, 0.04);
      r.add(rbox(0.05, 0.05, 0.026, 0.003, 'black', { pos: [0, 0, 0.013] }));
      r.add(rbox(0.04, 0.04, 0.034, 0.002, 'glass', { pos: [0, 0, 0.043] }));
      r.add(rbox(0.032, 0.03, 0.026, 0.002, 'abLight', { pos: [0, 0, 0.043], mat: { color: 0xc9a24a, metalness: 0.4, roughness: 0.5 } }));
      for (let i = 0; i < 7; i++) { r.add(box(0.0022, 0.006, 0.01, 'steel', { pos: [-0.018 + i * 0.006, 0.026, 0.0155], cast: false })); r.add(box(0.0022, 0.006, 0.01, 'steel', { pos: [-0.018 + i * 0.006, -0.026, 0.0155], cast: false })); }
    }

    /* ---------- 10 · VARIADOR DE FRECUENCIA (no se ve en las fotos: aproximado) ---------- */
    {
      const o = dev(g(10), -0.108, -0.05);
      o.add(rbox(0.082, 0.14, 0.074, 0.005, 'abLight', { pos: [0, 0, 0.037] }));
      o.add(rbox(0.07, 0.034, 0.008, 0.003, 'black', { pos: [0, 0.03, 0.076] }));
      o.add(box(0.05, 0.016, 0.002, 'green', { pos: [0, 0.03, 0.0805], mat: { color: 0x113a22, emissive: 0x0a3a1c }, cast: false }));
      for (let i = 0; i < 4; i++) o.add(rbox(0.012, 0.01, 0.006, 0.002, 'black', { pos: [-0.027 + i * 0.018, 0.0, 0.0775] }));
      o.add(cyl(0.011, 0.011, 0.008, 'steelDark', { axis: 'z', pos: [0.022, -0.017, 0.0775], seg: 24 }));
      for (let i = 0; i < 9; i++) o.add(box(0.07, 0.0022, 0.004, 'steelDark', { pos: [0, -0.04 - i * 0.0036, 0.0755], cast: false }));
      o.add(K.label('VFD', 0.04, 0.012, { bg: '#e0e3e6', fg: '#111', fs: 26, pos: [0, 0.058, 0.0752] }));
      for (let i = 0; i < 6; i++) o.add(rbox(0.01, 0.012, 0.012, 0.0015, 'steelDark', { pos: [-0.028 + i * 0.011, -0.0725, 0.036] }));
    }

    /* ---------- 11 · CLEMA DE TIERRA · 12 · CLEMAS DE PASO 2.5 mm · 13 · RIEL DIN · 14 · CANALETA · 15 · GLÁNDULAS (fotos 4 y 3) ---------- */
    {
      const g11 = g(11), g12 = g(12), g13 = g(13), g14 = g(14), g15 = g(15);
      [0.04, -0.06].forEach(v => g13.add(rbox(0.30, 0.035 * S, 0.007, 0.001, 'steelDark', { pos: at(0, v, 0.004) })));
      g14.add(rbox(0.30, 0.026, 0.026, 0.003, 'abLight', { pos: at(0, 0.086, 0.013) }));                                // canaleta ranurada superior
      const sl = []; for (let i = 0; i < 33; i++) sl.push({ p: [cx - 0.141 + i * 0.00885, cy + 0.086, zp + 0.0265], s: 1 });
      g14.add(inst(geo('slot', () => new THREE.BoxGeometry(0.0034, 0.02, 0.002)), 'steelDark', sl, { cast: false }));
      for (let i = 0; i < 12; i++) { const x = -0.03 + i * 0.0058, tg = i === 0 || i === 11; (tg ? g11 : g12).add(rbox(0.0052, 0.044 * S, 0.034 * S, 0.001, tg ? 'yellow' : 'gray', { pos: at(x, -0.06, 0.017 * S + 0.0) })); }
      g12.add(K.label('2.5 mm²', 0.03, 0.007, { bg: '#e9ecee', fg: '#111', fs: 22, pos: at(0.01, -0.082, 0.0345 * S + 0.001) }));
      screws(g12, Array.from({ length: 10 }, (_, i) => at(-0.0258 + i * 0.0058, -0.0425, 0.0345 * S)), 'z');
      // glándulas en el fondo (por donde entran las mangueras azules, el conduit y el cable)
      [-0.07, -0.02, 0.03, 0.07].forEach(x => { g15.add(cyl(0.011, 0.011, 0.018, 'black', { pos: [cx + x, cbBot - 0.008, cz + 0.03], seg: 6 })); g15.add(cyl(0.0085, 0.0085, 0.024, 'black', { pos: [cx + x, cbBot - 0.028, cz + 0.03], seg: 20 })); g15.add(cyl(0.0105, 0.0105, 0.01, 'black', { pos: [cx + x, cbBot - 0.045, cz + 0.03], seg: 20 })); });
    }

    /* ---------- cableado (fases, control y tierra) ---------- */
    {
      const gW = K.extra(C, 'cables');
      const w = (m, r, pts) => gW.add(hose(pts, r, m, { tension: 0.4, radial: 6, res: 60 }));
      w('cable', 0.0018, [at(-0.074, 0.085, 0.03), at(-0.07, 0.092, 0.03), at(-0.04, 0.092, 0.025), at(-0.04, 0.02, 0.03)]);
      w('cableBlue', 0.0018, [at(-0.032, 0.085, 0.03), at(-0.034, 0.092, 0.028), at(-0.04, 0.092, 0.028)]);
      w('red', 0.0016, [at(0.012, 0.085, 0.03), at(0.02, 0.092, 0.032), at(0.07, 0.092, 0.03), at(0.12, 0.09, 0.03)]);
      w('cableGray', 0.0016, [at(0.052, 0.03, 0.02), at(0.052, -0.01, 0.03), at(0.03, -0.045, 0.03)]);
      w('green', 0.002, [at(-0.03, -0.075, 0.018), at(-0.07, -0.09, 0.02), at(-0.14, -0.06, 0.02), at(-0.14, 0.06, 0.02)]);
      w('cable', 0.0018, [at(-0.074, -0.0, 0.03), at(-0.074, -0.04, 0.03), at(-0.06, -0.09, -0.01)]);
      w('cableBlue', 0.0017, [at(-0.032, 0.0, 0.03), at(-0.032, -0.05, 0.03), at(-0.01, -0.09, -0.01)]);
      w('cableGray', 0.0017, [at(0.088, 0.09, 0.03), at(0.07, 0.092, 0.03), at(0.04, 0.092, 0.03)]);
    }
  });
})();
