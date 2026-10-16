<?php

namespace App\Domain\ModulosComunes\Documentacion\Http\Controllers;

use App\Domain\ModulosComunes\Documentacion\Models\RevisionDocumento;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RevisionDocumentoController extends Controller
{
    public function index()
    {
        $revisiones = RevisionDocumento::with('documento','responsable')->orderBy('proxima_fecha_revision')->paginate(25);
        return Inertia::render('Revisiones/Index', compact('revisiones'));
    }

    public function complete(RevisionDocumento $revision, Request $request)
    {
        $revision->update($request->only(['analisis_vigencia','evaluacion_efectividad','modificaciones_proceso','retroalimentacion','decision','justificacion','proxima_fecha_revision']));
        // if decision is Obsoleto -> update documento
        if ($revision->decision === 'Obsoleto') {
            $revision->documento->update(['estado' => 'obsoleto']);
        }
        return back()->with('success', 'Revisión registrada');
    }
}
