<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class GarcomCors
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);
        
        // Adiciona headers CORS
        $response->headers->set('Access-Control-Allow-Origin', 'http://localhost:3000');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');
        
        return $response;
    }
}