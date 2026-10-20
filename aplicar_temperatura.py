#!/usr/bin/env python3
"""Aplica el módulo de temperatura sobre el proyecto Cronos. Idempotente (se puede ejecutar varias veces).
Uso:  python3 aplicar_temperatura.py /ruta/a/Cronos-main
"""
import os, shutil, sys

if len(sys.argv) != 2 or not os.path.isfile(os.path.join(sys.argv[1], 'artisan')):
    sys.exit('Uso: python3 aplicar_temperatura.py /ruta/a/Cronos-main  (carpeta que contiene "artisan")')
dest = sys.argv[1]
aqui = os.path.dirname(os.path.abspath(__file__))
origen = os.path.join(aqui, 'proyecto')

# 1) Copiar archivos nuevos
n = 0
for raiz, _, archivos in os.walk(origen):
    for a in archivos:
        src = os.path.join(raiz, a)
        rel = os.path.relpath(src, origen)
        dst = os.path.join(dest, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copyfile(src, dst); n += 1
print(f'[1] {n} archivos copiados')

def leer(p):
    with open(p, encoding='utf-8', newline='') as f: return f.read()
def escribir(p, s):
    if not os.path.exists(p + '.bak'): shutil.copyfile(p, p + '.bak')
    with open(p, 'w', encoding='utf-8', newline='') as f: f.write(s)

# 2) routes/api.php
p = os.path.join(dest, 'routes/api.php'); s = leer(p); nl = '\r\n' if '\r\n' in s else '\n'
if 'LecturaApiController' in s:
    print('[2] routes/api.php ya tenía la ruta')
else:
    bloque = '''
// Módulo de temperatura: recepción de lecturas desde el ESP32 (clave por dispositivo, sin sesión)
Route::middleware([
    \\App\\Domain\\ModulosComunes\\Temperatura\\Http\\Middleware\\AutenticarDispositivo::class,
    'throttle:30,1',
])->prefix('v1/temperatura')->name('api.v1.temperatura.')->group(function () {
    Route::post('lecturas', [\\App\\Domain\\ModulosComunes\\Temperatura\\Http\\Controllers\\LecturaApiController::class, 'store'])->name('lecturas');
});
'''.replace('\n', nl)
    escribir(p, s.rstrip() + nl + bloque); print('[2] ruta API añadida')

# 3) HandleInertiaRequests: compartir la clave recién generada
p = os.path.join(dest, 'app/Http/Middleware/HandleInertiaRequests.php'); s = leer(p); nl = '\r\n' if '\r\n' in s else '\n'
if 'clave_generada' in s:
    print('[3] HandleInertiaRequests ya tenía clave_generada')
else:
    ancla = "'import_result' => fn() => $request->session()->get('import_result'),"
    i = s.find(ancla)
    if i < 0: sys.exit('[3] No encontré la línea import_result; añade manualmente: \'clave_generada\' => fn() => $request->session()->get(\'clave_generada\'),')
    fin = s.find(nl, i) + len(nl)
    s = s[:fin] + "                'clave_generada' => fn() => $request->session()->get('clave_generada')," + nl + s[fin:]
    escribir(p, s); print('[3] flash clave_generada añadido')

# 4) Menú
p = os.path.join(dest, 'resources/js/data/areas-data.ts'); s = leer(p); nl = '\r\n' if '\r\n' in s else '\n'
if 'r_temperaturaDashboard' in s:
    print('[4] menú ya tenía las entradas')
else:
    a = 'title: "Lugares de Control", href: "/planta-lacteos/lugares-control-temperatura"'
    i = s.find(a)
    j = s.rfind('{', 0, i); ls = s.rfind(nl, 0, j) + len(nl)
    bloque = nl.join([
        '                    {',
        '                        title: "Dashboard Temperatura (Sensores)", href: "/temperatura/dashboard", permission: "r_temperaturaDashboard",',
        '                    },',
        '                    {',
        '                        title: "Dispositivos de Temperatura", href: "/temperatura/dispositivos", permission: "r_temperaturaDispositivos",',
        '                    },', ''])
    escribir(p, s[:ls] + bloque + s[ls:]); print('[4] menú actualizado')

print('\nListo. Siguiente: php artisan migrate && php artisan db:seed --class=TemperaturaPermisosSeeder')
