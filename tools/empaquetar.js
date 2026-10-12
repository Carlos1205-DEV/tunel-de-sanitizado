/* © 2026 Jose Carlos Trejo Espinosa. Todos los derechos reservados. */
// Arma la aplicación en UN SOLO archivo HTML (código, datos y fotos adentro) para abrirla con doble clic o subirla a otro sistema.
// Uso: node tools/empaquetar.js   →   dist/Tunel01_interactivo.html
const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..'), app = path.join(raiz, 'app'), leer = f => fs.readFileSync(path.join(app, f), 'utf8');
const html = leer('index.html');
const seguro = js => js.replace(/<\/script/gi, '<\\/script');           // evita cerrar el <script> antes de tiempo
const imagenes = {};
fs.readdirSync(path.join(app, 'img')).filter(f => /\.jpe?g$/i.test(f)).forEach(f => {
  imagenes[f.replace(/\.jpe?g$/i, '')] = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(app, 'img', f)).toString('base64');
});
let out = html.replace('<link rel="stylesheet" href="css/style.css">', () => '<style>\n' + leer('css/style.css') + '\n</style>');
out = out.replace(/<script src="([^"]+)"><\/script>/g, (m, src) => '<script>\n' + seguro(leer(src)) + '\n</script>');
out = out.replace('<script>', () => '<script>window.IMAGENES = ' + JSON.stringify(imagenes) + ';</script>\n<script>');
if (/src="(lib|js|data)\//.test(out) || /href="css\//.test(out)) throw new Error('Quedó algún script u hoja de estilo sin incrustar');
fs.mkdirSync(path.join(raiz, 'dist'), { recursive: true });
const destino = path.join(raiz, 'dist', 'Tunel01_interactivo.html');
fs.writeFileSync(destino, out);
console.log('Listo:', destino, (fs.statSync(destino).size / 1048576).toFixed(1) + ' MB,', Object.keys(imagenes).length, 'fotos');
