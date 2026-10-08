# Hallazgos de las fotos de planta (ayudas visuales de las rutinas)

Las fotos están en `app/img/ref_01.jpg` … `ref_11.jpg` (`ref_NN` = `word/media/imageNN.jpeg` de
`REFERENCIA VISUAL MENSUAL (TUNEL DE SANITIZADO 01).docx`; ese número no coincide con el orden visual de la página).
El dibujo de ensamble del Excel es `app/img/x_general.jpg`.
Regla del proyecto: **la planta real manda sobre la taxonomía** (ver `CLAUDE.md`).

## Qué muestra cada foto

| Foto | Qué se ve |
|---|---|
| `ref_06` | Vista general desde un extremo. La banda va **dentro de una tina (charola) de acero inoxidable** y la **campana** (caja inox con asa en U en su cara lateral) está apoyada sobre esa tina. La banda sale de la campana unos 30 cm y termina en una **chumacera de carcasa blanca**; en el borde de la foto asoma la punta redondeada de un **rodillo blanco**. Cortina de tiras transparentes colgada de una varilla con 2 sujetadores; varillas inox dobladas junto a la banda. El **gabinete** (caja inox chica) está enfrente de la tina, cerca de ese extremo, sobre un poste. Mangueras en el piso: azul (agua) y conduit gris. |
| `ref_08` | **Cuatro varillas blancas** (Ø aprox. 4–5 cm) con «cuello» torneado que entra en las **muescas de una placa inox vertical**; salen del final de la banda. Son los rodillos/guías de desgaste del inicio de la banda (el usuario los llama «rodillos blancos que llevan el producto hacia la banda»). |
| `ref_09` | Extremo de la flecha: **chumacera de brida con carcasa blanca (termoplástico)**, 2 tornillos hexagonales y **cople de mordaza negro** en la punta de la flecha; placa inox vertical sujeta la chumacera. Varilla inox doblada con un cilindro blanco en la punta. Abajo: manguera blanca de drenaje, manguera azul, manguera negra gruesa y un tubo inox con una válvula pequeña. |
| `ref_01` | Vista desde arriba en la boca de la campana: dos varillas inox transversales (soportan las cortinas), cortinas apartadas a ambos lados, banda azul, flecha con cople negro en un extremo y chumacera blanca en el otro, guía lateral ranurada de inox. |
| `ref_11` | Cuatro tiras anchas de cortina (unos 10–12 cm cada una) colgadas de una barra con tornillos; varilla inox en J con placa de base; chumacera blanca en la esquina; bloques blancos bajo el borde de la banda (puntas de las guías de desgaste). |
| `ref_05` | Vista baja desde el frente: la tina tiene el fondo inclinado/redondeado y se **atornilla a las patas con placas** (2 tornillos); patas de tubo rectangular inox con niveladores; travesaño plano a media altura; manguera blanca corrugada que sale de la tina y recorre el piso; manguera azul; conduit gris; base de la garrafa blanca bajo el travesaño. |
| `ref_07` | **Dossatron** (domo azul) sujeto con una abrazadera al borde de la tina, tubos de PVC gris, manguera transparente reforzada hacia la **garrafa blanca** en el piso, manguera azul. Detrás se ve una cortina de la campana. |
| `ref_10` | Detalle de la Dossatron: codos y uniones de PVC gris, manguera transparente con alambre («1" 73 PSI WP FDA CLEAR WIRE»), manguera azul, clavija negra del solenoide. |
| `ref_03` | Frente del **gabinete**: piloto bicolor (verde/rojo), botón rojo, cerradura con llave a la derecha; el **paro de emergencia cuelga debajo** del gabinete; el **desconectador rojo/amarillo está en el costado izquierdo**; poste central; manguera azul y cable al piso. |
| `ref_04` | Interior del gabinete: componentes **Eaton** (guardamotor con perilla negra, contactor blanco, interruptor termomagnético), desconectador giratorio a la izquierda, canaleta ranurada arriba y, **en el fondo del gabinete, el solenoide de latón** con bobina y conector DIN, con la manguera azul de agua. |
| `ref_02` | Puerta del gabinete por dentro: 3 bloques de contactos, cerradura de leva; bisagra del lado izquierdo (visto de frente). |

## Diferencias de la versión 1 del modelo frente a las fotos

1. **Estructura**: la v1 es un bastidor de tubo abierto con una charola aparte debajo; en planta es una **tina con la campana encima** y patas de tubo rectangular inox con travesaño a media altura.
2. **Rodillos blancos del inicio de la banda**: faltaban a la vista (solo había guías debajo de la banda).
3. **Chumaceras**: la v1 las hizo de inox con domo; en planta son de **carcasa blanca**, sin tapa, con **cople de mordaza negro** en la punta de la flecha.
4. **Gabinete**: la v1 pone el desconectador a la derecha, dos patas y el solenoide afuera; en planta el desconectador va a la **izquierda**, hay un poste central, el **paro BM13 cuelga abajo** y el **solenoide está dentro**.
5. **Dossatron**: la v1 la puso en un pedestal propio; en planta va **sujeta al borde de la tina** con abrazadera.
6. **Cortinas**: la v1 usa 7 tiras angostas en dos hileras; en planta se ven 4–5 tiras anchas (por confirmar).
7. Faltan: varillas inox en J con cilindro blanco, manguera transparente reforzada, tubo de drenaje con válvula, manguera negra.
8. La **bomba de recirculación** no aparece en ninguna foto; solo la nombra la tarea anual 1302 («cambio de rodamientos»),
   y la ayuda visual anual usa para **todas** sus tareas la foto de la chumacera blanca con el cople (`ref_09`, la flecha
   señala la chumacera). Posible causa: la tarea habla de las chumaceras de la flecha y no de una bomba. **Por confirmar**;
   mientras tanto `tools/build_data.py` mapea 1302 a `ref_10` (Dossatron), que no es la foto de la rutina.
9. Ninguna foto muestra el **motorreductor**; solo existe su dibujo en el manual.
10. **Lado y extremo** de gabinete, motor y Dossatron: pendiente de confirmar con el usuario.

## Preguntas abiertas (esperando respuesta del usuario)

El modelo **no se modifica** hasta que el usuario conteste. Material enviado: `docs/preguntas-1-croquis.jpg` (croquis de
zonas y tabla de respuesta) y `docs/preguntas-2-fotos.jpg` (fotos con los puntos numerados).

Definiciones del croquis: **ENTRADA** = extremo de las varillas blancas (foto 8); **SALIDA** = el otro extremo;
**LADO A** = el del gabinete (foto 6, tomada desde ese lado con la entrada a la izquierda; es la mano derecha de quien
camina en el sentido de la banda); **LADO B** = el opuesto. Zonas `A1…A3` y `B1…B3` (1 = entrada, 2 = centro, 3 = salida).

Dónde está cada cosa en la v1 (publicada): gabinete A3 · Dossatron + garrafa A1 · motor + cople B3 · manguera de
drenaje A2→A3 · bomba de recirculación en el centro, dentro de la tina.

1. Zona de a) gabinete, b) Dossatron + garrafa, c) flecha motriz con cople y chumacera, d) motorreductor,
   e) mangueras de drenaje, f) «bomba de recirculación» (¿bomba aparte, Dossatron o chumaceras de la flecha?).
2. Varillas blancas: ¿4 o 5?, ¿solo en la entrada?, ¿cuánto asoman?, ¿son las varillas de desgaste de Naylamid?
3. «Ruedas laterales» (tarea 1101): ¿son los cilindros blancos de las varillas inox en J (punto 14 de la foto 9)?
4. ¿Hay foto del motorreductor? Si no, se dibuja junto al cople según el manual.
5. Medidas estimadas (tina ≈ 1.7 m, campana ≈ 0.75 m, ancho ≈ 0.55 m, banda a ≈ 0.9 m del piso): ¿se dejan o hay reales?
6. Fotos extra opcionales: salida completa, lado B, interior de la campana con la boquilla, motorreductor.

### Respuestas del usuario · parte 1 (croquis)

- **a) Gabinete eléctrico: A1** (lado A, tercio de la entrada).
- **b) Dossatron + garrafa: B2** (lado B, centro).
- **c) Flecha motriz con cople y chumacera: B3** (lado B, salida), como en la v1, pero **más corta** (la v1 la saca demasiado)
  y **con una caja o gabinete de acero inox gris metálico, del mismo color que el túnel, que cubra motor, flecha, cople, etc.**
- **d) Motorreductor: B3**, dentro de la misma caja.
- **e) Mangueras de drenaje:** no sabe; cree que la manguera «extra» conectada a la bomba es la del drenaje.
- **f) «Bomba de recirculación»:** **no va debajo del túnel** y cree que **ese elemento no existe**. Circuito real según el
  usuario: garrafa blanca → manguera → bomba (Dossatron) → conectada al túnel → boquilla de aspersión; además la bomba tiene
  otra manguera conectada que no sabe qué es (cree que es el drenaje).
- No objetó las definiciones del croquis: entrada = extremo de las varillas blancas; lado A = el del gabinete (foto 6).
- **Pendiente** (dijo que contestará después): varillas blancas (¿4 o 5?, ¿solo entrada?, ¿cuánto asoman?), «ruedas
  laterales» de la tarea 1101, foto del motorreductor, medidas, fotos extra.

Interpretación para la v2 (se confirma al entregar): quitar la bomba de recirculación del modelo y ligar la tarea anual
1302 a las chumaceras de la flecha (foto 9) con una nota; la manguera blanca corrugada de drenaje sale del fondo de la tina
y pasa junto a la Dossatron hacia el piso (fotos 5 y 7); caja inox gris en B3 que cubre motor, reductor, cople y el tramo
de flecha.
