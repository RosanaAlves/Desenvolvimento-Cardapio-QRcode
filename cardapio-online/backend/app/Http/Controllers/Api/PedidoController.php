<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Models\PedidoItem;
use App\Models\Mesa;
use App\Models\Produto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class PedidoController extends Controller
{
    /**
     * Listar pedidos para admin (todos os pedidos)
     */
    public function indexAdmin()
    {
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
                                    'garcom_nome' => $pedido->garcom_nome, // 🔥 NOVO
                                    'status' => $pedido->status,
                                    'status_formatado' => $pedido->status_formatado, // 🔥 NOVO
                                    'total' => $pedido->total,
                                    'total_formatado' => $pedido->total_formatado, // 🔥 NOVO
                                    'created_at' => $pedido->created_at->format('d/m/Y H:i'),
                                    'tempo_espera' => $pedido->tempo_espera, // 🔥 NOVO
                                    'itens' => $pedido->itens->map(function($item) {
                                        return [
                                            'produto_nome' => $item->produto->nome ?? 'Produto não encontrado',
                                            'quantidade' => $item->quantidade,
                                            'preco_unitario' => $item->preco_unitario,
                                            'preco_total' => $item->quantidade * $item->preco_unitario, // 🔥 NOVO
                                            'observacoes' => $item->observacoes
                                        ];
                                    })
                                ];
                            });
            
            return $this->success($pedidos);
        } catch (\Exception $e) {
            Log::error('Erro em PedidoController::indexAdmin: ' . $e->getMessage());
            return $this->error('Erro ao carregar pedidos', 500);
        }
    }

    /**
     * 🔥 NOVO: Listar pedidos ativos (para cozinha/dashboard)
     */
    public function indexAtivos()
    {
        try {
            $pedidos = Pedido::with(['itens.produto', 'mesa'])
                            ->ativos() // 🔥 USA O ESCOPO DO MODEL
                            ->orderBy('created_at', 'asc')
                            ->get()
                            ->map(function($pedido) {
                                return $pedido->toArrayResumido(); // 🔥 USA MÉTODO DO MODEL
                            });
            
            return $this->success($pedidos);
        } catch (\Exception $e) {
            Log::error('Erro em PedidoController::indexAtivos: ' . $e->getMessage());
            return $this->error('Erro ao carregar pedidos ativos', 500);
        }
    }

    /**
     * Atualizar status do pedido
     */
    public function atualizarStatus(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|in:pending,pendente,preparando,pronto,entregue,cancelado'
            ]);

            $pedido = Pedido::with(['mesa', 'itens'])->find($id);
            
            if (!$pedido) {
                return $this->error('Pedido não encontrado', 404);
            }

            // Normalizar status
            $status = $validated['status'];
            if ($status === 'pending') $status = 'pendente';

            // 🔥 ATUALIZADO: Usa métodos do model
            switch ($status) {
                case 'preparando':
                    $pedido->marcarComoPreparando();
                    break;
                case 'pronto':
                    $pedido->marcarComoPronto();
                    break;
                case 'entregue':
                    $pedido->marcarComoEntregue();
                    break;
                case 'cancelado':
                    // 🔥 NOVO: Cancela com motivo
                    $motivo = $request->input('motivo', 'Cancelado pelo sistema');
                    $canceladoPor = $request->input('cancelado_por', 'Sistema');
                    $pedido->marcarComoCancelado($motivo, $canceladoPor);
                    break;
                default:
                    $pedido->marcarComoPendente();
            }

            $pedido->load(['itens.produto', 'mesa']);

            return $this->success($pedido, 'Status do pedido atualizado com sucesso');

        } catch (\Exception $e) {
            Log::error('Erro em PedidoController::atualizarStatus: ' . $e->getMessage());
            return $this->error('Erro ao atualizar status do pedido: ' . $e->getMessage(), 500);
        }
    }

    /**
     * 🔥 NOVO: Cancelar pedido específico
     */
    public function cancelarPedido(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'motivo' => 'required|string|max:500',
                'cancelado_por' => 'required|string|max:255'
            ]);

            $pedido = Pedido::with(['mesa', 'itens'])->find($id);
            
            if (!$pedido) {
                return $this->error('Pedido não encontrado', 404);
            }

            if (!$pedido->podeSerCancelado()) {
                return $this->error('Este pedido não pode ser cancelado. Status atual: ' . $pedido->status, 400);
            }

            // Cancela o pedido
            $pedido->marcarComoCancelado($validated['motivo'], $validated['cancelado_por']);
            $pedido->load(['itens.produto', 'mesa']);

            Log::info("Pedido #{$pedido->id} cancelado por: {$validated['cancelado_por']}. Motivo: {$validated['motivo']}");

            return $this->success($pedido, 'Pedido cancelado com sucesso');

        } catch (\Exception $e) {
            Log::error('Erro em PedidoController::cancelarPedido: ' . $e->getMessage());
            return $this->error('Erro ao cancelar pedido: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Criar novo pedido - ATUALIZADO
     */
    public function store(Request $request)
    {
        Log::info('Recebendo pedido:', $request->all());

        try {
            $validated = $request->validate([
                'mesa_id' => 'required|exists:mesas,id',
                'cliente_nome' => 'required|string|max:255',
                'garcom_nome' => 'required|string|max:255', // 🔥 NOVO: Nome do garçom
                'itens' => 'required|array|min:1',
                'itens.*.produto_id' => 'required|exists:produtos,id',
                'itens.*.quantidade' => 'required|integer|min:1',
                'itens.*.observacoes' => 'nullable|string|max:500' // 🔥 MELHORADO
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validação falhou:', $e->errors());
            return $this->error('Dados inválidos', 422, $e->errors());
        }

        try {
            DB::beginTransaction();

            // Verificar mesa
            $mesa = Mesa::find($request->mesa_id);
            if (!$mesa) {
                return $this->error('Mesa não encontrada', 404);
            }

            // 🔥 ATUALIZADO: Cria pedido com garçom
            $pedido = Pedido::create([
                'mesa_id' => $request->mesa_id,
                'cliente_nome' => $request->cliente_nome,
                'garcom_nome' => $request->garcom_nome, // 🔥 NOVO
                'status' => 'pendente',
                'total' => 0
            ]);

            $total = 0;
            $itensProcessados = [];

            // Processar itens
            foreach ($request->itens as $item) {
                $produto = Produto::find($item['produto_id']);
                
                if (!$produto) {
                    throw new \Exception("Produto ID {$item['produto_id']} não encontrado");
                }

                if (!$produto->disponivel) {
                    throw new \Exception("Produto {$produto->nome} não está disponível");
                }

                $itemTotal = $item['quantidade'] * $produto->preco;
                $total += $itemTotal;

                $pedidoItem = PedidoItem::create([
                    'pedido_id' => $pedido->id,
                    'produto_id' => $item['produto_id'],
                    'quantidade' => $item['quantidade'],
                    'preco_unitario' => $produto->preco,
                    'observacoes' => $item['observacoes'] ?? null
                ]);

                $itensProcessados[] = [
                    'id' => $pedidoItem->id,
                    'produto_nome' => $produto->nome,
                    'quantidade' => $item['quantidade'],
                    'preco_unitario' => $produto->preco,
                    'observacoes' => $item['observacoes'] ?? null
                ];
            }

            // Atualizar total do pedido
            $pedido->update(['total' => $total]);
            
            // Carregar relações para resposta
            $pedido->load(['itens.produto', 'mesa']);

            DB::commit();

            Log::info("Pedido #{$pedido->id} criado com sucesso. Total: R$ {$total}");

            return $this->success([
                'pedido' => [
                    'id' => $pedido->id,
                    'mesa_id' => $pedido->mesa_id,
                    'mesa_numero' => $pedido->mesa->numero,
                    'cliente_nome' => $pedido->cliente_nome,
                    'garcom_nome' => $pedido->garcom_nome,
                    'status' => $pedido->status,
                    'total' => $pedido->total,
                    'total_formatado' => $pedido->total_formatado,
                    'created_at' => $pedido->created_at->format('d/m/Y H:i'),
                    'itens' => $itensProcessados
                ],
                'total' => $total,
                'mensagem' => 'Pedido realizado com sucesso!'
            ], 'Pedido realizado com sucesso!', 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro em PedidoController::store: ' . $e->getMessage());
            return $this->error('Erro ao processar pedido: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Detalhes do pedido - ATUALIZADO
     */
    public function show($id)
    {
        try {
            $pedido = Pedido::with(['itens.produto', 'mesa'])->find($id);
            
            if (!$pedido) {
                return $this->error('Pedido não encontrado', 404);
            }

            // 🔥 MELHORADO: Retorna dados formatados
            $dadosPedido = [
                'id' => $pedido->id,
                'mesa_id' => $pedido->mesa_id,
                'mesa_numero' => $pedido->mesa->numero ?? 'N/A',
                'cliente_nome' => $pedido->cliente_nome,
                'garcom_nome' => $pedido->garcom_nome,
                'status' => $pedido->status,
                'status_formatado' => $pedido->status_formatado,
                'total' => $pedido->total,
                'total_formatado' => $pedido->total_formatado,
                'created_at' => $pedido->created_at->format('d/m/Y H:i'),
                'tempo_espera' => $pedido->tempo_espera,
                'pode_cancelar' => $pedido->podeSerCancelado(),
                'itens' => $pedido->itens->map(function($item) {
                    return [
                        'id' => $item->id,
                        'produto_id' => $item->produto_id,
                        'produto_nome' => $item->produto->nome ?? 'Produto não encontrado',
                        'quantidade' => $item->quantidade,
                        'preco_unitario' => $item->preco_unitario,
                        'preco_total' => $item->quantidade * $item->preco_unitario,
                        'observacoes' => $item->observacoes
                    ];
                })
            ];

            // 🔥 NOVO: Adiciona informações de cancelamento se aplicável
            if ($pedido->isCancelado()) {
                $dadosPedido['cancelamento'] = [
                    'cancelado_por' => $pedido->cancelado_por,
                    'motivo_cancelamento' => $pedido->motivo_cancelamento,
                    'cancelado_em' => $pedido->cancelado_em?->format('d/m/Y H:i')
                ];
            }

            return $this->success($dadosPedido);

        } catch (\Exception $e) {
            Log::error('Erro em PedidoController::show: ' . $e->getMessage());
            return $this->error('Erro ao carregar pedido: ' . $e->getMessage(), 500);
        }
    }

    /**
     * 🔥 NOVO: Pedidos por mesa
     */
    public function porMesa($mesaId)
    {
        try {
            $pedidos = Pedido::with(['itens.produto', 'mesa'])
                            ->where('mesa_id', $mesaId)
                            ->orderBy('created_at', 'desc')
                            ->get()
                            ->map(function($pedido) {
                                return $pedido->toArrayResumido();
                            });

            return $this->success($pedidos);

        } catch (\Exception $e) {
            Log::error('Erro em PedidoController::porMesa: ' . $e->getMessage());
            return $this->error('Erro ao carregar pedidos da mesa: ' . $e->getMessage(), 500);
        }
    }

    /**
     * 🔥 NOVO: Pedidos por garçom
     */
    public function porGarcom($garcomNome)
    {
        try {
            $pedidos = Pedido::with(['itens.produto', 'mesa'])
                            ->where('garcom_nome', $garcomNome)
                            ->orderBy('created_at', 'desc')
                            ->get()
                            ->map(function($pedido) {
                                return $pedido->toArrayResumido();
                            });

            return $this->success([
                'garcom' => $garcomNome,
                'total_pedidos' => $pedidos->count(),
                'pedidos' => $pedidos
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em PedidoController::porGarcom: ' . $e->getMessage());
            return $this->error('Erro ao carregar pedidos do garçom: ' . $e->getMessage(), 500);
        }
    }

    /**
     * 🔥 NOVO: Estatísticas de pedidos
     */
    public function estatisticas()
    {
        try {
            $estatisticas = [
                'total_pedidos' => Pedido::count(),
                'pedidos_hoje' => Pedido::deHoje()->count(),
                'pedidos_pendentes' => Pedido::pendentes()->count(),
                'pedidos_preparando' => Pedido::preparando()->count(),
                'pedidos_prontos' => Pedido::prontos()->count(),
                'faturamento_hoje' => Pedido::deHoje()->sum('total'),
                'faturamento_total' => Pedido::sum('total')
            ];

            return $this->success($estatisticas);

        } catch (\Exception $e) {
            Log::error('Erro em PedidoController::estatisticas: ' . $e->getMessage());
            return $this->error('Erro ao carregar estatísticas: ' . $e->getMessage(), 500);
        }
    }
}