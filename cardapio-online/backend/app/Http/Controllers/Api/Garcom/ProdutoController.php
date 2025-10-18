<?php

namespace App\Http\Controllers\Api\Garcom;

use App\Http\Controllers\Controller;
use App\Models\Produto;
use Illuminate\Support\Facades\Log;

class ProdutoController extends Controller
{
    // Produtos públicos (disponíveis)
    public function index()
    {
        try {
            $query = Produto::with('categoria');
            
            if (Schema::hasColumn('produtos', 'disponivel')) {
                $query->where('disponivel', 1);
            }
            
            $produtos = $query->get();
            return $this->success($produtos);
        } catch (\Exception $e) {
            Log::error('Erro em ProdutoController::index: ' . $e->getMessage());
            return $this->error('Erro ao carregar produtos', 500);
        }
    }

    // Produtos para admin (todos os produtos)
    public function indexAdmin()
    {
        try {
            $produtos = Produto::with('categoria')->get()->map(function($produto) {
                return [
                    'id' => $produto->id,
                    'nome' => $produto->nome,
                    'descricao' => $produto->descricao,
                    'preco' => $produto->preco,
                    'categoria_nome' => $produto->categoria->nome ?? 'Sem categoria',
                    'disponivel' => (bool)$produto->disponivel,
                    'imagem' => $produto->imagem
                ];
            });
            
            return $this->success($produtos);
        } catch (\Exception $e) {
            Log::error('Erro em ProdutoController::indexAdmin: ' . $e->getMessage());
            return $this->error('Erro ao carregar produtos', 500);
        }
    }

    // Produto específico
    public function show($id)
    {
        try {
            $produto = Produto::with('categoria')->find($id);
            
            if (!$produto) {
                return $this->error('Produto não encontrado', 404);
            }

            return $this->success($produto);
        } catch (\Exception $e) {
            Log::error('Erro em ProdutoController::show: ' . $e->getMessage());
            return $this->error('Erro ao carregar produto', 500);
        }
    }
}