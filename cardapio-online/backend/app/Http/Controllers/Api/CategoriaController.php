<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use Illuminate\Http\Request;

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