<?php

namespace App\Http\Controllers\Api\Garcom;

use App\Http\Controllers\Controller;
use App\Models\Mesa;
use App\Models\Pedido;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MesaController extends Controller
{
    // ✅ ADICIONAR: Métodos de resposta padrão
    private function success($data, $message = null, $code = 200)
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message
        ], $code);
    }

    private function error($message, $code = 500)
    {
        return response()->json([
            'success' => false,
            'message' => $message
        ], $code);
    }

    // Listar TODAS as mesas para o garçom
    public function index()
    {
        try {
            $mesas = Mesa::all();
            
            return $this->success($mesas);
            
        } catch (\Exception $e) {
            Log::error('Erro em MesaController::index: ' . $e->getMessage());
            return $this->error('Erro ao carregar mesas');
        }
    }

    // Status das mesas - CORRIGIDO
    public function status()
    {
        try {
            // ✅ CORRIGIDO: Agora usa 'pedidos' (plural) que foi corrigido no model
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

            return $this->success($mesasComStatus);

        } catch (\Exception $e) {
            Log::error('Erro em MesaController::status: ' . $e->getMessage());
            return $this->error('Erro ao buscar status das mesas: ' . $e->getMessage());
        }
    }

    // Pedidos da mesa
    public function pedidos($mesaId)
    {
        try {
            $pedidos = Pedido::where('mesa_id', $mesaId)
                            ->where('status', '!=', 'cancelado')
                            ->with(['itens.produto', 'mesa'])
                            ->get();

            return response()->json([
                'success' => true,
                'data' => $pedidos
            ]);
        } catch (\Exception $e) {
            Log::error('Erro em MesaController::pedidos: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar pedidos'
            ], 500);
        }
    }

    // Ocupar mesa - CORRIGIDO
    public function ocupar(Request $request, $id)
    {
        try {
            $request->validate([
                'garcom_nome' => 'required|string|max:255'
            ]);

            $mesa = Mesa::find($id);
            
            if (!$mesa) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mesa não encontrada'
                ], 404);
            }

            // Atualizar mesa
            $mesa->update([
                'status' => 'ocupada',
                'garcom_nome' => $request->garcom_nome,
                'status_pagamento' => 'aberta'
            ]);

            return response()->json([
                'success' => true,
                'data' => $mesa,
                'message' => 'Mesa ocupada com sucesso!'
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em MesaController::ocupar: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao ocupar mesa: ' . $e->getMessage()
            ], 500);
        }
    }

    // Liberar mesa
    public function liberar($id)
    {
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
                'garcom_nome' => null,
                'status_pagamento' => 'aberta'
            ]);

            return response()->json([
                'success' => true,
                'data' => $mesa,
                'message' => 'Mesa liberada com sucesso!'
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em MesaController::liberar: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao liberar mesa'
            ], 500);
        }
    }

    // Fechar conta - CORRIGIDO
    public function fecharConta($id)
    {
        DB::beginTransaction();
        try {
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

            // VALIDAÇÃO: Verifica se há pedidos
            if ($pedidos->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Sem pedidos realizados!'
                ], 422);
            }

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
            Log::error('Erro em MesaController::fecharConta: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao fechar conta: ' . $e->getMessage()
            ], 500);
        }
    }

    // Pagar conta - CORRIGIDO
    public function pagarConta($id)
    {
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
                'garcom_nome' => null
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Conta paga com sucesso'
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em MesaController::pagarConta: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao processar pagamento: ' . $e->getMessage()
            ], 500);
        }
    }

    // ✅ REMOVIDO: Métodos success() e error() privados
    // Usamos response()->json() diretamente em todos os lugares
}