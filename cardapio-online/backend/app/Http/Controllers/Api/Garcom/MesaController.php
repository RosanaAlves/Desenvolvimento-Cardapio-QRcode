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
    // ✅ CORREÇÃO: Use os métodos do Controller pai ou remova estes métodos

    // Listar TODAS as mesas para o garçom
    public function index()
    {
        try {
            $mesas = Mesa::all();
            
            return response()->json([
                'success' => true,
                'data' => $mesas
            ]);
            
        } catch (\Exception $e) {
            Log::error('Erro em MesaController::index: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar mesas'
            ], 500);
        }
    }

    // Status das mesas - CORRIGIDO
    public function status()
    {
        try {
            $mesas = Mesa::with(['pedidosAtivos'])->get();

            $mesasComStatus = $mesas->map(function($mesa) {
                $temPedidosAtivos = $mesa->pedidosAtivos->isNotEmpty();
                
                // ✅ LÓGICA CORRIGIDA - Prioridade correta
                $status = 'livre';
                
                if ($mesa->status_pagamento === 'paga') {
                    $status = 'paga';
                } elseif ($mesa->status_pagamento === 'fechada') {
                    $status = 'fechada';
                } elseif ($temPedidosAtivos) {
                    $status = 'ocupada';
                } elseif ($mesa->status === 'em_uso') {
                    $status = 'em_uso';
                }

                return [
                    'id' => $mesa->id,
                    'numero' => $mesa->numero,
                    'status' => $status,
                    'garcom_nome' => $mesa->garcom_nome,
                    'status_pagamento' => $mesa->status_pagamento,
                    'pedidos_ativos' => $mesa->pedidosAtivos,
                    'created_at' => $mesa->created_at,
                    'updated_at' => $mesa->updated_at
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $mesasComStatus
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em MesaController::status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar status das mesas: ' . $e->getMessage()
            ], 500);
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

        // NO MesaController do Garçom - CORRIGIR A LÓGICA
    public function ocupar($id)
    {
        try {
            $mesa = Mesa::findOrFail($id);
            
            // ✅ VERIFICAR SE JÁ ESTÁ OCUPADA
            if ($mesa->status === 'ocupada') {
                return response()->json([
                    'success' => false,
                    'message' => 'Mesa já está ocupada'
                ], 400);
            }

            // ✅ APENAS MARCAR COMO "EM USO" OU "RESERVADA" - NÃO "OCUPADA"
            $mesa->update([
                'status' => 'em_uso', // ou 'reservada'
                'garcom_nome' => auth()->user()->name ?? 'Garçom',
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Mesa preparada para uso',
                'data' => $mesa
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao ocupar mesa: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao preparar mesa'
            ], 500);
        }
    }

    // ✅ MARCAR COMO OCUPADA APENAS QUANDO PRIMEIRO PEDIDO FOR FEITO
    public function marcarComoOcupada($id)
    {
        try {
            $mesa = Mesa::findOrFail($id);
            
            $mesa->update([
                'status' => 'ocupada',
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Mesa marcada como ocupada'
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao marcar mesa como ocupada: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar status da mesa'
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

    // ... outros métodos ...
    public function statusConta($id)
    {
        try {
            $mesa = Mesa::find($id);
            if (!$mesa) {
                return response()->json(['success' => false, 'message' => 'Mesa não encontrada'], 404);
            }

            $pedidos = Pedido::where('mesa_id', $id)
                            ->where('status', '!=', 'cancelado')
                            ->with('itens.produto')
                            ->get();

            $totalConta = $pedidos->sum('total');

            return response()->json([
                'success' => true,
                'data' => [
                    'total_conta' => $totalConta,
                    'pedidos' => $pedidos,
                    'mesa' => $mesa
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em MesaController::statusConta: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Erro ao carregar status da conta'], 500);
        }
    }

    // ✅ FECHAR CONTA - Com validação de status
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

            // ✅ VALIDAÇÃO: Verifica se a conta já está fechada
            if ($mesa->status_pagamento === 'fechada') {
                return response()->json([
                    'success' => false,
                    'error' => 'Conta já foi fechada! Aguarde o pagamento no caixa.'
                ], 422);
            }

            // ✅ VALIDAÇÃO: Verifica se a conta já está paga
            if ($mesa->status_pagamento === 'paga') {
                return response()->json([
                    'success' => false,
                    'error' => 'Conta já foi paga! Mesa liberada.'
                ], 422);
            }

            $pedidos = Pedido::where('mesa_id', $id)
                            ->where('status', '!=', 'cancelado')
                            ->with('itens.produto')
                            ->get();

            // ✅ VALIDAÇÃO: Verifica se há pedidos
            if ($pedidos->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Sem pedidos realizados!'
                ], 422);
            }

            $totalConta = $pedidos->sum('total');

            // ✅ Fecha a conta
            $mesa->update([
                'status_pagamento' => 'fechada'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'total_conta' => $totalConta,
                'pedidos' => $pedidos,
                'mesa' => $mesa,
                'message' => 'Conta fechada! Direcione o cliente ao caixa.'
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

    // ✅ REABRIR CONTA
    public function reabrirConta($id)
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

            // ✅ VALIDAÇÃO: Só pode reabrir se estiver fechada
            if ($mesa->status_pagamento !== 'fechada') {
                return response()->json([
                    'success' => false,
                    'message' => 'Só é possível reabrir contas que estão fechadas'
                ], 422);
            }

            // Reabrir conta
            $mesa->update([
                'status_pagamento' => 'aberta'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Conta reaberta com sucesso!'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro em MesaController::reabrirConta: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao reabrir conta: ' . $e->getMessage()
            ], 500);
        }
    }  
}
