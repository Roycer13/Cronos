<?php

namespace App\Domain\ModulosComunes\Old\Http\Controllers;

use App\Domain\ModulosComunes\Old\Models\OldItem;
use App\Domain\ModulosComunes\Old\Models\OldSubarea;
use App\Domain\ModulosComunes\Old\Services\OldItemService;
use App\Domain\ModulosComunes\Old\Http\Requests\StoreOldItemRequest;
use App\Domain\ModulosComunes\Old\Http\Requests\UpdateOldItemRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

class OldItemController extends Controller
{
    protected $service;

    public function __construct(OldItemService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $query = OldItem::with('subarea.area')->latest();

        if ($request->filled('search')) {
            $query->where('nombre', 'like', "%{$request->search}%");
        }

        if ($request->filled('subarea_id')) {
            $query->where('old_subarea_id', $request->subarea_id);
        }

        if ($request->filled('area_id')) {
            $query->whereHas('subarea.area', function ($q) use ($request) {
                $q->where('id', $request->area_id);
            });
        }

        return Inertia::render('comunes/old/items/index', [
            'items' => $query->paginate(10),

            'subareas' => OldSubarea::select('id', 'nombre')->get(),


            'areas' => \App\Domain\ModulosComunes\Old\Models\OldArea::select('id', 'nombre')->get(),

            'filtros' => $request->only('search', 'subarea_id', 'area_id')
        ]);
    }
    public function create()
    {
        return Inertia::render('comunes/old/items/create', [
            'subareas' => OldSubarea::select('id', 'nombre')->get()
        ]);
    }

    public function edit(OldItem $oldItem)
    {
        return Inertia::render('comunes/old/items/edit', [
            'item' => $oldItem,
            'subareas' => OldSubarea::select('id', 'nombre')->get()
        ]);
    }

    public function store(StoreOldItemRequest $request)
    {
        $this->service->create($request->validated());

        return redirect()->route('old-items.index')
            ->with('success', 'Item creado');
    }

    public function show(OldItem $oldItem)
    {
        return response()->json($oldItem->load('subarea'));
    }

    public function update(UpdateOldItemRequest $request, OldItem $oldItem)
    {
        $this->service->update($oldItem, $request->validated());

        return redirect()->route('old-items.index')
            ->with('success', 'Item actualizado');
    }

    public function destroy(OldItem $oldItem)
    {
        $oldItem->delete();

        return redirect()->route('old-items.index')
            ->with('success', 'Item eliminado');
    }
    public function reporte(Request $request)
    {
        $query = OldItem::with('subarea.area');

        if ($request->filled('subarea_id')) {
            $query->where('old_subarea_id', $request->subarea_id);
        }

        if ($request->filled('area_id')) {
            $query->whereHas('subarea.area', function ($q) use ($request) {
                $q->where('id', $request->area_id);
            });
        }

        return Inertia::render('comunes/old/items/reporte', [
            'items' => $query->get(),
            'subareas' => OldSubarea::select('id', 'nombre')->get(),
            'areas' => \App\Domain\ModulosComunes\Old\Models\OldArea::select('id', 'nombre')->get(),
            'filtros' => $request->all()
        ]);
    }
}
