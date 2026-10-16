<?php

namespace App\Domain\ModulosComunes\Documentacion\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\ModulosComunes\Documentacion\Http\Requests\StoreDistribucionRequest;
use App\Domain\ModulosComunes\Documentacion\Models\Documento;
use App\Domain\ModulosComunes\Documentacion\Services\DistribucionService;
use App\Domain\ModulosComunes\Documentacion\Models\DistribucionDocumento;

use Inertia\Inertia;
use Illuminate\Http\Request;

class DistribucionDocumentoController extends Controller
{
    protected $service;

    public function __construct(DistribucionService $service)
    {
        $this->service = $service;
    }

    public function store(StoreDistribucionRequest $request, Documento $documento)
    {
        $data = $request->validated();
        $dist = $this->service->createDistribucion($documento, $data);
        return back()->with('success', 'Distribución registrada');
    }

    public function grantAccess(DistribucionDocumento $dist, Request $request)
    {
        $userId = $request->input('user_id');
        $from = $request->input('from') ? \Carbon\Carbon::parse($request->input('from')) : now();
        $to = $request->input('to') ? \Carbon\Carbon::parse($request->input('to')) : null;

        $this->service->grantAccess($dist, $userId, $from, $to);

        return back()->with('success', 'Acceso otorgado');
    }

    public function revokeAccess(DistribucionDocumento $dist)
    {
        $this->service->revokeAccess($dist);
        return back()->with('success', 'Acceso revocado');
    }

    public function registerDownload(DistribucionDocumento $dist)
    {
        $this->service->registerDownload($dist);
        return response()->json(['ok' => true, 'downloads' => $dist->fresh()->cantidad_descargas]);
    }
}
