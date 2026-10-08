/* Layout general, piso y biblioteca de piezas reutilizables (chumaceras, sprockets, acoplamientos, mangueras).
 * Referencia: fotos de planta de las rutinas (docs/hallazgos-fotos.md) y respuestas del usuario sobre dónde va cada sistema.
 * La taxonomía del Excel solo aporta nombres, cantidades y medidas de las piezas; la forma y el lugar salen de las fotos. */
(function () {
  'use strict';
  window.MODEL_BUILDERS.push(function (K) {
    const { THREE, PI, TAU, box, rbox, cyl, torus, sphere, lathe, extrude, mesh, mat, context, comps, bolts, merge, tr, hose } = K;

    /* ---------- LAYOUT (metros). X = banda (ENTRADA con las varillas blancas en -X, salida en +X), Y = altura,
     *  Z = LADO A (+Z, el del gabinete: foto 6) y LADO B (-Z, bomba Dossatron y caja del motorreductor).
     *  Zonas del croquis: 1 = entrada, 2 = centro, 3 = salida.  Gabinete en A1, Dossatron + garrafa en B2, motor en B3. ---------- */
    const L = K.L = {
      ys: 0.88,            // eje de las flechas (altura)
      R: 0.049,            // radio primitivo del sprocket de 12 dientes
      Lc: 1.196,           // distancia entre ejes (banda de 2.7 m de perímetro)
      sx: 0.598,           // posición X de las flechas (±)
      bw: 0.33,            // ancho de la banda
      legX: 0.71, legZ: 0.251,
      bearZ: 0.2365,       // plano de las chumaceras (±)
      // tina de acero inoxidable: la banda va dentro y la campana se apoya en su borde (fotos 5, 6, 7)
      tray: { x0: -0.82, x1: 0.82, yTop: 0.90, yBot: 0.55, yS: 0.80, zW: 0.2235, zB: 0.14, t: 0.003, lip: 0.022 },
      hood: { x0: -0.40, x1: 0.40, y0: 0.903, y1: 1.22, hw: 0.229, winW: 0.38, winY0: 0.918, winY1: 1.10, t: 0.008 },
      // 4 varillas blancas de Naylamid bajo la banda; asoman por la entrada y se apoyan en una placa con muescas (foto 8)
      rod: { x0: -0.862, x1: 0.56, r: 0.0135, y: 0.911, zs: [-0.0975, -0.0325, 0.0325, 0.0975], plateX: -0.832 },
      cab: { x: -0.36, y: 0.66, z: 0.32, w: 0.34, h: 0.23, d: 0.17 },                   // gabinete en A1 (puerta hacia +Z)
      dos: { x: -0.04, z: -0.31 },                                                       // eje de la Dossatron en B2
      jug: { x: -0.08, z: -0.47 },                                                       // garrafa en el piso, B2
      dosY: { tee: 0.60, housing: 0.665, clamp: 0.835, top: 1.0 },                       // alturas de la Dossatron (te de PVC, cuerpo negro, abrazadera, tapa)
      box: { x0: 0.448, x1: 0.748, y0: 0.46, y1: 0.98, z0: -0.43, z1: -0.75 },           // caja inox del motorreductor en B3
      motor: { x: 0.598, z: -0.665 },
      sol2: [0.06, 0.80, -0.285],                                                        // solenoide de la línea hacia la campana (aproximado)
      nozzle: { x: 0.05, y: 1.13, z: 0.0 }
    };
    // z de la pared de la tina a una altura dada (vertical arriba, inclinada abajo)
    L.wallZ = y => { const T = L.tray; return y >= T.yS ? T.zW : T.zB + (T.zW - T.zB) * Math.max(0, y - T.yBot) / (T.yS - T.yBot); };
    K.parts = {};
    const P = K.parts;

    K.extra = function (C, name) { const g = new THREE.Group(); g.name = C + ':' + name; g.userData.comp = C; comps[C].add(g); return g; };

    /* ---------- piso (contexto, no seleccionable) ---------- */
    {
      const fl = K.canvasTex(512, 512, (g, w, h) => {
        g.fillStyle = '#6d675d'; g.fillRect(0, 0, w, h);
        const n = 4, s = w / n;
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const v = 150 + ((i * 7 + j * 13) % 5) * 5; g.fillStyle = `rgb(${v},${v - 6},${v - 18})`; g.fillRect(i * s + 3, j * s + 3, s - 6, s - 6); }
      });
      fl.wrapS = fl.wrapT = THREE.RepeatWrapping; fl.repeat.set(12, 12);
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ map: fl, roughness: 0.7, metalness: 0, envMapIntensity: 0.3 }));
      floor.rotation.x = -PI / 2; floor.receiveShadow = true; floor.userData.floor = true; context.add(floor);
    }

    /* ---------- pie de nivelación (base, vástago roscado y tuercas) ---------- */
    K.level = function (x, y, z, r, mainY) {
      const g = new THREE.Group(); g.position.set(x, y || 0, z);
      g.add(lathe([[0.0, 0.0], [r, 0.0], [r * 1.02, 0.008], [r * 0.9, 0.016], [r * 0.34, 0.022], [r * 0.22, 0.034]], 'black', { seg: 40 }));
      g.add(cyl(r * 0.2, r * 0.2, mainY - 0.04, 'steel', { pos: [0, 0.034 + (mainY - 0.04) / 2, 0], seg: 20 }));
      g.add(cyl(r * 0.36, r * 0.36, 0.012, 'steelDark', { pos: [0, 0.07, 0], seg: 6 }));
      g.add(cyl(r * 0.36, r * 0.36, 0.012, 'steelDark', { pos: [0, mainY - 0.02, 0], seg: 6 }));
      return g;
    };

    /* ---------- envolvente convexa (para bridas redondeadas) ---------- */
    function hullShape(circles, holes) {
      const pts = [];
      circles.forEach(c => { for (let i = 0; i < 48; i++) { const a = i * TAU / 48; pts.push([c[0] + Math.cos(a) * c[2], c[1] + Math.sin(a) * c[2]]); } });
      pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
      pts.forEach(p => { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); });
      for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
      up.pop(); lo.pop(); const h = lo.concat(up), s = new THREE.Shape();
      h.forEach((p, i) => i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1])); s.closePath();
      (holes || []).forEach(q => { const p = new THREE.Path(); p.absarc(q[0], q[1], q[2], 0, TAU, true); s.holes.push(p); });
      return s;
    }
    K.hullShape = hullShape;

    /* ---------- abertura (hueco) de esquinas redondeadas para placas: ranuras, ventanas, muescas ---------- */
    K.rrectHole = function (cx, cy, w, h, r) {
      r = Math.min(r, w / 2 - 1e-5, h / 2 - 1e-5);
      const p = new THREE.Path(), x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2;
      p.moveTo(x0 + r, y0); p.quadraticCurveTo(x0, y0, x0, y0 + r); p.lineTo(x0, y1 - r); p.quadraticCurveTo(x0, y1, x0 + r, y1);
      p.lineTo(x1 - r, y1); p.quadraticCurveTo(x1, y1, x1, y1 - r); p.lineTo(x1, y0 + r); p.quadraticCurveTo(x1, y0, x1 - r, y0); p.closePath();
      return p;
    };
    // placa rectangular (centrada) con huecos: ojos redondos [x,y,r] y ranuras [cx,cy,w,h]
    K.plateShape = function (w, h, rounds, slots, rc) {
      const s = new THREE.Shape(), r = rc || 0;
      if (r > 0) { s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2); }
      else { s.moveTo(-w / 2, -h / 2); s.lineTo(w / 2, -h / 2); s.lineTo(w / 2, h / 2); s.lineTo(-w / 2, h / 2); }
      s.closePath();
      (rounds || []).forEach(q => { const p = new THREE.Path(); p.absarc(q[0], q[1], q[2], 0, TAU, true); s.holes.push(p); });
      (slots || []).forEach(q => s.holes.push(K.rrectHole(q[0], q[1], q[2], q[3], Math.min(q[2], q[3]) / 2)));
      return s;
    };

    /* ---------- chumacera de brida UCFL205 (eje 25 mm) de carcasa blanca de termoplástico, brida en el plano XY y cuerpo hacia +Z ---------- */
    P.ucfl205 = function (cap) {
      const g = new THREE.Group(), hs = 0.0477;
      g.add(extrude(hullShape([[-hs, 0, 0.0165], [hs, 0, 0.0165], [0, 0, 0.034]], [[-hs, 0, 0.0066], [hs, 0, 0.0066], [0, 0, 0.0245]]), 0.012, 'whiteHousing', { seg: 10 }));
      g.add(lathe([[0.0245, 0.006], [0.0345, 0.006], [0.0358, 0.014], [0.0345, 0.026], [0.030, 0.034], [0.0287, 0.040], [0.0287, 0.046], [0.0245, 0.046], [0.0245, 0.006]], 'whiteHousing', { axis: 'z', seg: 56 }));
      g.add(cyl(0.0262, 0.0262, 0.036, 'steel', { axis: 'z', pos: [0, 0, 0.032], seg: 48 }));                                  // inserto de acero inoxidable
      g.add(lathe([[0.0245, -0.006], [0.031, -0.006], [0.031, -0.011], [0.0245, -0.011]], 'black', { axis: 'z', seg: 40 }));      // sello trasero
      g.add(cyl(0.0042, 0.0042, 0.02, 'brass', { pos: [0, 0.0405, 0.02], seg: 10 }));
      g.add(sphere(0.0055, 'brass', { pos: [0, 0.0515, 0.02] }));
      g.add(cyl(0.0036, 0.0036, 0.014, 'steelDark', { pos: [0.0305, 0.0, 0.043], axis: 'x', seg: 10 }));
      if (cap) g.add(lathe([[0.0287, 0.030], [0.0322, 0.033], [0.0322, 0.060], [0.027, 0.070], [0.014, 0.0765], [0.0, 0.078]], 'whiteHousing', { axis: 'z', seg: 56 }));
      return g;
    };

    /* ---------- sprocket EZ Clean Serie 900, 12 dientes, acetal, orificio 1.5" (eje Z) ---------- */
    P.sprocket900 = function (width) {
      const rTip = 0.0526, rRoot = 0.0452, teeth = 12, N = teeth * 18, step = TAU / teeth, s = new THREE.Shape();
      const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
      for (let k = 0; k < N; k++) {
        const th = k * TAU / N, u = (th % step) / step, f = sm(0.08, 0.26, u) * (1 - sm(0.64, 0.82, u)), r = rRoot + (rTip - rRoot) * f;
        k ? s.lineTo(Math.cos(th) * r, Math.sin(th) * r) : s.moveTo(Math.cos(th) * r, Math.sin(th) * r);
      }
      s.closePath();
      const h = new THREE.Path(); h.absarc(0, 0, 0.0192, 0, TAU, true); s.holes.push(h);
      const g = new THREE.Group();
      g.add(extrude(s, width, 'acetal', { seg: 8 }));
      g.add(extrude(K.ringShape(0.0285, 0.0192), width * 1.5, 'acetal', { seg: 36 }));
      g.add(cyl(0.0034, 0.0034, 0.012, 'black', { pos: [0, 0.0285, 0], seg: 10 }));
      return g;
    };

    /* ---------- acoplamiento de mordaza (jaw) negro: maza con garras y araña de buna (eje Z) ---------- */
    P.jawHub = function (r, len, dir) {   // maza: cuerpo de z=0 a z=-len*dir y garras hacia +dir
      const g = new THREE.Group();
      g.add(cyl(r, r, len, 'blackOx', { axis: 'z', pos: [0, 0, -dir * len / 2], seg: 40 }));
      g.add(cyl(r * 1.0, r * 0.82, len * 0.18, 'blackOx', { axis: 'z', pos: [0, 0, dir * len * 0.09 - dir * 0.0], seg: 40 }));
      for (let i = 0; i < 3; i++) {
        const sh = new THREE.Shape(), a = i * TAU / 3, b = a + TAU / 6 - 0.16;
        sh.moveTo(Math.cos(a + 0.08) * r * 0.5, Math.sin(a + 0.08) * r * 0.5); sh.absarc(0, 0, r * 0.98, a + 0.08, b, false); sh.lineTo(Math.cos(b) * r * 0.5, Math.sin(b) * r * 0.5); sh.absarc(0, 0, r * 0.5, b, a + 0.08, true);
        const cm = extrude(sh, len * 0.5, 'blackOx', { seg: 10 }); cm.position.z = dir * len * 0.25; g.add(cm);
      }
      g.add(cyl(r * 0.1, r * 0.1, r * 0.6, 'steelDark', { pos: [0, r * 0.75, -dir * len * 0.55], seg: 10 }));
      return g;
    };
    P.jawSpider = function (r, w) {   // araña de buna con 6 lóbulos
      const N = 96, s = new THREE.Shape();
      for (let k = 0; k < N; k++) { const th = k * TAU / N, lobe = Math.abs(Math.cos(th * 3)), rad = r * (0.58 + 0.4 * Math.pow(lobe, 0.6)); k ? s.lineTo(Math.cos(th) * rad, Math.sin(th) * rad) : s.moveTo(Math.cos(th) * rad, Math.sin(th) * rad); }
      s.closePath(); const h = new THREE.Path(); h.absarc(0, 0, r * 0.3, 0, TAU, true); s.holes.push(h);
      return extrude(s, w, 'red', { seg: 6 });
    };

    /* ---------- anillo de retención / collarín (eje Z) ---------- */
    P.collar = function (rIn, rOut, w) { return extrude(K.ringShape(rOut, rIn), w, 'steelDark', { seg: 24 }); };

    /* ---------- manguera acanalada (tubo + anillos instanciados) ---------- */
    K.ribbed = function (points, r, matName, spacing, o) {
      const g = new THREE.Group(), c = new THREE.CatmullRomCurve3(points.map(a => new THREE.Vector3(a[0], a[1], a[2])), false, 'catmullrom', 0.4), len = c.getLength();
      g.add(mesh(new THREE.TubeGeometry(c, Math.max(16, Math.round(len * 80 * K.detail)), r, 16, false), matName, o));
      const n = Math.max(2, Math.floor(len / spacing)), tg = K.geo('rib' + r, () => new THREE.TorusGeometry(r * 1.05, r * 0.14, 8, 20)), im = new THREE.InstancedMesh(tg, K.mat(matName, o && o.mat), n);
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), z = new THREE.Vector3(0, 0, 1), one = new THREE.Vector3(1, 1, 1);
      for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; q.setFromUnitVectors(z, c.getTangentAt(t)); m4.compose(c.getPointAt(t), q, one); im.setMatrixAt(i, m4); }
      im.castShadow = true; im.frustumCulled = false; g.add(im); return g;
    };

    /* ---------- abrazadera de manguera (eje Y local) ---------- */
    P.hoseClamp = function (r) {
      const g = new THREE.Group();
      g.add(torus(r * 1.08, r * 0.1, 'steel', { axis: 'y', seg: 28 }));
      g.add(cyl(r * 0.16, r * 0.16, r * 0.5, 'steel', { pos: [r * 1.3, 0, 0], rot: [0, 0, PI / 2], seg: 10 }));
      return g;
    };
  });
})();
