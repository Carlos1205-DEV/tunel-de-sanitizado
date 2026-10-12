/* © 2026 Jose Carlos Trejo Espinosa. Todos los derechos reservados. */
/* Generador de PDF mínimo (sin librerías ni internet): texto Helvetica, líneas y rectángulos.
 * Coordenadas en puntos desde la esquina superior izquierda. Tamaño carta (612 × 792). */
(function () {
  'use strict';
  // caracteres fuera de Latin-1 que sí existen en WinAnsiEncoding
  const WIN = { '€': 128, '‚': 130, '„': 132, '…': 133, '•': 149, '–': 150, '—': 151, '‘': 145, '’': 146, '“': 147, '”': 148, '™': 153 };
  const enc = s => {
    let o = '';
    for (const ch of String(s)) {
      let c = WIN[ch] || ch.charCodeAt(0);
      if (c > 255) c = 63;                                   // '?' para lo que Helvetica no tiene
      if (c === 40 || c === 41 || c === 92) o += '\\' + String.fromCharCode(c);
      else if (c < 32 || c > 126) o += '\\' + ('00' + c.toString(8)).slice(-3);
      else o += String.fromCharCode(c);
    }
    return o;
  };
  const cv = document.createElement('canvas').getContext('2d');
  const FAM = '1000px Helvetica, Arial, "Liberation Sans", sans-serif';   // Arial y Liberation tienen las mismas medidas que Helvetica
  const n = v => (Math.round(v * 100) / 100).toString();

  function create() {
    const W = 612, H = 792, pages = [];
    let cur = null, f = 'F1', size = 10;
    const doc = {
      W, H,
      addPage() { cur = []; pages.push(cur); return doc; },
      font(name, s) { f = name === 'bold' ? 'F2' : 'F1'; size = s; return doc; },
      width(str, name, s) { cv.font = (((name || (f === 'F2' ? 'bold' : '')) === 'bold') ? 'bold ' : '') + FAM; return cv.measureText(String(str)).width / 1000 * (s || size); },
      wrap(str, w, name, s) {                                // parte un texto en renglones que caben en w
        const out = [];
        String(str || '').split('\n').forEach(par => {
          let line = '';
          par.split(/\s+/).filter(Boolean).forEach(word => {
            const t = line ? line + ' ' + word : word;
            if (doc.width(t, name, s) <= w) { line = t; return; }
            if (line) out.push(line);
            while (doc.width(word, name, s) > w && word.length > 1) {   // palabra más larga que la columna
              let k = word.length; while (k > 1 && doc.width(word.slice(0, k), name, s) > w) k--;
              out.push(word.slice(0, k)); word = word.slice(k);
            }
            line = word;
          });
          out.push(line);
        });
        return out;
      },
      text(str, x, y, o) {                                   // y = línea base
        o = o || {};
        const c = o.color || [0.1, 0.1, 0.1];
        let xx = x; if (o.align === 'right') xx = x - doc.width(str); else if (o.align === 'center') xx = x - doc.width(str) / 2;
        cur.push(`BT ${c.map(n).join(' ')} rg /${f} ${size} Tf ${n(xx)} ${n(H - y)} Td (${enc(str)}) Tj ET`);
        return doc;
      },
      rect(x, y, w, h, fill, stroke) {
        if (fill) cur.push(`${fill.map(n).join(' ')} rg ${n(x)} ${n(H - y - h)} ${n(w)} ${n(h)} re f`);
        if (stroke) cur.push(`${stroke.map(n).join(' ')} RG 0.6 w ${n(x)} ${n(H - y - h)} ${n(w)} ${n(h)} re S`);
        return doc;
      },
      line(x1, y1, x2, y2, color, lw) { cur.push(`${(color || [0.6, 0.6, 0.6]).map(n).join(' ')} RG ${n(lw || 0.6)} w ${n(x1)} ${n(H - y1)} m ${n(x2)} ${n(H - y2)} l S`); return doc; },
      get pageCount() { return pages.length; },
      onPage(i) { cur = pages[i]; return doc; },
      output() {
        const objs = [];
        const add = s => { objs.push(s); return objs.length; };
        add('<< /Type /Catalog /Pages 2 0 R >>');
        add('');                                             // páginas: se llena al final
        add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
        add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
        const kids = [];
        pages.forEach(p => {
          const body = p.join('\n');
          const c = add(`<< /Length ${body.length} >>\nstream\n${body}\nendstream`);
          kids.push(add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${c} 0 R >>`));
        });
        objs[1] = `<< /Type /Pages /Kids [${kids.map(k => k + ' 0 R').join(' ')}] /Count ${kids.length} >>`;
        let out = '%PDF-1.4\n%âãÏÓ\n';
        const offs = [];
        objs.forEach((o, i) => { offs.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
        const xref = out.length;
        out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map(o => ('0000000000' + o).slice(-10) + ' 00000 n \n').join('');
        out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
        const bytes = new Uint8Array(out.length);
        for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 255;
        return bytes;
      }
    };
    return doc;
  }
  window.PDFMini = { create };
})();
