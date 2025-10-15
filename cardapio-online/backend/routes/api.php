<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

// IMPORTS DOS MODELS
use App\Models\Categoria;
use App\Models\Produto;
use App\Models\Mesa;
use App\Models\Pedido;
use App\Models\PedidoItem;

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
Route::get('/cliente/cardapio', function() {
    try {
        $categorias = Categoria::where('disponivel', true)
            ->with(['produtos' => function($query) {
                $query->where('disponivel', true);
            }])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categorias
        ]);
    } catch (\Exception $e) {
        Log::error('Erro em /cliente/cardapio: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao carregar cardápio'], 500);
    }
});

Route::get('/cliente/categorias', function() {
    try {
        $categorias = Categoria::where('disponivel', true)->get();
        return response()->json($categorias);
    } catch (\Exception $e) {
        Log::error('Erro em /cliente/categorias: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao carregar categorias'], 500);
    }
});

Route::get('/cliente/produtos', function() {
    try {
        $produtos = Produto::with('categoria')
            ->where('disponivel', true)
            ->get();
        return response()->json($produtos);
    } catch (\Exception $e) {
        Log::error('Erro em /cliente/produtos: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao carregar produtos'], 500);
    }
});

Route::get('/cliente/categorias/{id}/produtos', function($id) {
    try {
        $produtos = Produto::where('categoria_id', $id)
            ->where('disponivel', true)
            ->get();
        return response()->json($produtos);
    } catch (\Exception $e) {
        Log::error('Erro em /cliente/categorias/{id}/produtos: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao carregar produtos'], 500);
    }
});

// =========================================================================
// ROTAS DO GARÇOM
// =========================================================================

// MESAS - GARÇOM
Route::get('/garcom/mesas', function() {
    try {
        $mesas = Mesa::all();
        return response()->json([
            'success' => true,
            'data' => $mesas
        ]);
    } catch (\Exception $e) {
        Log::error('Erro em /garcom/mesas: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao carregar mesas'], 500);
    }
});

Route::get('/garcom/mesas/status', function() {
    try {
        $mesas = Mesa::with(['pedidos' => function($query) {
            $query->whereIn('status', ['pendente', 'preparando', 'pronto']);
        }])->get();

        $mesasComStatus = $mesas->map(function($mesa) {
            $pedidoAtivo = $mesa->pedidos->first();
            
            $status = 'livre';
            if ($pedidoAtivo) {
                $status = 'ocupada';
            } elseif ($mesa->status_pagamento === 'fechada') {
                $status = 'fechada';
            } elseif ($mesa->status_pagamento === 'paga') {
                $status = 'paga';
            }

            return [
                'id' => $mesa->id,
                'numero' => $mesa->numero,
                'status' => $status,
                'garcom_nome' => $mesa->garcom_nome,
                'status_pagamento' => $mesa->status_pagamento,
                'pedido_id' => $pedidoAtivo ? $pedidoAtivo->id : null,
                'total_pedido' => $pedidoAtivo ? $pedidoAtivo->total : null,
                'created_at' => $mesa->created_at,
                'updated_at' => $mesa->updated_at
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $mesasComStatus
        ]);
    } catch (\Exception $e) {
        Log::error('Erro em /garcom/mesas/status: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao carregar status das mesas'], 500);
    }
});

Route::post('/garcom/mesas/{id}/ocupar', function(Request $request, $id) {
    try {
        $request->validate([
            'garcom_nome' => 'required|string|max:255'
        ]);

        $mesa = Mesa::find($id);
        if (!$mesa) {
            return response()->json(['error' => 'Mesa não encontrada'], 404);
        }

        $mesa->update([
            'status' => 'ocupada',
            'garcom_nome' => $request->garcom_nome,
            'status_pagamento' => 'aberta'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mesa ocupada com sucesso',
            'data' => $mesa
        ]);
    } catch (\Exception $e) {
        Log::error('Erro em /garcom/mesas/{id}/ocupar: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao ocupar mesa'], 500);
    }
});

Route::post('/garcom/mesas/{id}/liberar', function($id) {
    try {
        $mesa = Mesa::find($id);
        if (!$mesa) {
            return response()->json(['error' => 'Mesa não encontrada'], 404);
        }

        $mesa->update([
            'status' => 'livre',
            'garcom_nome' => null,
            'status_pagamento' => 'aberta'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mesa liberada com sucesso',
            'data' => $mesa
        ]);
    } catch (\Exception $e) {
        Log::error('Erro em /garcom/mesas/{id}/liberar: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao liberar mesa'], 500);
    }
});

// PEDIDOS - GARÇOM
Route::post('/garcom/pedidos', function(Request $request) {
    try {
        Log::info('Recebendo pedido do garçom:', $request->all());

        $validated = $request->validate([
            'mesa_id' => 'required|exists:mesas,id',
            'garcom_nome' => 'required|string|max:255',
            'itens' => 'required|array|min:1',
            'itens.*.produto_id' => 'required|exists:produtos,id',
            'itens.*.quantidade' => 'required|integer|min:1',
            'itens.*.observacoes' => 'nullable|string'
        ]);

        DB::beginTransaction();

        // Atualizar mesa
        $mesa = Mesa::find($request->mesa_id);
        $mesa->update([
            'status' => 'ocupada',
            'garcom_nome' => $request->garcom_nome,
            'status_pagamento' => 'aberta'
        ]);

        // Criar pedido
        $pedido = Pedido::create([
            'mesa_id' => $request->mesa_id,
            'garcom_nome' => $request->garcom_nome,
            'status' => 'pendente',
            'total' => 0
        ]);

        $total = 0;

        // Adicionar itens
        foreach ($request->itens as $item) {
            $produto = Produto::find($item['produto_id']);
            $itemTotal = $item['quantidade'] * $produto->preco;
            $total += $itemTotal;

            PedidoItem::create([
                'pedido_id' => $pedido->id,
                'produto_id' => $item['produto_id'],
                'quantidade' => $item['quantidade'],
                'preco_unitario' => $produto->preco,
                'observacoes' => $item['observacoes'] ?? null
            ]);
        }

        // Atualizar total
        $pedido->update(['total' => $total]);
        $pedido->load(['itens.produto', 'mesa']);

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Pedido realizado com sucesso!',
            'data' => $pedido
        ], 201);

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Erro ao criar pedido: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao processar pedido'], 500);
    }
});

// FECHAR CONTA
Route::post('/garcom/mesas/{id}/fechar-conta', function($id) {
    try {
        DB::beginTransaction();

        $mesa = Mesa::find($id);
        if (!$mesa) {
            return response()->json(['error' => 'Mesa não encontrada'], 404);
        }

        $pedidos = Pedido::where('mesa_id', $id)
            ->where('status', '!=', 'cancelado')
            ->with('itens.produto')
            ->get();

        // VALIDAÇÃO: Verifica se há pedidos
        if ($pedidos->isEmpty()) {
            return response()->json([
                'success' => false,
                'error' => 'Sem pedidos realizados!'
            ], 422);
        }

        $totalConta = $pedidos->sum('total');

        $mesa->update(['status_pagamento' => 'fechada']);

        DB::commit();

        return response()->json([
            'success' => true,
            'total_conta' => $totalConta,
            'pedidos' => $pedidos,
            'mesa' => $mesa
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Erro ao fechar conta: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao fechar conta'], 500);
    }
});

// PAGAR CONTA
Route::post('/garcom/mesas/{id}/pagar-conta', function($id) {
    try {
        $mesa = Mesa::find($id);
        if (!$mesa) {
            return response()->json(['error' => 'Mesa não encontrada'], 404);
        }

        $mesa->update([
            'status' => 'livre',
            'status_pagamento' => 'paga',
            'garcom_nome' => null
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Conta paga com sucesso'
        ]);

    } catch (\Exception $e) {
        Log::error('Erro ao pagar conta: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao processar pagamento'], 500);
    }
});

// =========================================================================
// ROTAS DO ADMIN
// =========================================================================

// DASHBOARD
Route::get('/admin/dashboard', function() {
    try {
        $mesasOcupadas = Mesa::whereHas('pedidos', function($query) {
            $query->whereIn('status', ['pendente', 'preparando', 'pronto']);
        })->count();
        
        $stats = [
            'total_mesas' => Mesa::count(),
            'mesas_ocupadas' => $mesasOcupadas,
            'mesas_livres' => Mesa::count() - $mesasOcupadas,
            'total_pedidos' => Pedido::count(),
            'pedidos_pendentes' => Pedido::where('status', 'pendente')->count(),
            'pedidos_preparando' => Pedido::where('status', 'preparando')->count(),
            'pedidos_prontos' => Pedido::where('status', 'pronto')->count(),
            'pedidos_entregues' => Pedido::where('status', 'entregue')->count(),
            'pedidos_hoje' => Pedido::whereDate('created_at', today())->count(),
            'total_produtos' => Produto::count(),
            'total_categorias' => Categoria::count(),
        ];
        
        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    } catch (\Exception $e) {
        Log::error('Erro em /admin/dashboard: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao carregar dashboard'], 500);
    }
});

// PEDIDOS - ADMIN
Route::get('/admin/pedidos', function() {
    try {
        $pedidos = Pedido::with(['itens.produto', 'mesa'])
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
        Log::error('Erro em /admin/pedidos: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao carregar pedidos'], 500);
    }
});

// ATUALIZAR STATUS DO PEDIDO - ADMIN
Route::put('/admin/pedidos/{id}/status', function(Request $request, $id) {
    try {
        $validated = $request->validate([
            'status' => 'required|in:pending,pendente,preparando,pronto,entregue,cancelado'
        ]);

        $pedido = Pedido::find($id);
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
        Log::error('Erro ao atualizar status: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao atualizar status'], 500);
    }
});

// CANCELAR PEDIDO - ADMIN
Route::post('/admin/pedidos/{id}/cancelar', function($id) {
    try {
        $pedido = Pedido::find($id);
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
        Log::error('Erro ao cancelar pedido: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao cancelar pedido'], 500);
    }
});

// PRODUTOS - ADMIN (CRUD COMPLETO)
Route::get('/admin/produtos', function() {
    try {
        $produtos = Produto::with('categoria')->get()->map(function($produto) {
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
        Log::error('Erro em /admin/produtos: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao carregar produtos'], 500);
    }
});

// CRIAR PRODUTO
Route::post('/admin/produtos', function(Request $request) {
    try {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'preco' => 'required|numeric|min:0',
            'categoria_id' => 'required|exists:categorias,id',
            'disponivel' => 'boolean',
            'imagem' => 'nullable|url'
        ]);

        $produto = Produto::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Produto criado com sucesso',
            'data' => $produto
        ], 201);

    } catch (\Exception $e) {
        Log::error('Erro ao criar produto: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao criar produto'], 500);
    }
});

// ATUALIZAR PRODUTO
Route::put('/admin/produtos/{id}', function(Request $request, $id) {
    try {
        $produto = Produto::find($id);
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
        Log::error('Erro ao atualizar produto: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao atualizar produto'], 500);
    }
});

// EXCLUIR PRODUTO
Route::delete('/admin/produtos/{id}', function($id) {
    try {
        $produto = Produto::find($id);
        if (!$produto) {
            return response()->json(['error' => 'Produto não encontrado'], 404);
        }

        $produto->delete();

        return response()->json([
            'success' => true,
            'message' => 'Produto excluído com sucesso'
        ]);

    } catch (\Exception $e) {
        Log::error('Erro ao excluir produto: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao excluir produto'], 500);
    }
});

// CATEGORIAS - ADMIN
Route::get('/admin/categorias', function() {
    try {
        $categorias = Categoria::withCount('produtos')->get();
        return response()->json($categorias);
    } catch (\Exception $e) {
        Log::error('Erro em /admin/categorias: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao carregar categorias'], 500);
    }
});

// CRIAR CATEGORIA
Route::post('/admin/categorias', function(Request $request) {
    try {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'descricao' => 'nullable|string',
            'disponivel' => 'boolean'
        ]);

        $categoria = Categoria::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Categoria criada com sucesso',
            'data' => $categoria
        ], 201);

    } catch (\Exception $e) {
        Log::error('Erro ao criar categoria: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao criar categoria'], 500);
    }
});

// ATUALIZAR CATEGORIA
Route::put('/admin/categorias/{id}', function(Request $request, $id) {
    try {
        $categoria = Categoria::find($id);
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
        Log::error('Erro ao atualizar categoria: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao atualizar categoria'], 500);
    }
});

// EXCLUIR CATEGORIA
Route::delete('/admin/categorias/{id}', function($id) {
    try {
        $categoria = Categoria::find($id);
        if (!$categoria) {
            return response()->json(['error' => 'Categoria não encontrada'], 404);
        }

        $categoria->delete();

        return response()->json([
            'success' => true,
            'message' => 'Categoria excluída com sucesso'
        ]);

    } catch (\Exception $e) {
        Log::error('Erro ao excluir categoria: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao excluir categoria'], 500);
    }
});

// MESAS - ADMIN
Route::get('/admin/mesas', function() {
    try {
        $mesas = Mesa::with(['pedidos' => function($query) {
            $query->whereIn('status', ['pendente', 'preparando', 'pronto']);
        }])->get();

        return response()->json($mesas);
    } catch (\Exception $e) {
        Log::error('Erro em /admin/mesas: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao carregar mesas'], 500);
    }
});

// =========================================================================
// ROTAS DE COMPATIBILIDADE
// =========================================================================

// Rotas públicas (mantidas para compatibilidade)
Route::get('/categorias', function() {
    try {
        $categorias = Categoria::where('disponivel', true)->get();
        return response()->json($categorias);
    } catch (\Exception $e) {
        Log::error('Erro em /categorias: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao carregar categorias'], 500);
    }
});

Route::get('/produtos', function() {
    try {
        $produtos = Produto::with('categoria')
            ->where('disponivel', true)
            ->get();
        return response()->json($produtos);
    } catch (\Exception $e) {
        Log::error('Erro em /produtos: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao carregar produtos'], 500);
    }
});

Route::get('/mesas', function() {
    try {
        $mesas = Mesa::all();
        return response()->json($mesas);
    } catch (\Exception $e) {
        Log::error('Erro em /mesas: ' . $e->getMessage());
        return response()->json(['error' => 'Erro ao carregar mesas'], 500);
    }
});

Route::get('/mesas/{id}/pedidos', function($id) {
    try {
        $pedidos = Pedido::where('mesa_id', $id)
            ->where('status', '!=', 'cancelado')
            ->with(['itens.produto', 'mesa'])
            ->get();

        return response()->json($pedidos);
    } catch (\Exception $e) {
        Log::error('Erro em /mesas/{id}/pedidos: ' . $e->getMessage());
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