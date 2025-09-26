<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\PedidoItem;
use Illuminate\Http\Request;

class PedidoController extends Controller
{
    public function store(Request $request)
    {
        // Validação básica do MVP
        $request->validate([
            'cliente_nome' => 'required|string|max:100',
            'cliente_telefone' => 'required|string|max:20',
            'itens' => 'required|array',
            'itens.*.produto_id' => 'required|exists:produtos,id',
            'itens.*.quantidade' => 'required|integer|min:1'
        ]);

        // Iniciar transação para garantir consistência
        return \DB::transaction(function () use ($request) {
            // Criar pedido
            $pedido = Pedido::create([
                'cliente_nome' => $request->cliente_nome,
                'cliente_telefone' => $request->cliente_telefone,
                'observacoes' => $request->observacoes,
                'total' => 0 // Será calculado
            ]);

            $totalPedido = 0;

            // Adicionar itens ao pedido
            foreach ($request->itens as $item) {
                $produto = \App\Models\Produto::find($item['produto_id']);
                
                $pedidoItem = PedidoItem::create([
                    'pedido_id' => $pedido->id,
                    'produto_id' => $item['produto_id'],
                    'quantidade' => $item['quantidade'],
                    'preco_unitario' => $produto->preco
                ]);

                $totalPedido += $produto->preco * $item['quantidade'];
            }

            // Atualizar total do pedido
            $pedido->update(['total' => $totalPedido]);

            return response()->json([
                'success' => true,
                'pedido_id' => $pedido->id,
                'total' => $totalPedido,
                'message' => 'Pedido realizado com sucesso!'
            ], 201);
        });
    }
}