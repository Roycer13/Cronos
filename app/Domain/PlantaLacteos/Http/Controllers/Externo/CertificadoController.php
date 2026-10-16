<?php

namespace App\Domain\PlantaLacteos\Http\Controllers\Externo;

use App\Domain\PlantaLacteos\Models\ExtDetalleSolicitudAnalisis;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CertificadoController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = ExtDetalleSolicitudAnalisis::query()
            ->with([
                'solicitud.user',
                'productoTerminado',
                'tipoMuestra',
                'microbiologias',
                'actividadAgua',
                'aguaFisico',
            ])
            ->whereHas('solicitud', function ($q) use ($user) {
                $q->where('ubicacion_id', $user->ubicacion_id);
            });

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('subcodigo', 'like', "%{$search}%")
                    ->orWhereHas('productoTerminado', function ($producto) use ($search) {
                        $producto->where('nombre_comercial', 'like', "%{$search}%")
                            ->orWhere('nombre', 'like', "%{$search}%");
                    })
                    ->orWhereHas('solicitud', function ($solicitud) use ($search) {
                        $solicitud->where('codigo', 'like', "%{$search}%" );
                    });
            });
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('tipo_analisis')) {
            $query->where('tipo_analisis', $request->tipo_analisis);
        }

        if ($request->filled('emitido')) {
            $query->where('certificado_emitido', $request->boolean('emitido'));
        }

        $detalles = $query
            ->orderByDesc('id')
            ->get();

        return Inertia::render('planta_lacteos/externo/certificados/index', [
            'detalles' => $detalles,
            'filters' => [
                'search' => $request->input('search', ''),
                'estado' => $request->input('estado', ''),
                'tipo_analisis' => $request->input('tipo_analisis', ''),
                'emitido' => $request->input('emitido', ''),
            ],
            'flash' => ['success' => session('success'), 'error' => session('error')],
        ]);
    }

    public function emitir(Request $request, ExtDetalleSolicitudAnalisis $detalle)
    {
        $detalle->update([
            'certificado_emitido' => true,
            'certificado_emitido_en' => now(),
        ]);

        return back()->with('success', 'Certificado emitido correctamente.');
    }
}
