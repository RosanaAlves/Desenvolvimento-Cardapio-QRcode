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