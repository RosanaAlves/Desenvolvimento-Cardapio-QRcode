<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PedidoController extends Controller
{
    // ✅ CANCELAR PEDIDO
    public function cancelar($id)
    {
        DB::beginTransaction();
        try {
            $pedido = Pedido::find($id);
            
            if (!$pedido) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pedido não encontrado'
                ], 404);
            }

            // Verificar se pode cancelar
            if ($pedido->status === 'entregue' || $pedido->status === 'cancelado') {
                return response()->json([
                    'success' => false,
                    'message' => 'Pedido não pode ser cancelado no status atual'
                ], 422);
            }

            $pedido->update(['status' => 'cancelado']);

            // Log de cancelamento
            // LogPedido::create([
            //     'pedido_id' => $pedido->id,
            //     'acao' => 'cancelamento',
            //     'user_id' => auth()->id()
            // ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pedido cancelado com sucesso!'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro em PedidoController::cancelar: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao cancelar pedido'
            ], 500);
        }
    }

    // ✅ LISTAR PEDIDOS COM FILTROS
    public function index(Request $request)
    {
        try {
            $query = Pedido::with(['itens.produto', 'mesa']);
            
            // Filtro por data
            if ($request->has('data')) {
                $query->whereDate('created_at', $request->data);
            }
            
            // Filtro por status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            $pedidos = $query->orderBy('created_at', 'desc')->get();

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
}