<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

// Rotas de teste
Route::get('/test', function() {
    return response()->json(['status' => 'OK', 'message' => 'API funcionando']);
});

// Rotas de Categorias
Route::get('/categorias', function() {
    $categorias = DB::table('categorias')
                   ->where('disponivel', 1)
                   ->get();
    return response()->json($categorias);
});

// Rotas de Produtos
Route::get('/produtos', function() {
    $produtos = DB::table('produtos')
                 ->join('categorias', 'produtos.categoria_id', '=', 'categorias.id')
                 ->where('produtos.disponivel', 1)
                 ->select('produtos.*', 'categorias.nome as categoria_nome')
                 ->get();
    return response()->json($produtos);
});

// Produtos por categoria
Route::get('/categorias/{id}/produtos', function($id) {
    $produtos = DB::table('produtos')
                 ->where('categoria_id', $id)
                 ->where('disponivel', 1)
                 ->get();
    return response()->json($produtos);
});

// Produto específico
Route::get('/produtos/{id}', function($id) {
    $produto = DB::table('produtos')
                ->join('categorias', 'produtos.categoria_id', '=', 'categorias.id')
                ->where('produtos.id', $id)
                ->select('produtos.*', 'categorias.nome as categoria_nome')
                ->first();
    return response()->json($produto);
});

// Rotas para Mesas
Route::get('/mesas', function() {
    $mesas = DB::table('mesas')
              ->where('status', 'livre')
              ->get();
    return response()->json($mesas);
});

// Rotas para Pedidos
Route::post('/pedidos', function(Request $request) {
    $request->validate([
        'mesa_id' => 'required|exists:mesas,id',
        'itens' => 'required|array'
    ]);

    DB::beginTransaction();
    try {
        // Criar pedido
        $pedidoId = DB::table('pedidos')->insertGetId([
            'mesa_id' => $request->mesa_id,
            'status' => 'pendente',
            'total' => 0,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $total = 0;

        // Adicionar itens
        foreach ($request->itens as $item) {
            $produto = DB::table('produtos')->where('id', $item['produto_id'])->first();
            
            if ($produto) {
                $itemTotal = $item['quantidade'] * $produto->preco;
                $total += $itemTotal;

                DB::table('pedido_itens')->insert([
                    'pedido_id' => $pedidoId,
                    'produto_id' => $item['produto_id'],
                    'quantidade' => $item['quantidade'],
                    'preco_unitario' => $produto->preco,
                    'observacoes' => $item['observacoes'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }
        }

        // Atualizar total do pedido
        DB::table('pedidos')->where('id', $pedidoId)->update(['total' => $total]);

        // Atualizar status da mesa
        DB::table('mesas')->where('id', $request->mesa_id)->update(['status' => 'ocupada']);

        DB::commit();

        return response()->json([
            'success' => true,
            'pedido_id' => $pedidoId,
            'total' => $total
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
    }
});

// Detalhes do pedido
Route::get('/pedidos/{id}', function($id) {
    $pedido = DB::table('pedidos')
               ->where('id', $id)
               ->first();

    if (!$pedido) {
        return response()->json(['error' => 'Pedido não encontrado'], 404);
    }

    $itens = DB::table('pedido_itens')
              ->join('produtos', 'pedido_itens.produto_id', '=', 'produtos.id')
              ->where('pedido_itens.pedido_id', $id)
              ->select('pedido_itens.*', 'produtos.nome as produto_nome', 'produtos.descricao')
              ->get();

    $mesa = DB::table('mesas')->where('id', $pedido->mesa_id)->first();

    return response()->json([
        'pedido' => $pedido,
        'itens' => $itens,
        'mesa' => $mesa
    ]);
});