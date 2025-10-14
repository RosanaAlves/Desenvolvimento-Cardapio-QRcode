<?php
namespace App\Http\Controllers\Api\Cliente;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Models\Produto;

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
                                ->get(['id', 'nome', 'descricao']);

            return $this->success($categorias);

        } catch (\Exception $e) {
            \Log::error('Erro Cliente/Categorias: ' . $e->getMessage());
            return $this->error('Erro ao carregar cardápio', 500);
        }
    }

    public function produtos()
    {
        try {
            $produtos = Produto::with('categoria')
                            ->where('disponivel', true)
                            ->get(['id', 'nome', 'descricao', 'preco', 'imagem', 'categoria_id']);

            return $this->success($produtos);

        } catch (\Exception $e) {
            \Log::error('Erro Cliente/Produtos: ' . $e->getMessage());
            return $this->error('Erro ao carregar produtos', 500);
        }
    }

    public function produtosPorCategoria($categoriaId)
    {
        try {
            $produtos = Produto::with('categoria')
                            ->where('categoria_id', $categoriaId)
                            ->where('disponivel', true)
                            ->get(['id', 'nome', 'descricao', 'preco', 'imagem', 'categoria_id']);

            return $this->success($produtos);

        } catch (\Exception $e) {
            \Log::error('Erro Cliente/ProdutosCategoria: ' . $e->getMessage());
            return $this->error('Erro ao carregar produtos', 500);
        }
    }

    public function show($id)
    {
        try {
            $produto = Produto::with('categoria')
                            ->where('disponivel', true)
                            ->find($id);

            if (!$produto) {
                return $this->error('Produto não encontrado', 404);
            }

            return $this->success($produto);

        } catch (\Exception $e) {
            \Log::error('Erro Cliente/Produto: ' . $e->getMessage());
            return $this->error('Erro ao carregar produto', 500);
        }
    }
}