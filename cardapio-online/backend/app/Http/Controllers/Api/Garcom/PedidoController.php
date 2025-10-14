<?php

namespace App\Http\Controllers\Api\Garcom;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Models\Produto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PedidoController extends Controller
{
    public function store(Request $request)
    {
        try {
            $request->validate([
                'mesa_id' => 'required|exists:mesas,id',
                'garcom_nome' => 'required|string|max:255',
                'itens' => 'required|array|min:1',
                'itens.*.produto_id' => 'required|exists:produtos,id',
                'itens.*.quantidade' => 'required|integer|min:1',
                'itens.*.observacoes' => 'nullable|string'
            ]);

            DB::beginTransaction();

            // Criar pedido
            $pedido = Pedido::create([
                'mesa_id' => $request->mesa_id,
                'garcom_nome' => $request->garcom_nome,
                'status' => 'pendente',
                'total' => 0
            ]);

            $totalPedido = 0;

            // Adicionar itens
            foreach ($request->itens as $item) {
                $produto = Produto::find($item['produto_id']);
                
                $subtotal = $produto->preco * $item['quantidade'];
                $totalPedido += $subtotal;

                $pedido->itens()->create([
                    'produto_id' => $item['produto_id'],
                    'quantidade' => $item['quantidade'],
                    'preco_unitario' => $produto->preco,
                    'subtotal' => $subtotal,
                    'observacoes' => $item['observacoes'] ?? ''
                ]);
            }

            // Atualizar total do pedido
            $pedido->update(['total' => $totalPedido]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $pedido->load('itens.produto'),
                'message' => 'Pedido realizado com sucesso!'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Erro em PedidoController::store: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar pedido'
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $pedido = Pedido::with(['itens.produto', 'mesa'])->find($id);

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
            \Log::error('Erro em PedidoController::show: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar pedido'
            ], 500);
        }
    }

    public function cancelar($id)
    {
        try {
            $pedido = Pedido::with('itens')->find($id);
            
            if (!$pedido) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pedido não encontrado'
                ], 404);
            }

            // Só pode cancelar se ainda não estiver em preparo
            if (!in_array($pedido->status, ['pendente', 'confirmado'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pedido não pode ser cancelado - já está em preparação'
                ], 422);
            }

            $pedido->update([
                'status' => 'cancelado',
                'cancelado_em' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pedido cancelado com sucesso'
            ]);

        } catch (\Exception $e) {
            \Log::error('Erro em PedidoController::cancelar: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao cancelar pedido'
            ], 500);
        }
    }

    public function meusPedidos($garcomNome)
    {
        try {
            $pedidos = Pedido::where('garcom_nome', $garcomNome)
                           ->where('status', '!=', 'cancelado')
                           ->with(['itens.produto', 'mesa'])
                           ->orderBy('created_at', 'desc')
                           ->get();

            return response()->json([
                'success' => true,
                'data' => $pedidos
            ]);

        } catch (\Exception $e) {
            \Log::error('Erro em PedidoController::meusPedidos: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar pedidos'
            ], 500);
        }
    }
}