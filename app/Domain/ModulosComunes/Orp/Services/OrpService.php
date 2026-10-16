<?php

namespace App\Domain\ModulosComunes\Orp\Services;

use App\Domain\ModulosComunes\Orp\Http\Requests\OrpRequest;
use App\Domain\ModulosComunes\Orp\Models\Orp;
use App\Domain\ModulosComunes\Orp\Models\OrpEstado;
use App\Domain\ModulosComunes\Productos\Models\ProductoTerminado;
use App\Domain\Sistema\Configuracion\Models\Estado;
use App\Domain\Sistema\Configuracion\Models\Ubicacion;
use App\Domain\Sistema\Configuracion\Models\Unidad;
use App\Domain\Sistema\Configuracion\Models\User;
use Illuminate\Container\Attributes\Auth;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;


class OrpService
{
    public function listarOrps(array $filtros = [], ?array $ubicacionesPermitidas = null): LengthAwarePaginator
    {
        $perPage = $filtros['per_page'] ?? 10;

        $query = Orp::with([
            'productoTerminado',
            'ubicacion',
            'usuarioCreador',
            'unidad',
            'historialEstados' => function ($query) {
                $query->latest()->take(1)->with('estado', 'usuario');
            }
        ]);

        if ($ubicacionesPermitidas !== null) {
            $query->whereIn('ubicacion_id', $ubicacionesPermitidas);
        }

        // Aplicar filtros
        if (!empty($filtros['search'])) {
            $query->where(function ($q) use ($filtros) {
                $q->where('codigo', 'LIKE', "%{$filtros['search']}%")
                    ->orWhere('lote', 'LIKE', "%{$filtros['search']}%");
            });
        }

        if (!empty($filtros['codigo'])) {
            $query->where('codigo', 'LIKE', "%{$filtros['codigo']}%");
        }

        if (!empty($filtros['lote'])) {
            $query->where('lote', 'LIKE', "%{$filtros['lote']}%");
        }

        if (!empty($filtros['producto_terminado'])) {
            $query->whereHas('productoTerminado', function ($q) use ($filtros) {
                $q->where('nombre_sap', 'LIKE', '%' . $filtros['producto_terminado'] . '%');
            });
        }

        if (!empty($filtros['ubicacion_id'])) {
            $query->where('ubicacion_id', $filtros['ubicacion_id']);
        }

        if (!empty($filtros['prioridad'])) {
            $query->where('prioridad', $filtros['prioridad']);
        }

        if (!empty($filtros['estado_id'])) {
            $query->whereHas('historialEstados', function ($q) use ($filtros) {
                $q->where('estado_id', $filtros['estado_id'])
                    ->whereRaw('fecha_hora = (SELECT MAX(fecha_hora) FROM orp_estados WHERE orp_id = orps.id)');
            });
        }

        if (!empty($filtros['destino_id'])) {
            $query->whereHas('productoTerminado', function ($q) use ($filtros) {
                $q->where('destino_id', $filtros['destino_id']);
            });
        }

        if (isset($filtros['revisado'])) {
            $query->where('revisado', $filtros['revisado']);
        }

        // NUEVO FILTRO POR FECHA DE VENCIMIENTO
        if (!empty($filtros['fecha_vencimiento_desde']) && !empty($filtros['fecha_vencimiento_hasta'])) {
            $query->whereBetween('fecha_vencimiento1', [
                $filtros['fecha_vencimiento_desde'],
                $filtros['fecha_vencimiento_hasta'],
            ]);
        } elseif (!empty($filtros['fecha_vencimiento_desde'])) {
            $query->whereDate('fecha_vencimiento1', '>=', $filtros['fecha_vencimiento_desde']);
        } elseif (!empty($filtros['fecha_vencimiento_hasta'])) {
            $query->whereDate('fecha_vencimiento1', '<=', $filtros['fecha_vencimiento_hasta']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function crearOrp(OrpRequest $request): Orp
    {
        return DB::transaction(function () use ($request) {
            $data = $request->validated();

            $user = auth()->user();

            // 🔥 Si NO es admin → forzar ubicación del usuario
            if (!$user->hasRole('Admin')) {
                $data['ubicacion_id'] = 1;
            }

            // 🔥 Si es admin → validar que venga
            // (opcional pero recomendado)
            if ($user->hasRole('Admin') && empty($data['ubicacion_id'])) {
                throw new \Exception('Debe seleccionar una ubicación');
            }


            $data['usuario_creador_id'] = auth()->id();
            $data['fecha_creacion'] = now();
            // Crear ORP
            $orp = Orp::create($data);


            // Registrar estado inicial (si se proporciona)
            $estado_orp = OrpEstado::create(
                [
                    'orp_id' => $orp->id,
                    'estado_id' => $this->getEstadoId('Pendiente'),
                    'usuario_id' => auth()->id(),
                    'fecha_hora' => now(),
                    'observaciones' => '-'
                ]
            );

            return $orp->load(['productoTerminado', 'ubicacion', 'usuarioCreador', 'unidad']);
        });
    }

    public function actualizarOrp($request, Orp $orp): bool
    {
        return $orp->update($request->validated());
    }

    public function cambiarEstado(Orp $orp, int $estadoId, int $usuarioId, string $observaciones = null): bool
    {
        return DB::transaction(function () use ($orp, $estadoId, $usuarioId, $observaciones) {
            // Registrar el cambio de estado en el historial
            $this->registrarCambioEstado($orp->id, $estadoId, $usuarioId, $observaciones);

            return true;
        });
    }

    private function registrarCambioEstado(int $orpId, int $estadoId, int $usuarioId, ?string $observaciones): void
    {
        OrpEstado::create([
            'orp_id' => $orpId,
            'estado_id' => $estadoId,
            'usuario_id' => $usuarioId,
            'fecha_hora' => now(),
            'observaciones' => $observaciones
        ]);
    }

    public function obtenerHistorialEstados(Orp $orp)
    {
        return $orp->historialEstados()
            ->with(['estado', 'usuario'])
            ->orderBy('fecha_hora', 'desc')
            ->get();
    }

    public function eliminarOrp(Orp $orp): ?bool
    {
        return $orp->delete();
    }

    public function actualizarCantidadProducida(Orp $orp, float $cantidadProducida): bool
    {
        return $orp->update(['cantidad_producida' => $cantidadProducida]);
    }

    /**
     * Importa ORPs desde archivo Excel o CSV
     */
    public function importarOrps(UploadedFile $archivo, int $usuarioCreadorId): array
    {
        \Log::info('=== DEBUG: INICIO IMPORTACIÓN ===');
        \Log::info('Nombre archivo: ' . $archivo->getClientOriginalName());
        \Log::info('Tamaño archivo: ' . $archivo->getSize() . ' bytes');

        $extension = $archivo->getClientOriginalExtension();
        \Log::info('Extensión detectada: ' . $extension);
        $registros = [];

        // Obtener usuario creador para obtener su ubicación
        $usuarioCreador = User::findOrFail($usuarioCreadorId);
        $ubicacionUsuario = $usuarioCreador->ubicacion;

        // Buscar unidad por defecto (UNIDAD)
        $unidadDefault = Unidad::where('nombre', 'UNIDAD')->first();

        if (in_array($extension, ['csv', 'txt'])) {
            \Log::info('Intentando leer como CSV...');
            $registros = $this->leerCsv($archivo);
        } elseif (in_array($extension, ['xlsx', 'xls'])) {
            \Log::info('Intentando leer como Excel...');
            $registros = $this->leerExcel($archivo);
        } else {
            \Log::error('Extensión no soportada: ' . $extension);
            throw new \Exception('Formato de archivo no soportado');
        }

        \Log::info('Cantidad de registros leídos: ' . count($registros));

        if (!empty($registros)) {
            \Log::debug('Primer registro (estructura):', $registros[0]);
            \Log::debug('Encabezados del primer registro:', array_keys($registros[0]));
        }

        // Inicializar arrays fuera del bucle
        $creados = 0;
        $creadosDetalle = [];
        $repetidos = [];
        $errores = [];

        DB::beginTransaction();
        try {
            foreach ($registros as $index => $registro) {
                try {
                    // Normalizar todas las claves del registro
                    $registroNormalizado = [];
                    foreach ($registro as $key => $value) {
                        $keyNormalizado = strtoupper($this->quitarAcentos(trim($key)));
                        $registroNormalizado[$keyNormalizado] = $value;
                    }
                    $registro = $registroNormalizado;

                    \Log::debug('Registro normalizado claves:', array_keys($registro));

                    // Validar campos requeridos
                    if (empty($registro['ORP']) || empty($registro['ITEM'])) {
                        throw new \Exception('Falta código ORP o Item');
                    }

                    $codigoOrp = $registro['ORP'];
                    $codigoProducto = $registro['ITEM'];

                    // VERIFICAR SI LA ORP YA EXISTE
                    $orpExistente = Orp::where('codigo', $codigoOrp)->first();
                    if ($orpExistente) {
                        $repetidos[] = [
                            'fila' => $index + 2,
                            'codigo' => $codigoOrp,
                            'producto' => $codigoProducto,
                            'descripcion' => $registro['DESCRIPCION DE PRODUCTO'] ?? '',
                            'razon' => 'ORP ya existe en el sistema'
                        ];
                        continue; // Saltar esta ORP, no crear
                    }

                    $productoTerminado = ProductoTerminado::where('codigo_sap', $codigoProducto)->first();

                    if (!$productoTerminado) {
                        throw new \Exception("Producto con código '{$codigoProducto}' no encontrado");
                    }

                    $comentarios = $registro['COMENTARIOS'] ?? '';
                    \Log::debug('Comentarios obtenidos:', [
                        'comentarios' => $comentarios,
                        'longitud' => strlen($comentarios)
                    ]);

                    // Extraer lote
                    $lote = $this->extraerLoteDeComentarios($comentarios);

                    // Si no se puede extraer lote, lanzar error
                    if ($lote === null) {
                        throw new \Exception('No se pudo extraer el lote de los comentarios');
                    }

                    // Parsear cantidad
                    $cantidadProgramada = $this->parsearCantidad($registro['PLANIFICADO'] ?? 0);

                    // Determinar prioridad
                    $prioridad = 'Normal';
                    $status = strtoupper($registro['STATUS'] ?? '');
                    if (str_contains($status, 'URGENTE')) {
                        $prioridad = 'urgente';
                    } elseif (str_contains($status, 'ALTA')) {
                        $prioridad = 'alta';
                    } elseif (str_contains($status, 'MEDIA')) {
                        $prioridad = 'media';
                    } elseif (str_contains($status, 'BAJA')) {
                        $prioridad = 'baja';
                    }

                    // Determinar ubicación
                    $ubicacionId = auth()->user()->ubicacion_id ?? $ubicacionUsuario->id;

                    // Crear ORP
                    $orpCreada = Orp::create([
                        'codigo' => $codigoOrp,
                        'producto_terminado_id' => $productoTerminado->id,
                        'lote' => $lote,
                        'prioridad' => $prioridad,
                        'cantidad_programada' => $cantidadProgramada,
                        'cantidad_producida' => 0,
                        'unidad_id' => $unidadDefault->id ?? null,
                        'tiempo_elaboracion' => null,
                        'revisado' => false,
                        'revisor_id' => null,
                        'fecha_revision' => null,
                        'usuario_creador_id' => $usuarioCreadorId,
                        'fecha_creacion' => now(),
                        'usuario_modificador_id' => $usuarioCreadorId,
                        'fecha_vencimiento1' => NULL,
                        'fecha_vencimiento2' => NULL,
                        'notas_internas' => null,
                        'ubicacion_id' => 1,
                        'observaciones' => $comentarios,
                    ]);

                    // Crear estado inicial
                    OrpEstado::create([
                        'orp_id' => $orpCreada->id,
                        'estado_id' => $this->getEstadoId('Pendiente'),
                        'usuario_id' => $usuarioCreadorId,
                        'fecha_hora' => now(),
                        'observaciones' => '-'
                    ]);

                    $creadosDetalle[] = [
                        'fila' => $index + 2,
                        'codigo' => $codigoOrp,
                        'producto' => $codigoProducto,
                        'descripcion' => $productoTerminado->nombre_comercial ?? '',
                        'lote' => $lote,
                        'cantidad' => $cantidadProgramada
                    ];

                    $creados++;
                } catch (\Throwable $e) {
                    $errores[] = [
                        'fila' => $index + 2,
                        'codigo' => $registro['ORP'] ?? 'N/A',
                        'producto' => $registro['ITEM'] ?? 'N/A',
                        'descripcion' => $registro['DESCRIPCION DE PRODUCTO'] ?? '',
                        'error' => $this->formatearMensajeError($e->getMessage()),
                        'solucion_sugerida' => $this->sugerirSolucion($e->getMessage(), $registro['ITEM'] ?? '')
                    ];
                }
            }

            DB::commit();

            // 📊 RESUMEN PARA LOGS
            \Log::info('=== RESUMEN IMPORTACIÓN ===', [
                'total_registros' => count($registros),
                'creados' => $creados,
                'repetidos' => count($repetidos),
                'errores' => count($errores),
                'creados_detalle_count' => count($creadosDetalle)
            ]);

            return [
                'creados' => $creados,
                'creados_detalle' => $creadosDetalle,
                'repetidos' => $repetidos,
                'errores' => $errores,
                'total_registros' => count($registros),
                'tiene_advertencias' => !empty($repetidos) || !empty($errores)
            ];
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function leerCsv(UploadedFile $archivo): array
    {
        $ruta = $archivo->getRealPath();
        $contenido = file_get_contents($ruta);

        if ($contenido === false || empty($contenido)) {
            \Log::warning('Archivo CSV vacío o no se pudo leer');
            return [];
        }
        // Detectar y convertir a UTF-8
        $encoding = mb_detect_encoding($contenido, ['UTF-8', 'ISO-8859-1', 'Windows-1252'], true);
        if ($encoding !== 'UTF-8') {
            $contenido = mb_convert_encoding($contenido, 'UTF-8', $encoding);
        }

        // Eliminar BOM (Byte Order Mark) si existe
        $bom = pack('H*', 'EFBBBF');
        $contenido = preg_replace("/^$bom/", '', $contenido);

        // Detectar delimitador
        $delimitadoresPosibles = [',', ';', "\t", '|'];
        $delimitador = ',';
        $maxCount = 0;

        foreach ($delimitadoresPosibles as $d) {
            $count = count(str_getcsv($contenido, $d));
            if ($count > $maxCount) {
                $maxCount = $count;
                $delimitador = $d;
            }
        }

        \Log::info("Delimitador detectado: '$delimitador'");

        // Crear lector CSV
        $csv = \League\Csv\Reader::createFromString($contenido);
        $csv->setDelimiter($delimitador);
        $csv->setHeaderOffset(0);

        // Obtener encabezados y normalizarlos
        $headers = $csv->getHeader();
        $headersNormalizados = array_map(function ($header) {
            $header = trim($header);
            $header = $this->quitarAcentos($header);
            return strtoupper($header);
        }, $headers);

        // Obtener registros como arrays asociativos con los headers originales
        $records = iterator_to_array($csv->getRecords());

        // Reemplazar las claves originales por las normalizadas
        $registros = [];
        foreach ($records as $record) {
            $nuevoRecord = [];
            foreach ($headers as $index => $headerOriginal) {
                $claveNormalizada = $headersNormalizados[$index];
                $nuevoRecord[$claveNormalizada] = $record[$headerOriginal] ?? null;
            }
            // Filtrar filas vacías (todas las columnas nulas o vacías)
            if (!empty(array_filter($nuevoRecord, fn($v) => !is_null($v) && $v !== ''))) {
                $registros[] = $nuevoRecord;
            }
        }

        \Log::info('Registros CSV procesados: ' . count($registros));
        if (!empty($registros)) {
            \Log::debug('Primer registro normalizado:', $registros[0]);
        }

        return $registros;
    }

    private function leerExcel(UploadedFile $archivo): array
    {
        \Log::debug('DEBUG leerExcel: Iniciando...');

        try {
            \Log::debug('DEBUG leerExcel: Llamando a Excel::toArray...');
            $data = Excel::toArray(null, $archivo);

            \Log::debug('DEBUG leerExcel: Número de hojas: ' . count($data));

            if (empty($data) || empty($data[0])) {
                \Log::warning('DEBUG leerExcel: Datos vacíos');
                return [];
            }

            $hoja = $data[0]; // Primera hoja
            \Log::debug('DEBUG leerExcel: Filas en hoja: ' . count($hoja));

            if (count($hoja) < 2) {
                \Log::warning('DEBUG leerExcel: Hoja tiene menos de 2 filas');
                return [];
            }

            // Primera fila son encabezados - MEJOR NORMALIZACIÓN
            $cabecera = array_map(function ($columna) {
                // Quitar acentos y convertir a mayúsculas
                $columna = $this->quitarAcentos(trim($columna));
                $columna = strtoupper($columna);
                return $columna;
            }, $hoja[0]);

            \Log::debug('DEBUG leerExcel: Encabezados normalizados:', $cabecera);

            \Log::debug('DEBUG leerExcel: Encabezados:', $cabecera);

            $registros = [];

            for ($i = 1; $i < count($hoja); $i++) {
                $fila = $hoja[$i];
                $registro = [];

                foreach ($cabecera as $index => $columna) {
                    $valor = $fila[$index] ?? null;
                    if ($valor instanceof \DateTime) {
                        $valor = $valor->format('d/m/Y');
                    }
                    $registro[$columna] = $valor;
                }

                $registros[] = $registro;
            }

            \Log::debug('DEBUG leerExcel: Registros procesados: ' . count($registros));

            if (!empty($registros)) {
                \Log::debug('DEBUG leerExcel: Primer registro:', $registros[0]);
            }

            return $registros;
        } catch (\Throwable $e) {
            \Log::error('DEBUG leerExcel: ERROR: ' . $e->getMessage());
            \Log::error('DEBUG leerExcel: TRACE: ' . $e->getTraceAsString());
            return [];
        }
    }

    private function extraerLoteDeComentarios(?string $comentarios): ?float
    {
        logger()->debug('=== DEBUG EXTRACCIÓN LOTE ===', [
            'comentarios' => $comentarios,
            'tipo' => gettype($comentarios)
        ]);

        if (empty($comentarios)) {
            logger()->warning('Comentarios vacíos, lote será null');
            return null;
        }

        // Normalizar: asegurar que esté en mayúsculas
        $comentariosUpper = strtoupper($comentarios);
        logger()->debug('Comentarios normalizados:', ['texto' => $comentariosUpper]);

        // Buscar "11.55 LOTES" - Ajusta el patrón
        if (preg_match('/(\d+(?:\.\d+)?)\s*(?:LOTE|LOTES)\b/', $comentariosUpper, $matches)) {
            logger()->debug('Patrón LOTE encontrado:', $matches);
            return (float) $matches[1];
        }
        // Buscar "8.54 MIX"
        elseif (preg_match('/(\d+(?:\.\d+)?)\s*(?:MIX)\b/', $comentariosUpper, $matches)) {
            logger()->debug('Patrón MIX encontrado:', $matches);
            return (float) $matches[1] * 0.108;
        }
        // Buscar sin espacio: "11.55LOTES"
        elseif (preg_match('/(\d+(?:\.\d+)?)LOTE/', $comentariosUpper, $matches)) {
            logger()->debug('Patrón sin espacio encontrado:', $matches);
            return (float) $matches[1];
        }

        logger()->warning('No se encontró patrón de lote en comentarios');
        return null;
    }

    private function parsearCantidad($valor): ?float
    {
        logger()->debug('=== PARSEAR CANTIDAD ===', [
            'valor_original' => $valor,
            'tipo' => gettype($valor)
        ]);

        if (is_null($valor) || $valor === '' || $valor === 0) {
            logger()->warning('Valor nulo o vacío, retornando null');
            return null;
        }

        // Si ya es numérico (como 172500 del Excel)
        if (is_numeric($valor)) {
            logger()->debug('Ya es numérico, convirtiendo a float:', ['resultado' => (float)$valor]);
            return (float) $valor;
        }

        // Si es string
        $valorStr = (string) $valor;
        logger()->debug('Valor como string:', ['string' => $valorStr]);

        // CASO ESPECÍFICO para "172.500,00" → 172500.00
        // Eliminar puntos de miles, convertir coma decimal a punto
        $valorStr = str_replace('.', '', $valorStr);
        $valorStr = str_replace(',', '.', $valorStr);

        logger()->debug('Después de limpiar:', ['limpio' => $valorStr]);

        // Eliminar caracteres no numéricos excepto punto y signo negativo
        $valorStr = preg_replace('/[^0-9\.\-]/', '', $valorStr);

        logger()->debug('Después de regex:', ['final' => $valorStr]);

        $resultado = (float) $valorStr;
        logger()->debug('Resultado final:', ['float' => $resultado]);

        return $resultado;
    }



    private function parsearFecha(?string $fecha): ?\DateTime
    {
        if (empty($fecha)) {
            return null;
        }

        try {
            // Intentar diferentes formatos
            $formatos = ['d/m/Y', 'Y-m-d', 'm/d/Y', 'd-m-Y'];

            foreach ($formatos as $formato) {
                $date = \DateTime::createFromFormat($formato, $fecha);
                if ($date !== false) {
                    return $date;
                }
            }

            return null;
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function getEstadoId(string $nombreEstado): int
    {
        return Estado::firstOrCreate(
            ['nombre' => $nombreEstado],
            ['descripcion' => 'Generado automáticamente', 'color' => '#9ca3af']
        )->id;
    }
    // AGREGA ESTE NUEVO MÉTODO a la clase OrpService:
    private function quitarAcentos(string $texto): string
    {
        $texto = str_replace(
            ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'Á', 'É', 'Í', 'Ó', 'Ú', 'Ñ'],
            ['a', 'e', 'i', 'o', 'u', 'n', 'A', 'E', 'I', 'O', 'U', 'N'],
            $texto
        );
        return $texto;
    }
    private function formatearMensajeError(string $mensajeError): string
    {
        $mensajes = [
            'Attempt to read property "id" on null' => 'Producto no encontrado en la base de datos',
            'Column \'lote\' cannot be null' => 'No se pudo extraer el lote de los comentarios',
            'Producto con código' => 'Producto no encontrado',
            'ORP ya existe' => 'La ORP ya está registrada',
        ];

        foreach ($mensajes as $buscar => $reemplazar) {
            if (strpos($mensajeError, $buscar) !== false) {
                return $reemplazar;
            }
        }

        return $mensajeError;
    }
    // Agrega este método para sugerir soluciones
    private function sugerirSolucion(string $error, string $codigoProducto): string
    {
        if (str_contains($error, 'Producto no encontrado')) {
            return "Agregar el producto con código '{$codigoProducto}' a la base de datos primero";
        }

        if (str_contains($error, 'ORP ya existe')) {
            return "La ORP ya está registrada. Verificar si necesita actualizarse";
        }

        if (str_contains($error, 'lote')) {
            return "Revisar el formato de los comentarios para extraer el lote";
        }

        return "Contactar al administrador del sistema";
    }
}
