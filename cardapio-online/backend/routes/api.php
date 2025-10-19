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

// Rota de Login (é pública, por isso fica fora do grupo)
Route::post('/login', [AuthController::class, 'login']);

// =========================================================================
// ROTAS PÚBLICAS - CARDÁPIO DO CLIENTE
// =========================================================================

Route::prefix('cliente')->group(function () {
    Route::get('/cardapio', [ClienteCardapioController::class, 'categorias']);
    Route::get('/categorias', [ClienteCardapioController::class, 'categorias']);
    Route::get('/produtos', [ClienteCardapioController::class, 'produtos']);
    Route::get('/categorias/{categoriaId}/produtos', [ClienteCardapioController::class, 'produtosPorCategoria']);
    Route::get('/produtos/{id}', [ClienteCardapioController::class, 'show']);
});

// =========================================================================
// ROTAS PROTEGIDAS (PRECISAM DE LOGIN)
// =========================================================================

Route::middleware('auth:sanctum')->group(function () {
    
    // Rotas para gerenciar o próprio usuário logado
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // --- ROTAS DO GARÇOM (AGORA PROTEGIDAS) ---
    Route::prefix('garcom')->group(function () {
        // CARDÁPIO
        Route::get('/cardapio/categorias', [CardapioController::class, 'categorias']);
        Route::get('/cardapio', [CardapioController::class, 'index']);
        Route::get('/cardapio/produtos', [CardapioController::class, 'produtos']);
        Route::get('/cardapio/categorias/{categoriaId}/produtos', [CardapioController::class, 'produtosPorCategoria']);
        Route::get('/cardapio/buscar/{termo}', [CardapioController::class, 'buscarProdutos']);
        
        // MESAS
        Route::get('/mesas', [MesaController::class, 'index']);
        Route::get('/mesas/status', [MesaController::class, 'status']);
        Route::get('/mesas/{mesaId}/pedidos', [MesaController::class, 'pedidos']);
        Route::post('/mesas/{id}/ocupar', [MesaController::class, 'ocupar']);
        Route::post('/mesas/{id}/liberar', [MesaController::class, 'liberar']);
        Route::get('/mesas/{id}/pode-fechar-conta', [MesaController::class, 'podeFecharConta']);
        Route::post('/mesas/{id}/fechar-conta', [MesaController::class, 'fecharConta']);
        Route::post('/mesas/{id}/reabrir-conta', [MesaController::class, 'reabrirConta']);
        Route::get('/mesas/{id}/status-conta', [MesaController::class, 'statusConta']);
        
        // PEDIDOS - GARÇOM
        Route::post('/pedidos', [PedidoController::class, 'store']);
        Route::get('/pedidos/{id}', [PedidoController::class, 'show']);
        Route::post('/pedidos/{id}/cancelar', [PedidoController::class, 'cancelar']);
        Route::get('/pedidos/garcom/{garcomNome}', [PedidoController::class, 'meusPedidos']);
        Route::get('/pedidos/mesa/{mesaId}', [PedidoController::class, 'pedidosPorMesa']);
        Route::put('/pedidos/{id}/observacoes', [PedidoController::class, 'atualizarObservacoes']);
        Route::get('/pedidos/garcom/{garcomNome}/estatisticas', [PedidoController::class, 'estatisticas']);
        
        // CATEGORIAS
        Route::get('/categorias', [CategoriaController::class, 'index']);
        Route::get('/categorias/{id}/produtos', [CategoriaController::class, 'produtosPorCategoria']);
        
        // DASHBOARD
        Route::get('/dashboard', [DashboardController::class, 'index']);
    });

    // --- ROTAS DO ADMIN (AGORA PROTEGIDAS) ---
    Route::prefix('admin')->group(function () {
        // 📊 DASHBOARD E CONFIGURAÇÕES
        Route::get('/dashboard', [ConfiguracaoController::class, 'dashboard']);
        Route::get('/configuracoes', [ConfiguracaoController::class, 'index']);
        Route::put('/configuracoes', [ConfiguracaoController::class, 'update']);
        Route::post('/configuracoes/reiniciar-sistema', [ConfiguracaoController::class, 'reiniciarSistema']);
        
        // 🕒 EXPEDIENTE
        Route::get('/expediente/status', [ExpedienteController::class, 'status']);
        Route::post('/expediente/abrir', [ExpedienteController::class, 'abrirExpediente']);
        Route::post('/expediente/fechar', [ExpedienteController::class, 'fecharExpediente']);
        Route::post('/expediente/relatorio', [ExpedienteController::class, 'relatorioPorData']);
        
        // 📦 PEDIDOS
        Route::get('/pedidos', [AdminPedidoController::class, 'index']);
        Route::get('/pedidos/{id}', [AdminPedidoController::class, 'show']);
        Route::put('/pedidos/{id}/status', [AdminPedidoController::class, 'updateStatus']);
        Route::post('/pedidos/{id}/cancelar', [AdminPedidoController::class, 'cancelar']);
        Route::get('/pedidos/estatisticas', [AdminPedidoController::class, 'estatisticas']);
        
        // 🪑 MESAS
        Route::get('/mesas', [AdminMesaController::class, 'index']);
        Route::post('/mesas/{id}/pagar-conta', [AdminMesaController::class, 'pagarConta']);
        Route::post('/mesas/{id}/liberar', [AdminMesaController::class, 'liberarMesa']);
        Route::get('/mesas/estatisticas', [AdminMesaController::class, 'estatisticas']);
        Route::get('/mesas/{id}', [AdminMesaController::class, 'show']);
        Route::post('/mesas/{id}/fechar-conta', [AdminMesaController::class, 'fecharConta']);
        
        // 🍔 PRODUTOS
        Route::get('/produtos', [AdminProdutoController::class, 'index']);
        Route::post('/produtos', [AdminProdutoController::class, 'store']);
        Route::get('/produtos/{id}', [AdminProdutoController::class, 'show']);
        Route::put('/produtos/{id}', [AdminProdutoController::class, 'update']);
        Route::delete('/produtos/{id}', [AdminProdutoController::class, 'destroy']);
        
        // 📂 CATEGORIAS
        Route::get('/categorias', [AdminCategoriaController::class, 'index']);
        Route::post('/categorias', [AdminCategoriaController::class, 'store']);
        Route::put('/categorias/{id}', [AdminCategoriaController::class, 'update']);
        Route::delete('/categorias/{id}', [AdminCategoriaController::class, 'destroy']);
        
        // 🖨️ IMPRESSÃO
        Route::get('/impressao/pedido/{id}/termica', [ImpressaoController::class, 'imprimirPedidoTermica']);
        Route::get('/impressao/pedido/{id}/compacto', [ImpressaoController::class, 'imprimirPedidoCompacto']);
        Route::post('/impressao/relatorio', [ImpressaoController::class, 'imprimirRelatorio']);
        
        // 📈 RELATÓRIOS
        Route::get('/relatorios/vendas', [RelatorioController::class, 'vendas']);
        Route::get('/relatorios/produtos', [RelatorioController::class, 'produtos']);
        Route::get('/relatorios/mesas', [RelatorioController::class, 'mesas']);
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