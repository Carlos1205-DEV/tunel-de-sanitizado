---
name: nueva-maquina
description: Receta paso a paso para hacer la app 3D interactiva de otra máquina de Qualtia a partir de esta base (mismo Excel de mantenimiento, mismas OT, misma app y mismo historial con PDF). Úsala cuando Jose Carlos pida hacer, empezar o continuar otra máquina.
---

# Nueva máquina a partir de la base del Túnel de Sanitizado 01

Lee primero `CLAUDE.md` (reglas, arquitectura, cómo probar y entregar) y `ESTADO.md`. Esta receta dice **en qué orden** se hace una máquina nueva. Avísale a Jose Carlos en qué paso vas, en español sencillo y con pasos numerados.

> Las otras máquinas (Extrusor 01, Cheese Former) comparten la misma base de interfaz (encabezado, modos, historial, PDF, guía, archivo único) pero tienen otro motor de modelo 3D. Si la máquina nueva se parece más a una de ellas, pregúntale de cuál quiere partir.

## 0. Pedir el material (no empieces el modelo sin esto)

Pídele, con una lista numerada:
1. **El Excel de mantenimiento** de la máquina (hojas de taxonomía, tareas, refacciones y fallas repetitivas).
2. **Las OT maestras en PDF** (una por frecuencia: «Orden No.», «Tarea No.», texto y horas): **esas son las tareas de la máquina**. Y las **rutinas** (.docx) con sus **ayudas visuales** («REFERENCIA VISUAL … .docx»): de ahí salen las claves, las fotos y la verdad de la planta.
3. **Fotos de la máquina**: frente, los dos costados, atrás, arriba, el tablero por dentro, la pantalla y de cerca cada parte importante (motor, transmisión, válvulas, sensores).
4. **Medidas aproximadas**: alto, ancho y largo totales y de las partes grandes. Con cinta o contando baldosas basta.
5. **Nombre que debe salir**: nombre de la máquina, subtítulo (área y línea) y número (ej. «REBANADORA 02»).
6. Cómo trabaja: qué entra, qué sale, qué se mueve y qué adaptaciones tiene en planta respecto al Excel.

Si falta algo, sigue con lo que sí se puede y anota lo pendiente en `ESTADO.md`.

## 1. Revisar las fotos y preguntar (regla principal de `CLAUDE.md`)

1. Revisa **todas** las fotos una por una (los .docx se convierten con `soffice --headless --convert-to pdf` y `pdftoppm -png`).
2. Escribe en `docs/hallazgos-fotos.md` qué se ve en cada una y en qué difiere de la taxonomía.
3. **Pregúntale las dudas** (sobre todo lado y extremo de cada sistema) con un croquis o una hoja numerada **antes** de modelar. Si dice «avísame y pregúntame», no toques el modelo hasta que conteste.

## 2. Repositorio nuevo

- Lo ideal: un repositorio por máquina, creado desde este con **«Use this template»** en GitHub (en la base: *Settings → General → Template repository*). Si él no lo ha creado, explícale los pasos; no lo crees tú sin que lo pida.
- En el repo nuevo: borra lo exclusivo del túnel (Excel, .docx, `app/img/*` salvo lo que se reutilice, `dist/*`, `docs/*`) y pon los archivos nuevos.

## 3. Datos del Excel

1. Adapta `tools/build_data.py` (OT en PDF, hojas, nombre de la máquina, sistemas, `FOTO`, `PUNTOS`, `NOTAS`) y córrelo: `python3 tools/build_data.py`. Lee los avisos (tareas, refacciones u OT sin elemento).
2. Enlaza cada tarea con sus elementos (`PUNTOS`) y cada foto de la rutina con su tarea (`FOTO`). Enséñale la tabla para que la revise: él conoce la máquina.
3. Si en planta algo contradice el Excel, **gana la foto**: se refleja en el modelo, en `app/data/info.js` (`aprox`, `q_tax`, `nota`) y en `ESTADO.md`; el Excel no se modifica.

## 4. Modelo 3D (`app/js/b_*.js` + `model.js`)

- Reescribe las secciones con `createKit` (`core.js`): `rbox`, `cyl`, `lathe`, `extrude`, `pipe`, `hose`, `bolts`… Cada elemento de la taxonomía cuelga de `K.el(sección, número)`.
- Medidas principales en `b_base.js` (`K.L`), en metros, sacadas de las fotos. Proporciones reales antes que detalle; sin piezas pixeladas; colores en sRGB convertidos a lineal.
- Lo que tapa a otras piezas (carcasas, cubiertas) va como `shell: true` para rayos X y corte; las puertas, con `K.doorFollowers` para que lo que cuelga de ellas se mueva con la puerta.
- Compara con las fotos usando capturas desde varias vistas; enséñale las capturas y corrige lo que él diga antes de seguir.

## 5. Textos, vistas y datos a mano

- `app/data/info.js`: descripción de cada elemento (en lenguaje de planta), `foto`, `plano`, `aprox: 1` si no sale en ninguna foto y `xray: 1` si queda tapado.
- `app/js/app.js`: textos con el nombre de la máquina, `VIEWS` (cámaras), recorrido por secciones y el **prefijo de localStorage** (`ts01_` → ej. `reb02_`; también en `modes.js`: `ts01_hist`, `ts01_pin`, `ts01_tecnico`, `ts01_calidad`).
- `app/js/modes.js`: claves de la rutina (`CLAVES`), lecturas (`needsReading`, `evalReading`) y nombre del equipo en el PDF (`EQUIPO`, `LUGAR`).
- `app/index.html`: título, encabezado en dos renglones y nombre en la pantalla de carga. `tools/empaquetar.js`: nombre del archivo de `dist/`.

## 6. Guía

- Ajusta `app/data/guia.js` (mismas 10 secciones; cambia lo propio de la máquina).
- Regenera las capturas con `node tools/capturas_guia.js` (cambia los ids de elementos y las cámaras) y **mira cada imagen**.

## 7. Probar y entregar

Sigue «Cómo probar» y «Cómo entregar» de `CLAUDE.md`. Actualiza `README.md` y `ESTADO.md` (qué está hecho, qué se decidió y qué falta confirmar en planta). Explícale el resultado en pocas líneas, sin tecnicismos, y pregúntale qué ajustar.
