<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\Request;

class CategoriaController extends Controller
{
    public function index()
    {
        $categorias = Categoria::where('disponivel', true)->get();
        return response()->json($categorias);
        
        // Ou se quiser retornar view:
        // return view('categorias.index', compact('categorias'));
    }

    public function show($id)
    {
        $categoria = Categoria::findOrFail($id);
        return response()->json($categoria);
    }
}