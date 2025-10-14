<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Produto;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class ProdutoController extends Controller
{
    /**
     * Listar produtos (público - apenas disponíveis)
     */
    public function index()
    {
        try {
            Log::info('Acessando lista de produtos');
            
            $query = Produto::with(['categoria' => function($query) {
                $query->select('id', 'nome');
            }]);
            
            // Filtra apenas produtos disponíveis
            $query->where('disponivel', true);
            
            $produtos = $query->get(['id', 'nome', 'descricao', 'preco', 'categoria_id', 'disponivel']);
            
            Log::info('Produtos encontrados: ' . $produtos->count());
            
            return $this->success($produtos);
            
        } catch (\Exception $e) {
            Log::error('Erro em ProdutoController@index: ' . $e->getMessage());
            return $this->error('Erro ao carregar produtos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Listar produtos para admin (todos os produtos)
     */
    public function indexAdmin()
    {
        try {
            $produtos = Produto::with(['categoria' => function($query) {
                $query->select('id', 'nome');
            }])->get();
            
            $produtosFormatados = $produtos->map(function($produto) {
                return [
                    'id' => $produto->id,
                    'nome' => $produto->nome,
                    'descricao' => $produto->descricao,
                    'preco' => (float) $produto->preco,
                    'categoria_id' => $produto->categoria_id,
                    'categoria_nome' => $produto->categoria->nome ?? 'Sem categoria',
                    'disponivel' => (bool) $produto->disponivel
                ];
            });
            
            return $this->success($produtosFormatados);
            
        } catch (\Exception $e) {
            Log::error('Erro em ProdutoController@indexAdmin: ' . $e->getMessage());
            return $this->error('Erro ao carregar produtos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Mostrar produto específico
     */
    public function show($id)
    {
        try {
            $produto = Produto::with(['categoria' => function($query) {
                $query->select('id', 'nome');
            }])->find($id);
            
            if (!$produto) {
                return $this->error('Produto não encontrado', 404);
            }

            return $this->success($produto);
            
        } catch (\Exception $e) {
            Log::error('Erro em ProdutoController@show: ' . $e->getMessage());
            return $this->error('Erro ao carregar produto: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Criar novo produto
     */
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

            return $this->success($produto, 'Produto criado com sucesso!', 201);
            
        } catch (\Exception $e) {
            Log::error('Erro em ProdutoController@store: ' . $e->getMessage());
            return $this->error('Erro ao criar produto: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Atualizar produto
     */
    public function update(Request $request, $id)
    {
        try {
            $produto = Produto::find($id);
            
            if (!$produto) {
                return $this->error('Produto não encontrado', 404);
            }

            $validated = $request->validate([
                'nome' => 'sometimes|string|max:255',
                'descricao' => 'nullable|string',
                'preco' => 'sometimes|numeric|min:0',
                'categoria_id' => 'sometimes|exists:categorias,id',
                'disponivel' => 'boolean'
            ]);

            $produto->update($validated);

            return $this->success($produto, 'Produto atualizado com sucesso!');
            
        } catch (\Exception $e) {
            Log::error('Erro em ProdutoController@update: ' . $e->getMessage());
            return $this->error('Erro ao atualizar produto: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Excluir produto
     */
    public function destroy($id)
    {
        try {
            $produto = Produto::find($id);
            
            if (!$produto) {
                return $this->error('Produto não encontrado', 404);
            }

            $produto->delete();

            return $this->success(null, 'Produto excluído com sucesso!');
            
        } catch (\Exception $e) {
            Log::error('Erro em ProdutoController@destroy: ' . $e->getMessage());
            return $this->error('Erro ao excluir produto: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Produtos por categoria
     */
    public function porCategoria($categoriaId)
    {
        try {
            $produtos = Produto::with(['categoria' => function($query) {
                $query->select('id', 'nome');
            }])
            ->where('categoria_id', $categoriaId)
            ->where('disponivel', true)
            ->get(['id', 'nome', 'descricao', 'preco', 'categoria_id', 'disponivel']);

            return $this->success($produtos);
            
        } catch (\Exception $e) {
            Log::error('Erro em ProdutoController@porCategoria: ' . $e->getMessage());
            return $this->error('Erro ao carregar produtos: ' . $e->getMessage(), 500);
        }
    }
}