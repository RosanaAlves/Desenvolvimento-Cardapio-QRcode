<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

Route::get('/', function () {
    return view('welcome');
});

// API SIMPLIFICADA - SEM TRY/CATCH COMPLEXO
Route::get('/api/categorias', function() {
    $categorias = DB::table('categorias')
                   ->where('disponivel', 1)
                   ->get();
    return $categorias;
});

Route::get('/api/produtos', function() {
    $produtos = DB::table('produtos')
                 ->where('disponivel', 1)
                 ->get();
    return $produtos;
});

// Rota de teste básica
Route::get('/api/test', function() {
    return response()->json(['status' => 'OK', 'message' => 'API funcionando']);
});

// Adicione estas rotas extras no routes/web.php:

// Produtos por categoria
Route::get('/api/categorias/{id}/produtos', function($id) {
    $produtos = DB::table('produtos')
                 ->where('categoria_id', $id)
                 ->where('disponivel', 1)
                 ->get();
    return response()->json($produtos);
});

// Produto específico
Route::get('/api/produtos/{id}', function($id) {
    $produto = DB::table('produtos')
                ->where('id', $id)
                ->first();
    return response()->json($produto);
});

// Rotas para Mesas e Pedidos
Route::get('/api/mesas', function() {
    return \App\Models\Mesa::where('status', 'livre')->get();
});

Route::post('/api/pedidos', function(Request $request) {
    $request->validate([
        'mesa_id' => 'required|exists:mesas,id',
        'itens' => 'required|array'
    ]);

    DB::beginTransaction();
    try {
        // Criar pedido
        $pedido = \App\Models\Pedido::create([
            'mesa_id' => $request->mesa_id,
            'status' => 'pendente'
        ]);

        $total = 0;

        // Adicionar itens
        foreach ($request->itens as $item) {
            $produto = \App\Models\Produto::find($item['produto_id']);
            
            $pedidoItem = \App\Models\PedidoItem::create([
                'pedido_id' => $pedido->id,
                'produto_id' => $item['produto_id'],
                'quantidade' => $item['quantidade'],
                'preco_unitario' => $produto->preco,
                'observacoes' => $item['observacoes'] ?? null
            ]);

            $total += $item['quantidade'] * $produto->preco;
        }

        // Atualizar total do pedido
        $pedido->update(['total' => $total]);

        // Atualizar status da mesa
        \App\Models\Mesa::where('id', $request->mesa_id)->update(['status' => 'ocupada']);

        DB::commit();

        return response()->json([
            'success' => true,
            'pedido_id' => $pedido->id,
            'total' => $total
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
    }
});

Route::get('/api/pedidos/{id}', function($id) {
    $pedido = \App\Models\Pedido::with(['itens.produto', 'mesa'])->find($id);
    return response()->json($pedido);
});