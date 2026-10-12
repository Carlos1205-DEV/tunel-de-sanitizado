/* © 2026 Jose Carlos Trejo Espinosa. Todos los derechos reservados. */
/* Guía de uso que se muestra dentro de la aplicación (modo "? Guía").
 * {img:nombre|texto} inserta la foto img/nombre.jpg (en la versión de un solo archivo viene incluida). */
window.GUIA = [
  {
    t: 'Qué es y cómo abrirla',
    html: `<p>Es una copia en 3D del <b>Túnel de Sanitizado 01 (OP TS01)</b> de Empaque, línea Cortes, que se puede girar, abrir y tocar elemento por elemento para aprender qué es, qué se le revisa, qué refacciones lleva y qué fallas ha tenido. Los datos salen del Excel oficial de mantenimiento y de las dos órdenes de trabajo (OT) maestras del túnel, la mensual y la anual, que son sus tareas; el dibujo se hizo con las fotos de planta.</p>
<ol><li>Abre el archivo o el enlace de la aplicación (en Chrome o Edge).</li>
<li>Espera unos segundos mientras dice <i>Construyendo modelo 3D…</i>; en celular puede tardar un poco más.</li>
<li>Cuando la máquina gira sola, ya puedes usarla.</li></ol>
<p>Funciona en computadora, tableta y celular; en celular conviene ponerlo de lado. <b>No se descompone nada:</b> todo es simulación. Si te pierdes, recarga la página.</p>`
  },
  {
    t: 'Mapa de la pantalla',
    html: `<p>La pantalla tiene cinco zonas; los números rojos de la imagen corresponden a la tabla.</p>
{img:guia_mapa|Pantalla principal con las cinco zonas numeradas}
<table><tr><th>#</th><th>Zona</th><th>Para qué sirve</th></tr>
<tr><td>1</td><td>Modos (arriba a la derecha)</td><td>Explorar, Ruta guiada, Historial, Análisis y esta Guía</td></tr>
<tr><td>2</td><td>Lista de secciones (izquierda)</td><td>Buscar un elemento por nombre o abrir una de las secciones del túnel</td></tr>
<tr><td>3</td><td>Modelo 3D (centro)</td><td>La máquina: se gira, se acerca y se toca</td></tr>
<tr><td>4</td><td>Barra de herramientas (abajo)</td><td>Vistas, operación, rayos X, despiece, explosión y más opciones</td></tr>
<tr><td>5</td><td>Panel de información (derecha)</td><td>Explica lo que seleccionaste o el modo en que estás</td></tr></table>
<p>El panel de la derecha se esconde y vuelve a salir con la flechita <b>◂</b> de su esquina.</p>
<p><b>En celular</b> el panel queda abajo, la barra de herramientas encima de él y la lista de secciones se abre con <b>☰</b>. Los botones se deslizan de lado con el dedo.</p>
{img:guia_celular|Así se ve en un celular}`
  },
  {
    t: 'Moverse alrededor de la máquina',
    html: `<table><tr><th>Quiero…</th><th>Con mouse</th><th>Con el dedo</th></tr>
<tr><td>Girar</td><td>Botón izquierdo apretado y mover</td><td>Arrastrar un dedo</td></tr>
<tr><td>Acercar o alejar</td><td>Rueda del mouse</td><td>Pellizco con dos dedos</td></tr>
<tr><td>Mover de lado</td><td>Botón derecho apretado y mover</td><td>Arrastrar con dos dedos</td></tr>
<tr><td>Elegir un elemento</td><td>Un clic</td><td>Un toque</td></tr></table>
<p>En la barra de abajo, el botón <b>Vista</b> abre una lista de vistas fijas: <i>Isométrica</i> (la de inicio), <i>Lado A · gabinete</i>, <i>Lado B · bomba y motor</i>, <i>Entrada</i>, <i>Salida</i> y <i>Superior</i>; y de detalle: la caja del motorreductor, la banda, las varillas blancas, el interior de la campana, el gabinete, el Dossatron con su garrafa y la zona bajo la banda.</p>
<p><b>Si te pierdes</b>, abre <b>Vista</b> y elige <b>Isométrica</b>: la cámara regresa al inicio.</p>`
  },
  {
    t: 'Explorar: conocer cada elemento',
    html: `<p>Toca un elemento: la cámara se acerca, parpadea en ámbar y el panel explica qué es. También puedes elegirlo en la lista de la izquierda o escribir su nombre en <b>Buscar pieza, tarea o refacción</b>.</p>
{img:guia_pieza|Panel de un elemento seleccionado}
<ul><li><b>A. Nombre, sección y foto:</b> si el elemento sale en una foto de planta, aquí se ve. Los que no salen en ninguna foto llevan la insignia <b>Aproximado · no sale en las fotos</b>: se dibujaron por su descripción.</li>
<li><b>B. Pestañas con datos del Excel:</b> Resumen (nombre completo, cantidad, número de parte y material), Tareas de las OT (Tarea No., qué se hace, cada cuánto y si requiere paro), Refacciones (con severidad) y Fallas (órdenes de trabajo históricas).</li>
<li><b>C. Botones:</b> <i>◂ Anterior</i> y <i>Siguiente ▸</i> pasan al elemento vecino, <i>Ver sección completa</i> muestra toda la sección. Algunos elementos traen uno extra: <i>Abrir la puerta</i>, <i>Ver en operación</i> o <i>Accionar el paro de emergencia</i>.</li></ul>
<p>La pestaña <b>Tareas</b> lista las tareas de las OT que se le hacen a ese elemento, cada una con su <b>Tarea No.</b> (por ejemplo <i>TS01-PREV-MEC-01</i>); al tocar una te lleva a la ruta guiada en esa tarea.</p>
{img:guia_tareas|Pestaña Tareas de un elemento}
<p>Si un elemento queda tapado (por la tina, la campana o la caja del motorreductor), la aplicación pone Rayos X o abre el gabinete sola para que lo veas.</p>
<p><b>⤢ Despiece:</b> con una sección o un elemento seleccionado, el botón <b>Despiece</b> separa sus piezas para ver cómo está armado. Puedes dejarlo <i>en sitio</i> o <i>por separado</i> en un tablero, y con la barra <i>Separación</i> abrirlo más o menos.</p>
{img:guia_despiece|Despiece de una sección}`
  },
  {
    t: 'La barra de herramientas',
    html: `<p>Un botón en color ámbar está encendido; presiónalo otra vez para apagarlo.</p>
{img:guia_barra|La barra de herramientas}
<table><tr><th>Botón</th><th>Qué hace</th></tr>
<tr><td>Vista</td><td>Lista de vistas fijas de la cámara</td></tr>
<tr><td>▶ Operación</td><td>Simula el túnel trabajando: la banda avanza, la boquilla rocía y las cortinas se mueven. Cambia a ■ Detener</td></tr>
<tr><td>Rayos X</td><td>La campana y el gabinete se vuelven transparentes</td></tr>
<tr><td>Aislar</td><td>Deja visible solo lo seleccionado</td></tr>
<tr><td>⤢ Despiece</td><td>Separa las piezas de la sección seleccionada</td></tr>
<tr><td>Explosión</td><td>Barra <i>Explosión general</i> (separa todo el equipo del centro) y barra <i>Corte de la campana</i> (rebana la campana y el gabinete)</td></tr>
<tr><td>Más</td><td>Giro automático, etiquetas de secciones, abrir la puerta del gabinete, paro de emergencia, mapa de calor y calidad gráfica</td></tr></table>
{img:guia_operacion|El túnel en operación}
{img:guia_rayosx|Rayos X: interior de la campana y del gabinete}
{img:guia_explosion|Explosión general}
<p><b>Mapa de calor</b> (en <i>Más</i>) pinta los elementos por la severidad de sus refacciones (rojo crítica, amarillo moderada, verde normal, gris sin refacción) o por las fallas históricas (OT).</p>
{img:guia_calor|Mapa de calor por severidad de refacciones}
<p><b>Paro de emergencia</b> (en <i>Más</i>): el túnel se detiene y no arranca hasta restablecerlo.</p>`
  },
  {
    t: 'Recorrido por las secciones',
    html: `<p>En el panel de bienvenida (modo Explorar) está el botón <b>▶ Recorrido por las secciones</b>: la cámara se mueve sola y un letrero arriba explica cada sección del túnel.</p>
<p>En el letrero: <b>Siguiente ›</b> adelanta y <b>Salir</b> termina. Si no tocas nada, avanza solo.</p>`
  },
  {
    t: 'Ruta guiada: hacer las tareas de una OT',
    html: `<p>Las <b>tareas del túnel</b> están en dos órdenes de trabajo (OT) maestras: la <b>mensual</b> (<i>OP-TS01-INSP-GRAL-EO-1M</i>, equipo operando, 15 tareas) y la <b>anual</b> (<i>OP-TS01-PREV-MEC/ELEC-EP-1A</i>, equipo parado, 7 tareas). Cada tarea trae su <b>Tarea No.</b>, por ejemplo <i>TS01-INSP-MEC-01</i>. La ruta guiada las recorre una por una; al terminar se genera el <b>reporte en PDF</b> y la OT queda guardada en <b>③ Historial</b>.</p>
<ol><li>Arriba, presiona <b>② Ruta guiada</b>.</li>
<li>Lee la seguridad (EPP, tierra, paro y LOTO) y escribe tu nombre (se recuerda para la próxima vez).</li>
<li>Elige la OT: mensual o anual.</li>
<li>En cada tarea la cámara va al elemento y el panel dice qué hacer, cada cuánto, cuántos minutos (los de la OT) y muestra la foto de referencia. Si dice <b>Requiere paro</b>, detén la máquina y aplica el bloqueo (LOTO) antes.</li>
<li>Si la tarea pide lecturas (temperatura, amperaje y voltaje del motor), escríbelas: si alguna sale de rango te avisa.</li>
<li>Marca la clave: <b>B</b> se realizó y todo bien · <b>BP</b> se realizó pero hay pendientes · <b>BCF</b> se realizó y se corrigió la falla · <b>X</b> no se realizó · <b>N/A</b> no aplica. Con BP, BCF o X es obligatorio escribir la observación.</li>
<li><b>← Anterior</b> regresa una tarea; <b>Ver foto de referencia</b> muestra u oculta la foto.</li></ol>
{img:guia_ruta|Una tarea de la ruta guiada}
<p>Al terminar, el <b>PDF se descarga solo</b> con el número de la OT, la fecha, el técnico, cada tarea con su clave, lecturas, observaciones, pendientes y espacio para firmas. Su nombre dice la OT, la fecha y el técnico, por ejemplo <i>OT_mensual_2026-10-09_Jose_Carlos.pdf</i>. Ese archivo es el que se sube a Proteus o se imprime.</p>`
  },
  {
    t: 'Historial de OT',
    html: `<p>Arriba, presiona <b>③ Historial</b>. Ahí quedan todas las OT que se terminaron en <b>② Ruta guiada</b> en ese equipo, con todas sus tareas, de la más reciente a la más antigua. Una OT se guarda cuando todas sus tareas tienen clave; si empezaste a media OT (por ejemplo desde la pestaña Tareas de un elemento), la ruta te lleva a las tareas que falten antes de guardar.</p>
{img:guia_historial|Historial con filtros}
<ul><li><b>Filtros:</b> por técnico, por OT (mensual o anual) y por fechas (desde / hasta).</li>
<li><b>Ver:</b> abre el detalle de una OT, tarea por tarea (con <b>← Volver al historial</b> regresas a la lista).</li>
<li><b>PDF:</b> vuelve a descargar el reporte de esa OT.</li>
<li><b>Exportar a Excel:</b> descarga en una sola tabla todas las OT que se ven con los filtros, un renglón por tarea.</li></ul>
<p><b>Borrar OT</b> (pide el <b>PIN de supervisor</b>):</p>
<ul><li><b>🗑</b> en una tarjeta borra solo esa OT (por ejemplo, una prueba o un error).</li>
<li><b>Borrar historial</b> borra todas; si hay filtros puestos, solo las filtradas (por ejemplo, las anteriores a cierta fecha).</li>
<li>Antes de borrar <b>siempre se baja un respaldo en Excel</b> (<i>Respaldo_borrado_…</i>). Lo borrado no se puede recuperar desde la app.</li>
<li>El PIN inicial es <b>2026</b>. Cámbialo con <b>Cambiar PIN</b> (pide el actual y el nuevo, de 4 a 8 números). El PIN es de cada equipo.</li></ul>
<p><b>Importante:</b> el historial se guarda en el navegador de ese equipo. Si se borran los datos del navegador o se usa otra computadora, no aparece. Por eso conviene guardar los PDF o exportar a Excel de vez en cuando.</p>
<p>En el enlace publicado en internet el visor no permite descargar archivos: ahí el historial se copia para pegarlo en Excel. En la versión de un solo archivo todo se descarga normal.</p>`
  },
  {
    t: 'Análisis: fallas y refacciones',
    html: `<p>Arriba, presiona <b>④ Análisis</b>. Resume el historial del Excel:</p>
<ul><li><b>Pareto de OT de falla:</b> al tocar una barra se iluminan en la máquina los elementos donde ocurrieron.</li>
<li><b>OT de falla por sección:</b> al tocar una barra la cámara va a esa sección.</li>
<li><b>Refacciones críticas:</b> al tocar una, la cámara va al elemento.</li></ul>
<p>Arriba del Pareto hay botones para encender o apagar el mapa de calor.</p>
{img:guia_analisis|Modo Análisis}`
  },
  {
    t: 'Si algo no sale como esperas',
    html: `<table><tr><th>Lo que pasa</th><th>Qué hacer</th></tr>
<tr><td>Se mueve lento o a saltos</td><td>Abre <b>Más</b> y baja la <b>Calidad gráfica</b> a Media o Baja</td></tr>
<tr><td>Me perdí</td><td>Abre <b>Vista</b> y elige <b>Isométrica</b></td></tr>
<tr><td>No arranca con ▶ Operación</td><td>El paro de emergencia está accionado: en <b>Más</b> restablécelo</td></tr>
<tr><td>Todo transparente o apagado</td><td>Apaga <b>Rayos X</b> o <b>Aislar</b></td></tr>
<tr><td>No encuentro un elemento</td><td>Escríbelo en el buscador de la izquierda o usa <b>Explosión</b></td></tr>
<tr><td>No se descargó el PDF</td><td>Revisa la carpeta <i>Descargas</i>; en el enlace publicado no se puede descargar, usa la versión de un solo archivo</td></tr>
<tr><td>No veo el panel derecho</td><td>Presiona la flechita <b>▸</b> del borde derecho</td></tr></table>
<p>El modelo está hecho con las fotos de planta de las ayudas visuales; lo que no sale en ninguna foto se dibujó de forma aproximada (lleva la insignia <b>Aproximado</b>). Las medidas son aproximadas y no sustituyen los planos ni los manuales del fabricante.</p>`
  }
];
