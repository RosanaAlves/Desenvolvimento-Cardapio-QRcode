<?php

namespace App\Http;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Não autenticado.'], 401);
        }

        $user = Auth::user();

        // Supondo que você tenha uma coluna 'role' ou 'tipo' no seu model User
        // Ex: 'admin', 'garcom'
        foreach ($roles as $role) {
            if ($user->role == $role) {
                return $next($request);
            }
        }

        return response()->json(['message' => 'Acesso não autorizado.'], 403);
    }
}