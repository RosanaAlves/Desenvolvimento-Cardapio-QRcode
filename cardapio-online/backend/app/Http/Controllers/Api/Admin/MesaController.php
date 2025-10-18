<?php
namespace App\Http\Controllers\Api\Admin;

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
            $mesas = Mesa::with(['pedidosAtivos' => function($query) {
                $query->select('id', 'mesa_id', 'status', 'total', 'created_at');
            }])->orderBy('numero')->get();

            // ✅ USAR MÉTODO DO MODEL EM VEZ DE LÓGICA CUSTOMIZADA
            $mesasComInfo = $mesas->map(function($mesa) {
                return array_merge($mesa->toArrayResumido(), [
                    'pedidos_ativos_count' => $mesa->quantidade_pedidos_ativos,
                    'pedidos_ativos' => $mesa->pedidosAtivos
                ]);
            });

            return response()->json([
                'success' => true,
                'data' => $mesasComInfo
            ]);
        } catch (\Exception $e) {
            Log::error('Erro em Admin MesaController::index: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar mesas: ' . $e->getMessage()
            ], 500);
        }
    }

    // ✅ PAGAR CONTA DA MESA - CORRIGIDO PARA NOVO MODEL
    public function pagarConta($id)
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

            // ✅ VERIFICAR SE A MESA TEM CONTA FECHADA
            if (!$mesa->contaFechada()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mesa não possui conta fechada para pagar. Status atual: ' . $mesa->status_pagamento
                ], 422);
            }

            // ✅ USAR MÉTODO DO MODEL (que já cuida dos pedidos)
            $resultado = $mesa->pagarConta();

            if (!$resultado) {
                throw new \Exception('Falha ao pagar conta da mesa');
            }

            DB::commit();

            Log::info('✅ Conta da mesa paga', [
                'mesa_id' => $mesa->id,
                'mesa_numero' => $mesa->numero,
                'status_anterior' => 'fechada',
                'status_novo' => 'paga'
            ]);

            // ✅ RECARREGAR MESA COM DADOS ATUALIZADOS
            $mesa->refresh();

            return response()->json([
                'success' => true,
                'message' => 'Conta da mesa paga com sucesso! Mesa liberada.',
                'data' => $mesa->toArrayResumido()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('❌ Erro em Admin MesaController::pagarConta: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao pagar conta da mesa: ' . $e->getMessage()
            ], 500);
        }
    }

    // ✅ LIBERAR MESA FORÇADAMENTE (ADMIN) - CORRIGIDO
    public function liberarMesa($id)
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

            // ✅ CANCELAR PEDIDOS ATIVOS
            Pedido::where('mesa_id', $id)
                 ->whereIn('status', ['pendente', 'preparando', 'pronto'])
                 ->update(['status' => 'cancelado']);

            // ✅ USAR MÉTODO DO MODEL PARA LIBERAR
            $mesa->liberar();

            DB::commit();

            // ✅ RECARREGAR MESA COM DADOS ATUALIZADOS
            $mesa->refresh();

            return response()->json([
                'success' => true,
                'message' => 'Mesa liberada forçadamente com sucesso!',
                'data' => $mesa->toArrayResumido()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro em Admin MesaController::liberarMesa: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao liberar mesa: ' . $e->getMessage()
            ], 500);
        }
    }

    // ✅ FECHAR CONTA DA MESA - NOVO MÉTODO
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

            // ✅ VERIFICAR SE PODE FECHAR CONTA
            if (!$mesa->contaAberta()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Conta já está fechada ou paga'
                ], 422);
            }

            if ($mesa->total_conta <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Não é possível fechar conta sem pedidos ativos'
                ], 422);
            }

            // ✅ USAR MÉTODO DO MODEL
            $resultado = $mesa->fecharConta();

            if (!$resultado) {
                throw new \Exception('Falha ao fechar conta da mesa');
            }

            DB::commit();

            // ✅ RECARREGAR MESA COM DADOS ATUALIZADOS
            $mesa->refresh();

            return response()->json([
                'success' => true,
                'message' => 'Conta fechada com sucesso!',
                'data' => $mesa->toArrayResumido()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('❌ Erro em Admin MesaController::fecharConta: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao fechar conta: ' . $e->getMessage()
            ], 500);
        }
    }

    // ✅ ESTATÍSTICAS DAS MESAS - CORRIGIDO
    public function estatisticas()
    {
        try {
            $totalMesas = Mesa::count();
            $mesasLivres = Mesa::where('status', 'livre')->count();
            $mesasOcupadas = Mesa::where('status', 'ocupada')->count();
            $mesasComContaFechada = Mesa::where('status_pagamento', 'fechada')->count();
            $mesasComContaPaga = Mesa::where('status_pagamento', 'paga')->count();

            $mesasEmUso = $mesasOcupadas + $mesasComContaFechada;

            return response()->json([
                'success' => true,
                'data' => [
                    'total_mesas' => $totalMesas,
                    'mesas_livres' => $mesasLivres,
                    'mesas_ocupadas' => $mesasOcupadas,
                    'mesas_conta_fechada' => $mesasComContaFechada,
                    'mesas_conta_paga' => $mesasComContaPaga,
                    'mesas_em_uso' => $mesasEmUso,
                    'taxa_ocupacao' => $totalMesas > 0 ? round(($mesasEmUso / $totalMesas) * 100, 2) : 0
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em Admin MesaController::estatisticas: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar estatísticas'
            ], 500);
        }
    }

    // ✅ DETALHES DA MESA - NOVO MÉTODO
    public function show($id)
    {
        try {
            $mesa = Mesa::with(['pedidosAtivos.produto', 'pedidos' => function($query) {
                $query->orderBy('created_at', 'desc')->limit(10);
            }])->find($id);

            if (!$mesa) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mesa não encontrada'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $mesa->toArrayAdmin()
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em Admin MesaController::show: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar detalhes da mesa'
            ], 500);
        }
    }
}