<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CategoriaController extends Controller
{
    // ✅ LISTAR CATEGORIAS
    public function index()
    {
        try {
            $categorias = Categoria::withCount('produtos')->get();

            return response()->json([
                'success' => true,
                'data' => $categorias
            ]);
        } catch (\Exception $e) {
            Log::error('Erro em Admin CategoriaController::index: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar categorias'
            ], 500);
        }
    }

    // ✅ CRIAR CATEGORIA
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nome' => 'required|string|max:255',
                'descricao' => 'nullable|string',
                'disponivel' => 'boolean'
            ]);

            $categoria = Categoria::create($validated);

            return response()->json([
                'success' => true,
                'data' => $categoria,
                'message' => 'Categoria criada com sucesso!'
            ], 201);

        } catch (\Exception $e) {
            Log::error('Erro em Admin CategoriaController::store: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar categoria'
            ], 500);
        }
    }

    // ✅ ATUALIZAR CATEGORIA
    public function update(Request $request, $id)
    {
        try {
            $categoria = Categoria::find($id);
            if (!$categoria) {
                return response()->json([
                    'success' => false,
                    'message' => 'Categoria não encontrada'
                ], 404);
            }

            $validated = $request->validate([
                'nome' => 'sometimes|required|string|max:255',
                'descricao' => 'nullable|string',
                'disponivel' => 'boolean'
            ]);

            $categoria->update($validated);

            return response()->json([
                'success' => true,
                'data' => $categoria,
                'message' => 'Categoria atualizada com sucesso!'
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em Admin CategoriaController::update: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar categoria'
            ], 500);
        }
    }

    // ✅ EXCLUIR CATEGORIA
    public function destroy($id)
    {
        try {
            $categoria = Categoria::find($id);
            if (!$categoria) {
                return response()->json([
                    'success' => false,
                    'message' => 'Categoria não encontrada'
                ], 404);
            }

            // Verificar se existem produtos nesta categoria
            if ($categoria->produtos()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Não é possível excluir categoria com produtos vinculados'
                ], 422);
            }

            $categoria->delete();

            return response()->json([
                'success' => true,
                'message' => 'Categoria excluída com sucesso!'
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em Admin CategoriaController::destroy: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao excluir categoria'
            ], 500);
        }
    }
}