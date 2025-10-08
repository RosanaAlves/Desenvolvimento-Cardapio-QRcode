<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Models\Pedido; // ← IMPORT ADICIONADO
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log; // ← IMPORT ADICIONADO

class CategoriaController extends Controller
{
    public function index()
    {
        $categorias = Categoria::with(['produtos' => function($query) {
            $query->where('disponivel', true);
        }])->get();
        
        return response()->json($categorias);
    }

    // MÉTODO STORE CORRIGIDO - DENTRO DA CLASSE
    public function store(Request $request)
    {
        try {
            Log::info('Recebendo pedido:', $request->all());
            
            // Validação
            $validated = $request->validate([
                'cliente' => 'required|string',
                'itens' => 'required|array',
                'total' => 'required|numeric',
            ]);

            // Criar pedido
            $pedido = Pedido::create($validated);
            
            Log::info('Pedido criado:', $pedido->toArray());

            return response()->json([
                'success' => true,
                'pedido' => $pedido,
                'message' => 'Pedido realizado com sucesso!'
            ], 201);

        } catch (\Exception $e) {
            Log::error('Erro ao criar pedido:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor'
            ], 500);
        }
    }
}