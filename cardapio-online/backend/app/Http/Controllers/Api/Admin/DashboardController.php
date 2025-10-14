<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Models\Mesa;
use App\Models\Produto;
use App\Models\Categoria;
use App\Models\Configuracao;
use App\Models\Expediente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function estatisticas()
    {
        $expedienteAtivo = Expediente::where('ativo', true)->first();
        
        $estatisticas = [
            'total_categorias' => Categoria::count(),
            'categorias_ativas' => Categoria::where('disponivel', true)->count(),
            'total_produtos' => Produto::count(),
            'produtos_ativos' => Produto::where('disponivel', true)->count(),
            'total_mesas' => Mesa::count(),
            'mesas_ocupadas' => Mesa::where('status', 'ocupada')->count(),
            'pedidos_hoje' => Pedido::whereDate('created_at', today())->count(),
            'vendas_hoje' => Pedido::whereDate('created_at', today())
                                ->where('status', '!=', 'cancelado')
                                ->sum('total'),
            'expediente_ativo' => $expedienteAtivo ? true : false,
            'total_expediente' => $expedienteAtivo ? $expedienteAtivo->total_vendido : 0
        ];
        
        return response()->json($estatisticas);
    }

    // Iniciar expediente
    public function iniciarExpediente(Request $request)
    {
        $request->validate([
            'total_mesas' => 'required|integer|min:1|max:50'
        ]);

        DB::beginTransaction();
        try {
            // Finalizar expediente anterior se existir
            Expediente::where('ativo', true)->update(['ativo' => false]);

            // Criar novo expediente
            $expediente = Expediente::create([
                'data' => now()->format('Y-m-d'),
                'iniciado_em' => now(),
                'ativo' => true
            ]);

            // Reiniciar mesas
            Mesa::query()->update([
                'status' => 'livre',
                'garcom_nome' => null,
                'status_pagamento' => 'aberta'
            ]);

            // Atualizar configuração de mesas
            Configuracao::first()->update([
                'total_mesas' => $request->total_mesas
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Expediente iniciado com sucesso!',
                'expediente' => $expediente
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Erro ao iniciar expediente'], 500);
        }
    }

    // Finalizar expediente
    public function finalizarExpediente()
    {
        DB::beginTransaction();
        try {
            $expediente = Expediente::where('ativo', true)->first();
            
            if (!$expediente) {
                return response()->json(['error' => 'Nenhum expediente ativo'], 422);
            }

            // Calcular total vendido no dia
            $totalVendido = Pedido::whereDate('created_at', $expediente->data)
                                ->where('status', '!=', 'cancelado')
                                ->sum('total');

            $expediente->update([
                'finalizado_em' => now(),
                'total_vendido' => $totalVendido,
                'ativo' => false
            ]);

            // Liberar todas as mesas
            Mesa::query()->update([
                'status' => 'livre',
                'garcom_nome' => null,
                'status_pagamento' => 'aberta'
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Expediente finalizado!',
                'total_vendido' => $totalVendido,
                'expediente' => $expediente
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Erro ao finalizar expediente'], 500);
        }
    }

    // Reiniciar sistema (apenas admin)
    public function reiniciarSistema()
    {
        // 🔒 Esta função deve ter uma validação extra de segurança
        DB::beginTransaction();
        try {
            // Liberar todas as mesas
            Mesa::query()->update([
                'status' => 'livre',
                'garcom_nome' => null,
                'status_pagamento' => 'aberta'
            ]);

            // Cancelar pedidos pendentes
            Pedido::whereIn('status', ['pendente', 'preparando'])
                  ->update([
                      'status' => 'cancelado',
                      'cancelado_em' => now()
                  ]);

            DB::commit();

            return response()->json(['message' => 'Sistema reiniciado com sucesso!']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Erro ao reiniciar sistema'], 500);
        }
    }
}