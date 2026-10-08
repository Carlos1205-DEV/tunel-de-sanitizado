#!/usr/bin/env python3
"""Genera app/data/taxonomia.js, app/data/datos.js y app/img/ para la app del Túnel de Sanitizado 01
a partir del Excel y los .docx del repositorio.   Uso:  python3 tools/build_data.py   (requiere openpyxl y Pillow)"""
import json, re, zipfile, os, warnings, shutil
import openpyxl
from PIL import Image
warnings.filterwarnings('ignore')

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP = REPO + '/app'
XLSX = REPO + '/TUNEL SANITIZADO FORMATO.xlsx'
wb = openpyxl.load_workbook(XLSX, data_only=True)

def clean(v):
    if v is None: return ''
    return re.sub(r'\s+', ' ', str(v).replace('\xa0', ' ')).strip()

# ------------------------------------------------------------------ taxonomía
ws = wb['{TAXONOMIA.MAQUINA}']
rows = list(ws.iter_rows(values_only=True))
COMPS = [
    ('spray', 'SPREA (BOQUILLA DE ASPERSION)', 'mec', 'Boquilla de aspersión (Sprea)',
     'Boquilla hidráulica Unijet de ángulo ancho que rocía la solución sanitizante en niebla sobre el producto, dentro de la campana del túnel.'),
    ('motorreductor', 'MOTORREDUCTOR', 'mec', 'Motorreductor y electroválvula',
     'Motor trifásico WEG de 0.5 HP con reductor sin fin 40:1 (43.8 RPM) que mueve la banda, y solenoide de agua de 3/4" que abre el paso del agua.'),
    ('dossatron', 'BOMBA DOSSATRON', 'mec', 'Bomba dosificadora Dossatron',
     'Bomba dosificadora accionada por la presión del agua (D14MZ2-D). Succiona el sanitizante de la garrafa y lo mezcla con el agua al porcentaje ajustado.'),
    ('botonera', 'BOTON PARO DE EMERGENCIA (BOTONERA BM13)', 'mec', 'Botón de paro de emergencia (BM13)',
     'Botonera BM13 con el paro de emergencia, montada en una varilla con dos placas y tornillería inoxidable.'),
    ('transmision', 'TRANSMISION', 'mec', 'Transmisión, banda y estructura',
     'Estructura del túnel, banda modular Serie 900, sprockets, flechas, chumaceras, guías de desgaste, acoplamientos y tornillería.'),
    ('gabinete', 'GABINETE ELECTRICO', 'ele', 'Gabinete eléctrico',
     'Tablero de control con protecciones, contactor, guardamotor, variador de frecuencia, fuente, relevadores y clemas.'),
]
comp_by_name = {c[1]: c for c in COMPS}
taxo = {c[0]: {'id': c[0], 'sys': c[2], 'name': c[3], 'desc': c[4], 'items': []} for c in COMPS}
cur = None
for r in rows[16:92]:
    r = list(r) + [None] * 10
    if clean(r[1]) in comp_by_name:
        cur = comp_by_name[clean(r[1])][0]
    elif clean(r[0]) in comp_by_name:
        cur = comp_by_name[clean(r[0])][0]
    if cur is None: continue
    no, name = clean(r[2]), clean(r[3])
    if not name or not no or not re.match(r'^\d+$', no): continue
    q = clean(r[6])
    qty = int(q) if q.isdigit() else 1
    taxo[cur]['items'].append({
        'i': len(taxo[cur]['items']) + 1, 'no': int(no), 'n': name,
        'm': '' if clean(r[4]) in ('', 'N/A') else clean(r[4]),
        'p': '' if clean(r[5]) in ('', 'N/A') else clean(r[5]), 'q': qty})
# pendientes sin número de parte
for it in taxo['transmision']['items']:
    if it['p'].startswith('PENDIENTE'):
        it['pend'] = 1
        it['p'] = ('Sin No. de parte (obstruido en el escaneo)' if 'OBSTRUIDO' in it['p'] else 'Sin No. de parte visible en el manual')

# componentes que no están en la taxonomía del Excel pero salen en las rutinas, fotos y fallas
EXTRA = {
    'id': 'cubierta', 'sys': 'mec', 'name': 'Campana, cortinas y tanque',
    'desc': 'Piezas que no figuran en la taxonomía del Excel pero aparecen en las rutinas, las fotos y el historial de fallas: campana del túnel, cortinas (hawaianas), tanque colector, garrafa de sanitizante, mangueras y bomba de recirculación. Se modelaron a partir de las fotos de referencia.',
    'extra': 1,
    'items': [
        {'i': 1, 'no': 0, 'n': 'CAMPANA DEL TÚNEL (CUBIERTA DE ACERO INOXIDABLE)', 'm': 'ACERO INOXIDABLE', 'p': '', 'q': 1, 'x': 1},
        {'i': 2, 'no': 0, 'n': 'CORTINAS HAWAIANAS DE ENTRADA', 'm': 'PVC TRANSPARENTE', 'p': '', 'q': 7, 'x': 1},
        {'i': 3, 'no': 0, 'n': 'CORTINAS HAWAIANAS DE SALIDA', 'm': 'PVC TRANSPARENTE', 'p': '', 'q': 7, 'x': 1},
        {'i': 4, 'no': 0, 'n': 'TANQUE COLECTOR (CHAROLA DE DRENADO)', 'm': 'ACERO INOXIDABLE', 'p': '', 'q': 1, 'x': 1},
        {'i': 5, 'no': 0, 'n': 'MANGUERA DE DRENAJE', 'm': '', 'p': '', 'q': 1, 'x': 1},
        {'i': 6, 'no': 0, 'n': 'GARRAFA DE SANITIZANTE Y MANGUERA DE SUCCIÓN', 'm': 'POLIETILENO', 'p': '', 'q': 1, 'x': 1},
        {'i': 7, 'no': 0, 'n': 'MANGUERAS, TUBERÍA DE AGUA Y CONDUIT', 'm': '', 'p': '', 'q': 1, 'x': 1},
        {'i': 8, 'no': 0, 'n': 'BOMBA DE RECIRCULACIÓN DE AGUA', 'm': '', 'p': '', 'q': 1, 'x': 1},
    ]}
comps_out = [taxo[c[0]] for c in COMPS] + [EXTRA]
TAXO = {'sistemas': {'mec': 'Sistema mecánico', 'ele': 'Sistema eléctrico'}, 'comps': comps_out}
for c in comps_out:
    print(c['id'], len(c['items']))

# ------------------------------------------------------------------ tareas (Excel)
ws = wb['TAREAS ']
tareas = {}
for r in ws.iter_rows(min_row=8, values_only=True):
    per = clean(r[8])
    if not per or not per.startswith('TS01'): continue
    tareas[per] = {'per': per, 'clase': clean(r[1]), 'tactica': clean(r[3]), 'frec': clean(r[6]).upper(),
                   'paro': clean(r[7]).upper(), 'nivel': clean(r[9]).upper(), 'min': int(float(clean(r[10]) or 0)),
                   'herr': '' if clean(r[11]) in ('', 'N/A') else clean(r[11]), 'act': clean(r[5])}
print('tareas', len(tareas))

# ------------------------------------------------------------------ rutinas (docx)
def docx_items(path):
    x = zipfile.ZipFile(path).read('word/document.xml').decode()
    paras = re.findall(r'<w:p[ >].*?</w:p>', x, re.S)
    out = []
    for p in paras:
        t = ''.join(re.findall(r'<w:t[^>]*>([^<]*)</w:t>', p)).strip()
        m = re.match(r'^(\d{4})\.-\s*\(\s*\)\s*(.+)$', t)
        if m: out.append((m.group(1), m.group(2).strip()))
    return out
CODE2PER = {'1101': 'TS01-INSP-MEC-01', '1102': 'TS01-INSP-MEC-02', '1103': 'TS01-INSP-MEC-03', '1104': 'TS01-INSP-MEC-04',
            '1105': 'TS01-INSP-MEC-05', '1106': 'TS01-INSP-MEC-06', '1107': 'TS01-INSP-MEC-07', '1108': 'TS01-INSP-MEC-08',
            '1109': 'TS01-INSP-MEC-09', '1301': 'TS01-PREV-MEC-01', '3101': 'TS01-INSP-ELEC-01', '3201': 'TS01-PRED-MEC-01',
            '3302': 'TS01-LIMP-ELEC-01', '7101': 'TS01-INSP-GRAL-01', '7102': 'TS01-INSP-GRAL-02',
            '1302': 'TS01-PREV-MEC-02', '1303': 'TS01-PREV-MEC-03', '1304': 'TS01-PREV-MEC-04', '1305': 'TS01-PREV-MEC-05',
            '1306': 'TS01-PREV-MEC-06', '1307': 'TS01-LIMP-MEC-01', '3301': 'TS01-PREV-ELEC-01'}
SYSNAME = {'1': 'Mecánico', '2': 'Neumático', '3': 'Eléctrico', '4': 'Hidráulico', '5': 'Instrumentación', '6': 'Lubricación', '7': 'General'}
CLASSNAME = {'1': 'Inspección', '2': 'Predictivo', '3': 'Preventivo'}
# fotos de referencia (ver ref_XX.jpg) y puntos del 3D que cubre cada tarea
FOTO = {'1101': 'ref_01', '1102': 'ref_11', '1103': 'ref_09', '1104': 'ref_01', '1105': 'ref_07', '1106': 'ref_08', '1107': 'ref_09',
        '1108': 'ref_11', '1109': 'ref_10', '1301': 'ref_09', '3101': 'ref_03', '3201': 'ref_09', '3302': 'ref_04', '7101': 'ref_06',
        '7102': 'ref_05', '1302': 'ref_10', '1304': 'ref_09', '1305': 'ref_09', '1306': 'ref_11', '3301': 'ref_04'}
PUNTOS = {
    '1101': ['transmision:17', 'transmision:18'], '1102': ['transmision:19'], '1103': ['transmision:35', 'transmision:34', 'transmision:22'],
    '1104': ['transmision:19'], '1105': ['dossatron:1', 'cubierta:6'], '1106': ['transmision:12', 'transmision:15'],
    '1107': ['transmision:20', 'transmision:6', 'transmision:32'], '1108': ['cubierta:2', 'cubierta:3'],
    '1109': ['spray:1', 'dossatron:1'], '1301': ['transmision:21', 'transmision:10', 'transmision:11'],
    '3101': ['comp:gabinete'], '3201': ['motorreductor:1', 'motorreductor:2'], '3302': ['comp:gabinete'],
    '7101': ['ALL'], '7102': ['transmision:1', 'transmision:12', 'transmision:15'],
    '1302': ['cubierta:8'], '1303': ['motorreductor:2'], '1304': ['transmision:35', 'transmision:34'], '1305': ['motorreductor:2'],
    '1306': ['transmision:19'], '1307': ['motorreductor:1'], '3301': ['gabinete:5', 'gabinete:1', 'motorreductor:3']}
def ficha(fid, titulo, periodo, path):
    items = []
    for code, text in docx_items(path):
        per = CODE2PER[code]; t = tareas.get(per, {})
        items.append({'codigo': code, 'per': per, 'texto': text, 'sistema': SYSNAME[code[0]], 'clase': CLASSNAME[code[1]],
                      'frec': t.get('frec', ''), 'paro': t.get('paro', ''), 'nivel': t.get('nivel', ''), 'min': t.get('min', 0),
                      'herr': t.get('herr', ''), 'foto': FOTO.get(code, ''), 'puntos': PUNTOS[code]})
    return {'id': fid, 'titulo': titulo, 'periodo': periodo, 'items': items}
fichas = [ficha('mensual', 'Rutina mensual', 'Equipo operando · inspección, predictivo y limpieza', REPO + '/RUTINA MENSUAL TUNEL DE SANITIZADO 01 EQUIPO OPERANDO.docx'),
          ficha('anual', 'Rutina anual', 'Equipo parado · cambios preventivos y limpieza', REPO + '/RUTINA ANUAL TUNEL DE SANITIZADO 01 EQUIPO PARADO.docx')]
for f in fichas: print(f['id'], len(f['items']))

# ------------------------------------------------------------------ fallas
ws = wb['FALLAS REPETITIVAS']
rows = list(ws.iter_rows(values_only=True))
fallas, grp = [], None
for r in rows[5:]:
    r = list(r) + [None] * 40
    if clean(r[0]): grp = clean(r[0])
    if not clean(r[1]): continue
    def num(v):
        try: return float(clean(v) or 0)
        except ValueError: return 0.0
    fallas.append({'ot': clean(r[1]), 'desc': clean(r[3]), 'tipo': clean(r[9]), 'fecha': clean(r[10]), 'prio': clean(r[11]).split('.')[0],
                   'min': num(r[20]), 'muerto': num(r[21]), 'total': num(r[24]), 'clase': clean(r[26]), 'det': clean(r[29]), 'grupo': grp})
pareto = []
for r in rows[5:15]:
    r = list(r) + [None] * 40
    g = clean(r[33])
    if g and g != 'TOTAL': pareto.append({'grupo': g, 'ot': int(float(clean(r[34]))), 'pct': round(float(clean(r[35])) * 100, 1)})
print('fallas', len(fallas), 'pareto', len(pareto), sum(p['ot'] for p in pareto))
GRUPO_ELEM = {
    'BANDA - ROTURA / ESLABONES DAÑADOS': ['transmision:19'],
    'BANDA - ATORAMIENTO / DESALINEACION POR GUIAS': ['transmision:12', 'transmision:15', 'transmision:19'],
    'BANDA - FALLA DE TRANSMISION (SPROCKETS / CUÑA)': ['transmision:20', 'transmision:6', 'transmision:8', 'transmision:9'],
    'ESTRUCTURA - SOLDADURA DE GUIAS Y BASE (DESOLDADO)': ['transmision:1', 'transmision:15', 'transmision:12'],
    'SISTEMA ELECTRICO / GABINETE (NO ENCIENDE, PROTECCIONES, ELECTROVALVULA)': ['comp:gabinete', 'motorreductor:3'],
    'BANDA - CAMBIO DE HAWAIANAS (TOPES / ADITAMENTOS)': ['cubierta:2', 'cubierta:3'],
    'SPREA Y BOMBA DOSSATRON (SISTEMA DE ASPERSION)': ['spray:1', 'dossatron:1'],
}

# ------------------------------------------------------------------ refacciones
ws = wb['REFACCIONES ']
SEV = {'critico': 'CRÍTICO', 'moderado': 'MEDIA', 'normal': 'BAJA'}
REF_ELEM = [
    (r'SPREA', ['spray:1']), (r'SOLENOIDE', ['motorreductor:3']), (r'MOTOR ELECTRICO', ['motorreductor:1']), (r'REDUCTOR NEMA', ['motorreductor:2']),
    (r'DOSSATRON', ['dossatron:1']), (r'BOTON PARO', ['botonera:1']), (r'PLACA 1 BOTONERA', ['botonera:2']), (r'PLACA 2 BOTONERA', ['botonera:3']),
    (r'VARILLA BOTONERA', ['botonera:4']), (r'ESTRUCTURA TUNEL', ['transmision:1']), (r'CUÑA FLECHA', ['transmision:6']),
    (r'GUIA DE DESGASTE', ['transmision:12']), (r'BANDA MODULAR', ['transmision:19']), (r'SPROCKET', ['transmision:20']),
    (r'HAWAIANAS', ['cubierta:2', 'cubierta:3']), (r'PERNO PLACA', ['transmision:2']), (r'PLACA SOPORTE ESTRUCTURA', ['transmision:3']),
    (r'FLECHA MOTOR', ['transmision:7']), (r'RODILLO CONDUCIDO', ['transmision:8']), (r'RODILLO MOTRIZ', ['transmision:9']),
    (r'RODILLO BANDA', ['transmision:17']), (r'SOPORTE RODILLO', ['transmision:18']), (r'CHUMACERA COCOL', ['transmision:21']),
    (r'COPLE MORDAZA \(MOTOR\)', ['transmision:22']), (r'COPLE MORDAZA \(TUNEL\)', ['transmision:34']), (r'ELEMENTO BUNA', ['transmision:35']),
    (r'PLACA 1 CHUMACERA', ['transmision:10']), (r'PLACA 2 CHUMACERA', ['transmision:11']), (r'SOPORTE GUIA DE DESGASTE', ['transmision:15']),
    (r'SELENOIDE', ['transmision:33']), (r'GUARDA MOTOR', ['gabinete:5']), (r'VARIADOR', ['gabinete:10']), (r'TERMICO 3x10', ['gabinete:1']),
    (r'TERMICO 3x20', ['gabinete:2']), (r'CONTACTOR', ['gabinete:4']), (r'FUENTE', ['gabinete:6']), (r'RELEVADOR FINDER 220', ['gabinete:7']),
    (r'RELEVADOR FINDER 24', ['gabinete:8']), (r'RELEVADOR DE 14', ['gabinete:9']), (r'BOTON LATERAL', ['gabinete:3']),
    (r'TIERRA FISICA', ['gabinete:11']), (r'PASO 2\.5', ['gabinete:12']), (r'RIEL DIN', ['gabinete:13']), (r'CANALETA', ['gabinete:14']),
    (r'GLANDULA', ['gabinete:15'])]
refs = []
for r in ws.iter_rows(min_row=9, max_row=62, values_only=True):
    r = list(r) + [None] * 10
    sev = clean(r[7]).lower()
    if sev not in SEV: continue
    part = clean(r[0]); desc = clean(r[1])
    elems = []
    for pat, el in REF_ELEM:
        if re.search(pat, part + ' ' + desc, re.I): elems = el; break
    refs.append({'parte': part, 'desc': desc, 'uds': clean(r[2]), 'sev': SEV[sev], 'elems': elems})
print('refs', len(refs), 'sin elemento:', [x['parte'] for x in refs if not x['elems']])

# ------------------------------------------------------------------ escribir JS
os.makedirs(APP + '/data', exist_ok=True)
with open(APP + '/data/taxonomia.js', 'w', encoding='utf-8') as f:
    f.write('window.TAXO=' + json.dumps(TAXO, ensure_ascii=False, separators=(',', ':')) + ';\n')
DATA = {'maquina': 'TÚNEL DE SANITIZADO 01 (OP TS01)', 'area': 'Empaque', 'linea': 'Cortes', 'tareas': tareas, 'fichas': fichas,
        'fallas': fallas, 'pareto': pareto, 'grupoElem': GRUPO_ELEM, 'refs': refs}
with open(APP + '/data/datos.js', 'w', encoding='utf-8') as f:
    f.write('window.DATA=' + json.dumps(DATA, ensure_ascii=False, separators=(',', ':')) + ';\n')

# ------------------------------------------------------------------ imágenes
import io
IMG = APP + '/img'
os.makedirs(IMG, exist_ok=True)
def save(data, name, maxs=1000, q=84):
    im = Image.open(io.BytesIO(data))
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA'); bg = Image.new('RGB', im.size, (255, 255, 255)); bg.paste(im, mask=im.split()[-1]); im = bg
    im = im.convert('RGB'); im.thumbnail((maxs, maxs)); im.save(IMG + '/' + name + '.jpg', quality=q, optimize=True)
zm = zipfile.ZipFile(REPO + '/REFERENCIA VISUAL MENSUAL (TUNEL DE SANITIZADO 01).docx')   # fotos de la rutina mensual
for i in range(1, 12):
    save(zm.read('word/media/image%d.jpeg' % i), 'ref_%02d' % i)
zx = zipfile.ZipFile(XLSX)                                                                # ilustraciones del manual (hoja de taxonomía)
for src, name in [('image49', 'x_spray'), ('image50', 'x_motorreductor'), ('image51', 'x_solenoide'), ('image52', 'x_dossatron'),
                  ('image53', 'x_botonera_desp'), ('image54', 'x_botonera_foto'), ('image55', 'x_transmision'),
                  ('image56', 'x_gabinete'), ('image57', 'x_general')]:
    save(zx.read('xl/media/' + src + '.png'), name, 1000, 88)
print(sorted(os.listdir(IMG)))
