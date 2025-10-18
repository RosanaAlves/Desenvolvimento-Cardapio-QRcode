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
    // ✅ LISTAR MESAS COM NOVOS STATUS - CORRIGIDO
    public function index()
    {
        try {
            $mesas = Mesa::with(['pedidos' => function($query) {
                $query->whereIn('status', ['pendente', 'preparando', 'pronto']);
            }])->orderBy('numero')->get();

            // ✅ ADICIONAR INFORMAÇÕES ADICIONAIS
            $mesasComInfo = $mesas->map(function($mesa) {
                $pedidosAtivos = $mesa->pedidos->count();
                $totalConta = $mesa->pedidos->sum('total');
                
                // ✅ CORREÇÃO: Determinar status correto da mesa
                $statusMesa = $mesa->status;
                if ($mesa->status_pagamento === 'fechada') {
                    $statusMesa = 'fechada';
                } elseif ($mesa->status_pagamento === 'paga') {
                    $statusMesa = 'livre';
                }

                return [
                    'id' => $mesa->id,
                    'numero' => $mesa->numero,
                    'status' => $statusMesa,
                    'status_pagamento' => $mesa->status_pagamento,
                    'garcom_nome' => $mesa->garcom_nome,
                    'capacidade' => $mesa->capacidade,
                    'disponivel' => $mesa->disponivel,
                    'pedidos_ativos' => $pedidosAtivos,
                    'total_conta' => $totalConta,
                    'created_at' => $mesa->created_at,
                    'updated_at' => $mesa->updated_at,
                    'pedidos' => $mesa->pedidos
                ];
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

    // ✅ PAGAR CONTA DA MESA - CORRIGIDO
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

            // ✅ VERIFICAR SE A MESA TEM CONTA PARA PAGAR
            if ($mesa->status_pagamento !== 'fechada') {
                return response()->json([
                    'success' => false,
                    'message' => 'Mesa não possui conta fechada para pagar. Status atual: ' . $mesa->status_pagamento
                ], 422);
            }

            // ✅ MARCAR PEDIDOS COMO ENTREGUES
            Pedido::where('mesa_id', $id)
                 ->whereIn('status', ['pendente', 'preparando', 'pronto'])
                 ->update(['status' => 'entregue']);

            // ✅ ATUALIZAR STATUS DA MESA PARA LIVRE
            $mesa->update([
                'status' => 'livre',
                'status_pagamento' => 'paga',
                'garcom_nome' => null
            ]);

            DB::commit();

            Log::info('✅ Conta da mesa paga', [
                'mesa_id' => $mesa->id,
                'mesa_numero' => $mesa->numero,
                'status_anterior' => 'fechada',
                'status_novo' => 'paga'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Conta da mesa paga com sucesso! Mesa liberada.',
                'data' => $mesa
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

    // ✅ LIBERAR MESA FORÇADAMENTE (ADMIN)
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

            // ✅ LIBERAR MESA COMPLETAMENTE
            $mesa->update([
                'status' => 'livre',
                'status_pagamento' => 'aberta',
                'garcom_nome' => null
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Mesa liberada forçadamente com sucesso!',
                'data' => $mesa
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

    // ✅ ESTATÍSTICAS DAS MESAS - CORRIGIDO
    public function estatisticas()
    {
        try {
            $totalMesas = Mesa::count();
            $mesasLivres = Mesa::where('status', 'livre')->count();
            $mesasOcupadas = Mesa::where('status', 'ocupada')->count();
            $mesasFechadas = Mesa::where('status_pagamento', 'fechada')->count();
            $mesasPagas = Mesa::where('status_pagamento', 'paga')->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_mesas' => $totalMesas,
                    'mesas_livres' => $mesasLivres,
                    'mesas_ocupadas' => $mesasOcupadas,
                    'mesas_fechadas' => $mesasFechadas,
                    'mesas_pagas' => $mesasPagas,
                    'taxa_ocupacao' => $totalMesas > 0 ? round((($mesasOcupadas + $mesasFechadas) / $totalMesas) * 100, 2) : 0
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
}