<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Models\Produto;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class CategoriaController extends Controller
{
    // Categorias públicas
    public function index()
    {
        try {
            $query = Categoria::query();
            
            if (Schema::hasColumn('categorias', 'disponivel')) {
                $query->where('disponivel', 1);
            }
            
            $categorias = $query->get();
            return $this->success($categorias);
        } catch (\Exception $e) {
            Log::error('Erro em CategoriaController::index: ' . $e->getMessage());
            return $this->error('Erro ao carregar categorias', 500);
        }
    }

    // Categorias para admin (todas)
    public function indexAdmin()
    {
        try {
            $categorias = Categoria::all();
            return $this->success($categorias);
        } catch (\Exception $e) {
            Log::error('Erro em CategoriaController::indexAdmin: ' . $e->getMessage());
            return $this->error('Erro ao carregar categorias', 500);
        }
    }

    // Produtos por categoria
    public function produtosPorCategoria($id)
    {
        try {
            $query = Produto::where('categoria_id', $id);
            
            if (Schema::hasColumn('produtos', 'disponivel')) {
                $query->where('disponivel', 1);
            }
            
            $produtos = $query->get();
            return $this->success($produtos);
        } catch (\Exception $e) {
            Log::error('Erro em CategoriaController::produtosPorCategoria: ' . $e->getMessage());
            return $this->error('Erro ao carregar produtos', 500);
        }
    }
}