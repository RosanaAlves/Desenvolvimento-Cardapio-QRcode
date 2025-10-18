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
    // ✅ LISTAR MESAS - CORRIGIDO PARA NOVO MODEL
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

    // ✅ STATUS DAS MESAS - CORRIGIDO PARA NOVO MODEL
    public function status()
    {
        try {
            $mesas = Mesa::with(['pedidosAtivos'])->get();

            $mesasComStatus = $mesas->map(function($mesa) {
                // ✅ USAR MÉTODOS DO MODEL EM VEZ DE LÓGICA CUSTOMIZADA
                return [
                    'id' => $mesa->id,
                    'numero' => $mesa->numero,
                    'status' => $mesa->status,
                    'status_pagamento' => $mesa->status_pagamento,
                    'status_formatado' => $mesa->status_formatado,
                    'status_pagamento_formatado' => $mesa->status_pagamento_formatado,
                    'garcom_nome' => $mesa->garcom_nome,
                    'pedidos_ativos' => $mesa->pedidosAtivos,
                    'total_conta' => $mesa->total_conta,
                    'quantidade_pedidos_ativos' => $mesa->quantidade_pedidos_ativos,
                    'cor_status' => $mesa->cor_status,
                    'cor_status_pagamento' => $mesa->cor_status_pagamento,
                    'created_at' => $mesa->created_at,
                    'updated_at' => $mesa->updated_at,
                    // ✅ INFORMAR SE PODE FECHAR CONTA
                    'pode_fechar_conta' => $mesa->contaAberta() && $mesa->total_conta > 0
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

    // ✅ PEDIDOS DA MESA - CORRIGIDO
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

    // ✅ OCUPAR MESA - CORRIGIDO PARA NOVO MODEL
    public function ocupar($id)
    {
        DB::beginTransaction();
        try {
            $mesa = Mesa::findOrFail($id);
            
            // ✅ VERIFICAR SE JÁ ESTÁ OCUPADA
            if ($mesa->estaOcupada()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mesa já está ocupada'
                ], 400);
            }

            // ✅ VERIFICAR SE JÁ TEM CONTA FECHADA OU PAGA
            if ($mesa->contaFechada() || $mesa->contaPaga()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mesa com conta fechada ou paga. Libere a mesa primeiro.'
                ], 400);
            }

            // ✅ USAR MÉTODO DO MODEL
            $resultado = $mesa->ocupar(auth()->user()->name ?? 'Garçom');

            if (!$resultado) {
                throw new \Exception('Falha ao ocupar mesa');
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Mesa ocupada com sucesso',
                'data' => $mesa->toArrayResumido()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro ao ocupar mesa: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao ocupar mesa: ' . $e->getMessage()
            ], 500);
        }
    }

    // ✅ LIBERAR MESA - CORRIGIDO PARA NOVO MODEL
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

            // ✅ VERIFICAR SE PODE LIBERAR (não pode liberar com conta fechada e valor pendente)
            if ($mesa->contaFechada() && $mesa->total_conta > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Não é possível liberar mesa com conta fechada e valor pendente. Feche o pedido no caixa primeiro.'
                ], 422);
            }

            // ✅ CANCELAR PEDIDOS ATIVOS SE HOUVER
            if ($mesa->tem_pedidos_ativos) {
                Pedido::where('mesa_id', $id)
                     ->whereIn('status', ['pendente', 'preparando', 'pronto'])
                     ->update(['status' => 'cancelado']);
            }

            // ✅ USAR MÉTODO DO MODEL
            $resultado = $mesa->liberar();

            if (!$resultado) {
                throw new \Exception('Falha ao liberar mesa');
            }

            DB::commit();

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

    // ✅ STATUS DA CONTA - CORRIGIDO
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

            return response()->json([
                'success' => true,
                'data' => [
                    'total_conta' => $mesa->total_conta,
                    'pedidos' => $mesa->pedidosAtivos,
                    'mesa' => $mesa->toArrayResumido(),
                    'pode_fechar_conta' => $mesa->contaAberta() && $mesa->total_conta > 0,
                    'pode_reabrir_conta' => $mesa->contaFechada(),
                    // ✅ INFORMAR QUE O PAGAMENTO É NO CAIXA
                    'instrucao_pagamento' => $mesa->contaFechada() ? 'Direcione o cliente ao caixa para pagamento' : null
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

    // ✅ FECHAR CONTA - GARÇOM APENAS FECHA, NÃO PAGA
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
            if ($mesa->contaFechada()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Conta já foi fechada! Aguarde o pagamento no caixa.'
                ], 422);
            }

            // ✅ VALIDAÇÃO: Verifica se a conta já está paga
            if ($mesa->contaPaga()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Conta já foi paga! Mesa liberada.'
                ], 422);
            }

            // ✅ VALIDAÇÃO: Verifica se há pedidos
            if ($mesa->total_conta <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sem pedidos realizados!'
                ], 422);
            }

            // ✅ USAR MÉTODO DO MODEL
            $resultado = $mesa->fecharConta();

            if (!$resultado) {
                throw new \Exception('Falha ao fechar conta');
            }

            DB::commit();

            // ✅ RECARREGAR DADOS ATUALIZADOS
            $mesa->refresh();

            return response()->json([
                'success' => true,
                'message' => '✅ Conta fechada com sucesso! Direcione o cliente ao caixa para pagamento.',
                'data' => [
                    'total_conta' => $mesa->total_conta,
                    'mesa' => $mesa->toArrayResumido(),
                    'instrucao' => 'Cliente deve ser direcionado ao caixa para efetuar o pagamento'
                ]
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

    // ✅ REABRIR CONTA - GARÇOM PODE REABRIR SE NECESSÁRIO
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
            if (!$mesa->contaFechada()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Só é possível reabrir contas que estão fechadas'
                ], 422);
            }

            // ✅ USAR MÉTODO DO MODEL (se existir) ou atualizar diretamente
            $mesa->update([
                'status_pagamento' => 'aberta'
            ]);

            DB::commit();

            // ✅ RECARREGAR DADOS ATUALIZADOS
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

    // ❌ REMOVIDO: Método pagarConta() - Apenas admin/caixa pode pagar conta
    // ❌ REMOVIDO: Método marcarComoOcupada() - Não é mais necessário
}