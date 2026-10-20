#!/usr/bin/env python3
r"""Aplica los cambios del punto 2 sobre archivos existentes de Cronos.

Uso (desde la raíz del proyecto, la carpeta que contiene app/ y resources/):
    python aplicar_cambios.py            # aplica
    python aplicar_cambios.py --probar   # solo verifica, no escribe nada
    python aplicar_cambios.py C:\ruta\al\proyecto

- Respeta CRLF o LF del archivo original.
- Es seguro repetirlo: si un cambio ya está, lo salta.
- Guarda una copia .bak antes de modificar cada archivo.
"""
import sys, shutil
from pathlib import Path

args = [a for a in sys.argv[1:] if not a.startswith('--')]
PROBAR = '--probar' in sys.argv
RAIZ = Path(args[0]) if args else Path('.')

ROUTES = 'app/Domain/PlantaLacteos/routes.php'
MODELO = 'app/Domain/PlantaLacteos/Models/RecepcionMateriaPrima.php'
CTRL = 'app/Domain/PlantaLacteos/Http/Controllers/RecepcionMateriaPrimaController.php'
REQ = 'app/Domain/PlantaLacteos/Http/Requests/RecepcionMateriaPrimaRequest.php'
MENU = 'resources/js/data/areas-data.ts'

USE_ANCHOR = "use App\\Domain\\PlantaLacteos\\Http\\Controllers\\RecepcionMateriaPrimaController;\n"
USE_NEW = "use App\\Domain\\PlantaLacteos\\Http\\Controllers\\InformeMateriaPrimaController;\n"

PDF_OLD = ("Route::get('/recepciones-materia-prima/pdf', [RecepcionMateriaPrimaController::class, 'pdf'])\n"
           "    ->name('recepciones-materia-prima.pdf');\n")
PDF_NEW = ("Route::get('/recepciones-materia-prima/pdf', [RecepcionMateriaPrimaController::class, 'pdf'])\n"
           "    ->name('recepciones-materia-prima.pdf')\n"
           "    ->middleware(AdminOrPermission::class . ':r_recepcionMateriaPrima');\n"
           "\n"
           "// Informe de materias primas ingresadas\n"
           "Route::get('informes/materia-prima', [InformeMateriaPrimaController::class, 'index'])\n"
           "    ->name('informes.materia-prima.index')\n"
           "    ->middleware(AdminOrPermission::class . ':r_recepcionMateriaPrima');\n"
           "\n"
           "Route::get('informes/materia-prima/datos', [InformeMateriaPrimaController::class, 'datos'])\n"
           "    ->name('informes.materia-prima.datos')\n"
           "    ->middleware(AdminOrPermission::class . ':r_recepcionMateriaPrima');\n"
           "\n"
           "Route::get('informes/materia-prima/reporte', [InformeMateriaPrimaController::class, 'reporte'])\n"
           "    ->name('informes.materia-prima.reporte')\n"
           "    ->middleware(AdminOrPermission::class . ':r_recepcionMateriaPrima');\n"
           "\n"
           "Route::get('informes/materia-prima/excel', [InformeMateriaPrimaController::class, 'excel'])\n"
           "    ->name('informes.materia-prima.excel')\n"
           "    ->middleware(AdminOrPermission::class . ':r_recepcionMateriaPrima');\n")

REPORTE_RUTA = ("Route::get('informes/materia-prima/reporte', [InformeMateriaPrimaController::class, 'reporte'])\n"
                "    ->name('informes.materia-prima.reporte')\n"
                "    ->middleware(AdminOrPermission::class . ':r_recepcionMateriaPrima');\n"
                "\n")

MOD_OLD = ("                fn($q, $registro) => $q->where('registro_senasag', 'like', \"%{$registro}%\")\n"
           "            );")
MOD_NEW = ("                fn($q, $registro) => $q->where('registro_senasag', 'like', \"%{$registro}%\")\n"
           "            )\n"
           "            // Rango de fechas (usado por el informe de materias primas ingresadas)\n"
           "            ->when(\n"
           "                $filters['fecha_desde'] ?? null,\n"
           "                fn($q, $desde) => $q->where('tiempo', '>=', \\Carbon\\Carbon::parse($desde)->startOfDay())\n"
           "            )\n"
           "            ->when(\n"
           "                $filters['fecha_hasta'] ?? null,\n"
           "                fn($q, $hasta) => $q->where('tiempo', '<=', \\Carbon\\Carbon::parse($hasta)->endOfDay())\n"
           "            );")

CTRL_OLD = ("            abort(403, 'No tienes permiso para actualizar el estado de esta recepción.');\n"
            "        }\n"
            "\n"
            "        $recepcion->estado_id = $request->estado_id;")
CTRL_NEW = ("            abort(403, 'No tienes permiso para actualizar el estado de esta recepción.');\n"
            "        }\n"
            "\n"
            "        $request->validate([\n"
            "            'estado_id' => 'nullable|integer|exists:estados,id',\n"
            "            'liberacion_id' => 'nullable|integer|exists:estados,id',\n"
            "            'estado_analisis_id' => 'nullable|integer|exists:estados,id',\n"
            "            'estado_revision_id' => 'nullable|integer|exists:estados,id',\n"
            "            'revisor_id' => 'nullable|integer|exists:users,id',\n"
            "            'observacion' => 'nullable|string|max:2000',\n"
            "        ]);\n"
            "\n"
            "        $recepcion->estado_id = $request->estado_id;")

REQ1_OLD = "'proveedor_materia_prima_id' => 'required|integer',"
REQ1_NEW = "'proveedor_materia_prima_id' => 'required|integer|exists:PLL_proveedor_materia_primas,id',"
REQ2_OLD = "'almacenero_id'           => 'required|integer',"
REQ2_NEW = "'almacenero_id'           => 'required|integer|exists:users,id',"

ADMIN = '{ title: "Administrar Materia Prima", href: "/admin/materia-prima", permission: "r_adminMateriaPrima" },'
INFORME = '{ title: "Informe de Materia Prima", href: "/informes/materia-prima", permission: "r_recepcionMateriaPrima" },'

problemas = []


def leer(ruta):
    p = RAIZ / ruta
    if not p.exists():
        problemas.append(f'{ruta}: no existe (¿ejecutas el script en la raíz del proyecto?)')
        return None, None, None
    crudo = p.read_bytes().decode('utf-8')
    crlf = '\r\n' in crudo
    return p, crudo.replace('\r\n', '\n'), crlf


def guardar(p, texto, crlf):
    if PROBAR:
        return
    shutil.copy2(p, str(p) + '.bak')
    if crlf:
        texto = texto.replace('\n', '\r\n')
    p.write_bytes(texto.encode('utf-8'))


def reemplazar(texto, viejo, nuevo, marca, etiqueta, ruta):
    """Reemplaza una sola vez; si 'marca' ya está, lo da por hecho."""
    if marca in texto:
        print(f'  = ya aplicado: {etiqueta}')
        return texto, False
    if texto.count(viejo) != 1:
        problemas.append(f'{ruta}: no encontré el bloque exacto para "{etiqueta}" '
                         f'(coincidencias: {texto.count(viejo)}). Hazlo a mano.')
        return texto, False
    print(f'  + {etiqueta}')
    return texto.replace(viejo, nuevo, 1), True


def procesar(ruta, cambios):
    print(ruta)
    p, texto, crlf = leer(ruta)
    if p is None:
        return
    hubo = False
    for viejo, nuevo, marca, etiqueta in cambios:
        texto, ok = reemplazar(texto, viejo, nuevo, marca, etiqueta, ruta)
        hubo = hubo or ok
    if hubo:
        guardar(p, texto, crlf)


procesar(ROUTES, [
    (USE_ANCHOR, USE_ANCHOR + USE_NEW, 'InformeMateriaPrimaController;', 'use del controlador nuevo'),
    (PDF_OLD, PDF_NEW, "informes.materia-prima.index", 'permiso en /pdf + rutas del informe'),
    # Para quien ya aplicó la versión anterior: agrega solo la ruta 'reporte'
    ("Route::get('informes/materia-prima/excel',", REPORTE_RUTA + "Route::get('informes/materia-prima/excel',",
     "informes.materia-prima.reporte", 'ruta del reporte'),
])
procesar(MODELO, [(MOD_OLD, MOD_NEW, "$filters['fecha_desde']", 'rango de fechas en scopeFilter')])
procesar(CTRL, [(CTRL_OLD, CTRL_NEW, "'estado_revision_id' => 'nullable|integer|exists:estados,id'", 'validación en updateEstado')])
procesar(REQ, [
    (REQ1_OLD, REQ1_NEW, 'exists:PLL_proveedor_materia_primas,id', 'exists en proveedor'),
    (REQ2_OLD, REQ2_NEW, "'almacenero_id'           => 'required|integer|exists:users,id'", 'exists en almacenero'),
])

# Menú: se agrega debajo de cada "Administrar Materia Prima" (aparece en dos lugares)
print(MENU)
p, texto, crlf = leer(MENU)
if p is not None:
    lineas = texto.split('\n')
    salida, agregados = [], 0
    for i, linea in enumerate(lineas):
        salida.append(linea)
        if ADMIN in linea:
            siguiente = lineas[i + 1] if i + 1 < len(lineas) else ''
            if INFORME not in siguiente:
                sangria = linea[:len(linea) - len(linea.lstrip())]
                salida.append(sangria + INFORME)
                agregados += 1
    if agregados:
        print(f'  + {agregados} entrada(s) de menú')
        guardar(p, '\n'.join(salida), crlf)
    elif any(INFORME in l for l in lineas):
        print('  = ya aplicado: menú')
    else:
        problemas.append(f'{MENU}: no encontré "Administrar Materia Prima". Agrega la entrada a mano.')

print()
if problemas:
    print('ATENCIÓN, esto no se pudo aplicar solo:')
    for x in problemas:
        print(' -', x)
    sys.exit(1)
print('Listo (modo prueba, no se escribió nada).' if PROBAR else 'Listo. Se guardaron copias .bak de cada archivo modificado.')
