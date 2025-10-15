<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Configuracao;
use App\Models\Pedido;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ExpedienteController extends Controller
{
    // ✅ STATUS DO EXPEDIENTE
    public function status()
    {
        try {
            $config = Configuracao::getConfig();
            
            // Estatísticas do dia atual
            $hoje = now()->format('Y-m-d');
            $pedidosHoje = Pedido::whereDate('created_at', $hoje)->count();
            $vendasHoje = Pedido::whereDate('created_at', $hoje)->sum('total');
            
            return response()->json([
                'success' => true,
                'data' => [
                    'expediente_aberto' => $config->expediente_aberto,
                    'pedidos_hoje' => $pedidosHoje,
                    'vendas_hoje' => (float) $vendasHoje,
                    'configuracao' => $config
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Erro em ExpedienteController::status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao verificar status do expediente'
            ], 500);
        }
    }

    // ✅ ABRIR EXPEDIENTE
    public function abrirExpediente()
    {
        DB::beginTransaction();
        try {
            $config = Configuracao::getConfig();
            
            if ($config->expediente_aberto) {
                return response()->json([
                    'success' => false,
                    'message' => 'Expediente já está aberto!'
                ], 422);
            }

            $config->update(['expediente_aberto' => true]);

            // Criar log de abertura
            // LogExpediente::create(['tipo' => 'abertura', 'user_id' => auth()->id()]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Expediente aberto com sucesso!'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro em ExpedienteController::abrirExpediente: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao abrir expediente'
            ], 500);
        }
    }

    // ✅ FECHAR EXPEDIENTE (com relatório)
    public function fecharExpediente()
    {
        DB::beginTransaction();
        try {
            $config = Configuracao::getConfig();
            
            if (!$config->expediente_aberto) {
                return response()->json([
                    'success' => false,
                    'message' => 'Expediente já está fechado!'
                ], 422);
            }

            // Gerar relatório do dia
            $hoje = now()->format('Y-m-d');
            $relatorio = $this->gerarRelatorioDia($hoje);

            // Fechar expediente
            $config->update(['expediente_aberto' => false]);

            // Criar log de fechamento
            // LogExpediente::create([
            //     'tipo' => 'fechamento', 
            //     'user_id' => auth()->id(),
            //     'dados' => json_encode($relatorio)
            // ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Expediente fechado com sucesso!',
                'relatorio' => $relatorio
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro em ExpedienteController::fecharExpediente: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao fechar expediente'
            ], 500);
        }
    }

    // ✅ GERAR RELATÓRIO DO DIA
    private function gerarRelatorioDia($data)
    {
        $pedidos = Pedido::whereDate('created_at', $data)
                        ->with(['itens.produto', 'mesa'])
                        ->get();

        $totalVendas = $pedidos->sum('total');
        $totalPedidos = $pedidos->count();
        $pedidosPorStatus = $pedidos->groupBy('status')->map->count();

        return [
            'data' => $data,
            'total_pedidos' => $totalPedidos,
            'total_vendas' => (float) $totalVendas,
            'pedidos_por_status' => $pedidosPorStatus,
            'pedidos' => $pedidos
        ];
    }

    // ✅ RELATÓRIO POR DATA
    public function relatorioPorData(Request $request)
    {
        try {
            $request->validate([
                'data' => 'required|date'
            ]);

            $relatorio = $this->gerarRelatorioDia($request->data);

            return response()->json([
                'success' => true,
                'data' => $relatorio
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em ExpedienteController::relatorioPorData: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao gerar relatório'
            ], 500);
        }
    }
}