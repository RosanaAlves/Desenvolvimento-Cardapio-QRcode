<?php

namespace App\Http\Controllers\Api\Garcom;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Models\Produto;
use Illuminate\Http\Request;

class CardapioController extends Controller
{
    public function categorias()
    {
        try {
            $categorias = Categoria::where('disponivel', true)
                                ->with(['produtos' => function($query) {
                                    $query->where('disponivel', true)
                                          ->select('id', 'nome', 'descricao', 'preco', 'imagem', 'categoria_id');
                                }])
                                ->select('id', 'nome', 'descricao')
                                ->get();

            return response()->json([
                'success' => true,
                'data' => $categorias
            ]);

        } catch (\Exception $e) {
            \Log::error('Erro em CardapioController::categorias: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar categorias',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function index()
    {
        return $this->categorias();
    }

    public function produtos()
    {
        try {
            $produtos = Produto::where('disponivel', true)
                             ->with('categoria')
                             ->get();

            return response()->json([
                'success' => true,
                'data' => $produtos
            ]);

        } catch (\Exception $e) {
            \Log::error('Erro em CardapioController::produtos: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar produtos'
            ], 500);
        }
    }

    public function produtosPorCategoria($categoriaId)
    {
        try {
            $produtos = Produto::where('categoria_id', $categoriaId)
                             ->where('disponivel', true)
                             ->with('categoria')
                             ->get();

            return response()->json([
                'success' => true,
                'data' => $produtos
            ]);

        } catch (\Exception $e) {
            \Log::error('Erro em CardapioController::produtosPorCategoria: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar produtos'
            ], 500);
        }
    }

    public function buscarProdutos($termo)
    {
        try {
            $produtos = Produto::where('disponivel', true)
                             ->where(function($query) use ($termo) {
                                 $query->where('nome', 'LIKE', "%{$termo}%")
                                       ->orWhere('descricao', 'LIKE', "%{$termo}%");
                             })
                             ->with('categoria')
                             ->get();

            return response()->json([
                'success' => true,
                'data' => $produtos
            ]);

        } catch (\Exception $e) {
            \Log::error('Erro em CardapioController::buscarProdutos: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar produtos'
            ], 500);
        }
    }
}