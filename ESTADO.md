# Estado del proyecto · Túnel de Sanitizado 01 interactivo

Última actualización: se adoptó la base de las otras máquinas (Extrusor 01 y Cheese Former): crédito del autor, historial con PDF y Excel, guía de uso, calidad gráfica y versión de un solo archivo. Se quitó Práctica.

## Qué está terminado

- **Modelo 3D v2** hecho con las fotos de planta (Three.js procedural, sin imágenes): 74 elementos (66 de la taxonomía + 8 que salen en las fotos: campana, cortinas, tina, mangueras de drenaje, garrafa, mangueras azules y conduit, caja inox del motorreductor). Distribución confirmada por el usuario: entrada con 4 varillas blancas, gabinete en A1, Dossatron y garrafa en B2, flecha con cople negro y motorreductor en caja inox en B3 (ver `CLAUDE.md` y `docs/hallazgos-fotos.md`).
- **Explorar**: ficha por elemento con tareas, refacciones, fallas, foto y plano; vistas en lista desplegable; rayos X, aislar, explosión general, corte de la campana y **despiece** (en sitio, por separado y por elemento); mapa de calor; recorrido por las secciones.
- **Tareas = las dos OT maestras (PDF)**: OT mensual `OP-TS01-INSP-GRAL-EO-1M` (equipo operando, 15 tareas) y OT anual `OP-TS01-PREV-MEC/ELEC-EP-1A` (equipo parado, 7 tareas), con su «Tarea No.» (TS01-INSP-MEC-01…), texto y minutos tal como vienen en la OT. `tools/build_data.py` las lee de los PDF (necesita `pdftotext`) y les une el paro, nivel y herramientas del Excel y la foto de la ayuda visual por el texto de la actividad (en las 22 tareas coincide al 100 %).
- **Ruta guiada**: recorre las tareas de la OT que elijas con las claves oficiales B, BP, BCF, X y N/A, lecturas del motor (máx. 42 °C, 1.5 A, 220 V ±10 %), foto de referencia y seguridad. Al terminar **se descarga sola el PDF** (generador propio `app/js/pdf.js`, sin internet; trae el Orden No., la Tarea No. de cada una y las firmas) y la OT queda en el historial.
- **Historial** (modo aparte): sin límite, con filtros (técnico, OT, fechas), Ver, PDF de cada OT y **Exportar a Excel** (CSV con BOM, un renglón por tarea).
- **Borrar del historial** (una OT, todas o las filtradas) con **PIN de supervisor** (inicial `2026`, se cambia en la app y se guarda por equipo) y **respaldo automático en Excel antes de borrar**. Es un candado contra errores, no seguridad fuerte: quien sepa borrar los datos del navegador también borra el historial.
- **Análisis**: Pareto de las 56 OT, OT por sección, refacciones críticas y mapa de calor.
- **Guía de uso** dentro de la app (`app/data/guia.js`, imágenes `app/img/guia_*.jpg`, se regeneran con `node tools/capturas_guia.js`).
- **Calidad gráfica** Ultra / Alta / Media / Baja (menú *Más › Calidad gráfica*): se recuerda la elección (`ts01_calidad`); sin elegir, Alta en computadora y Media en celular; si el equipo va lento, baja sola a Media.
- **Encabezado en dos renglones** con el crédito del autor; modos ① Explorar ② Ruta guiada ③ Historial ④ Análisis ? Guía.
- **Un solo archivo**: `node tools/empaquetar.js` → `dist/Tunel01_interactivo.html` (código, datos y fotos adentro; se abre con doble clic y sin internet).
- El historial vive en el navegador de cada equipo (localStorage con prefijo `ts01_`); a futuro, un registro central (Proteus o servidor de TI). Las OT guardadas por versiones anteriores (sin fecha completa o con los pasos 1101… de la rutina) se convierten solas al abrir.

## Decisiones que conviene saber

- Las **claves** de cada tarea son las de la rutina oficial del túnel (B, BP, BCF, X, N/A), no Conforme / Anomalía / Omitido de otras máquinas: en el PDF y en el Excel salen tal cual, con su significado. Con BP, BCF o X la observación es obligatoria. Una lectura fuera de rango no deja marcar B.
- Las guías de desgaste de la banda son **4 varillas blancas** (la taxonomía dice 5): la cantidad de planta manda y la ficha lo avisa. Son los «rodillos y ruedas laterales» de la tarea 1101.
- **No hay bomba de recirculación** aparte en planta: la tarea anual TS01-PREV-MEC-02 (cambio de rodamientos de la «bomba de recirculación») se enlaza a las chumaceras de la flecha, con una nota en la ficha. La mayoría de las tareas anuales usan la misma foto de la chumacera.
- Las OT y tareas del Excel se muestran completas; lo que no coincide con planta se resuelve en el modelo y en las notas de `app/data/info.js`, nunca modificando el Excel.
- Fuentes: el `index.html` pide Barlow Condensed e Inter a Google Fonts; sin internet se usa Arial Narrow o la letra del sistema (todo funciona igual).

- **Diferencias entre la OT y el Excel** (manda la OT): cuatro tareas tienen otro «Tarea No.» en la hoja TAREAS del Excel (OT `TS01-INSP-GRAL-01` = Excel `TS01-GRAL-INSP-01`; `TS01-PRED-ELEC-01` = `TS01-PRED-MEC-01`; `TS01-PREV-ELEC-02` = `TS01-LIMP-ELEC-01`; `TS01-PREV-MEC-07` = `TS01-LIMP-MEC-01`; se guarda como `per_excel`) y `TS01-PREV-MEC-01` dura 2 en la OT y 4 en el Excel (se usa 2). Sistema y clase de cada tarea salen de su Tarea No.
- **Hrs Estim. de la OT**: la OT las rotula «Hrs Estim.» pero los números son iguales a los minutos del Excel (30 para limpiar el tablero, 300 para cambiar rodamientos); en la app se muestran como **minutos**. Por confirmar con mantenimiento.
- El orden de las tareas en la ruta es el de la OT (el que imprime el sistema). Las fotos de las ayudas visuales se unen a cada tarea por su texto.
- La tarea `TS01-PREV-MEC-02` habla de una «bomba de recirculación de agua» que en planta no existe aparte (ver arriba): se mantiene el texto de la OT y la nota «por confirmar».

## Por confirmar en planta (aparecen como «Aproximado» en la ficha)

28 de los 74 elementos no salen en ninguna foto y se dibujaron por su descripción:
- Boquilla Sprea; motor WEG y reductor (dentro de la caja inox: no se ve el aparato real).
- Tornillería y rondanas del botón BM13 y de la transmisión; cuñas, flecha del motor, rodillos y soportes de rodillo; cople mordaza ML099 (en las fotos se ve el cople negro, no su modelo exacto); anillos de eje; solenoide.
- Gabinete: clemas relevador Finder (220 V y 24 VDC), relevador de 14 pines y variador de frecuencia.
- Caja inox del motorreductor (lado B): tamaño y puertas.
- Medidas generales: banda de 330 mm × 2.7 m, sprockets de 12 dientes, tina de unos 1.64 m, campana de unos 0.8 m, banda a unos 0.93 m del piso.
- Sin número de parte en la taxonomía: solenoide, cople mordaza y elemento de buna.
- Si se consiguen fotos del motorreductor, del interior de la caja inox y del variador, se ajustan esos elementos.

## Base para otras máquinas

- `CLAUDE.md` tiene las reglas del proyecto (las mismas de las otras máquinas más la regla de modelar según las fotos) y `.claude/skills/nueva-maquina/SKILL.md` la receta paso a paso (`/nueva-maquina`).
- `tools/build_data.py` genera `app/data` y `app/img` desde el Excel y los .docx de rutinas; las descripciones a mano están en `app/data/info.js`.

## Cómo probarlo

1. Abre `dist/Tunel01_interactivo.html` (o `app/index.html`) con doble clic en Chrome o Edge.
2. En **② Ruta guiada** haz una rutina completa: al final se descarga el PDF.
3. En **③ Historial** revisa que aparezca; prueba Ver, PDF, Exportar a Excel y borrar con el PIN `2026`.
