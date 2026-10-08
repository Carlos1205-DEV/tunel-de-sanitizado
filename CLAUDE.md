# Instrucciones del proyecto · aplicaciones interactivas 3D de equipos de planta

## Regla principal (la pidió el usuario; vale SIEMPRE que se pida una aplicación interactiva o un modelo 3D de una máquina)

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

## Este repositorio (Túnel de Sanitizado 01 · OP TS01 · área Empaque · línea Cortes)

- `app/`: la aplicación (`index.html`, `js/`, `css/`, `data/`, `img/`, `lib/`). `js/b_*.js` construyen el 3D por secciones;
  `js/app.js` es la interfaz; `js/modes.js` trae Ruta guiada, Práctica y Análisis.
- `tools/build_data.py`: regenera `app/data` y `app/img` a partir del Excel y los .docx.
- `docs/hallazgos-fotos.md`: lo que se ve en cada foto de planta y en qué difiere la primera versión del modelo.
- Publicada como Artifact: https://claude.ai/artifact/7Vjq6QNtnZawTEM6vwZara. Para actualizarla se publica con `url`; el
  `index.html` se sube sin `<html>`, `<head>` ni `<body>` (el visor los agrega) y el resto con `files` y `root=app/`.
- Pruebas visuales: Playwright de Node (`/opt/node22/lib/node_modules/playwright`) con Chromium y
  `--use-angle=swiftshader --enable-unsafe-swiftshader`; en ese modo los fotogramas son lentos, así que la animación del
  despiece se avanza llamando `__ts.despiece.update(0.05)` en un ciclo.
- Rama de trabajo: `claude/ecstatic-hawking-ya9eqm`. No abrir PR si el usuario no lo pide.
