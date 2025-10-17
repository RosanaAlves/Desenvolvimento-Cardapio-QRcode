<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Garcom\CardapioController;
use App\Http\Controllers\Api\Garcom\CategoriaController;
use App\Http\Controllers\Api\Garcom\DashboardController;
use App\Http\Controllers\Api\Garcom\MesaController;
use App\Http\Controllers\Api\Garcom\PedidoController;
use App\Http\Controllers\Api\Garcom\ProdutoController;
use App\Http\Controllers\Api\Cliente\CardapioController as ClienteCardapioController;

// 🔥 NOVOS CONTROLLERS ADMIN
use App\Http\Controllers\Api\Admin\ConfiguracaoController;
use App\Http\Controllers\Api\Admin\ExpedienteController;
use App\Http\Controllers\Api\Admin\RelatorioController;
use App\Http\Controllers\Api\Admin\PedidoController as AdminPedidoController;
use App\Http\Controllers\Api\Admin\ProdutoController as AdminProdutoController;
use App\Http\Controllers\Api\Admin\CategoriaController as AdminCategoriaController;
use App\Http\Controllers\Api\Admin\MesaController as AdminMesaController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rota de teste
Route::get('/test', function() {
    return response()->json([
        'success' => true,
        'message' => 'API funcionando',
        'timestamp' => now()->format('d/m/Y H:i:s')
    ]);
});

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
// ROTAS DO GARÇOM (USANDO CONTROLLERS)
// =========================================================================

Route::prefix('garcom')->group(function () {
    
    // 🔥 CARDÁPIO
    Route::get('/cardapio/categorias', [CardapioController::class, 'categorias']);
    Route::get('/cardapio', [CardapioController::class, 'index']);
    Route::get('/cardapio/produtos', [CardapioController::class, 'produtos']);
    Route::get('/cardapio/categorias/{categoriaId}/produtos', [CardapioController::class, 'produtosPorCategoria']);
    Route::get('/cardapio/buscar/{termo}', [CardapioController::class, 'buscarProdutos']);
    
    // 🔥 MESAS
    Route::get('/mesas', [MesaController::class, 'index']);
    Route::get('/mesas/status', [MesaController::class, 'status']);
    Route::get('/mesas/{mesaId}/pedidos', [MesaController::class, 'pedidos']);
    Route::post('/mesas/{id}/ocupar', [MesaController::class, 'ocupar']);
    Route::post('/mesas/{id}/liberar', [MesaController::class, 'liberar']);
    Route::post('/mesas/{id}/fechar-conta', [MesaController::class, 'fecharConta']);
    // Route::post('/mesas/{id}/pagar-conta', [MesaController::class, 'pagarConta']);
    Route::post('/mesas/{id}/reabrir-conta', [MesaController::class, 'reabrirConta']);
    Route::get('/mesas/{id}/status-conta', [MesaController::class, 'statusConta']);
    
    // 🔥 PEDIDOS
    Route::post('/pedidos', [PedidoController::class, 'store']);
    Route::get('/pedidos/{id}', [PedidoController::class, 'show']);
    Route::post('/pedidos/{id}/cancelar', [PedidoController::class, 'cancelar']);
    Route::get('/pedidos/garcom/{garcomNome}', [PedidoController::class, 'meusPedidos']);
    
    // 🔥 CATEGORIAS
    Route::get('/categorias', [CategoriaController::class, 'index']);
    Route::get('/categorias/{id}/produtos', [CategoriaController::class, 'produtosPorCategoria']);
    
    // 🔥 PRODUTOS
    Route::get('/produtos', [ProdutoController::class, 'index']);
    Route::get('/produtos/{id}', [ProdutoController::class, 'show']);
    
    // 🔥 DASHBOARD
    Route::get('/dashboard', [DashboardController::class, 'index']);
});


/// =========================================================================
// ROTAS DO ADMIN (CORRIGIDAS - USANDO OS CONTROLLERS DA PASTA ADMIN)
// =========================================================================

Route::prefix('admin')->group(function () {
    
    // 🔥 CONFIGURAÇÕES DO SISTEMA
    Route::get('/configuracoes', [ConfiguracaoController::class, 'index']);
    Route::put('/configuracoes', [ConfiguracaoController::class, 'update']);
    Route::post('/configuracoes/reiniciar-sistema', [ConfiguracaoController::class, 'reiniciarSistema']);
    
    // 🔥 EXPEDIENTE (ABRIR/FECHAR DIA)
    Route::get('/expediente/status', [ExpedienteController::class, 'status']);
    Route::post('/expediente/abrir', [ExpedienteController::class, 'abrirExpediente']);
    Route::post('/expediente/fechar', [ExpedienteController::class, 'fecharExpediente']);
    Route::get('/expediente/relatorio', [ExpedienteController::class, 'relatorioPorData']);
    
    // 🔥 RELATÓRIOS AVANÇADOS
    Route::get('/relatorios/vendas-periodo', [RelatorioController::class, 'vendasPorPeriodo']);
    Route::get('/relatorios/produtos-mais-vendidos', [RelatorioController::class, 'produtosMaisVendidos']);
    
    // 🔥 DASHBOARD - ADMIN
    Route::get('/dashboard', [ConfiguracaoController::class, 'dashboard']);

    // 🔥 PEDIDOS - ADMIN (USANDO OS CONTROLLERS DA PASTA ADMIN)
    Route::get('/pedidos', [App\Http\Controllers\Api\Admin\PedidoController::class, 'index']);
    Route::put('/pedidos/{id}/status', [App\Http\Controllers\Api\Admin\PedidoController::class, 'updateStatus']);
    Route::post('/pedidos/{id}/cancelar', [App\Http\Controllers\Api\Admin\PedidoController::class, 'cancelar']);

    // 🔥 PRODUTOS - ADMIN (USANDO OS CONTROLLERS DA PASTA ADMIN)
    Route::get('/produtos', [App\Http\Controllers\Api\Admin\ProdutoController::class, 'index']);
    Route::post('/produtos', [App\Http\Controllers\Api\Admin\ProdutoController::class, 'store']);
    Route::put('/produtos/{id}', [App\Http\Controllers\Api\Admin\ProdutoController::class, 'update']);
    Route::delete('/produtos/{id}', [App\Http\Controllers\Api\Admin\ProdutoController::class, 'destroy']);

    // 🔥 CATEGORIAS - ADMIN (USANDO OS CONTROLLERS DA PASTA ADMIN)
    Route::get('/categorias', [App\Http\Controllers\Api\Admin\CategoriaController::class, 'index']);
    Route::post('/categorias', [App\Http\Controllers\Api\Admin\CategoriaController::class, 'store']);
    Route::put('/categorias/{id}', [App\Http\Controllers\Api\Admin\CategoriaController::class, 'update']);
    Route::delete('/categorias/{id}', [App\Http\Controllers\Api\Admin\CategoriaController::class, 'destroy']);

    // 🔥 IMPRESSÃO - ADMIN
    Route::get('/impressao/pedido/{id}/termica', [ImpressaoController::class, 'imprimirPedidoTermica']);
    Route::get('/impressao/pedido/{id}/compacto', [ImpressaoController::class, 'imprimirPedidoCompacto']);
    Route::get('/impressao/relatorio', [ImpressaoController::class, 'imprimirRelatorio']);

    // 🔥 MESAS - ADMIN (USANDO OS CONTROLLERS DA PASTA ADMIN + NOVA ROTA PAGAR CONTA)
    Route::get('/mesas', [App\Http\Controllers\Api\Admin\MesaController::class, 'index']);
    Route::post('/mesas/{id}/pagar-conta', [App\Http\Controllers\Api\Admin\MesaController::class, 'pagarConta']); // ✅ NOVA ROTA
});


// =========================================================================
// ROTAS DE COMPATIBILIDADE (PUBLICAS - MANTIDAS COMO FALLBACK)
// =========================================================================

// 🔥 ROTAS PÚBLICAS PARA COMPATIBILIDADE
Route::get('/categorias', function() {
    try {
        $categorias = \App\Models\Categoria::where('disponivel', true)->get();
        return response()->json($categorias);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Erro em /categorias: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao carregar categorias'], 500);
    }
});

Route::get('/produtos', function() {
    try {
        $produtos = \App\Models\Produto::with('categoria')
            ->where('disponivel', true)
            ->get();
        return response()->json($produtos);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Erro em /produtos: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao carregar produtos'], 500);
    }
});

Route::get('/mesas', function() {
    try {
        $mesas = \App\Models\Mesa::all();
        return response()->json($mesas);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Erro em /mesas: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao carregar mesas'], 500);
    }
});

Route::get('/mesas/{id}/pedidos', function($id) {
    try {
        $pedidos = \App\Models\Pedido::where('mesa_id', $id)
            ->where('status', '!=', 'cancelado')
            ->with(['itens.produto', 'mesa'])
            ->get();

        return response()->json($pedidos);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Erro em /mesas/{id}/pedidos: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao carregar pedidos'], 500);
    }
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