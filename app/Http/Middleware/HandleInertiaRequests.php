<?php

namespace App\Http\Middleware;

use Inertia\Middleware;
use Illuminate\Http\Request;
use Illuminate\Foundation\Inspiring;

class HandleInertiaRequests extends Middleware
{
    /**
     * La vista raíz cargada en la primera visita.
     */
    protected $rootView = 'app';

    /**
     * Versión actual de los assets.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Props globales compartidas con todas las vistas Inertia.
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');
        $user = $request->user();

        // ✅ Datos del usuario autenticado
        $userData = $user ? [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            // Roles (Spatie)
            'roles' => $user->getRoleNames()->toArray(),
            // Permisos (Spatie)
            'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
            // ubicacion
            'ubicacion' => $user->ubicacion ? [
                'id' => $user->ubicacion->id,
                'nombre' => $user->ubicacion->nombre,
            ] : null,
        ] : null;

        return array_merge(parent::share($request), [
            // 🔹 Información general
            'name' => config('app.name'),
            'quote' => [
                'message' => trim($message),
                'author' => trim($author),
            ],

            // 🔹 Usuario (modo directo y compatibilidad)
            'user' => fn() => $userData,
            'auth' => fn() => [
                'user' => $userData,
            ],

            // 🔹 Mensajes flash
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
                'info' => fn() => $request->session()->get('info'),
                'warning' => fn() => $request->session()->get('warning'),
                'import_result' => fn() => $request->session()->get('import_result'), // <-- Añade esto
            ],

            // 🔹 Estado del sidebar (guardado en cookie)
            'sidebarOpen' => fn() =>
            !$request->hasCookie('sidebar_state') ||
                $request->cookie('sidebar_state') === 'true',
        ]);
    }
}
