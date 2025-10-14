<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use Illuminate\Http\Request;

class PedidoController extends Controller
{
    public function index()
    {
        try {
            $pedidos = Pedido::with(['itens.produto', 'mesa'])
                            ->orderBy('created_at', 'desc')
                            ->get()
                            ->map(function($pedido) {
                                return [
                                    'id' => $pedido->id,
                                    'mesa_id' => $pedido->mesa_id,
                                    'mesa_numero' => $pedido->mesa->numero,
                                    'cliente_nome' => $pedido->cliente_nome,
                                    'garcom_nome' => $pedido->garcom_nome,
                                    'status' => $pedido->status,
                                    'status_formatado' => $pedido->status_formatado,
                                    'total' => $pedido->total,
                                    'total_formatado' => $pedido->total_formatado,
                                    'created_at' => $pedido->created_at->format('d/m/Y H:i'),
                                    'tempo_espera' => $pedido->tempo_espera,
                                    'itens' => $pedido->itens->map(function($item) {
                                        return [
                                            'produto_nome' => $item->produto->nome,
                                            'quantidade' => $item->quantidade,
                                            'preco_unitario' => $item->preco_unitario,
                                            'observacoes' => $item->observacoes
                                        ];
                                    })
                                ];
                            });

            return $this->success($pedidos);

        } catch (\Exception $e) {
            \Log::error('Erro Admin/Pedidos: ' . $e->getMessage());
            return $this->error('Erro ao carregar pedidos', 500);
        }
    }

    public function cancelar(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'motivo' => 'required|string|max:500',
                'cancelado_por' => 'required|string|max:255'
            ]);

            $pedido = Pedido::find($id);
            
            if (!$pedido) {
                return $this->error('Pedido não encontrado', 404);
            }

            $pedido->marcarComoCancelado($validated['motivo'], $validated['cancelado_por']);

            return $this->success($pedido, 'Pedido cancelado com sucesso');

        } catch (\Exception $e) {
            \Log::error('Erro ao cancelar pedido (admin): ' . $e->getMessage());
            return $this->error('Erro ao cancelar pedido', 500);
        }
    }

    public function atualizarStatus(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|in:pendente,preparando,pronto,entregue,cancelado'
            ]);

            $pedido = Pedido::find($id);
            
            if (!$pedido) {
                return $this->error('Pedido não encontrado', 404);
            }

            $pedido->update(['status' => $validated['status']]);

            return $this->success($pedido, 'Status atualizado com sucesso');

        } catch (\Exception $e) {
            \Log::error('Erro ao atualizar status (admin): ' . $e->getMessage());
            return $this->error('Erro ao atualizar status', 500);
        }
    }
}