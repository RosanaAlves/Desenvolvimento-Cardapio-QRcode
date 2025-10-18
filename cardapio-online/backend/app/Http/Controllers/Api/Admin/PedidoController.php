<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Models\Mesa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PedidoController extends Controller
{
    // ✅ LISTAR PEDIDOS COM FILTROS
    public function index(Request $request)
    {
        try {
            $query = Pedido::with(['itens.produto.categoria', 'mesa'])
                ->orderBy('created_at', 'desc');

            // ✅ FILTRO POR STATUS
            if ($request->has('status') && $request->status !== 'todos') {
                $query->where('status', $request->status);
            }

            // ✅ FILTRO POR DATA
            if ($request->has('data')) {
                $query->whereDate('created_at', $request->data);
            }

            $pedidos = $query->get();

            return response()->json([
                'success' => true,
                'data' => $pedidos,
                'count' => $pedidos->count(),
                'filtros' => [
                    'status' => $request->status ?? 'todos',
                    'data' => $request->data ?? null
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Erro em PedidoController::index: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar pedidos: ' . $e->getMessage()
            ], 500);
        }
    }

    // ✅ ATUALIZAR STATUS DO PEDIDO - CORRIGIDO
    public function updateStatus(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validate([
                'status' => 'required|in:pending,pendente,preparando,pronto,entregue,cancelado'
            ]);

            $pedido = Pedido::with(['mesa'])->find($id);
            
            if (!$pedido) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pedido não encontrado'
                ], 404);
            }

            $status = $validated['status'];
            if ($status === 'pending') $status = 'pendente';

            // ✅ ATUALIZAR STATUS
            $pedido->update(['status' => $status]);

            Log::info('🔄 Status do pedido atualizado', [
                'pedido_id' => $pedido->id,
                'status_anterior' => $pedido->getOriginal('status'),
                'status_novo' => $status,
                'mesa_id' => $pedido->mesa_id
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $pedido->load(['itens.produto', 'mesa']),
                'message' => 'Status atualizado com sucesso!'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('❌ Erro em PedidoController::updateStatus: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar status: ' . $e->getMessage()
            ], 500);
        }
    }

    // ✅ CANCELAR PEDIDO - CORRIGIDO
    public function cancelar($id)
    {
        DB::beginTransaction();
        try {
            $pedido = Pedido::with(['mesa'])->find($id);
            
            if (!$pedido) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pedido não encontrado'
                ], 404);
            }

            // ✅ VERIFICAR SE PODE SER CANCELADO
            if ($pedido->status === 'entregue') {
                return response()->json([
                    'success' => false,
                    'message' => 'Não é possível cancelar pedido já entregue'
                ], 422);
            }

            if ($pedido->status === 'cancelado') {
                return response()->json([
                    'success' => false,
                    'message' => 'Pedido já está cancelado'
                ], 422);
            }

            $pedido->update(['status' => 'cancelado']);

            Log::info('🗑️ Pedido cancelado pelo admin', [
                'pedido_id' => $pedido->id,
                'mesa_id' => $pedido->mesa_id,
                'status_anterior' => $pedido->getOriginal('status')
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pedido cancelado com sucesso!'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('❌ Erro em PedidoController::cancelar: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao cancelar pedido: ' . $e->getMessage()
            ], 500);
        }
    }

    // ✅ DETALHES DO PEDIDO
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
            Log::error('Erro em PedidoController::show: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar pedido'
            ], 500);
        }
    }

    // ✅ ESTATÍSTICAS DOS PEDIDOS
    public function estatisticas()
    {
        try {
            $hoje = now()->format('Y-m-d');
            
            $estatisticas = [
                'total_pedidos' => Pedido::count(),
                'pedidos_hoje' => Pedido::whereDate('created_at', $hoje)->count(),
                'pedidos_pendentes' => Pedido::where('status', 'pendente')->count(),
                'pedidos_preparando' => Pedido::where('status', 'preparando')->count(),
                'pedidos_prontos' => Pedido::where('status', 'pronto')->count(),
                'pedidos_entregues' => Pedido::where('status', 'entregue')->count(),
                'pedidos_cancelados' => Pedido::where('status', 'cancelado')->count(),
                'vendas_hoje' => Pedido::whereDate('created_at', $hoje)->sum('total'),
                'vendas_total' => Pedido::sum('total'),
                'ticket_medio' => Pedido::count() > 0 ? Pedido::avg('total') : 0
            ];

            return response()->json([
                'success' => true,
                'data' => $estatisticas
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em PedidoController::estatisticas: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar estatísticas'
            ], 500);
        }
    }
}