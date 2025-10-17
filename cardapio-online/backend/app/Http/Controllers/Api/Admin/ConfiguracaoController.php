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

    // ✅ ATUALIZAR CONFIGURAÇÕES - VERSÃO SIMPLIFICADA (NO CONTROLLER)
    public function update(Request $request)
    {
        try {
            \Log::info('📥 Recebendo atualização de configurações:', $request->all());

            $request->validate([
                'nome_estabelecimento' => 'sometimes|string|max:255',
                'telefone' => 'sometimes|string|max:20',
                'numero_mesas' => 'sometimes|integer|min:1|max:50',
                'taxa_servico' => 'sometimes|numeric|min:0'
            ]);

            \Log::info('✅ Validação passou');

            // 🔥 ALTERNATIVA SIMPLES - Atualização direta
            $config = \App\Models\Configuracao::first();
            
            if (!$config) {
                \Log::error('❌ Configuração não encontrada');
                return response()->json([
                    'success' => false,
                    'message' => 'Configuração não encontrada'
                ], 404);
            }

            \Log::info('📋 Configuração encontrada:', ['id' => $config->id]);

            // Atualizar campos individualmente
            if ($request->has('nome_estabelecimento')) {
                $config->nome_estabelecimento = $request->nome_estabelecimento;
            }
            
            if ($request->has('telefone')) {
                $config->telefone = $request->telefone;
            }
            
            if ($request->has('numero_mesas')) {
                $config->numero_mesas = $request->numero_mesas;
            }
            
            if ($request->has('taxa_servico')) {
                $config->taxa_servico = $request->taxa_servico;
            }

            \Log::info('💾 Salvando configuração...');
            $config->save();
            \Log::info('✅ Configuração salva com sucesso');

            return response()->json([
                'success' => true,
                'data' => $config,
                'message' => 'Configurações atualizadas com sucesso!'
            ]);

        } catch (\Exception $e) {
            \Log::error('❌ Erro em ConfiguracaoController::update: ' . $e->getMessage());
            \Log::error('❌ Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar configurações: ' . $e->getMessage(),
                'debug' => 'Verifique os logs do servidor'
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