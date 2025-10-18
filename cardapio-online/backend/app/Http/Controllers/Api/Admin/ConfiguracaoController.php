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
    // ✅ OBTER CONFIGURAÇÕES - CORRIGIDO
    public function index()
    {
        try {
            // Usar firstOrCreate para evitar erros se não existir
            $config = Configuracao::firstOrCreate([], [
                'nome_estabelecimento' => 'Jetro\'s Lanches',
                'telefone' => '',
                'numero_mesas' => 10,
                'taxa_servico' => 0,
                'expediente_aberto' => false
            ]);
            
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

    // ✅ ATUALIZAR CONFIGURAÇÕES - CORRIGIDO
    public function update(Request $request)
    {
        DB::beginTransaction();
        try {
            Log::info('📥 Recebendo atualização de configurações:', $request->all());

            $validated = $request->validate([
                'nome_estabelecimento' => 'sometimes|string|max:255',
                'telefone' => 'sometimes|string|max:20',
                'numero_mesas' => 'sometimes|integer|min:1|max:50',
                'taxa_servico' => 'sometimes|numeric|min:0|max:100'
            ]);

            Log::info('✅ Validação passou');

            // 🔥 USAR firstOrCreate PARA EVITAR ERROS
            $config = Configuracao::firstOrCreate([], [
                'nome_estabelecimento' => 'Jetro\'s Lanches',
                'telefone' => '',
                'numero_mesas' => 10,
                'taxa_servico' => 0,
                'expediente_aberto' => false
            ]);

            Log::info('📋 Configuração encontrada/criada:', ['id' => $config->id]);

            // ✅ CORREÇÃO: Atualizar número de mesas se necessário
            if (isset($validated['numero_mesas'])) {
                $this->atualizarNumeroMesas($validated['numero_mesas']);
            }

            // Atualizar apenas os campos fornecidos
            $config->fill($validated);
            $config->save();

            Log::info('✅ Configuração salva com sucesso');

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $config,
                'message' => 'Configurações atualizadas com sucesso!'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('❌ Erro em ConfiguracaoController::update: ' . $e->getMessage());
            Log::error('❌ Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar configurações: ' . $e->getMessage()
            ], 500);
        }
    }

    // ✅ CORREÇÃO: Método para atualizar número de mesas
    private function atualizarNumeroMesas($novoNumero)
    {
        $mesasAtuais = Mesa::count();
        
        if ($novoNumero > $mesasAtuais) {
            // Adicionar mesas faltantes
            for ($i = $mesasAtuais + 1; $i <= $novoNumero; $i++) {
                Mesa::create([
                    'numero' => $i,
                    'status' => 'livre',
                    'status_pagamento' => 'aberta',
                    'capacidade' => 4,
                    'disponivel' => true
                ]);
            }
        } elseif ($novoNumero < $mesasAtuais) {
            // Remover mesas extras (apenas se estiverem livres)
            $mesasParaRemover = Mesa::where('numero', '>', $novoNumero)
                ->where('status', 'livre')
                ->get();
                
            foreach ($mesasParaRemover as $mesa) {
                $mesa->delete();
            }
        }
        
        Log::info('🔄 Número de mesas atualizado', [
            'antes' => $mesasAtuais,
            'depois' => $novoNumero
        ]);
    }

    // ✅ REINICIAR SISTEMA - CORRIGIDO (AGORA LIMPA PEDIDOS)
    public function reiniciarSistema()
    {
        DB::beginTransaction();
        try {
            // 🔄 CANCELAR TODOS OS PEDIDOS (NÃO DELETAR, APENAS CANCELAR)
            Pedido::where('status', '!=', 'cancelado')
                 ->update([
                     'status' => 'cancelado',
                     'updated_at' => now()
                 ]);

            // 🔄 LIBERAR TODAS AS MESAS
            Mesa::query()->update([
                'status' => 'livre',
                'garcom_nome' => null,
                'status_pagamento' => 'aberta',
                'updated_at' => now()
            ]);

            // 🔄 FECHAR EXPEDIENTE
            $config = Configuracao::first();
            if ($config) {
                $config->update(['expediente_aberto' => false]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Sistema reiniciado com sucesso! Todas as mesas foram liberadas e pedidos cancelados.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro em ConfiguracaoController::reiniciarSistema: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao reiniciar sistema: ' . $e->getMessage()
            ], 500);
        }
    }

    // ✅ DASHBOARD - CORRIGIDO
    public function dashboard()
    {
        try {
            $mesasOcupadas = Mesa::where('status', 'ocupada')->count();
            
            $stats = [
                'total_mesas' => Mesa::count(),
                'mesas_ocupadas' => $mesasOcupadas,
                'mesas_livres' => Mesa::where('status', 'livre')->count(),
                'total_pedidos' => Pedido::count(),
                'pedidos_pendentes' => Pedido::where('status', 'pendente')->count(),
                'pedidos_preparando' => Pedido::where('status', 'preparando')->count(),
                'pedidos_prontos' => Pedido::where('status', 'pronto')->count(),
                'pedidos_entregues' => Pedido::where('status', 'entregue')->count(),
                'pedidos_cancelados' => Pedido::where('status', 'cancelado')->count(),
                'pedidos_hoje' => Pedido::whereDate('created_at', today())->count(),
                'vendas_hoje' => Pedido::whereDate('created_at', today())
                                 ->where('status', '!=', 'cancelado')
                                 ->sum('total'),
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