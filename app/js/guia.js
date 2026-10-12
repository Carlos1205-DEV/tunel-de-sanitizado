/* © 2026 Jose Carlos Trejo Espinosa. Todos los derechos reservados. */
/* Modo «? Guía»: la guía de uso (data/guia.js) dentro de la aplicación; las imágenes se amplían al tocarlas */
(function () {
  'use strict';
  const TS = window.TS, ACT = TS.ACT, $ = TS.$, esc = TS.esc;
  const G_ = { open: 0 };
  function guiaView() {
    const G = window.GUIA || [];
    return `<div class="p-head"><div class="p-sys">Ayuda</div><div class="p-title">Guía de uso</div></div>
    <div class="p-body"><p class="p-desc">Todo lo que tiene la aplicación, explicado paso a paso. Toca un tema para abrirlo; toca una imagen para verla grande.</p>
      ${G.map((s, i) => `<div class="gsec ${G_.open === i ? 'open' : ''}"><button class="gh" data-act="gopen" data-i="${i}"><span class="gn">${i + 1}</span>${esc(s.t)}<span class="gc">${G_.open === i ? '−' : '+'}</span></button>${G_.open === i ? `<div class="gb">${s.html.replace(/\{img:([a-z0-9_]+)\|([^}]*)\}/g, (m, n, alt) => `<img class="gimg" src="${TS.imgSrc(n)}" alt="${esc(alt)}" data-act="gzoom">`)}</div>` : ''}</div>`).join('')}
    </div>`;
  }
  ACT.gopen = d => { G_.open = G_.open === +d.i ? -1 : +d.i; TS.renderPanel(true); };
  ACT.gzoom = (d, el) => { const L = $('#lightbox'); L.querySelector('img').src = el.src; L.querySelector('figcaption').textContent = el.alt; L.hidden = false; };
  $('#lightbox').onclick = () => { $('#lightbox').hidden = true; };
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#lightbox').hidden) $('#lightbox').hidden = true; });
  TS.MODE_RENDER.guia = guiaView;
})();
