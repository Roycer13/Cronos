<?php

namespace App\Domain\Sistema\Configuracion\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\Sistema\Configuracion\Http\Requests\EstadoRequest;
use App\Domain\Sistema\Configuracion\Models\Estado;
use Illuminate\Http\Request;

class EstadoController extends Controller
{
    /**
     * Mostrar todos los estados (respuesta JSON pura para Axios o API).
     */
    public function index()
    {
        return response()->json(Estado::all());
    }

    /**
     * Crear un nuevo estado.
     */
    public function store(EstadoRequest $request)
    {
        $estado = Estado::create($request->validated());
        return response()->json($estado);
    }

    /**
     * Actualizar un estado existente.
     */
    public function update(EstadoRequest $request, Estado $estado)
    {
        $estado->update($request->validated());
        return response()->json($estado);
    }

    /**
     * Eliminar un estado.
     */
    public function destroy(Estado $estado)
    {
        $estado->delete();
        return response()->json(['success' => true]);
    }
}
