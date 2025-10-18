<?php

namespace App\Http\Controllers\Api\Garcom;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Models\Produto;
use App\Models\Mesa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PedidoController extends Controller
{
    /**
     * Criar um novo pedido e atualizar status da mesa
     */
    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $request->validate([
                'mesa_id' => 'required|exists:mesas,id',
                'garcom_nome' => 'required|string|max:255',
                'itens' => 'required|array|min:1',
                'itens.*.produto_id' => 'required|exists:produtos,id',
                'itens.*.quantidade' => 'required|integer|min:1',
                'itens.*.observacoes' => 'nullable|string|max:500'
            ]);

            Log::info('🆕 Criando novo pedido', [
                'mesa_id' => $request->mesa_id,
                'garcom_nome' => $request->garcom_nome,
                'quantidade_itens' => count($request->itens)
            ]);

            // ✅ VERIFICAR E ATUALIZAR STATUS DA MESA PARA "OCUPADA"
            $mesa = Mesa::find($request->mesa_id);
            if (!$mesa) {
                throw new \Exception('Mesa não encontrada');
            }

            // Se mesa não está ocupada, marcar como ocupada (primeiro pedido)
            if ($mesa->status !== 'ocupada') {
                Log::info('🔄 Atualizando status da mesa para ocupada', [
                    'mesa_id' => $mesa->id,
                    'status_anterior' => $mesa->status,
                    'status_novo' => 'ocupada'
                ]);
                
                $mesa->ocupar();
            }

            // ✅ CRIAR PEDIDO
            $pedido = Pedido::create([
                'mesa_id' => $request->mesa_id,
                'garcom_nome' => $request->garcom_nome,
                'status' => 'pendente',
                'total' => 0,
                'observacoes' => $request->observacoes_gerais ?? null
            ]);

            $totalPedido = 0;

            // ✅ ADICIONAR ITENS DO PEDIDO
            foreach ($request->itens as $index => $item) {
                $produto = Produto::find($item['produto_id']);
                
                if (!$produto) {
                    throw new \Exception("Produto ID {$item['produto_id']} não encontrado");
                }

                if (!$produto->disponivel) {
                    throw new \Exception("Produto {$produto->nome} não está disponível");
                }

                $subtotal = $produto->preco * $item['quantidade'];
                $totalPedido += $subtotal;

                $pedido->itens()->create([
                    'produto_id' => $item['produto_id'],
                    'quantidade' => $item['quantidade'],
                    'preco_unitario' => $produto->preco,
                    'subtotal' => $subtotal,
                    'observacoes' => $item['observacoes'] ?? null
                ]);

                Log::info('📦 Item adicionado ao pedido', [
                    'pedido_id' => $pedido->id,
                    'produto' => $produto->nome,
                    'quantidade' => $item['quantidade'],
                    'subtotal' => $subtotal
                ]);
            }

            // ✅ ATUALIZAR TOTAL DO PEDIDO
            $pedido->update(['total' => $totalPedido]);

            DB::commit();

            Log::info('✅ Pedido criado com sucesso', [
                'pedido_id' => $pedido->id,
                'mesa_id' => $pedido->mesa_id,
                'total' => $totalPedido,
                'quantidade_itens' => $pedido->itens->count()
            ]);

            return response()->json([
                'success' => true,
                'data' => $pedido->load(['itens.produto', 'mesa']),
                'message' => 'Pedido realizado com sucesso!'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('❌ Erro em PedidoController::store: ' . $e->getMessage(), [
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar pedido: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Exibir detalhes de um pedido específico
     */
    public function show($id)
    {
        try {
            $pedido = Pedido::with(['itens.produto.categoria', 'mesa'])->find($id);

            if (!$pedido) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pedido não encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $pedido
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erro em PedidoController::show: ' . $e->getMessage(), [
                'pedido_id' => $id
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar pedido'
            ], 500);
        }
    }

    /**
     * Cancelar um pedido
     */
    public function cancelar($id)
    {
        DB::beginTransaction();
        try {
            $pedido = Pedido::with(['itens', 'mesa'])->find($id);
            
            if (!$pedido) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pedido não encontrado'
                ], 404);
            }

            // ✅ VERIFICAR SE PODE SER CANCELADO
            if (!$pedido->podeSerCancelado()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pedido não pode ser cancelado - já está em preparação avançada'
                ], 422);
            }

            // ✅ CANCELAR PEDIDO
            $pedido->marcarComoCancelado('Cancelado pelo garçom');

            Log::info('🗑️ Pedido cancelado', [
                'pedido_id' => $pedido->id,
                'mesa_id' => $pedido->mesa_id,
                'garcom' => $pedido->garcom_nome
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pedido cancelado com sucesso'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('❌ Erro em PedidoController::cancelar: ' . $e->getMessage(), [
                'pedido_id' => $id
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao cancelar pedido: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Listar pedidos de um garçom específico
     */
    public function meusPedidos($garcomNome)
    {
        try {
            $pedidos = Pedido::where('garcom_nome', $garcomNome)
                           ->where('status', '!=', 'cancelado')
                           ->with(['itens.produto.categoria', 'mesa'])
                           ->orderBy('created_at', 'desc')
                           ->get();

            Log::info('📋 Listando pedidos do garçom', [
                'garcom' => $garcomNome,
                'quantidade_pedidos' => $pedidos->count()
            ]);

            return response()->json([
                'success' => true,
                'data' => $pedidos,
                'count' => $pedidos->count()
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erro em PedidoController::meusPedidos: ' . $e->getMessage(), [
                'garcom_nome' => $garcomNome
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar pedidos'
            ], 500);
        }
    }

    /**
     * Listar pedidos ativos de uma mesa específica
     */
    public function pedidosPorMesa($mesaId)
    {
        try {
            $pedidos = Pedido::where('mesa_id', $mesaId)
                           ->where('status', '!=', 'cancelado')
                           ->with(['itens.produto', 'mesa'])
                           ->orderBy('created_at', 'desc')
                           ->get();

            return response()->json([
                'success' => true,
                'data' => $pedidos,
                'count' => $pedidos->count()
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erro em PedidoController::pedidosPorMesa: ' . $e->getMessage(), [
                'mesa_id' => $mesaId
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar pedidos da mesa'
            ], 500);
        }
    }

    /**
     * Atualizar observações de um pedido
     */
    public function atualizarObservacoes(Request $request, $id)
    {
        try {
            $request->validate([
                'observacoes' => 'nullable|string|max:1000'
            ]);

            $pedido = Pedido::find($id);
            
            if (!$pedido) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pedido não encontrado'
                ], 404);
            }

            $pedido->update([
                'observacoes' => $request->observacoes
            ]);

            Log::info('📝 Observações do pedido atualizadas', [
                'pedido_id' => $pedido->id,
                'observacoes' => $request->observacoes
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Observações atualizadas com sucesso',
                'data' => $pedido
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erro em PedidoController::atualizarObservacoes: ' . $e->getMessage(), [
                'pedido_id' => $id
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar observações'
            ], 500);
        }
    }

    /**
     * Estatísticas dos pedidos do garçom
     */
    public function estatisticas($garcomNome)
    {
        try {
            $hoje = now()->format('Y-m-d');
            
            $estatisticas = [
                'pedidos_hoje' => Pedido::where('garcom_nome', $garcomNome)
                                      ->whereDate('created_at', $hoje)
                                      ->where('status', '!=', 'cancelado')
                                      ->count(),
                
                'pedidos_ativos' => Pedido::where('garcom_nome', $garcomNome)
                                        ->whereIn('status', ['pendente', 'preparando'])
                                        ->where('status', '!=', 'cancelado')
                                        ->count(),
                
                'vendas_hoje' => Pedido::where('garcom_nome', $garcomNome)
                                     ->whereDate('created_at', $hoje)
                                     ->where('status', '!=', 'cancelado')
                                     ->sum('total'),
                
                'pedidos_mes' => Pedido::where('garcom_nome', $garcomNome)
                                     ->whereMonth('created_at', now()->month)
                                     ->where('status', '!=', 'cancelado')
                                     ->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $estatisticas
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erro em PedidoController::estatisticas: ' . $e->getMessage(), [
                'garcom_nome' => $garcomNome
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar estatísticas'
            ], 500);
        }
    }
}