<?php

use Illuminate\Support\Facades\Route;
use App\Models\Categoria;
use App\Models\Produto;

Route::get('/test', function() {
    return response()->json([
        'message' => 'API do Cardápio Online funcionando!',
        'status' => 'success'
    ]);
});

Route::get('/categorias', function() {
    try {
        $categorias = Categoria::with(['produtos' => function($query) {
            $query->where('disponivel', true);
        }])->get();
        
        return response()->json([
            'success' => true,
            'data' => $categorias,
            'count' => $categorias->count()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
});

Route::get('/produtos', function() {
    try {
        $produtos = Produto::with('categoria')
                          ->where('disponivel', true)
                          ->get();
        
        return response()->json([
            'success' => true,
            'data' => $produtos,
            'count' => $produtos->count()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
});
