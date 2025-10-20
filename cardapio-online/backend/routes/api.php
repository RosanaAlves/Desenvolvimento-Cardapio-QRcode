<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

// CONTROLLERS PÚBLICOS
use App\Http\Controllers\Api\Cliente\CardapioController as ClienteCardapioController;

// CONTROLLERS PRIVADOS (GARÇOM E ADMIN)
use App\Http\Controllers\Api\Garcom\CardapioController;
use App\Http\Controllers\Api\Garcom\CategoriaController;
use App\Http\Controllers\Api\Garcom\DashboardController;
use App\Http\Controllers\Api\Garcom\MesaController;
use App\Http\Controllers\Api\Garcom\PedidoController;

use App\Http\Controllers\Api\Admin\ConfiguracaoController;
use App\Http\Controllers\Api\Admin\ExpedienteController;
use App\Http\Controllers\Api\Admin\RelatorioController;
use App\Http\Controllers\Api\Admin\PedidoController as AdminPedidoController;
use App\Http\Controllers\Api\Admin\ProdutoController as AdminProdutoController;
use App\Http\Controllers\Api\Admin\CategoriaController as AdminCategoriaController;
use App\Http\Controllers\Api\Admin\MesaController as AdminMesaController;
use App\Http\Controllers\Api\Admin\ImpressaoController;

// =========================================================================
// ROTAS DE AUTENTICAÇÃO
// =========================================================================

Route::post('/login', [AuthController::class, 'login']);

// =========================================================================
// ROTAS PÚBLICAS - CARDÁPIO DO CLIENTE
// =========================================================================

Route::prefix('cliente')->group(function () {
    Route::get('/cardapio', [ClienteCardapioController::class, 'categorias']);
    Route::get('/produtos', [ClienteCardapioController::class, 'produtos']);
    Route::get('/categorias/{categoriaId}/produtos', [ClienteCardapioController::class, 'produtosPorCategoria']);
    Route::get('/produtos/{id}', [ClienteCardapioController::class, 'show']);
});

// =========================================================================
// ROTAS PROTEGIDAS (PRECISAM DE LOGIN)
// =========================================================================

Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // --- ROTAS DO GARÇOM ---
    Route::prefix('garcom')->middleware('check.role:garcom,administrador')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/cardapio', [CardapioController::class, 'index']);
        Route::get('/cardapio/buscar/{termo}', [CardapioController::class, 'buscarProdutos']);
        Route::get('/mesas/status', [MesaController::class, 'status']);
        Route::post('/mesas/{id}/ocupar', [MesaController::class, 'ocupar']);
        Route::post('/mesas/{id}/liberar', [MesaController::class, 'liberar']);
        Route::get('/mesas/{id}/pode-fechar-conta', [MesaController::class, 'podeFecharConta']);
        Route::post('/mesas/{id}/fechar-conta', [MesaController::class, 'fecharConta']);
        Route::post('/mesas/{id}/reabrir-conta', [MesaController::class, 'reabrirConta']);
        Route::get('/mesas/{id}/status-conta', [MesaController::class, 'statusConta']);
        Route::post('/pedidos', [PedidoController::class, 'store']);
    });

    // --- ROTAS DO ADMIN ---
    Route::prefix('admin')->middleware('check.role:administrador')->group(function () {
        Route::get('/dashboard', [ConfiguracaoController::class, 'dashboard']);
        Route::get('/configuracoes', [ConfiguracaoController::class, 'index']);
        Route::put('/configuracoes', [ConfiguracaoController::class, 'update']);
        Route::post('/configuracoes/reiniciar-sistema', [ConfiguracaoController::class, 'reiniciarSistema']);
        Route::get('/expediente/status', [ExpedienteController::class, 'status']);
        Route::post('/expediente/abrir', [ExpedienteController::class, 'abrirExpediente']);
        Route::post('/expediente/fechar', [ExpedienteController::class, 'fecharExpediente']);
        Route::post('/expediente/relatorio', [ExpedienteController::class, 'relatorioPorData']);
        Route::get('/pedidos', [AdminPedidoController::class, 'index']);
        Route::get('/pedidos/{id}', [AdminPedidoController::class, 'show']);
        Route::put('/pedidos/{id}/status', [AdminPedidoController::class, 'updateStatus']);
        Route::post('/pedidos/{id}/cancelar', [AdminPedidoController::class, 'cancelar']);
        Route::get('/pedidos/estatisticas', [AdminPedidoController::class, 'estatisticas']);
        Route::get('/mesas', [AdminMesaController::class, 'index']);
        Route::post('/mesas/{id}/pagar-conta', [AdminMesaController::class, 'pagarConta']);
        Route::post('/mesas/{id}/liberar', [AdminMesaController::class, 'liberarMesa']);
        Route::get('/mesas/estatisticas', [AdminMesaController::class, 'estatisticas']);
        Route::get('/mesas/{id}', [AdminMesaController::class, 'show']);
        Route::post('/mesas/{id}/fechar-conta', [AdminMesaController::class, 'fecharConta']);
        Route::resource('/produtos', AdminProdutoController::class)->except(['create', 'edit']);
        Route::resource('/categorias', AdminCategoriaController::class)->except(['create', 'edit']);
        Route::get('/impressao/pedido/{id}/termica', [ImpressaoController::class, 'imprimirPedidoTermica']);
        Route::get('/impressao/pedido/{id}/compacto', [ImpressaoController::class, 'imprimirPedidoCompacto']);
        
        // ✅ CORREÇÃO: Rotas de relatório apontando para os métodos corretos
        Route::post('/relatorios/vendas-por-periodo', [RelatorioController::class, 'vendasPorPeriodo']);
        Route::post('/relatorios/produtos-mais-vendidos', [RelatorioController::class, 'produtosMaisVendidos']);
    });
});

// =========================================================================
// ROTA DE FALLBACK
// =========================================================================
Route::fallback(function() {
    return response()->json([
        'success' => false,
        'message' => 'Endpoint não encontrado'
    ], 404);
});