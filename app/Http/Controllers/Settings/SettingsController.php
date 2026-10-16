<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class SettingsController extends Controller
{
    public function updatePreferences(Request $request): JsonResponse
    {
        $request->validate([
            'appearance' => ['required', Rule::in(['light', 'dark', 'system'])],
            'theme' => ['required', 'string', 'max:50'], // Permitir cualquier string para flexibilidad
        ]);

        $user = Auth::user();
        $currentPreferences = $user->preferencias ?? [];
        if (!is_array($currentPreferences)) {
            $currentPreferences = [];
        }

        $user->update([
            'preferencias' => array_merge($currentPreferences, [
                'appearance' => $request->appearance,
                'theme' => $request->theme,
            ])
        ]);

        return response()->json([
            'message' => 'Preferencias actualizadas correctamente.',
            'preferences' => $user->fresh()->preferencias,
        ]);
    }
}