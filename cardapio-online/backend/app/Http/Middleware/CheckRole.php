<?php

namespace App\Http\Middleware; // Se você mudou o namespace, use o seu.

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Não autenticado.'], 401);
        }

        $user = Auth::user();

        // 1. ✅ Verificar se o usuário está ATIVO (Adicionado)
        if (!$user->isAtivo()) {
            return response()->json(['message' => 'Sua conta está inativa. Acesso negado.'], 403);
        }

        // 2. ✅ Verificar o PAPEL (TIPO)
        foreach ($roles as $role) {
            // Agora usamos o método hasRole() que verifica a coluna 'tipo'
            if ($user->hasRole($role)) { 
                return $next($request);
            }
        }

        return response()->json(['message' => 'Acesso não autorizado para esta função.'], 403);
    }
}