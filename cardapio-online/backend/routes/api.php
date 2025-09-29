<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\ProdutoController;

Route::get('/categorias', [CategoriaController::class, 'index']);
Route::get('/produtos', [ProdutoController::class, 'index']);

// Rota de teste
Route::get('/test', function() {
    return response()->json(['message' => 'API do Cardápio Online funcionando!']);
});