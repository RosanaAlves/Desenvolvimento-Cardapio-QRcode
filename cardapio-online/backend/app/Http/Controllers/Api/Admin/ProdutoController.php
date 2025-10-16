<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Produto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ProdutoController extends Controller
{
    // ✅ LISTAR PRODUTOS
    public function index()
    {
        try {
            $produtos = Produto::with('categoria')->get();
            
            return response()->json([
                'success' => true,
                'data' => $produtos
            ]);
        } catch (\Exception $e) {
            Log::error('Erro em Admin ProdutoController::index: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar produtos'
            ], 500);
        }
    }

    // ✅ CRIAR PRODUTO
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nome' => 'required|string|max:255',
                'descricao' => 'nullable|string',
                'preco' => 'required|numeric|min:0',
                'categoria_id' => 'required|exists:categorias,id',
                'disponivel' => 'boolean',
                'imagem' => 'nullable|url'
            ]);

            $produto = Produto::create($validated);

            return response()->json([
                'success' => true,
                'data' => $produto,
                'message' => 'Produto criado com sucesso!'
            ], 201);

        } catch (\Exception $e) {
            Log::error('Erro em Admin ProdutoController::store: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar produto'
            ], 500);
        }
    }

    // ✅ ATUALIZAR PRODUTO
    public function update(Request $request, $id)
    {
        try {
            $produto = Produto::find($id);
            
            if (!$produto) {
                return response()->json([
                    'success' => false,
                    'message' => 'Produto não encontrado'
                ], 404);
            }

            $validated = $request->validate([
                'nome' => 'sometimes|required|string|max:255',
                'descricao' => 'nullable|string',
                'preco' => 'sometimes|required|numeric|min:0',
                'categoria_id' => 'sometimes|required|exists:categorias,id',
                'disponivel' => 'boolean',
                'imagem' => 'nullable|url'
            ]);

            $produto->update($validated);

            return response()->json([
                'success' => true,
                'data' => $produto,
                'message' => 'Produto atualizado com sucesso!'
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em Admin ProdutoController::update: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar produto'
            ], 500);
        }
    }

    // ✅ EXCLUIR PRODUTO
    public function destroy($id)
    {
        try {
            $produto = Produto::find($id);
            
            if (!$produto) {
                return response()->json([
                    'success' => false,
                    'message' => 'Produto não encontrado'
                ], 404);
            }

            $produto->delete();

            return response()->json([
                'success' => true,
                'message' => 'Produto excluído com sucesso!'
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em Admin ProdutoController::destroy: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao excluir produto'
            ], 500);
        }
    }
}