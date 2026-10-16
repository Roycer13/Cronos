<?php

namespace App\Domain\PlantaLacteos\Http\Controllers;


use App\Domain\PlantaLacteos\Models\RecepcionMateriaPrima;
use App\Domain\PlantaLacteos\Models\AnalisisMateriaPrima;
use App\Domain\Sistema\Configuracion\Models\Estado;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class AnalisisMateriaPrimaController extends Controller
{


    // Helpers de ubicación (copiados de RecepcionMateriaPrimaController)
    private function isAdmin()
    {
        return auth()->user()->hasRole('admin');
    }

    private function getUbicacionId()
    {
        return auth()->user()->ubicacion_id;
    }

    /**
     * Muestra los análisis de una recepción específica.
     */
    public function indexPorRecepcion($recepcionId)
    {
        $recepcion = RecepcionMateriaPrima::with([
            'itemMateriaPrima.categoriaMateriaPrima',
            'proveedorMateriaPrima',
            'user',
            'analisisMateriaPrima.user', // para mostrar quién registró cada análisis
            'estadoRevision',
            'revisor',
        ])->findOrFail($recepcionId);

        // Verificar permisos de ubicación (si no es admin)
        if (!$this->isAdmin() && $recepcion->ubicacion_id !== $this->getUbicacionId()) {
            abort(403, 'No tienes permiso para ver estos análisis.');
        }

        return Inertia::render('planta_lacteos/materiaPrima/analisis/index', [
            'recepcion' => $recepcion,
            'analisis' => $recepcion->analisisMateriaPrima,
            'categoria' => $recepcion->itemMateriaPrima->categoriaMateriaPrima,
        ]);
    }

    /**
     * Actualiza un análisis específico.
     */
    public function update(Request $request, AnalisisMateriaPrima $analisis)
    {
        // Verificar permisos de ubicación a través de la recepción
        $recepcion = $analisis->recepcionMateriaPrima;
        if (!$this->isAdmin() && $recepcion->ubicacion_id !== $this->getUbicacionId()) {
            abort(403, 'No tienes permiso para actualizar este análisis.');
        }

        // Validar todos los campos posibles (todos opcionales)
        $data = $request->validate([
            'lote' => 'nullable|string|max:255',
            'temperatura' => 'nullable|numeric',
            'ph' => 'nullable|numeric',
            'solidos' => 'nullable|numeric',
            'viscosidad' => 'nullable|numeric',
            'densidad' => 'nullable|numeric',
            'acidez' => 'nullable|numeric',
            'color' => 'nullable|boolean',
            'olor' => 'nullable|boolean',
            'sabor' => 'nullable|boolean',
            'aspecto' => 'nullable|boolean',
            'textura' => 'nullable|boolean',
            'sin_material_extraño' => 'nullable|boolean',
            'conformidad' => 'nullable|boolean',
            'observaciones' => 'nullable|string',
            'numero_bobina' => 'nullable|string|max:255',
            'peso_neto' => 'nullable|numeric',
            'adherencia' => 'nullable|boolean',
            'frotacion' => 'nullable|boolean',
            'texto' => 'nullable|boolean',
            'sentido_embobinado' => 'nullable|boolean',
            'largo_envase' => 'nullable|numeric',
            'ancho_envase' => 'nullable|numeric',
            'largo_taca' => 'nullable|numeric',
            'ancho_taca' => 'nullable|numeric',
            'distancia_taca_borde' => 'nullable|numeric',
            'largo_superior' => 'nullable|string|max:255',
            'largo_inferior' => 'nullable|string|max:255',
            'ancho' => 'nullable|string|max:255',
            'densidad_lineal' => 'nullable|numeric',
            'numero_paquete' => 'nullable|string|max:255',
            'peso_unitario' => 'nullable|numeric',
            'largo_total' => 'nullable|numeric',
            'ancho_total' => 'nullable|numeric',
            'ancho_plegado' => 'nullable|numeric',
            'micronaje' => 'nullable|string|max:255',
            'resistencia_envase' => 'nullable|boolean',
            'transparencia' => 'nullable|boolean',
            'calidad_impresion' => 'nullable|boolean',
            'numero_embalaje' => 'nullable|string|max:255',
            'espesor' => 'nullable|numeric',
            'altura_total' => 'nullable|numeric',
            'diametro_medio' => 'nullable|numeric',
            'altura_etiqueta' => 'nullable|numeric',
            'perimetro_etiqueta' => 'nullable|numeric',
            'diametro_cuello' => 'nullable|numeric',
            'altura_plegada' => 'nullable|numeric',
            'diametro_externo_base' => 'nullable|numeric',
            'diametro_interno' => 'nullable|numeric',
            'acabado_fino' => 'nullable|boolean',
            'sin_deformidad' => 'nullable|boolean',
            'resistencia_base' => 'nullable|boolean',
            'tiempo_analisis' => 'nullable|date',
        ]);

        // Si tiempo_analisis viene vacío, lo eliminamos para que se guarde como null
        if (empty($data['tiempo_analisis'])) {
            unset($data['tiempo_analisis']);
        }

        $analisis->update($data);

        return back()->with('success', 'Análisis actualizado correctamente.');
    }

    public function pdf(Request $request, $recepcionId)
    {
        $recepcion = RecepcionMateriaPrima::with([
            'itemMateriaPrima.categoriaMateriaPrima',
            'proveedorMateriaPrima',
            'user',
            'revisor',
        ])->findOrFail($recepcionId);

        if (!$this->isAdmin() && $recepcion->ubicacion_id !== $this->getUbicacionId()) {
            abort(403, 'No tienes permiso para ver este reporte.');
        }

        $query = AnalisisMateriaPrima::where('recepcion_materia_prima_id', $recepcionId);

        if ($request->filled('fecha_desde') && $request->filled('fecha_hasta')) {
            $desde = Carbon::parse($request->fecha_desde)->startOfDay();
            $hasta = Carbon::parse($request->fecha_hasta)->endOfDay();
            $query->whereBetween('tiempo_analisis', [$desde, $hasta]);
        }

        $analisis = $query->with('user')->orderBy('numero_muestra')->get();

        $usuariosMap = [];
        foreach ([$recepcion->user, $recepcion->revisor, ...$analisis->pluck('user')->all()] as $user) {
            if ($user && $user->codigo) {
                $usuariosMap[$user->codigo] = [
                    'codigo' => $user->codigo,
                    'nombre' => trim(($user->name ?? '') . ' ' . ($user->apellido ?? '')),
                ];
            }
        }

        return response()->json([
            'analisis' => $analisis,
            'recepcion' => [
                'id' => $recepcion->id,
                'tiempo' => $recepcion->tiempo,
                'item_materia_prima' => [
                    'nombre' => $recepcion->itemMateriaPrima->nombre,
                    'categoria' => $recepcion->itemMateriaPrima->categoriaMateriaPrima?->nombre,
                ],
                'proveedor' => $recepcion->proveedorMateriaPrima->nombre,
                'usuario' => $recepcion->user?->name . ' ' . $recepcion->user?->apellido,
                'revisor' => $recepcion->revisor ? [
                    'codigo' => $recepcion->revisor->codigo,
                    'nombre' => trim(($recepcion->revisor->name ?? '') . ' ' . ($recepcion->revisor->apellido ?? '')),
                ] : null,
                'cantidad' => $recepcion->cantidad ?? null,
                'unidades' => $recepcion->unidades ?? null,
                'nca' => $recepcion->nca ?? null,
                'nivel_inspeccion' => $recepcion->nivel_inspeccion ?? null,
                'plan_muestreo' => $recepcion->plan_muestreo ?? null,
            ],
            'usuarios_involucrados' => array_values($usuariosMap),
            'filtros' => $request->only(['fecha_desde', 'fecha_hasta', 'view_id']),
        ]);
    }

    public function destroyAllPorRecepcion($recepcionId)
    {
        $recepcion = RecepcionMateriaPrima::findOrFail($recepcionId);

        if (!$this->isAdmin() && $recepcion->ubicacion_id !== $this->getUbicacionId()) {
            abort(403, 'No tienes permiso para eliminar estos análisis.');
        }

        DB::transaction(function () use ($recepcion) {
            $recepcion->analisisMateriaPrima()->delete();
            $estadoPendiente = Estado::where('nombre', 'Pendiente')->first();
            if ($estadoPendiente) {
                $recepcion->estado_analisis_id = $estadoPendiente->id;
                $recepcion->save();
            }
        });

        return back()->with('success', "Se eliminaron todos los análisis de la recepción #{$recepcion->id}.");
    }

    /**
     * Genera registros de análisis para una recepción a partir del tamaño de lote,
     * nivel de inspección y plan de muestreo.
     */
  public function generarDesdeRecepcion(Request $request, $recepcionId)
{
    try {
        $request->validate([
            'nivel_inspeccion' => ['required', Rule::in(['S-1', 'S-2', 'S-3', 'S-4', 'I', 'II', 'III'])],
            'plan_muestreo'    => ['required', Rule::in(['reducido', 'normal', 'rigurosa'])],
            'nca'              => 'nullable|string|max:50',
        ]);

        $recepcion = RecepcionMateriaPrima::findOrFail($recepcionId);

        // Obtener tamaño de lote (unidades)
        $unidades = $recepcion->unidades;
        if (is_null($unidades) || $unidades < 1) {
            return back()->withErrors(['msg' => 'El tamaño de lote (unidades) no es válido.']);
        }

        // Verificar si ya tiene análisis o si ya fue analizada
        $estadoAnalizado = Estado::whereIn('nombre', ['Analizando', 'ANALIZANDO'])->first();
        if (($estadoAnalizado && $recepcion->estado_analisis_id === $estadoAnalizado->id) || $recepcion->analisisMateriaPrima()->exists()) {
            return back()->withErrors(['msg' => 'Esta recepción ya tiene registros de análisis generados y no se puede volver a analizar.']);
        }

        // Usar transacción para asegurar consistencia
        DB::beginTransaction();

        // SI ES UNA UNIDAD, CREAR SOLO UN REGISTRO DE ANÁLISIS
        if ($unidades == 1) {
            // Obtener o crear el estado "Analizado" si no existe
            if (!$estadoAnalizado) {
                $estadoAnalizado = Estado::firstOrCreate(
                    ['nombre' => 'Analizado'],
                    [
                        'descripcion' => 'Análisis de materia prima completado.',
                        'color' => '#10b981'
                    ]
                );
            }

            // Actualizar la recepción con los datos ingresados e indicar que está analizado
            $recepcion->nivel_inspeccion = $request->nivel_inspeccion;
            $recepcion->plan_muestreo = $request->plan_muestreo;
            $recepcion->nca = $request->nca;
            $recepcion->estado_analisis_id = $estadoAnalizado->id;
            $recepcion->save();

            // Obtener lotes de la recepción y asignar el primero (si existe)
            $lotes = $recepcion->recepcionLotes()->pluck('lote')->toArray();

            // Crear solo 1 registro de análisis
            AnalisisMateriaPrima::create([
                'recepcion_materia_prima_id' => $recepcion->id,
                'numero_muestra'             => 1,
                'lote'                       => $lotes[0] ?? null,
                'user_id'                    => auth()->id(),
            ]);

            DB::commit();

            return redirect()->route('recepciones-materia-prima.index2')
                ->with('success', "Se generó 1 registro de análisis para la recepción #{$recepcion->id} (Unidad única).");

        }

        // CONTINUAR CON LA LÓGICA NORMAL PARA MÁS DE 1 UNIDAD
        // 1. Obtener letra según tamaño de lote y nivel de inspección
        $letra = $this->obtenerLetra($unidades, $request->nivel_inspeccion);
        if (!$letra) {
            return back()->withErrors(['msg' => 'No se pudo determinar la letra para el nivel de inspección seleccionado.']);
        }

        // 2. Obtener cantidad de muestras según letra y plan
        $cantidadMuestras = $this->obtenerCantidadMuestras($letra, $request->plan_muestreo);
        if ($cantidadMuestras === null) {
            return back()->withErrors(['msg' => 'No se encontró cantidad para la letra y plan seleccionados.']);
        }

        // 3. Obtener o crear el estado "Analizado" si no existe
        if (!$estadoAnalizado) {
            $estadoAnalizado = Estado::firstOrCreate(
                ['nombre' => 'Analizado'],
                [
                    'descripcion' => 'Análisis de materia prima completado.',
                    'color' => '#10b981'
                ]
            );
        }

        // 4. Actualizar la recepción con los datos ingresados e indicar que está analizado
        $recepcion->nivel_inspeccion = $request->nivel_inspeccion;
        $recepcion->plan_muestreo = $request->plan_muestreo;
        $recepcion->nca = $request->nca;
        $recepcion->estado_analisis_id = $estadoAnalizado->id;
        $recepcion->save();

        // 5. Crear los registros de análisis y asignar lotes de forma equilibrada
        $lotes = $recepcion->recepcionLotes()->pluck('lote')->toArray();
        $nLotes = count($lotes);

        $analisis = [];

        if ($nLotes > 0) {
            // Distribuir la cantidad de muestras entre los lotes lo más uniformemente posible
            $base = intdiv($cantidadMuestras, $nLotes);
            $remainder = $cantidadMuestras % $nLotes;

            $assignments = [];
            for ($j = 0; $j < $nLotes; $j++) {
                $countFor = $base + ($j < $remainder ? 1 : 0);
                for ($k = 0; $k < $countFor; $k++) {
                    $assignments[] = $lotes[$j];
                }
            }

            // Asegurar que haya tantas asignaciones como muestras (por si acaso)
            while (count($assignments) < $cantidadMuestras) {
                $assignments[] = $lotes[$nLotes - 1];
            }

            for ($i = 1; $i <= $cantidadMuestras; $i++) {
                $analisis[] = [
                    'recepcion_materia_prima_id' => $recepcion->id,
                    'numero_muestra'             => $i,
                    'lote'                       => $assignments[$i - 1] ?? null,
                    'user_id'                    => auth()->id(),
                    'created_at'                 => now(),
                    'updated_at'                 => now(),
                ];
            }
        } else {
            for ($i = 1; $i <= $cantidadMuestras; $i++) {
                $analisis[] = [
                    'recepcion_materia_prima_id' => $recepcion->id,
                    'numero_muestra'             => $i,
                    'user_id'                    => auth()->id(),
                    'created_at'                 => now(),
                    'updated_at'                 => now(),
                ];
            }
        }

        AnalisisMateriaPrima::insert($analisis);

        DB::commit();

        return redirect()->route('recepciones-materia-prima.index2')
            ->with('success', "Se generaron {$cantidadMuestras} registros de análisis para la recepción #{$recepcion->id}.");

    } catch (\Exception $e) {
        DB::rollBack();
        \Log::error('Error al generar análisis de materia prima: ' . $e->getMessage(), [
            'recepcionId' => $recepcionId,
            'exception' => $e,
        ]);

        return back()->withErrors(['msg' => 'Ocurrió un error al generar los análisis: ' . $e->getMessage()]);
    }
}

    /**
     * Determina la letra según tamaño de lote y nivel de inspección.
     * Basado en la tabla proporcionada.
     */
    private function obtenerLetra($unidades, $nivel)
    {
        // Definir rangos (inclusive) y su mapeo a letras según nivel
        $rangos = [
            ['min' => 2,    'max' => 8,     'S-1' => 'A', 'S-2' => 'A', 'S-3' => 'A', 'S-4' => 'A', 'I' => 'A', 'II' => 'A', 'III' => 'B'],
            ['min' => 9,    'max' => 15,    'S-1' => 'A', 'S-2' => 'A', 'S-3' => 'A', 'S-4' => 'A', 'I' => 'A', 'II' => 'B', 'III' => 'C'],
            ['min' => 16,   'max' => 25,    'S-1' => 'A', 'S-2' => 'A', 'S-3' => 'B', 'S-4' => 'B', 'I' => 'B', 'II' => 'C', 'III' => 'D'],
            ['min' => 26,   'max' => 50,    'S-1' => 'A', 'S-2' => 'B', 'S-3' => 'B', 'S-4' => 'C', 'I' => 'C', 'II' => 'D', 'III' => 'E'],
            ['min' => 51,   'max' => 90,    'S-1' => 'B', 'S-2' => 'B', 'S-3' => 'C', 'S-4' => 'C', 'I' => 'C', 'II' => 'E', 'III' => 'F'],
            ['min' => 91,   'max' => 150,   'S-1' => 'B', 'S-2' => 'B', 'S-3' => 'C', 'S-4' => 'D', 'I' => 'D', 'II' => 'F', 'III' => 'G'],
            ['min' => 151,  'max' => 280,   'S-1' => 'C', 'S-2' => 'C', 'S-3' => 'D', 'S-4' => 'E', 'I' => 'E', 'II' => 'G', 'III' => 'H'],
            ['min' => 281,  'max' => 500,   'S-1' => 'C', 'S-2' => 'C', 'S-3' => 'D', 'S-4' => 'E', 'I' => 'F', 'II' => 'H', 'III' => 'J'],
            ['min' => 501,  'max' => 1200,  'S-1' => 'C', 'S-2' => 'C', 'S-3' => 'E', 'S-4' => 'F', 'I' => 'G', 'II' => 'J', 'III' => 'K'],
            ['min' => 1201, 'max' => 3200,  'S-1' => 'C', 'S-2' => 'D', 'S-3' => 'E', 'S-4' => 'G', 'I' => 'H', 'II' => 'K', 'III' => 'L'],
            ['min' => 3201, 'max' => 10000, 'S-1' => 'C', 'S-2' => 'D', 'S-3' => 'F', 'S-4' => 'G', 'I' => 'K', 'II' => 'L', 'III' => 'M'],
            ['min' => 10001,'max' => 35000, 'S-1' => 'C', 'S-2' => 'D', 'S-3' => 'F', 'S-4' => 'H', 'I' => 'K', 'II' => 'M', 'III' => 'N'],
            ['min' => 35001,'max' => 150000,'S-1' => 'D', 'S-2' => 'E', 'S-3' => 'G', 'S-4' => 'J', 'I' => 'L', 'II' => 'N', 'III' => 'P'],
            ['min' => 150001,'max' => 500000,'S-1' => 'D', 'S-2' => 'E', 'S-3' => 'G', 'S-4' => 'J', 'I' => 'M', 'II' => 'P', 'III' => 'Q'],
            ['min' => 500001,'max' => PHP_INT_MAX, 'S-1' => 'D', 'S-2' => 'E', 'S-3' => 'H', 'S-4' => 'K', 'I' => 'N', 'II' => 'Q', 'III' => 'R'],
        ];

        foreach ($rangos as $rango) {
            if ($unidades >= $rango['min'] && $unidades <= $rango['max']) {
                return $rango[$nivel] ?? null;
            }
        }

        return null;
    }

    /**
     * Obtiene la cantidad de muestras según letra y plan de muestreo.
     */
    private function obtenerCantidadMuestras($letra, $plan)
    {
        $tablas = [
            'reducido' => [
                'A' => 2, 'B' => 2, 'C' => 2, 'D' => 3, 'E' => 5, 'F' => 8, 'G' => 13,
                'H' => 20, 'J' => 32, 'K' => 50, 'L' => 80, 'M' => 125, 'N' => 200,
                'P' => 315, 'Q' => 500, 'R' => 800,
            ],
            'normal' => [
                'A' => 2, 'B' => 3, 'C' => 5, 'D' => 8, 'E' => 13, 'F' => 20, 'G' => 32,
                'H' => 50, 'J' => 80, 'K' => 125, 'L' => 200, 'M' => 315, 'N' => 500,
                'P' => 800, 'Q' => 1250, 'R' => 2000,
            ],
            'rigurosa' => [
                'A' => 2, 'B' => 3, 'C' => 5, 'D' => 8, 'E' => 13, 'F' => 20, 'G' => 32,
                'H' => 50, 'J' => 80, 'K' => 125, 'L' => 200, 'M' => 315, 'N' => 500,
                'P' => 800, 'Q' => 1250, 'R' => 2000, 'S' => 3150,
            ],
        ];

        return $tablas[$plan][$letra] ?? null;
    }
}
