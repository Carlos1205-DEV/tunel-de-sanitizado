/* Ensamblado del modelo 3D del TÚNEL DE SANITIZADO 01 a partir de la taxonomía del Excel.
 * Cada sección (7) es un grupo; cada elemento de la taxonomía es un sub-grupo seleccionable (comp:i).
 * Cada hijo directo de una sección queda dentro de una "unidad" (envoltorio) que el despiece puede desplazar. */
(function () {
  'use strict';
  window.createTunelModel = function (opts) {
    opts = opts || {};
    const K = window.createKit(opts), THREE = K.THREE, TAXO = window.TAXO;
    TAXO.comps.forEach(c => K.comp(c.id, c.name, c.sys));
    window.MODEL_BUILDERS.forEach(b => b(K));
    K.root.updateMatrixWorld(true);

    /* ---------- cajas envolventes (con soporte de InstancedMesh) ---------- */
    const tmpB = new THREE.Box3(), tmpM = new THREE.Matrix4();
    function instBox(o) {
      const b = new THREE.Box3(), g = o.geometry; if (!g.boundingBox) g.computeBoundingBox();
      for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, tmpM); tmpB.copy(g.boundingBox).applyMatrix4(tmpM); b.union(tmpB); }
      return b.applyMatrix4(o.matrixWorld);
    }
    function objBox(obj) {
      const b = new THREE.Box3(), t = new THREE.Box3(); obj.updateWorldMatrix(true, true);
      obj.traverse(o => {
        if (o.userData.floor) return;
        if (o.isInstancedMesh) b.union(instBox(o));
        else if (o.isMesh) { if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); t.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld); b.union(t); }
      });
      return b;
    }
    function boxOfMeshes(list) {
      const b = new THREE.Box3(), t = new THREE.Box3();
      list.forEach(o => { if (o.isInstancedMesh) b.union(instBox(o)); else { if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); t.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld); b.union(t); } });
      return b;
    }

    /* ---------- explosión general: cada elemento se aleja del centro de la máquina ---------- */
    {
      const M = new THREE.Vector3(0.0, 0.75, 0.0);
      TAXO.comps.forEach(c => {
        K.comps[c.id].children.slice().forEach(ch => {
          const b = objBox(ch); if (b.isEmpty()) return;
          const ctr = b.getCenter(new THREE.Vector3()), d = ctr.clone().sub(M), l = d.length();
          if (l < 0.1) d.set(0, 1, 0.6); d.normalize();
          const k = 0.18 + l * 0.75;
          K.explode(ch, d.x * k * 1.15, d.y * k * 0.9 + 0.05, d.z * k * 1.15);
        });
      });
    }

    /* ---------- unidades de despiece: cada hijo directo de una sección va dentro de un envoltorio ---------- */
    const units = {};
    TAXO.comps.forEach(c => {
      const cg = K.comps[c.id]; units[c.id] = [];
      cg.children.slice().forEach(ch => {
        const w = new THREE.Group(); w.name = 'unidad'; w.userData.unit = true;
        cg.add(w); w.add(ch);
        units[c.id].push({ obj: w, child: ch, key: ch.userData.elem || null, name: ch.name || '' });
      });
    });

    /* ---------- registro ---------- */
    K.root.updateMatrixWorld(true);
    const meshes = [], meshesByElem = {}, meshesByComp = {}, ctxMeshes = [];
    function keyOf(o) {
      let elem = null, comp = null;
      for (let n = o; n; n = n.parent) {
        if (!elem && n.userData.elem) elem = n.userData.elem;
        if (!comp && n.userData.comp) comp = n.userData.comp;
        if (elem && comp) break;
      }
      if (elem && !comp) comp = elem.split(':')[0];
      return { elem, comp };
    }
    K.root.traverse(o => {
      if (!(o.isMesh || o.isInstancedMesh) || o.userData.floor) return;
      const k = keyOf(o); o.userData.elem = k.elem; o.userData.comp = k.comp;
      let ctx = false; for (let n = o; n; n = n.parent) if (n === K.context) ctx = true;
      o.userData.context = ctx || !k.comp;
      if (o.userData.context) { ctxMeshes.push(o); return; }
      meshes.push(o);
      (meshesByComp[k.comp] = meshesByComp[k.comp] || []).push(o);
      if (k.elem) (meshesByElem[k.elem] = meshesByElem[k.elem] || []).push(o);
    });
    Object.values(K.elems).forEach(e => {
      const list = meshesByElem[e.key] || [];
      e.meshes = list; e.box = list.length ? boxOfMeshes(list) : new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
      e.center = e.box.getCenter(new THREE.Vector3()); e.size = e.box.getSize(new THREE.Vector3());
    });
    const compInfo = {};
    TAXO.comps.forEach(c => {
      const list = meshesByComp[c.id] || [], b = boxOfMeshes(list);
      compInfo[c.id] = { box: b, center: b.getCenter(new THREE.Vector3()), size: b.getSize(new THREE.Vector3()), meshes: list };
    });
    const missing = [];
    TAXO.comps.forEach(c => c.items.forEach(it => { const e = K.elems[c.id + ':' + it.i]; if (!e || !e.meshes.length) missing.push(c.id + ':' + it.i + ' ' + it.n); }));
    if (missing.length) console.warn('Elementos sin geometría:', missing);

    let triangles = 0;
    meshes.forEach(m => { const g = m.geometry, n = (g.index ? g.index.count : g.attributes.position.count) / 3; triangles += n * (m.isInstancedMesh ? m.count : 1); });

    /* ---------- API ---------- */
    const state = K.state, SPEED = 4.59;   // 43.8 RPM de salida del reductor
    state.flow = 0;
    const api = {
      root: K.root, kit: K, comps: K.comps, elems: K.elems, compInfo, units, meshes, ctxMeshes, meshesByElem, meshesByComp, shells: K.shells, state, missing, triangles,
      detail: K.detail, elemDoor: K.elemDoor || {}, objBox, instBox, boxOfMeshes,
      setExplode(t) { K.expl.forEach(e => e.obj.position.copy(e.base).addScaledVector(e.vec, t)); },
      setRunning(v) { state.running = v; },
      setEstop(v) { state.estop = v; K.setEstopLook && K.setEstopLook(v); },
      setDoor(k, open) { state.doorT[k] = open ? 1 : 0; },
      // muestra solo una sección (vista "por separado"); null restaura todo
      setOnly(compId) {
        Object.keys(K.comps).forEach(id => { K.comps[id].visible = !compId || id === compId; });
        K.context.children.forEach(o => { if (!o.userData.floor) o.visible = !compId; });
      },
      dispose() {
        K.root.traverse(o => { if (o.geometry) o.geometry.dispose(); });
        Object.values(K.matCache || {}).forEach(m => m.dispose());
      },
      update(dt) {
        state.t += dt;
        const run = state.running && !state.estop, target = run ? SPEED : 0;
        state.speed += (target - state.speed) * Math.min(1, dt * (run ? 2.2 : 3.2));
        if (Math.abs(state.speed) < 0.003) state.speed = 0;
        state.flow += ((run ? 1 : 0) - state.flow) * Math.min(1, dt * 3);
        K.spinners.forEach(s => { s.obj.rotation[s.axis] += s.k * state.speed * dt; });
        K.anim.forEach(fn => fn(dt, state));
      }
    };
    return api;
  };
})();
