# Túnel de Sanitizado 01 (OP TS01) · modelo 3D interactivo

Aplicación web de un solo paquete (HTML + JS, sin servidor) con el modelo 3D del túnel de sanitizado, construida con
la taxonomía del Excel y las rutinas de mantenimiento. Se abre con `app/index.html`.

## Qué incluye

- **Modelo 3D procedural** (Three.js) con los **74 elementos**: los 66 de la taxonomía del Excel (boquilla Sprea, motorreductor
  WEG con reductor y solenoide, bomba Dossatron, botonera BM13, transmisión de 35 elementos y gabinete de 15) más 8 piezas
  que no están en la taxonomía pero aparecen en las rutinas y fotos (campana, cortinas, tina de acero inoxidable, mangueras
  de drenaje, garrafa, mangueras azules y conduit, y la caja inox del motorreductor). **La forma y el lugar de cada pieza salen
  de las fotos de planta de las rutinas** y de lo que indicó el personal de planta; la taxonomía solo aporta nombres, partes y
  refacciones. Lo que no sale en ninguna foto se marca como «Aproximado».
- **Vista desplegable**: un solo botón «Vista» con la lista de vistas (generales y de detalle) en lugar de botones sueltos.
- **Explorar**: ficha por pieza con tareas, refacciones, fallas, foto y plano del manual; rayos X, aislar, corte, explosión
  general y **despiece** (en sitio, por separado en tablero y por elemento).
- **Ruta guiada**: rutinas mensual (15 puntos) y anual (7 puntos) con las claves B, BP, BCF, X y N/A, lecturas del motor
  (máx. 42 °C, 1.5 A, 220 V), foto de referencia y reporte.
- **Práctica**: ubicar piezas en el 3D y preguntas generadas con las rutinas y el Excel.
- **Análisis**: Pareto de las 56 OT, refacciones críticas y mapa de calor sobre el modelo.

## Estructura

```
app/index.html          página principal
app/css, app/js         interfaz y modelo (b_*.js construyen cada sección del 3D)
app/data                taxonomía, rutinas, fallas y refacciones (generados desde el Excel) e info.js (descripciones)
app/img                 fotos de la rutina mensual e ilustraciones del manual
tools/build_data.py     regenera app/data y app/img a partir del Excel y los .docx
```

## Distribución (confirmada con el personal de planta)

- **Entrada** = el extremo de las 4 varillas blancas de Naylamid; **salida** = el otro extremo.
- **Lado A** = el del gabinete eléctrico (foto 6); **lado B** = el opuesto. Zonas: 1 = entrada, 2 = centro, 3 = salida.
- Gabinete en **A1** (un solo poste, ménsula a la tina, desconectador en el costado izquierdo, paro BM13 en la puerta).
- Dossatron abrazada a la tina con la garrafa en el piso en **B2**; flecha motriz con cople negro y chumacera blanca, y
  motorreductor dentro de una **caja de acero inoxidable** gris en **B3**.
- No hay bomba de recirculación aparte (la tarea anual 1302 se enlaza a las chumaceras). La banda corre dentro de una **tina**
  de acero inoxidable con la campana encima. En planta las guías de desgaste son 4 varillas (la taxonomía dice 5).

## Notas

- Medidas aproximadas (no hay plano acotado del equipo): banda de 330 mm × 2.7 m, sprockets de 12 dientes, chumaceras UCFL205,
  tina de unos 1.64 m, campana de unos 0.8 m y banda a unos 0.93 m del piso.
- Los elementos marcados «No figura en la taxonomía», «Aproximado» y los de número de parte pendiente (solenoide, cople mordaza
  y elemento de buna) se indican en la ficha de cada pieza.
- Detalle de lo que muestra cada foto: `docs/hallazgos-fotos.md`. Para regenerar datos e imágenes: `python3 tools/build_data.py`.
