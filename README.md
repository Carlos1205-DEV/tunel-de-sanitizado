# Túnel de Sanitizado 01 (OP TS01) · modelo 3D interactivo

Aplicación web (HTML + JS, sin servidor ni internet) con el modelo 3D del túnel de sanitizado, construida con
la taxonomía del Excel y las dos OT maestras de mantenimiento (sus tareas). Se abre con `app/index.html` o, en **un solo archivo**,
con `dist/Tunel01_interactivo.html` (se arma con `node tools/empaquetar.js`).
Desarrollado por Jose Carlos Trejo Espinosa · 2026. Usa la misma base que el Extrusor 01 y el Cheese Former.

## Qué incluye

- **Modelo 3D procedural** (Three.js) con los **74 elementos**: los 66 de la taxonomía del Excel (boquilla Sprea, motorreductor
  WEG con reductor y solenoide, bomba Dossatron, botonera BM13, transmisión de 35 elementos y gabinete de 15) más 8 piezas
  que no están en la taxonomía pero aparecen en las tareas de las OT y en las fotos (campana, cortinas, tina de acero inoxidable, mangueras
  de drenaje, garrafa, mangueras azules y conduit, y la caja inox del motorreductor). **La forma y el lugar de cada pieza salen
  de las fotos de planta de las rutinas** y de lo que indicó el personal de planta; la taxonomía solo aporta nombres, partes y
  refacciones. Lo que no sale en ninguna foto se marca como «Aproximado».
- **Vista desplegable**: un solo botón «Vista» con la lista de vistas (generales y de detalle) en lugar de botones sueltos.
- **Explorar**: ficha por pieza con tareas, refacciones, fallas, foto y plano del manual; rayos X, aislar, corte, explosión
  general y **despiece** (en sitio, por separado en tablero y por elemento).
- **Tareas**: las de las dos **OT maestras** (PDF): mensual `OP-TS01-INSP-GRAL-EO-1M` (15 tareas) y anual `OP-TS01-PREV-MEC/ELEC-EP-1A` (7 tareas), con su «Tarea No.» (TS01-INSP-MEC-01…).
- **Ruta guiada**: recorre las tareas de la OT que elijas (✔ Conforme, ⚠ Anomalía u Omitir), lecturas del motor
  (máx. 42 °C, 1.5 A, 220 V), foto de referencia. Al terminar se descarga sola el **reporte en PDF** de la OT.
- **Historial**: todas las OT terminadas, con filtros (técnico, OT, fechas), PDF de cada una, exportar a Excel y
  borrado con PIN de supervisor (inicial `2026`; antes de borrar baja un respaldo en Excel). Se guarda en el navegador de cada equipo.
- **Análisis**: Pareto de las 56 OT, refacciones críticas y mapa de calor sobre el modelo.
- **Guía de uso** dentro de la app, con imágenes, y **calidad gráfica** Ultra / Alta / Media / Baja (menú *Más*).

## Estructura

```
app/index.html          página principal
app/css, app/js         interfaz y modelo (b_*.js construyen cada sección del 3D; modes.js = ruta, historial y análisis; pdf.js = reportes)
app/data                taxonomía, OT con sus tareas, fallas y refacciones (generados desde el Excel) e info.js (descripciones)
app/img                 fotos de las ayudas visuales e ilustraciones del manual
OT *.pdf               las dos órdenes de trabajo maestras (mensual y anual): las tareas del túnel
tools/build_data.py     regenera app/data y app/img a partir de las OT (PDF), el Excel y los .docx
tools/empaquetar.js     arma dist/Tunel01_interactivo.html (un solo archivo con todo adentro)
tools/capturas_guia.js  regenera las imágenes de la guía (app/img/guia_*.jpg) con Playwright
ESTADO.md               qué está terminado y qué falta confirmar en planta
```

## Distribución (confirmada con el personal de planta)

- **Entrada** = el extremo de las 4 varillas blancas de Naylamid; **salida** = el otro extremo.
- **Lado A** = el del gabinete eléctrico (foto 6); **lado B** = el opuesto. Zonas: 1 = entrada, 2 = centro, 3 = salida.
- Gabinete en **A1** (un solo poste, ménsula a la tina, desconectador en el costado izquierdo, paro BM13 en la puerta).
- Dossatron abrazada a la tina con la garrafa en el piso en **B2**; flecha motriz con cople negro y chumacera blanca, y
  motorreductor dentro de una **caja de acero inoxidable** gris en **B3**.
- No hay bomba de recirculación aparte (la tarea anual TS01-PREV-MEC-02 se enlaza a las chumaceras). La banda corre dentro de una **tina**
  de acero inoxidable con la campana encima. En planta las guías de desgaste son 4 varillas (la taxonomía dice 5).

## Notas

- Medidas aproximadas (no hay plano acotado del equipo): banda de 330 mm × 2.7 m, sprockets de 12 dientes, chumaceras UCFL205,
  tina de unos 1.64 m, campana de unos 0.8 m y banda a unos 0.93 m del piso.
- Los elementos marcados «No figura en la taxonomía», «Aproximado» y los de número de parte pendiente (solenoide, cople mordaza
  y elemento de buna) se indican en la ficha de cada pieza.
- Detalle de lo que muestra cada foto: `docs/hallazgos-fotos.md`. Para regenerar datos e imágenes: `python3 tools/build_data.py`.
