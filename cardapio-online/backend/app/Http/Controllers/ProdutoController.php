<?php

namespace App\Http\Controllers;

use App\Models\Produto;
use App\Models\Categoria;
use Illuminate\Http\Request;

class ProdutoController extends Controller
{
    public function index()
    {
        // Retorna produtos com categorias (Eager Loading)
        $produtos = Produto::with('categoria')
                          ->where('disponivel', true)
                          ->get();
        
        return response()->json($produtos);
    }

    public function porCategoria($categoriaId)
    {
        $produtos = Produto::with('categoria')
                          ->where('categoria_id', $categoriaId)
                          ->where('disponivel', true)
                          ->get();
        
        return response()->json($produtos);
    }
}

class CategoriaController extends Controller
{
    public function index()
    {
        $categorias = Categoria::with(['produtos' => function($query) {
            $query->where('disponivel', true);
        }])->get();
        
        return response()->json($categorias);
    }
}