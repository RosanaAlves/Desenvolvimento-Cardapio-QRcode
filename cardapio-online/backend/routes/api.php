<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Garcom\CardapioController;
use App\Http\Controllers\Api\Garcom\CategoriaController;
use App\Http\Controllers\Api\Garcom\DashboardController;
use App\Http\Controllers\Api\Garcom\MesaController;
use App\Http\Controllers\Api\Garcom\PedidoController;
use App\Http\Controllers\Api\Garcom\ProdutoController;
// 🔥 ADICIONE ESTE IMPORT
use App\Http\Controllers\Api\Cliente\CardapioController as ClienteCardapioController;

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

// 🔥 ADICIONE ESTE GRUPO DE ROTAS DO CLIENTE COM CONTROLLERS
Route::prefix('cliente')->group(function () {
    Route::get('/cardapio', [ClienteCardapioController::class, 'categorias']);
    Route::get('/categorias', [ClienteCardapioController::class, 'categorias']);
    Route::get('/produtos', [ClienteCardapioController::class, 'produtos']);
    Route::get('/categorias/{categoriaId}/produtos', [ClienteCardapioController::class, 'produtosPorCategoria']);
    Route::get('/produtos/{id}', [ClienteCardapioController::class, 'show']);
});

// 🔥 MANTENHA AS ROTAS DE CLOSURE COMO FALLBACK (opcional)
Route::get('/cliente/cardapio/fallback', function() {
    try {
        $categorias = \App\Models\Categoria::where('disponivel', true)
            ->with(['produtos' => function($query) {
                $query->where('disponivel', true);
            }])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categorias
        ]);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Erro em /cliente/cardapio: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao carregar cardápio'], 500);
    }
});

Route::get('/cliente/categorias/fallback', function() {
    try {
        $categorias = \App\Models\Categoria::where('disponivel', true)->get();
        return response()->json($categorias);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Erro em /cliente/categorias: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao carregar categorias'], 500);
    }
});

Route::get('/cliente/produtos/fallback', function() {
    try {
        $produtos = \App\Models\Produto::with('categoria')
            ->where('disponivel', true)
            ->get();
        return response()->json($produtos);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Erro em /cliente/produtos: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao carregar produtos'], 500);
    }
});

// =========================================================================
// ROTAS DO GARÇOM (USANDO CONTROLLERS)
// =========================================================================

Route::prefix('garcom')->group(function () {
    
    // 🔥 CARDÁPIO - GARÇOM
    Route::get('/cardapio/categorias', [CardapioController::class, 'categorias']);
    Route::get('/cardapio', [CardapioController::class, 'index']);
    Route::get('/cardapio/produtos', [CardapioController::class, 'produtos']);
    Route::get('/cardapio/categorias/{categoriaId}/produtos', [CardapioController::class, 'produtosPorCategoria']);
    Route::get('/cardapio/buscar/{termo}', [CardapioController::class, 'buscarProdutos']);
    
    // 🔥 MESAS - GARÇOM
    Route::get('/mesas', [MesaController::class, 'index']);
    Route::get('/mesas/status', [MesaController::class, 'status']);
    Route::get('/mesas/{mesaId}/pedidos', [MesaController::class, 'pedidos']);
    Route::post('/mesas/{id}/ocupar', [MesaController::class, 'ocupar']);
    Route::post('/mesas/{id}/liberar', [MesaController::class, 'liberar']);
    Route::post('/mesas/{id}/fechar-conta', [MesaController::class, 'fecharConta']);
    Route::post('/mesas/{id}/pagar-conta', [MesaController::class, 'pagarConta']);
    Route::get('/mesas/{id}/status-conta', [GarcomMesaController::class, 'statusConta']);
    
    // 🔥 PEDIDOS - GARÇOM
    Route::post('/pedidos', [PedidoController::class, 'store']);
    Route::get('/pedidos/{id}', [PedidoController::class, 'show']);
    Route::post('/pedidos/{id}/cancelar', [PedidoController::class, 'cancelar']);
    Route::get('/pedidos/garcom/{garcomNome}', [PedidoController::class, 'meusPedidos']);
    
    // 🔥 CATEGORIAS - GARÇOM
    Route::get('/categorias', [CategoriaController::class, 'index']);
    Route::get('/categorias/admin', [CategoriaController::class, 'indexAdmin']);
    Route::get('/categorias/{id}/produtos', [CategoriaController::class, 'produtosPorCategoria']);
    
    // 🔥 PRODUTOS - GARÇOM
    Route::get('/produtos', [ProdutoController::class, 'index']);
    Route::get('/produtos/admin', [ProdutoController::class, 'indexAdmin']);
    Route::get('/produtos/{id}', [ProdutoController::class, 'show']);
    
    // 🔥 DASHBOARD - GARÇOM
    Route::get('/dashboard', [DashboardController::class, 'index']);
});

// =========================================================================
// ROTAS DO ADMIN (MANTIDAS COMO CLOSURES PARA COMPATIBILIDADE)
// =========================================================================

// DASHBOARD
Route::get('/admin/dashboard', function() {
    try {
        $mesasOcupadas = \App\Models\Mesa::whereHas('pedidos', function($query) {
            $query->whereIn('status', ['pendente', 'preparando', 'pronto']);
        })->count();
        
        $stats = [
            'total_mesas' => \App\Models\Mesa::count(),
            'mesas_ocupadas' => $mesasOcupadas,
            'mesas_livres' => \App\Models\Mesa::count() - $mesasOcupadas,
            'total_pedidos' => \App\Models\Pedido::count(),
            'pedidos_pendentes' => \App\Models\Pedido::where('status', 'pendente')->count(),
            'pedidos_preparando' => \App\Models\Pedido::where('status', 'preparando')->count(),
            'pedidos_prontos' => \App\Models\Pedido::where('status', 'pronto')->count(),
            'pedidos_entregues' => \App\Models\Pedido::where('status', 'entregue')->count(),
            'pedidos_hoje' => \App\Models\Pedido::whereDate('created_at', today())->count(),
            'total_produtos' => \App\Models\Produto::count(),
            'total_categorias' => \App\Models\Categoria::count(),
        ];
        
        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Erro em /admin/dashboard: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao carregar dashboard'], 500);
    }
});

// PEDIDOS - ADMIN
Route::get('/admin/pedidos', function() {
    try {
        $pedidos = \App\Models\Pedido::with(['itens.produto', 'mesa'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($pedido) {
                return [
                    'id' => $pedido->id,
                    'mesa_id' => $pedido->mesa_id,
                    'mesa_numero' => $pedido->mesa->numero ?? 'N/A',
                    'garcom_nome' => $pedido->garcom_nome,
                    'status' => $pedido->status,
                    'total' => $pedido->total,
                    'created_at' => $pedido->created_at,
                    'itens' => $pedido->itens->map(function($item) {
                        return [
                            'produto_nome' => $item->produto->nome ?? 'Produto não encontrado',
                            'quantidade' => $item->quantidade,
                            'preco_unitario' => $item->preco_unitario,
                            'observacoes' => $item->observacoes
                        ];
                    })
                ];
            });
        
        return response()->json($pedidos);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Erro em /admin/pedidos: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao carregar pedidos'], 500);
    }
});

// ATUALIZAR STATUS DO PEDIDO - ADMIN
Route::put('/admin/pedidos/{id}/status', function(\Illuminate\Http\Request $request, $id) {
    try {
        $validated = $request->validate([
            'status' => 'required|in:pending,pendente,preparando,pronto,entregue,cancelado'
        ]);

        $pedido = \App\Models\Pedido::find($id);
        if (!$pedido) {
            return response()->json(['error' => 'Pedido não encontrado'], 404);
        }

        $status = $validated['status'];
        if ($status === 'pending') $status = 'pendente';

        $pedido->update(['status' => $status]);

        return response()->json([
            'success' => true,
            'message' => 'Status atualizado com sucesso',
            'data' => $pedido
        ]);

    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Erro ao atualizar status: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao atualizar status'], 500);
    }
});

// CANCELAR PEDIDO - ADMIN
Route::post('/admin/pedidos/{id}/cancelar', function($id) {
    try {
        $pedido = \App\Models\Pedido::find($id);
        if (!$pedido) {
            return response()->json(['error' => 'Pedido não encontrado'], 404);
        }

        // Só pode cancelar se não estiver em preparo
        if ($pedido->status === 'preparando' || $pedido->status === 'pronto') {
            return response()->json([
                'success' => false,
                'message' => 'Não é possível cancelar pedido em preparo'
            ], 422);
        }

        $pedido->update(['status' => 'cancelado']);

        return response()->json([
            'success' => true,
            'message' => 'Pedido cancelado com sucesso'
        ]);

    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Erro ao cancelar pedido: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao cancelar pedido'], 500);
    }
});

// PRODUTOS - ADMIN
Route::get('/admin/produtos', function() {
    try {
        $produtos = \App\Models\Produto::with('categoria')->get()->map(function($produto) {
            return [
                'id' => $produto->id,
                'nome' => $produto->nome,
                'descricao' => $produto->descricao,
                'preco' => $produto->preco,
                'categoria_id' => $produto->categoria_id,
                'categoria_nome' => $produto->categoria->nome ?? 'Sem categoria',
                'disponivel' => (bool)$produto->disponivel,
                'imagem' => $produto->imagem
            ];
        });
        
        return response()->json($produtos);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Erro em /admin/produtos: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao carregar produtos'], 500);
    }
});

// CRIAR PRODUTO
Route::post('/admin/produtos', function(\Illuminate\Http\Request $request) {
    try {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'preco' => 'required|numeric|min:0',
            'categoria_id' => 'required|exists:categorias,id',
            'disponivel' => 'boolean',
            'imagem' => 'nullable|url'
        ]);

        $produto = \App\Models\Produto::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Produto criado com sucesso',
            'data' => $produto
        ], 201);

    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Erro ao criar produto: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao criar produto'], 500);
    }
});

// ATUALIZAR PRODUTO
Route::put('/admin/produtos/{id}', function(\Illuminate\Http\Request $request, $id) {
    try {
        $produto = \App\Models\Produto::find($id);
        if (!$produto) {
            return response()->json(['error' => 'Produto não encontrado'], 404);
        }

        $validated = $request->validate([
            'nome' => 'sometimes|required|string|max:255',
            'descricao' => 'nullable|string',
            'preco' => 'sometimes|required|numeric|min:0',
            'categoria_id' => 'sometimes|required|exists:categorias,id',
            'disponivel' => 'boolean',
            'imagem' => 'nullable|url'
        ]);

        $produto->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Produto atualizado com sucesso',
            'data' => $produto
        ]);

    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Erro ao atualizar produto: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao atualizar produto'], 500);
    }
});

// EXCLUIR PRODUTO
Route::delete('/admin/produtos/{id}', function($id) {
    try {
        $produto = \App\Models\Produto::find($id);
        if (!$produto) {
            return response()->json(['error' => 'Produto não encontrado'], 404);
        }

        $produto->delete();

        return response()->json([
            'success' => true,
            'message' => 'Produto excluído com sucesso'
        ]);

    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Erro ao excluir produto: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao excluir produto'], 500);
    }
});

// CATEGORIAS - ADMIN
Route::get('/admin/categorias', function() {
    try {
        $categorias = \App\Models\Categoria::withCount('produtos')->get();
        return response()->json($categorias);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Erro em /admin/categorias: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao carregar categorias'], 500);
    }
});

// CRIAR CATEGORIA
Route::post('/admin/categorias', function(\Illuminate\Http\Request $request) {
    try {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'disponivel' => 'boolean'
        ]);

        $categoria = \App\Models\Categoria::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Categoria criada com sucesso',
            'data' => $categoria
        ], 201);

    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Erro ao criar categoria: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao criar categoria'], 500);
    }
});

// ATUALIZAR CATEGORIA
Route::put('/admin/categorias/{id}', function(\Illuminate\Http\Request $request, $id) {
    try {
        $categoria = \App\Models\Categoria::find($id);
        if (!$categoria) {
            return response()->json(['error' => 'Categoria não encontrada'], 404);
        }

        $validated = $request->validate([
            'nome' => 'sometimes|required|string|max:255',
            'descricao' => 'nullable|string',
            'disponivel' => 'boolean'
        ]);

        $categoria->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Categoria atualizada com sucesso',
            'data' => $categoria
        ]);

    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Erro ao atualizar categoria: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao atualizar categoria'], 500);
    }
});

// EXCLUIR CATEGORIA
Route::delete('/admin/categorias/{id}', function($id) {
    try {
        $categoria = \App\Models\Categoria::find($id);
        if (!$categoria) {
            return response()->json(['error' => 'Categoria não encontrada'], 404);
        }

        $categoria->delete();

        return response()->json([
            'success' => true,
            'message' => 'Categoria excluída com sucesso'
        ]);

    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Erro ao excluir categoria: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao excluir categoria'], 500);
    }
});

// MESAS - ADMIN
Route::get('/admin/mesas', function() {
    try {
        $mesas = \App\Models\Mesa::with(['pedidos' => function($query) {
            $query->whereIn('status', ['pendente', 'preparando', 'pronto']);
        }])->get();

        return response()->json($mesas);
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::error('Erro em /admin/mesas: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao carregar mesas'], 500);
    }
});

// =========================================================================
// ROTAS DE COMPATIBILIDADE
// =========================================================================

// Rotas públicas (mantidas para compatibilidade)
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