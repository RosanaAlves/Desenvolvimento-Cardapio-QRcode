<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Models\Produto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RelatorioController extends Controller
{
    // ✅ VENDAS POR PERÍODO
    public function vendasPorPeriodo(Request $request)
    {
        try {
            $request->validate([
                'data_inicio' => 'required|date',
                'data_fim' => 'required|date|after_or_equal:data_inicio'
            ]);

            $vendas = Pedido::whereBetween('created_at', [$request->data_inicio, $request->data_fim])
                           ->select(
                               DB::raw('DATE(created_at) as data'),
                               DB::raw('COUNT(*) as total_pedidos'),
                               DB::raw('SUM(total) as total_vendas')
                           )
                           ->groupBy('data')
                           ->orderBy('data')
                           ->get();

            return response()->json([
                'success' => true,
                'data' => $vendas
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em RelatorioController::vendasPorPeriodo: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao gerar relatório de vendas'
            ], 500);
        }
    }

    // ✅ PRODUTOS MAIS VENDIDOS
    public function produtosMaisVendidos(Request $request)
    {
        try {
            $request->validate([
                'data_inicio' => 'sometimes|date',
                'data_fim' => 'sometimes|date|after_or_equal:data_inicio'
            ]);

            $query = DB::table('pedido_itens')
                      ->join('produtos', 'pedido_itens.produto_id', '=', 'produtos.id')
                      ->join('pedidos', 'pedido_itens.pedido_id', '=', 'pedidos.id')
                      ->select(
                          'produtos.nome',
                          DB::raw('SUM(pedido_itens.quantidade) as total_vendido'),
                          DB::raw('SUM(pedido_itens.quantidade * pedido_itens.preco_unitario) as total_faturado')
                      )
                      ->groupBy('produtos.id', 'produtos.nome')
                      ->orderByDesc('total_vendido');

            // Aplicar filtro de data se fornecido
            if ($request->has('data_inicio') && $request->has('data_fim')) {
                $query->whereBetween('pedidos.created_at', [$request->data_inicio, $request->data_fim]);
            }

            $produtos = $query->get();

            return response()->json([
                'success' => true,
                'data' => $produtos
            ]);

        } catch (\Exception $e) {
            Log::error('Erro em RelatorioController::produtosMaisVendidos: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao gerar relatório de produtos'
            ], 500);
        }
    }
}