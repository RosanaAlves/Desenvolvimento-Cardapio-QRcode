<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

Route::get('/', function () {
    return view('welcome');
});

// API SIMPLIFICADA - SEM TRY/CATCH COMPLEXO
Route::get('/api/categorias', function() {
    $categorias = DB::table('categorias')
                   ->where('disponivel', 1)
                   ->get();
    return $categorias;
});

Route::get('/api/produtos', function() {
    $produtos = DB::table('produtos')
                 ->where('disponivel', 1)
                 ->get();
    return $produtos;
});

// Rota de teste básica
Route::get('/api/test', function() {
    return response()->json(['status' => 'OK', 'message' => 'API funcionando']);
});

// Adicione estas rotas extras no routes/web.php:

// Produtos por categoria
Route::get('/api/categorias/{id}/produtos', function($id) {
    $produtos = DB::table('produtos')
                 ->where('categoria_id', $id)
                 ->where('disponivel', 1)
                 ->get();
    return response()->json($produtos);
});

// Produto específico
Route::get('/api/produtos/{id}', function($id) {
    $produto = DB::table('produtos')
                ->where('id', $id)
                ->first();
    return response()->json($produto);
});