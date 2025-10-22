<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class GarcomAuth
{
    public function handle(Request $request, Closure $next)
    {
        // Desabilita CSRF apenas para rotas do garçom
        if ($request->is('api/garcom/*')) {
            config(['session.driver' => 'array']);
        }
        
        return $next($request);
    }
}