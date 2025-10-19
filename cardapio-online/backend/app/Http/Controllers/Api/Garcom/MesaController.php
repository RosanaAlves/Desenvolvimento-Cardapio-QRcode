<?php

namespace App\Http\Controllers\Api\Garcom;

use App\Http\Controllers\Controller;
use App\Models\Mesa; // ✅ CORRIGIDO
use App\Models\Pedido; // ✅ CORRIGIDO
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
            // ✅ PRÉ-CARREGAMENTO EFICIENTE DE TODOS OS DADOS NECESSÁRIOS
            $mesas = Mesa::with(['pedidosAtivos', 'pedidosEntregues'])->orderBy('numero')->get();

            // ✅ LÓGICA SIMPLES E CONSISTENTE USANDO O MÉTODO DO MODEL
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
    // app/Http/Controllers/Api/Garcom/MesaController.php

    // ATENÇÃO: Adicione 'use Illuminate\Http\Request;' no topo do arquivo se não houver.

    public function ocupar(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            // ✅ VALIDAÇÃO DO NOME DO GARÇOM ENVIADO PELO FRONTEND
            $request->validate([
                'garcom_nome' => 'required|string|max:255'
            ]);

            $mesa = Mesa::findOrFail($id);
            
            if ($mesa->estaOcupada()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mesa já está ocupada'
                ], 400);
            }

            if ($mesa->contaFechada() || $mesa->contaPaga()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mesa com conta fechada ou paga. Libere a mesa primeiro.'
                ], 400);
            }

            // ✅ CORREÇÃO: Usa o 'garcom_nome' que veio da requisição
            $resultado = $mesa->ocupar($request->garcom_nome);

            if (!$resultado) {
                throw new \Exception('Falha ao atualizar o status da mesa no banco de dados.');
            }

            DB::commit();

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

            $totalConta = $mesa->pedidos()
                ->where('status', 'entregue')
                ->sum('total');

            $pedidosEmAndamento = $mesa->pedidos()
                ->whereIn('status', ['pendente', 'preparando', 'pronto'])
                ->exists();

            $pedidosEntregues = $mesa->pedidos()
                ->where('status', 'entregue')
                ->exists();

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

    // ✅ FECHAR CONTA - GARÇOM APENAS FECHA, NÃO PAGA
    
   // ✅ FECHAR CONTA - CORREÇÃO FINAL
   // app/Http/Controllers/Api/Garcom/MesaController.php

    public function fecharConta($id)
    {
        DB::beginTransaction();
        try {
            $mesa = Mesa::with(['pedidos'])->find($id);
            
            if (!$mesa) {
                return response()->json(['success' => false, 'message' => 'Mesa não encontrada'], 404);
            }

            if ($mesa->contaFechada() || $mesa->contaPaga()) {
                return response()->json(['success' => false, 'message' => 'Conta já foi fechada ou paga.'], 422);
            }

            // ✅ LÓGICA CORRIGIDA:
            // 1. Verifica se ainda há pedidos sendo preparados na cozinha.
            $pedidosEmAndamento = $mesa->pedidos()->whereIn('status', ['pendente', 'preparando'])->exists();
            if ($pedidosEmAndamento) {
                return response()->json([
                    'success' => false,
                    'message' => 'Não é possível fechar conta! Existem pedidos em andamento na cozinha.'
                ], 422);
            }
            
            // 2. Verifica se existe pelo menos um pedido que já saiu da cozinha (pronto ou entregue).
            $temPedidosConcluidos = $mesa->pedidos()->whereIn('status', ['pronto', 'entregue'])->exists();
            if (!$temPedidosConcluidos) {
                return response()->json([
                    'success' => false,
                    'message' => 'Não é possível fechar conta! Nenhum pedido foi finalizado ainda.'
                ], 422);
            }
            
            // ✅ ATUALIZA O STATUS DA MESA
            $mesa->fecharConta(); // Usa o método do model para consistência

            DB::commit();

            $mesa->refresh();

            return response()->json([
                'success' => true,
                'message' => '✅ Conta fechada com sucesso! Direcione o cliente ao caixa.',
                'data' => [
                    'total_conta' => $mesa->total_conta,
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