<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )

    ->withMiddleware(function (Middleware $middleware) {
        // 🔒 Middleware globales que se ejecutan en el stack web
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class, // Personaliza el tema o apariencia
            HandleInertiaRequests::class, // 👈 Aquí se definen los props globales de Inertia
            AddLinkHeadersForPreloadedAssets::class, // Mejora rendimiento con preload
        ]);

        // 👇 Alias para middlewares de Spatie Permission
        // Permite usar en rutas: ->middleware('role:admin') o ->middleware('permission:crear_usuarios')
        $middleware->alias([
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
        ]);
    })

    ->withExceptions(function (Exceptions $exceptions) {
        // ⚠️ Aquí puedes personalizar el manejo de errores globales si lo necesitas
    })

    ->create();
