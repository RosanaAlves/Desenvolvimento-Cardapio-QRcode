<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProdutoController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\PedidoController;

// Rotas do MVP
Route::get('/categorias', [CategoriaController::class, 'index']);
Route::get('/produtos', [ProdutoController::class, 'index']);
Route::get('/produtos/categoria/{id}', [ProdutoController::class, 'porCategoria']);
Route::post('/pedidos', [PedidoController::class, 'store']);