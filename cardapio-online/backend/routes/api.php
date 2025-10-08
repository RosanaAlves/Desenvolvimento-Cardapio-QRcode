<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

// 🔥 IMPORTS DOS MODELS
use App\Models\Categoria;
use App\Models\Produto;
use App\Models\Mesa;
use App\Models\Pedido;
use App\Models\PedidoItem;

// 🔥 CORS MANUAL
if (isset($_SERVER['REQUEST_METHOD'])) {
    header('Access-Control-Allow-Origin: http://localhost:3000, http://localhost:3001');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN, Accept, Origin');
    header('Access-Control-Allow-Credentials: true');

    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// 🔥 GRUPO API COM PREFIXO /api
Route::prefix('api')->group(function () {

    // Rotas de teste
    Route::get('/test', function() {
        return response()->json(['status' => 'OK', 'message' => 'API funcionando']);
    });

    // 🔥 ROTA PEDIDOS SIMPLES (para evitar 405)
    Route::get('/pedidos', function() {
        return response()->json(['error' => 'Use /api/admin/pedidos para acessar todos os pedidos'], 400);
    });

    // 🔥 ROTAS DO ADMIN
    Route::get('/admin/dashboard', function() {
        try {
            $stats = [
                'total_mesas' => Mesa::count(),
                'mesas_ocupadas' => Mesa::where('status', 'ocupada')->count(),
                'mesas_livres' => Mesa::where('status', 'livre')->count(),
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

    // 🔥 TODOS OS PEDIDOS (ADMIN)
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
                                    'cliente_nome' => $pedido->cliente_nome,
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

    // 🔥 ATUALIZAR STATUS DO PEDIDO
    Route::put('/admin/pedidos/{id}/status', function(Request $request, $id) {
        try {
            $validated = $request->validate([
                'status' => 'required|in:pending,pendente,preparando,pronto,entregue,cancelado'
            ]);

            $pedido = Pedido::find($id);
            
            if (!$pedido) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pedido não encontrado'
                ], 404);
            }

            // Normalizar status
            $status = $validated['status'];
            if ($status === 'pending') $status = 'pendente';

            $pedido->update(['status' => $status]);

            return response()->json([
                'success' => true,
                'message' => 'Status do pedido atualizado com sucesso',
                'data' => $pedido
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao atualizar status do pedido: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar status do pedido'
            ], 500);
        }
    });

    // 🔥 PRODUTOS PARA ADMIN (TODOS OS PRODUTOS)
    Route::get('/admin/produtos', function() {
        try {
            $produtos = Produto::with('categoria')->get()->map(function($produto) {
                return [
                    'id' => $produto->id,
                    'nome' => $produto->nome,
                    'descricao' => $produto->descricao,
                    'preco' => $produto->preco,
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

    // Rotas de Categorias
    Route::get('/categorias', function() {
        try {
            $categorias = Categoria::where('disponivel', 1)->get();
            return response()->json($categorias);
        } catch (\Exception $e) {
            Log::error('Erro em /categorias: ' . $e->getMessage());
            return response()->json(['error' => 'Erro ao carregar categorias'], 500);
        }
    });

    // Rotas de Produtos (público)
    Route::get('/produtos', function() {
        try {
            $produtos = Produto::with('categoria')
                              ->where('disponivel', 1)
                              ->get();
            return response()->json($produtos);
        } catch (\Exception $e) {
            Log::error('Erro em /produtos: ' . $e->getMessage());
            return response()->json(['error' => 'Erro ao carregar produtos'], 500);
        }
    });

    // Produtos por categoria
    Route::get('/categorias/{id}/produtos', function($id) {
        try {
            $produtos = Produto::where('categoria_id', $id)
                              ->where('disponivel', 1)
                              ->get();
            return response()->json($produtos);
        } catch (\Exception $e) {
            Log::error('Erro em /categorias/{id}/produtos: ' . $e->getMessage());
            return response()->json(['error' => 'Erro ao carregar produtos'], 500);
        }
    });

    // Produto específico
    Route::get('/produtos/{id}', function($id) {
        try {
            $produto = Produto::with('categoria')->find($id);
            
            return $produto 
                ? response()->json($produto)
                : response()->json(['error' => 'Produto não encontrado'], 404);
        } catch (\Exception $e) {
            Log::error('Erro em /produtos/{id}: ' . $e->getMessage());
            return response()->json(['error' => 'Erro ao carregar produto'], 500);
        }
    });

    // Rotas para Mesas
    Route::get('/mesas', function() {
        try {
            $mesas = Mesa::all();
            return response()->json($mesas);
        } catch (\Exception $e) {
            Log::error('Erro em /mesas: ' . $e->getMessage());
            return response()->json(['error' => 'Erro ao carregar mesas'], 500);
        }
    });

    // 🔥 ROTA DE PEDIDOS - USANDO MODELS ELOQUENT
    Route::post('/pedidos', function(Request $request) {
        Log::info('Recebendo pedido:', $request->all());

        try {
            $validated = $request->validate([
                'mesa_id' => 'required|exists:mesas,id',
                'cliente_nome' => 'required|string|max:255',
                'itens' => 'required|array|min:1',
                'itens.*.produto_id' => 'required|exists:produtos,id',
                'itens.*.quantidade' => 'required|integer|min:1'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dados inválidos',
                'errors' => $e->errors()
            ], 422);
        }

        try {
            // Iniciar transação
            DB::beginTransaction();

            // Atualizar mesa
            $mesa = Mesa::find($request->mesa_id);
            if (!$mesa) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mesa não encontrada'
                ], 404);
            }

            $mesa->update([
                'status' => 'ocupada',
                'cliente_nome' => $request->cliente_nome,
                'status_pagamento' => 'aberta'
            ]);

            // Criar pedido usando o Model
            $pedido = Pedido::create([
                'mesa_id' => $request->mesa_id,
                'cliente_nome' => $request->cliente_nome,
                'status' => 'pendente',
                'total' => 0
            ]);

            $total = 0;

            // Adicionar itens usando o Model PedidoItem
            foreach ($request->itens as $item) {
                $produto = Produto::find($item['produto_id']);
                
                if ($produto) {
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
            }

            // Atualizar total do pedido
            $pedido->update(['total' => $total]);

            // Carregar relações para a resposta
            $pedido->load(['itens.produto', 'mesa']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pedido realizado com sucesso!',
                'data' => [
                    'pedido' => $pedido,
                    'total' => $total,
                    'cliente_nome' => $request->cliente_nome,
                    'mesa_id' => $request->mesa_id
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro ao criar pedido: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro interno ao processar pedido',
                'error' => env('APP_DEBUG') ? $e->getMessage() : 'Erro no servidor'
            ], 500);
        }
    });

    // Fechar conta - USANDO MODELS
    Route::post('/mesas/{id}/fechar-conta', function($id) {
        try {
            DB::beginTransaction();

            $mesa = Mesa::find($id);
            if (!$mesa) {
                return response()->json([
                    'success' => false, 
                    'message' => 'Mesa não encontrada'
                ], 404);
            }

            $pedidos = Pedido::where('mesa_id', $id)
                            ->where('status', '!=', 'cancelado')
                            ->with('itens.produto')
                            ->get();

            $totalConta = $pedidos->sum('total');

            $mesa->update([
                'status_pagamento' => 'fechada'
            ]);

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
            return response()->json([
                'success' => false, 
                'message' => 'Erro ao fechar conta: ' . $e->getMessage()
            ], 500);
        }
    });

    // Pagar conta - USANDO MODELS
    Route::post('/mesas/{id}/pagar-conta', function($id) {
        try {
            $mesa = Mesa::find($id);
            
            if (!$mesa) {
                return response()->json([
                    'success' => false, 
                    'message' => 'Mesa não encontrada'
                ], 404);
            }

            $mesa->update([
                'status' => 'livre',
                'status_pagamento' => 'paga',
                'cliente_nome' => null
            ]);

            return response()->json([
                'success' => true, 
                'message' => 'Conta paga com sucesso'
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao pagar conta: ' . $e->getMessage());
            return response()->json([
                'success' => false, 
                'message' => 'Erro ao processar pagamento: ' . $e->getMessage()
            ], 500);
        }
    });

    // 🔥 BUSCAR PEDIDOS DA MESA - USANDO MODELS
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

    // 🔥 NOVA ROTA - DETALHES DO PEDIDO
    Route::get('/pedidos/{id}', function($id) {
        try {
            $pedido = Pedido::with(['itens.produto', 'mesa'])->find($id);
            
            return $pedido 
                ? response()->json($pedido)
                : response()->json(['error' => 'Pedido não encontrado'], 404);
        } catch (\Exception $e) {
            Log::error('Erro em /pedidos/{id}: ' . $e->getMessage());
            return response()->json(['error' => 'Erro ao carregar pedido'], 500);
        }
    });

});

// 🔥 ROTA OPTIONS PARA CORS PREFLIGHT
Route::options('/{any}', function () {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', 'http://localhost:3000, http://localhost:3001')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN, Accept, Origin')
        ->header('Access-Control-Allow-Credentials', 'true');
})->where('any', '.*');