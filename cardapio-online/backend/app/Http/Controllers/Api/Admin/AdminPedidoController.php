<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PedidoController extends Controller
{
    // ✅ LISTAR PEDIDOS
    public function index()
    {
        try {
            $pedidos = Pedido::with(['itens.produto', 'mesa'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $pedidos
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em PedidoController::index: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar pedidos'
            ], 500);
        }
    }

    // ✅ ATUALIZAR STATUS DO PEDIDO
    public function updateStatus(Request $request, $id)
    {
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

            $status = $validated['status'];
            if ($status === 'pending') $status = 'pendente';

            $pedido->update(['status' => $status]);

            return response()->json([
                'success' => true,
                'data' => $pedido,
                'message' => 'Status atualizado com sucesso!'
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em PedidoController::updateStatus: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar status'
            ], 500);
        }
    }

    // ✅ CANCELAR PEDIDO
    public function cancelar($id)
    {
        try {
            $pedido = Pedido::find($id);
            
            if (!$pedido) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pedido não encontrado'
                ], 404);
            }

            // Só pode cancelar se não estiver entregue
            if ($pedido->status === 'entregue') {
                return response()->json([
                    'success' => false,
                    'message' => 'Não é possível cancelar pedido já entregue'
                ], 422);
            }

            $pedido->update(['status' => 'cancelado']);

            return response()->json([
                'success' => true,
                'message' => 'Pedido cancelado com sucesso!'
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em PedidoController::cancelar: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao cancelar pedido'
            ], 500);
        }
    }
}