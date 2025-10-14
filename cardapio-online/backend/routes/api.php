<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
<<<<<<< Updated upstream
=======

// IMPORTS DOS CONTROLLERS ESPECIALIZADOS
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\PedidoController as AdminPedidoController;
use App\Http\Controllers\Api\Admin\ProdutoController as AdminProdutoController;
use App\Http\Controllers\Api\Admin\CategoriaController as AdminCategoriaController;
use App\Http\Controllers\Api\Admin\ConfiguracaoController as AdminConfiguracaoController;
use App\Http\Controllers\Api\Admin\MesaController as AdminMesaController;
>>>>>>> Stashed changes

use App\Http\Controllers\Api\Garcom\PedidoController as GarcomPedidoController;
use App\Http\Controllers\Api\Garcom\MesaController as GarcomMesaController;
use App\Http\Controllers\Api\Garcom\CardapioController as GarcomCardapioController;

use App\Http\Controllers\Api\Cliente\CardapioController as ClienteCardapioController;

use App\Http\Controllers\Api\Auth\LoginController;

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

<<<<<<< Updated upstream
// Rotas de Categorias
Route::get('/categorias', function() {
    $categorias = DB::table('categorias')
                   ->where('disponivel', 1)
                   ->get();
    return response()->json($categorias);
});

// Rotas de Produtos
Route::get('/produtos', function() {
    $produtos = DB::table('produtos')
                 ->join('categorias', 'produtos.categoria_id', '=', 'categorias.id')
                 ->where('produtos.disponivel', 1)
                 ->select('produtos.*', 'categorias.nome as categoria_nome')
                 ->get();
    return response()->json($produtos);
});

// Produtos por categoria
Route::get('/categorias/{id}/produtos', function($id) {
    $produtos = DB::table('produtos')
                 ->where('categoria_id', $id)
                 ->where('disponivel', 1)
                 ->get();
    return response()->json($produtos);
});

// Produto específico
Route::get('/produtos/{id}', function($id) {
    $produto = DB::table('produtos')
                ->join('categorias', 'produtos.categoria_id', '=', 'categorias.id')
                ->where('produtos.id', $id)
                ->select('produtos.*', 'categorias.nome as categoria_nome')
                ->first();
    return response()->json($produto);
});

// Rotas para Mesas
Route::get('/mesas', function() {
    $mesas = DB::table('mesas')
              ->where('status', 'livre')
              ->get();
    return response()->json($mesas);
});

// Rotas para Pedidos
Route::post('/pedidos', function(Request $request) {
    $request->validate([
        'mesa_id' => 'required|exists:mesas,id',
        'itens' => 'required|array'
    ]);

    DB::beginTransaction();
    try {
        // Criar pedido
        $pedidoId = DB::table('pedidos')->insertGetId([
            'mesa_id' => $request->mesa_id,
            'status' => 'pendente',
            'total' => 0,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $total = 0;

        // Adicionar itens
        foreach ($request->itens as $item) {
            $produto = DB::table('produtos')->where('id', $item['produto_id'])->first();
            
            if ($produto) {
                $itemTotal = $item['quantidade'] * $produto->preco;
                $total += $itemTotal;

                DB::table('pedido_itens')->insert([
                    'pedido_id' => $pedidoId,
                    'produto_id' => $item['produto_id'],
                    'quantidade' => $item['quantidade'],
                    'preco_unitario' => $produto->preco,
                    'observacoes' => $item['observacoes'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }

        // Atualizar total do pedido
        DB::table('pedidos')->where('id', $pedidoId)->update(['total' => $total]);

        // Atualizar status da mesa
        DB::table('mesas')->where('id', $request->mesa_id)->update(['status' => 'ocupada']);

        DB::commit();

        return response()->json([
            'success' => true,
            'pedido_id' => $pedidoId,
            'total' => $total
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
    }
});

// Detalhes do pedido
Route::get('/pedidos/{id}', function($id) {
    $pedido = DB::table('pedidos')
               ->where('id', $id)
               ->first();

    if (!$pedido) {
        return response()->json(['error' => 'Pedido não encontrado'], 404);
    }

    $itens = DB::table('pedido_itens')
              ->join('produtos', 'pedido_itens.produto_id', '=', 'produtos.id')
              ->where('pedido_itens.pedido_id', $id)
              ->select('pedido_itens.*', 'produtos.nome as produto_nome', 'produtos.descricao')
              ->get();

    $mesa = DB::table('mesas')->where('id', $pedido->mesa_id)->first();

    return response()->json([
        'pedido' => $pedido,
        'itens' => $itens,
        'mesa' => $mesa
    ]);
=======
/*
|--------------------------------------------------------------------------
| ROTAS PÚBLICAS - CARDÁPIO DO CLIENTE
|--------------------------------------------------------------------------
*/
Route::prefix('cliente')->group(function () {
    Route::get('/cardapio', [ClienteCardapioController::class, 'index']);
    Route::get('/cardapio/categorias', [ClienteCardapioController::class, 'categorias']);
    Route::get('/cardapio/produtos/{id}', [ClienteCardapioController::class, 'produto']);
    Route::get('/cardapio/categorias/{id}/produtos', [ClienteCardapioController::class, 'produtosPorCategoria']);
});

/*
|--------------------------------------------------------------------------
| ROTAS DO GARÇOM
|--------------------------------------------------------------------------
*/
Route::prefix('garcom')->group(function () {
    // Mesas
    Route::get('/mesas', [GarcomMesaController::class, 'index']);
    Route::get('/mesas/status', [GarcomMesaController::class, 'status']);
    Route::get('/mesas/{mesaId}/pedidos', [GarcomMesaController::class, 'pedidos']);
    
    // Cardápio para garçom
    Route::get('/cardapio', [GarcomCardapioController::class, 'index']);
    Route::get('/cardapio/categorias', [GarcomCardapioController::class, 'categorias']);
    Route::get('/cardapio/produtos', [GarcomCardapioController::class, 'produtos']);
    Route::get('/cardapio/categorias/{id}/produtos', [GarcomCardapioController::class, 'produtosPorCategoria']);
    Route::get('/cardapio/buscar/{termo}', [GarcomCardapioController::class, 'buscarProdutos']);
    
    // Pedidos
    Route::post('/pedidos', [GarcomPedidoController::class, 'store']);
    Route::get('/pedidos/{id}', [GarcomPedidoController::class, 'show']);
    Route::post('/pedidos/{id}/cancelar', [GarcomPedidoController::class, 'cancelar']);
    Route::get('/pedidos/garcom/{garcomNome}', [GarcomPedidoController::class, 'meusPedidos']);
    
    // Gestão de mesas
    Route::post('/mesas/{id}/ocupar', [GarcomMesaController::class, 'ocupar']);
    Route::post('/mesas/{id}/liberar', [GarcomMesaController::class, 'liberar']);
    Route::post('/mesas/{id}/fechar-conta', [GarcomMesaController::class, 'fecharConta']);
    Route::post('/mesas/{id}/pagar-conta', [GarcomMesaController::class, 'pagarConta']);
});

/*
|--------------------------------------------------------------------------
| ROTAS DO ADMIN
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->group(function () {
    // Dashboard
    Route::get('/dashboard', [AdminDashboardController::class, 'index']);
    Route::get('/estatisticas', [AdminDashboardController::class, 'estatisticas']);
    
    // Pedidos
    Route::get('/pedidos', [AdminPedidoController::class, 'index']);
    Route::get('/pedidos/{id}', [AdminPedidoController::class, 'show']);
    Route::post('/pedidos/{id}/cancelar', [AdminPedidoController::class, 'cancelar']);
    Route::put('/pedidos/{id}/status', [AdminPedidoController::class, 'atualizarStatus']);
    Route::get('/pedidos/relatorio/{periodo}', [AdminPedidoController::class, 'relatorio']);
    
    // Produtos
    Route::get('/produtos', [AdminProdutoController::class, 'index']);
    Route::get('/produtos/{id}', [AdminProdutoController::class, 'show']);
    Route::post('/produtos', [AdminProdutoController::class, 'store']);
    Route::put('/produtos/{id}', [AdminProdutoController::class, 'update']);
    Route::delete('/produtos/{id}', [AdminProdutoController::class, 'destroy']);
    Route::post('/produtos/{id}/toggle-disponibilidade', [AdminProdutoController::class, 'toggleDisponibilidade']);
    
    // Categorias
    Route::get('/categorias', [AdminCategoriaController::class, 'index']);
    Route::get('/categorias/{id}', [AdminCategoriaController::class, 'show']);
    Route::post('/categorias', [AdminCategoriaController::class, 'store']);
    Route::put('/categorias/{id}', [AdminCategoriaController::class, 'update']);
    Route::delete('/categorias/{id}', [AdminCategoriaController::class, 'destroy']);
    Route::post('/categorias/{id}/toggle-disponibilidade', [AdminCategoriaController::class, 'toggleDisponibilidade']);
    
    // Configurações
    Route::get('/configuracoes', [AdminConfiguracaoController::class, 'show']);
    Route::put('/configuracoes', [AdminConfiguracaoController::class, 'atualizar']);
    Route::post('/configuracoes/iniciar-expediente', [AdminConfiguracaoController::class, 'iniciarExpediente']);
    Route::post('/configuracoes/finalizar-expediente', [AdminConfiguracaoController::class, 'finalizarExpediente']);
    Route::post('/configuracoes/reiniciar-sistema', [AdminConfiguracaoController::class, 'reiniciarSistema']);
    
    // Mesas (admin)
    Route::get('/mesas', [AdminMesaController::class, 'index']);
    Route::get('/mesas/{id}', [AdminMesaController::class, 'show']);
    Route::put('/mesas/{id}', [AdminMesaController::class, 'update']);
    Route::post('/mesas/{id}/toggle-disponibilidade', [AdminMesaController::class, 'toggleDisponibilidade']);
});

/*
|--------------------------------------------------------------------------
| ROTAS DE AUTENTICAÇÃO
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/login', [LoginController::class, 'login']);
    Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/user', [LoginController::class, 'user'])->middleware('auth:sanctum');
});

/*
|--------------------------------------------------------------------------
| ROTAS DE COMPATIBILIDADE (LEGACY)
|--------------------------------------------------------------------------
*/
Route::prefix('compatibilidade')->group(function () {
    Route::get('/categorias', function() {
        return app()->make(\App\Http\Controllers\Api\Cliente\CardapioController::class)->categorias();
    });
    
    Route::get('/produtos', function() {
        return app()->make(\App\Http\Controllers\Api\Cliente\CardapioController::class)->index();
    });
    
    Route::get('/mesas', function() {
        return app()->make(\App\Http\Controllers\Api\Garcom\MesaController::class)->index();
    });
});

/*
|--------------------------------------------------------------------------
| ROTA DE FALLBACK
|--------------------------------------------------------------------------
*/
Route::fallback(function() {
    return response()->json([
        'success' => false,
        'message' => 'Endpoint não encontrado',
        'available_routes' => [
            '/api/test',
            '/api/cliente/cardapio/*',
            '/api/garcom/*',
            '/api/admin/*',
            '/api/auth/*'
        ]
    ], 404);
>>>>>>> Stashed changes
});