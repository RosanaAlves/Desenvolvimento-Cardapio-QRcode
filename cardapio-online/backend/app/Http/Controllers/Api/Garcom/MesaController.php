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
    // ✅ LISTAR MESAS
    public function index()
    {
        try {
            $mesas = Mesa::with(['pedidosAtivos'])->orderBy('numero')->get();
            
            return response()->json([
                'success' => true,
                'data' => $mesas->map(function($mesa) {
                    return $mesa->toArrayResumido();
                })
            ]);
            
        } catch (\Exception $e) {
            Log::error('Erro em MesaController::index: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar mesas'
            ], 500);
        }
    }

    // ✅ STATUS DAS MESAS
    public function status()
    {
        try {
            $mesas = Mesa::with(['pedidosAtivos', 'pedidosEntregues'])->orderBy('numero')->get();

            return response()->json([
                'success' => true,
                'data' => $mesas->map(fn($mesa) => $mesa->toArrayResumido())
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em MesaController::status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar status das mesas: ' . $e->getMessage()
            ], 500);
        }
    }

    // ✅ PEDIDOS DA MESA
    public function pedidos($mesaId)
    {
        try {
            $pedidos = Pedido::where('mesa_id', $mesaId)
                            ->where('status', '!=', 'cancelado')
                            ->with(['itens.produto', 'mesa'])
                            ->orderBy('created_at', 'desc')
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

    // ✅ OCUPAR MESA - CORREÇÃO CRÍTICA
    public function ocupar(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            // ✅ VALIDAÇÃO DO NOME DO GARÇOM
            $request->validate([
                'garcom_nome' => 'required|string|max:255'
            ]);

            $mesa = Mesa::findOrFail($id);
            
            // ✅ VERIFICAÇÕES SIMPLIFICADAS E FUNCIONAIS
            if ($mesa->status === 'ocupada') {
                return response()->json([
                    'success' => false,
                    'message' => 'Mesa já está ocupada'
                ], 400);
            }

            if ($mesa->status_pagamento === 'fechada' || $mesa->status_pagamento === 'paga') {
                return response()->json([
                    'success' => false,
                    'message' => 'Mesa com conta fechada ou paga. Libere a mesa primeiro.'
                ], 400);
            }

            // ✅ OCUPAÇÃO DIRETA - MÉTODO SIMPLES E FUNCIONAL
            $mesa->update([
                'status' => 'ocupada',
                'garcom_nome' => $request->garcom_nome,
                'status_pagamento' => 'aberta'
            ]);

            DB::commit();

            // ✅ RECARREGA OS DADOS ATUALIZADOS
            $mesa->refresh();

            return response()->json([
                'success' => true,
                'message' => 'Mesa ocupada com sucesso',
                'data' => $mesa->toArrayResumido()
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'O nome do garçom é obrigatório.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro ao ocupar mesa: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao ocupar mesa: ' . $e->getMessage()
            ], 500);
        }
    }

    // ✅ LIBERAR MESA - CORREÇÃO CRÍTICA
    public function liberar($id)
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

            // ✅ VERIFICAÇÃO SIMPLIFICADA
            if ($mesa->status_pagamento === 'fechada' && $mesa->total_conta > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Não é possível liberar mesa com conta fechada e valor pendente.'
                ], 422);
            }

            // ✅ CANCELAR PEDIDOS ATIVOS
            Pedido::where('mesa_id', $id)
                 ->whereIn('status', ['pendente', 'preparando', 'pronto'])
                 ->update(['status' => 'cancelado']);

            // ✅ LIBERAÇÃO DIRETA
            $mesa->update([
                'status' => 'livre',
                'garcom_nome' => null,
                'status_pagamento' => 'aberta',
                'total_conta' => 0
            ]);

            DB::commit();

            $mesa->refresh();

            return response()->json([
                'success' => true,
                'message' => 'Mesa liberada com sucesso!',
                'data' => $mesa->toArrayResumido()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro em MesaController::liberar: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao liberar mesa: ' . $e->getMessage()
            ], 500);
        }
    }

    // ✅ STATUS DA CONTA - CORREÇÃO
    public function statusConta($id)
    {
        try {
            $mesa = Mesa::with(['pedidosAtivos.itens.produto'])->find($id);
            
            if (!$mesa) {
                return response()->json([
                    'success' => false, 
                    'message' => 'Mesa não encontrada'
                ], 404);
            }

            // ✅ CALCULA O TOTAL CORRETAMENTE
            $totalConta = $mesa->pedidos()
                ->where('status', 'entregue')
                ->sum('total');

            return response()->json([
                'success' => true,
                'data' => [
                    'total_conta' => $totalConta,
                    'pedidos' => $mesa->pedidosAtivos,
                    'mesa' => $mesa->toArrayResumido(),
                    'pode_fechar_conta' => $this->podeFecharContaInterno($mesa),
                    'pode_reabrir_conta' => $mesa->status_pagamento === 'fechada',
                    'instrucao_pagamento' => $mesa->status_pagamento === 'fechada' ? 'Direcione o cliente ao caixa para pagamento' : null
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em MesaController::statusConta: ' . $e->getMessage());
            return response()->json([
                'success' => false, 
                'message' => 'Erro ao carregar status da conta'
            ], 500);
        }
    }

    // ✅ MÉTODO AUXILIAR PARA VERIFICAR SE PODE FECHAR CONTA
    private function podeFecharContaInterno($mesa)
    {
        $pedidosEmAndamento = $mesa->pedidos()
            ->whereIn('status', ['pendente', 'preparando', 'pronto'])
            ->exists();

        $pedidosEntregues = $mesa->pedidos()
            ->where('status', 'entregue')
            ->exists();

        $totalConta = $mesa->pedidos()
            ->where('status', 'entregue')
            ->sum('total');

        return !$pedidosEmAndamento && $pedidosEntregues && $totalConta > 0;
    }
    
    // ✅ VERIFICAR SE PODE FECHAR CONTA
    public function podeFecharConta($id)
    {
        try {
            $mesa = Mesa::with(['pedidos'])->find($id);
            
            if (!$mesa) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mesa não encontrada'
                ], 404);
            }

            $pedidosEmAndamento = $mesa->pedidos()
                ->whereIn('status', ['pendente', 'preparando', 'pronto'])
                ->exists();

            $pedidosEntregues = $mesa->pedidos()
                ->where('status', 'entregue')
                ->exists();

            $totalConta = $mesa->pedidos()
                ->where('status', 'entregue')
                ->sum('total');

            $podeFechar = !$pedidosEmAndamento && $pedidosEntregues && $totalConta > 0;

            return response()->json([
                'success' => true,
                'data' => [
                    'pode_fechar' => $podeFechar,
                    'total_conta' => $totalConta,
                    'pedidos_em_andamento' => $pedidosEmAndamento,
                    'pedidos_entregues' => $pedidosEntregues,
                    'mensagem' => $podeFechar ? 
                        'Pronto para fechar conta' : 
                        ($pedidosEmAndamento ? 
                            'Existem pedidos em andamento' : 
                            (!$pedidosEntregues ? 
                                'Não há pedidos entregues' : 
                                'Sem valor para fechar conta'
                            )
                        )
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em MesaController::podeFecharConta: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao verificar conta'
            ], 500);
        }
    }

    // ✅ FECHAR CONTA - CORREÇÃO CRÍTICA
    public function fecharConta($id)
    {
        DB::beginTransaction();
        try {
            $mesa = Mesa::with(['pedidos'])->find($id);
            
            if (!$mesa) {
                return response()->json(['success' => false, 'message' => 'Mesa não encontrada'], 404);
            }

            // ✅ VERIFICAÇÕES SIMPLIFICADAS
            if ($mesa->status_pagamento === 'fechada' || $mesa->status_pagamento === 'paga') {
                return response()->json(['success' => false, 'message' => 'Conta já foi fechada ou paga.'], 422);
            }

            // ✅ VERIFICA SE PODE FECHAR
            $podeFechar = $this->podeFecharContaInterno($mesa);
            if (!$podeFechar) {
                return response()->json([
                    'success' => false,
                    'message' => 'Não é possível fechar conta! Existem pedidos em andamento ou nenhum pedido entregue.'
                ], 422);
            }

            // ✅ FECHA A CONTA DIRETAMENTE
            $mesa->update([
                'status_pagamento' => 'fechada'
            ]);

            DB::commit();

            $mesa->refresh();

            return response()->json([
                'success' => true,
                'message' => '✅ Conta fechada com sucesso! Direcione o cliente ao caixa.',
                'data' => [
                    'total_conta' => $mesa->pedidos()->where('status', 'entregue')->sum('total'),
                    'mesa' => $mesa->toArrayResumido(),
                    'instrucao' => 'Cliente deve ser direcionado ao caixa para efetuar o pagamento'
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro em MesaController::fecharConta: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Erro interno ao fechar conta.'], 500);
        }
    }

    // ✅ REABRIR CONTA - CORREÇÃO
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

            // ✅ VERIFICAÇÃO SIMPLIFICADA
            if ($mesa->status_pagamento !== 'fechada') {
                return response()->json([
                    'success' => false,
                    'message' => 'Só é possível reabrir contas que estão fechadas'
                ], 422);
            }

            // ✅ REABRE A CONTA
            $mesa->update([
                'status_pagamento' => 'aberta'
            ]);

            DB::commit();

            $mesa->refresh();

            return response()->json([
                'success' => true,
                'message' => 'Conta reaberta com sucesso!',
                'data' => $mesa->toArrayResumido()
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