<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminOrPermission
{
    public function handle(Request $request, Closure $next, $permission)
    {
        $user = $request->user();

        if ($user && ($user->hasRole('admin') || $user->can($permission))) {
            return $next($request);
        }

        abort(403);
    }
}
