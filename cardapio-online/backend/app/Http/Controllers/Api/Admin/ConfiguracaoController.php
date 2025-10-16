<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Configuracao;
use App\Models\Mesa;
use App\Models\Pedido;
use App\Models\Produto;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ConfiguracaoController extends Controller
{
    // ✅ OBTER CONFIGURAÇÕES
    public function index()
    {
        try {
            $config = Configuracao::getConfig();
            
            return response()->json([
                'success' => true,
                'data' => $config
            ]);
            
        } catch (\Exception $e) {
            Log::error('Erro em ConfiguracaoController::index: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar configurações'
            ], 500);
        }
    }

    // ✅ ATUALIZAR CONFIGURAÇÕES
    public function update(Request $request)
    {
        try {
            $request->validate([
                'nome_estabelecimento' => 'sometimes|string|max:255',
                'telefone' => 'sometimes|string|max:20',
                'numero_mesas' => 'sometimes|integer|min:1|max:50',
                'taxa_servico' => 'sometimes|numeric|min:0'
            ]);

            $config = Configuracao::getConfig();
            $config->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $config,
                'message' => 'Configurações atualizadas com sucesso!'
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em ConfiguracaoController::update: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar configurações'
            ], 500);
        }
    }

    // ✅ REINICIAR SISTEMA (zerar mesas e pedidos)
    public function reiniciarSistema()
    {
        DB::beginTransaction();
        try {
            // 🔄 LIBERAR TODAS AS MESAS
            Mesa::query()->update([
                'status' => 'livre',
                'garcom_nome' => null,
                'status_pagamento' => 'aberta'
            ]);

            // 🔄 CANCELAR PEDIDOS EM ABERTO (não entregues)
            Pedido::where('status', '!=', 'entregue')
                 ->where('status', '!=', 'cancelado')
                 ->update(['status' => 'cancelado']);

            // 🔄 FECHAR EXPEDIENTE
            $config = Configuracao::getConfig();
            $config->update(['expediente_aberto' => false]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Sistema reiniciado com sucesso! Todas as mesas foram liberadas.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro em ConfiguracaoController::reiniciarSistema: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao reiniciar sistema'
            ], 500);
        }
    }

    // ✅ DASHBOARD - ADMIN
    public function dashboard()
    {
        try {
            $mesasOcupadas = Mesa::whereHas('pedidos', function($query) {
                $query->whereIn('status', ['pendente', 'preparando', 'pronto']);
            })->count();
            
            $stats = [
                'total_mesas' => Mesa::count(),
                'mesas_ocupadas' => $mesasOcupadas,
                'mesas_livres' => Mesa::count() - $mesasOcupadas,
                'total_pedidos' => Pedido::count(),
                'pedidos_pendentes' => Pedido::where('status', 'pendente')->count(),
                'pedidos_preparando' => Pedido::where('status', 'preparando')->count(),
                'pedidos_prontos' => Pedido::where('status', 'pronto')->count(),
                'pedidos_entregues' => Pedido::where('status', 'entregue')->count(),
                'pedidos_hoje' => Pedido::whereDate('created_at', today())->count(),
                'total_produtos' => Produto::count(),
                'total_categorias' => Categoria::count(),
            ];
            
            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Erro em ConfiguracaoController::dashboard: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar dashboard'
            ], 500);
        }
    }
}