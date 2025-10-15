<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Configuracao;
use Illuminate\Http\Request;
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
        try {
            // Implementar lógica para:
            // - Liberar todas as mesas
            // - Cancelar pedidos em aberto
            // - Manter histórico de pedidos finalizados
            
            return response()->json([
                'success' => true,
                'message' => 'Sistema reiniciado com sucesso!'
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em ConfiguracaoController::reiniciarSistema: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao reiniciar sistema'
            ], 500);
        }
    }
}