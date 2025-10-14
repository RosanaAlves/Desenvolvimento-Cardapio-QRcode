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
    // Listar todas as mesas (admin vê tudo)
    public function index()
    {
        try {
            $mesas = Mesa::all();
            return response()->json([
                'success' => true,
                'data' => $mesas
            ]);
        } catch (\Exception $e) {
            Log::error('Erro em MesaController::index: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar mesas'
            ], 500);
        }
    }

    // Mostrar mesa específica
    public function show($id)
    {
        try {
            $mesa = Mesa::with(['pedidos' => function($query) {
                $query->where('status', '!=', 'cancelado');
            }])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $mesa
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Mesa não encontrada'
            ], 404);
        }
    }

    // Atualizar mesa
    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'numero' => 'sometimes|integer|unique:mesas,numero,' . $id,
                'capacidade' => 'sometimes|integer|min:1',
                'status' => 'sometimes|in:livre,ocupada,reservada',
                'disponivel' => 'boolean' // ✅ NOVO CAMPO
            ]);

            $mesa = Mesa::findOrFail($id);
            $mesa->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $mesa,
                'message' => 'Mesa atualizada com sucesso'
            ]);
        } catch (\Exception $e) {
            Log::error('Erro em MesaController::update: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar mesa'
            ], 500);
        }
    }

    // Toggle disponibilidade
    public function toggleDisponibilidade($id)
    {
        try {
            $mesa = Mesa::findOrFail($id);
            $mesa->update(['disponivel' => !$mesa->disponivel]);

            return response()->json([
                'success' => true,
                'message' => 'Disponibilidade atualizada',
                'disponivel' => $mesa->disponivel
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar disponibilidade'
            ], 500);
        }
    }

    // Métodos auxiliares para respostas padronizadas
    private function success($data = null, $message = null)
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message
        ]);
    }

    private function error($message, $code = 400)
    {
        return response()->json([
            'success' => false,
            'message' => $message
        ], $code);
    }
}