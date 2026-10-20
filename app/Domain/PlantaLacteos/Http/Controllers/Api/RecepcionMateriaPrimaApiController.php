<?php

namespace App\Domain\PlantaLacteos\Http\Controllers\Api;

use App\Domain\PlantaLacteos\Http\Requests\InformeMateriaPrimaRequest;
use App\Domain\PlantaLacteos\Services\InformeMateriaPrimaService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Web service de solo lectura para materia prima (autenticación por token Sanctum).
 * Reutiliza InformeMateriaPrimaService: mismos totales y mismo alcance por ubicación
 * que la pantalla web.
 */
class RecepcionMateriaPrimaApiController extends Controller
{
    private const HABILIDAD = 'materia-prima:read';
    private const MAX_POR_PAGINA = 100;

    public function __construct(private InformeMateriaPrimaService $servicio)
    {
    }

    /** Admin ve todo; el resto solo su ubicación (igual que el módulo web). */
    private function ubicacionId(Request $request): ?int
    {
        $user = $request->user();

        return $user->hasRole('admin') ? null : $user->ubicacion_id;
    }

    private function exigirHabilidad(Request $request): void
    {
        abort_unless($request->user()->tokenCan(self::HABILIDAD), 403, 'El token no tiene la habilidad ' . self::HABILIDAD . '.');
    }

    private function agregado($g): array
    {
        return [
            'recepciones' => (int) $g->recepciones,
            'total_kg' => (float) $g->total_kg,
            'sin_kg' => (int) $g->sin_kg,
        ];
    }

    /** GET /api/v1/materia-prima/informe — totales por materia prima, proveedor y estado. */
    public function informe(InformeMateriaPrimaRequest $request): JsonResponse
    {
        $this->exigirHabilidad($request);

        $filtros = $request->validated();
        $r = $this->servicio->resumen($filtros, $this->ubicacionId($request));

        return response()->json([
            'filtros' => $filtros,
            'general' => $this->agregado($r['general']),
            'por_materia_prima' => $r['por_item']->map(fn ($g) => [
                'id' => $g->item_materia_prima_id,
                'nombre' => $g->itemMateriaPrima?->nombre,
            ] + $this->agregado($g))->values(),
            'por_proveedor' => $r['por_proveedor']->map(fn ($g) => [
                'id' => $g->proveedor_materia_prima_id,
                'nombre' => $g->proveedorMateriaPrima?->nombre,
            ] + $this->agregado($g))->values(),
            'por_estado' => $r['por_estado']->map(fn ($g) => [
                'id' => $g->estado_id,
                'nombre' => $g->estado?->nombre,
            ] + $this->agregado($g))->values(),
        ]);
    }

    /** GET /api/v1/materia-prima/recepciones — detalle paginado (máx. 100 por página). */
    public function recepciones(InformeMateriaPrimaRequest $request): JsonResponse
    {
        $this->exigirHabilidad($request);

        $filtros = $request->validated();
        $porPagina = min((int) ($filtros['per_page'] ?? 25), self::MAX_POR_PAGINA);

        $pagina = $this->servicio->detalle($filtros, $this->ubicacionId($request), $porPagina);

        // Solo los campos necesarios: no se exponen usuarios ni datos internos.
        $pagina->getCollection()->transform(fn ($r) => [
            'id' => $r->id,
            'fecha' => $r->tiempo ? \Carbon\Carbon::parse($r->tiempo)->toIso8601String() : null,
            'materia_prima' => $r->itemMateriaPrima?->nombre,
            'proveedor' => $r->proveedorMateriaPrima?->nombre,
            'total_kg' => $r->cantidad_recepcionada_total_kg !== null ? (float) $r->cantidad_recepcionada_total_kg : null,
            'estado' => $r->estado?->nombre,
            'liberacion' => $r->liberacion?->nombre,
            'certificado' => (bool) $r->certificado,
            'lotes' => $r->recepcionLotes->map(fn ($l) => [
                'lote' => $l->lote,
                'fecha_vencimiento' => $l->fecha_vencimiento,
                'total_kg' => $l->cantidad_recepcionada_total_kg !== null ? (float) $l->cantidad_recepcionada_total_kg : null,
            ])->values(),
        ]);

        return response()->json($pagina);
    }
}