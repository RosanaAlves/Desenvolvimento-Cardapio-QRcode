<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Mesa;
use Illuminate\Support\Facades\Log;

class MesaController extends Controller
{
    // ✅ LISTAR MESAS
    public function index()
    {
        try {
            $mesas = Mesa::with(['pedidos' => function($query) {
                $query->whereIn('status', ['pendente', 'preparando', 'pronto']);
            }])->get();

            return response()->json([
                'success' => true,
                'data' => $mesas
            ]);
        } catch (\Exception $e) {
            Log::error('Erro em Admin MesaController::index: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar mesas'
            ], 500);
        }
    }
        // ✅ PAGAR CONTA DA MESA
    public function pagarConta($id)
    {
        try {
            $mesa = Mesa::find($id);
            
            if (!$mesa) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mesa não encontrada'
                ], 404);
            }

            // Verificar se a mesa tem conta para pagar
            if ($mesa->status_pagamento !== 'fechada') {
                return response()->json([
                    'success' => false,
                    'message' => 'Mesa não possui conta fechada para pagar'
                ], 422);
            }

            // 🔄 ATUALIZAR STATUS DA MESA PARA LIVRE
            $mesa->update([
                'status' => 'livre',
                'status_pagamento' => 'paga',
                'garcom_nome' => null
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Conta da mesa paga com sucesso!',
                'data' => $mesa
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em Admin MesaController::pagarConta: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao pagar conta da mesa'
            ], 500);
        }
    }
}