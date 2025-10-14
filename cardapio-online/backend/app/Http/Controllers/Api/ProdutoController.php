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