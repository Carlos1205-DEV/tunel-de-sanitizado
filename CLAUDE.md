# Instrucciones del proyecto · Máquinas interactivas Qualtia (aplicaciones 3D de equipos de planta)

Este repositorio es la app 3D interactiva del **Túnel de Sanitizado 01 · OP TS01** (área Empaque, línea Cortes, Planta 2 Querétaro) y sigue la **misma base** que las otras máquinas de Qualtia (Extrusor 01, Cheese Former): mismo encabezado, mismos modos, mismo historial con PDF, misma guía y mismo archivo único. Solo cambian el modelo 3D y los datos.

- Para hacer **otra máquina** sigue la receta `.claude/skills/nueva-maquina/SKILL.md` (comando `/nueva-maquina`).
- `ESTADO.md` dice qué está terminado y qué falta en esta máquina. Léelo al empezar.

## Con quién trabajas

- **Jose Carlos Trejo Espinosa** (practicante de mantenimiento en Qualtia). Escríbele **en español de México, sencillo y sin tecnicismos**: no es programador. Explica los pasos con números y dile qué botón tocar. Si algo no se puede (descargas en el enlace publicado, por ejemplo), dilo claro y da la alternativa.
- Antes de cambios grandes, explica lo que vas a hacer. Cuando pregunta "¿cómo le hacemos?" o dice "te pregunto, no lo hagas", **solo responde**: no cambies nada.
- Los usuarios finales son técnicos y operadores de planta, poco familiarizados con la tecnología. Todo texto de la app va en español y se entiende sin capacitación.

## Regla principal del modelado (la pidió el usuario; vale SIEMPRE que se pida una aplicación interactiva o un modelo 3D de una máquina)

1. **El modelado se basa 100 % en la realidad de la planta**: las fotos de las rutinas y de las ayudas visuales
   («REFERENCIA VISUAL … .docx») y cualquier foto que dé el usuario. Las fotos deciden la forma, el tamaño, los colores,
   los materiales, qué piezas hay, cuántas y **en qué lado / extremo está cada sistema**.
2. **La taxonomía (Excel) NO manda sobre la geometría**: en planta el equipo está armado un poco distinto. La taxonomía se
   usa para nombres de elementos, sistemas y secciones, números de parte, cantidades, refacciones, tareas y fallas, y como
   orientación aproximada de dónde están los sistemas (su dibujo de ensamble no es la verdad de la planta).
3. Si una foto y la taxonomía se contradicen, **gana la foto**. Lo que no salga en ninguna foto se modela como
   «aproximado», se marca así en la ficha de la pieza y se le pregunta al usuario.
4. **Antes de modelar o de cambiar el modelo**: revisar TODAS las fotos una por una (los .docx de referencia visual se
   renderizan con `soffice --headless --convert-to pdf` y `pdftoppm -png` para ver las flechas y los textos), anotar qué se
   ve en cada una y qué difiere del modelo, y **preguntar las dudas (sobre todo lado y extremo de cada sistema) ANTES de
   proceder**. Si el usuario dice «avísame y pregúntame», el modelo no se toca hasta que conteste.
5. Sin piezas pixeladas: geometría real (Three.js procedural), con el mismo nivel de detalle que la dosificadora y el extrusor.
   Los colores se definen en sRGB y se convierten a lineal (`convertSRGBToLinear`) o se ven lavados.

## Reglas de la base que no se rompen

1. **Crédito del autor** en: el encabezado (`Desarrollado por Jose Carlos Trejo Espinosa · 2026`), la pantalla de carga, el pie de cada PDF, `<meta name="author">` y el comentario `/* © 2026 Jose Carlos Trejo Espinosa. Todos los derechos reservados. */` al inicio de cada archivo de código (también lo escribe `tools/build_data.py` en `taxonomia.js` y `datos.js`). **Nunca** agregues "apagados remotos", bloqueos ocultos ni caducidades: él protege su trabajo con el repositorio privado.
2. **Funciona sin internet y con doble clic** (`file://`): nada de servidores, frameworks ni CDNs. three.js va en `app/lib/`. Todo se dibuja con código; las únicas imágenes son las fotos y planos de `app/img/`. (Las fuentes de Google del `index.html` son opcionales: sin internet se usa una letra de sistema.)
3. **Las TAREAS del túnel son las de las dos OT maestras (PDF)**: `OT TUNEL DE SANITIZADO 01 MENSUAL EQUIPO OPERANDO.pdf` (OP-TS01-INSP-GRAL-EO-1M, 15 tareas) y `OT TUNEL DE SANITIZADO 01 ANUAL EQUIPO PARADO.pdf` (OP-TS01-PREV-MEC/ELEC-EP-1A, 7 tareas). Su «Tarea No.» (TS01-INSP-MEC-01…), su texto y sus horas mandan sobre la numeración del Excel; las rutinas (.docx) solo aportan la foto de la ayuda visual y el Excel el paro, el nivel y las herramientas. **En la app se habla de «tarea» y «OT»; nunca se muestran como tareas los pasos 1101… de la rutina** (están en `item.rutina` solo para ligar la foto). Los demás datos salen del Excel oficial (`app/data/taxonomia.js` y `datos.js` los genera `tools/build_data.py`). No inventes tareas, refacciones ni fallas. Si algo de planta contradice el Excel (ej. 4 varillas blancas y no 5, la bomba de recirculación que no existe), se **respeta la foto**, se anota en `info.js` (`aprox`, `q_tax`, `nota`) y en `ESTADO.md`; el Excel no se modifica.
4. **Medidas y lugares que no se conocen se preguntan** o se marcan como «por confirmar» en `ESTADO.md` y como «Aproximado» en la ficha. No las presentes como hechos.
5. **Modos de la app** (ya decididos, no cambiarlos sin que él lo pida): ① Explorar · ② Ruta guiada · ③ Historial · ④ Análisis · ? Guía. El modo *Práctica* se quitó a petición de su asesor; no lo vuelvas a poner.
6. **Encabezado en dos renglones**: arriba `TÚNEL DE SANITIZADO 01 · Planta 2 Querétaro`, abajo `Empaque · Línea Cortes · Modelo 3D · Desarrollado por…`. La barra de modos no debe partirse en dos renglones a 1024 px.
7. **Ruta guiada → PDF + historial**: al terminar una OT (todas sus tareas) se descarga sola su PDF (`app/js/pdf.js`, generador propio) y queda en el historial (localStorage). Las claves de cada tarea son las oficiales de la rutina (B, BP, BCF, X, N/A). El Historial tiene filtros (técnico, OT, fechas), Ver, PDF, Exportar a Excel (CSV con BOM) y borrar con **PIN de supervisor** (inicial `2026`) que **siempre baja un respaldo en Excel antes de borrar**.
8. **Claves de localStorage con prefijo por máquina**: aquí `ts01_hist`, `ts01_pin`, `ts01_tecnico`, `ts01_calidad`. En Chrome todos los archivos abiertos con doble clic comparten almacenamiento, así que otra máquina **debe** usar otro prefijo o se mezclan los historiales.
9. **Git**: trabaja en la rama que indique la sesión (`claude/ecstatic-hawking-ya9eqm`); commits en español y descriptivos; no abras PR si no lo pide.

## Este repositorio (distribución confirmada por el usuario, v2)

- X = banda (entrada con las 4 varillas blancas en −X), +Z = LADO A (el del gabinete, foto 6), −Z = LADO B. Gabinete en A1; Dossatron + garrafa
  en B2; flecha motriz con cople negro, motorreductor y caja inox gris en B3; no hay bomba de recirculación; guías de desgaste = 4 varillas
  blancas (son los «rodillos y ruedas laterales» de la tarea TS01-INSP-MEC-01). Medidas aproximadas. Lo no fotografiado lleva `aprox: 1` en
  `app/data/info.js` (insignia «Aproximado»).
- `docs/hallazgos-fotos.md`: lo que se ve en cada foto de planta, en qué difería la primera versión, las preguntas y las respuestas del usuario.
- Publicada como Artifact: https://claude.ai/artifact/7Vjq6QNtnZawTEM6vwZara.

## Cómo está armada la app

| Archivo | Qué hace | ¿Cambia por máquina? |
|---|---|---|
| `app/index.html` | Estructura: encabezado, modos, barra de herramientas, paneles | Solo nombres y textos |
| `app/css/style.css` | Estilos (tema oscuro industrial, ámbar Qualtia) | No |
| `app/js/core.js` | Núcleo geométrico: materiales PBR, `createKit` (rbox, cyl, lathe, extrude, tubos, tornillos…), niveles de malla | No |
| `app/js/b_*.js` + `model.js` | **Modelo 3D procedural** por secciones (`b_base`, `b_transmision`, `b_cubierta`, `b_mec`, `b_gabinete`) y su ensamble | **Sí, se rehace completo** |
| `app/js/despiece.js` | Motor de despiece (vista explosionada de sección y de elemento) | No |
| `app/js/app.js` | Interfaz: selección, vistas, panel Explorar, barra de herramientas, calidad, recorrido | Poco: textos y vistas |
| `app/js/modes.js` | Ruta guiada (tareas de las OT), Historial de OT (filtros, PDF, Excel, PIN) y Análisis | Poco: claves, lecturas y nombre del equipo |
| `app/js/pdf.js` | Generador de PDF (Helvetica, tamaño carta) | No |
| `app/js/guia.js` + `app/data/guia.js` | Guía de uso dentro de la app (10 secciones con imágenes) | Textos e imágenes |
| `app/data/taxonomia.js`, `datos.js` | Taxonomía, OT con sus tareas, refacciones y fallas (los genera `tools/build_data.py`) | Se regeneran |
| `app/data/info.js` | Descripción de cada elemento, fotos, banderas `aprox` / `xray` | Sí (a mano) |
| `app/img/` | Fotos de planta `ref_*`, planos `x_*` y capturas `guia_*` | Sí |
| `tools/build_data.py` | OT (PDF, con `pdftotext`) + Excel + .docx → `app/data` y `app/img` | Ajustes por máquina |
| `tools/empaquetar.js` | Hace la versión de un solo archivo `dist/Tunel01_interactivo.html` (incluye fotos) | Solo el nombre |
| `tools/capturas_guia.js` | Regenera las imágenes `app/img/guia_*.jpg` con Playwright | Ids de elementos y cámaras |

El modelo se arma con `window.createTunelModel({ detail })`; cada elemento seleccionable cuelga de una sección con `K.el(sección, número)` y se enlaza con la taxonomía por la clave `sección:número`.

## Cómo probar (obligatorio antes de entregar)

- Playwright de Node (`/opt/node22/lib/node_modules/playwright`) con Chromium y `--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist --allow-file-access-from-files`, abrir `file:///…/app/index.html` y esperar `window.__ts && #loading.done`. Con ese modo los fotogramas son lentos: la animación del despiece se avanza con `__ts.despiece.update(0.05)` en un ciclo.
- Revisa: que no haya `pageerror`; que todos los elementos se seleccionen y sus pestañas abran; una OT completa (sale el PDF) y que aparezca en Historial; exportar a Excel; borrar con PIN; encabezado a 1024, 1280 y 390 px (celular); calidad Baja y Ultra.
- PDFs: revísalos convirtiéndolos a imagen (`pymupdf`).
- Mira las capturas tú mismo antes de decir que algo quedó.

## Cómo entregar

1. `node tools/empaquetar.js` → `dist/Tunel01_interactivo.html` (un solo archivo, sin internet). Pruébalo en una carpeta vacía.
2. Commit y push a la rama de la sesión.
3. Si hay enlace publicado (Artifact), se actualiza **en la misma URL**: el `index.html` se sube sin `<html>`, `<head>` ni `<body>` (el visor los agrega) y el resto con `files` y `root=app/`. En ese visor no se pueden descargar archivos (la app lo detecta con `window.claude` y copia al portapapeles).
4. Mándale el archivo de `dist/` y explícale en pocas líneas qué cambió y qué probaste.
