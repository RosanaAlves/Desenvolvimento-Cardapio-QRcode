<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use App\Models\Produto;
use App\Models\Categoria;
use App\Models\Mesa;
use App\Models\Configuracao;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            $config = Configuracao::getConfig();
            
            $stats = [
                // Mesas
                'total_mesas' => Mesa::count(),
                'mesas_ocupadas' => Mesa::where('status', 'ocupada')->count(),
                'mesas_livres' => Mesa::where('status', 'livre')->count(),
                
                // Pedidos
                'total_pedidos' => Pedido::count(),
                'pedidos_pendentes' => Pedido::pendentes()->count(),
                'pedidos_preparando' => Pedido::preparando()->count(),
                'pedidos_prontos' => Pedido::prontos()->count(),
                'pedidos_entregues' => Pedido::where('status', 'entregue')->count(),
                'pedidos_hoje' => Pedido::deHoje()->count(),
                
                // Financeiro
                'faturamento_hoje' => Pedido::deHoje()->where('status', 'entregue')->sum('total'),
                'faturamento_mes' => Pedido::whereMonth('created_at', now()->month)
                                        ->where('status', 'entregue')
                                        ->sum('total'),
                'faturamento_total' => Pedido::where('status', 'entregue')->sum('total'),
                
                // Produtos
                'total_produtos' => Produto::count(),
                'produtos_disponiveis' => Produto::where('disponivel', true)->count(),
                'total_categorias' => Categoria::count(),
                
                // Configurações
                'expediente_aberto' => $config->expediente_aberto,
                'faturamento_dia' => $config->faturamento_dia
            ];

            // Pedidos recentes (últimos 10)
            $pedidosRecentes = Pedido::with(['mesa', 'itens.produto'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function($pedido) {
                    return [
                        'id' => $pedido->id,
                        'mesa_numero' => $pedido->mesa->numero,
                        'cliente_nome' => $pedido->cliente_nome,
                        'garcom_nome' => $pedido->garcom_nome,
                        'status' => $pedido->status,
                        'status_formatado' => $pedido->status_formatado,
                        'total' => $pedido->total,
                        'total_formatado' => $pedido->total_formatado,
                        'created_at' => $pedido->created_at->format('d/m/Y H:i'),
                        'itens_count' => $pedido->itens->count()
                    ];
                });

            // Produtos mais vendidos
            $produtosMaisVendidos = DB::table('pedido_itens')
                ->join('produtos', 'pedido_itens.produto_id', '=', 'produtos.id')
                ->select(
                    'produtos.id',
                    'produtos.nome',
                    DB::raw('SUM(pedido_itens.quantidade) as total_vendido'),
                    DB::raw('SUM(pedido_itens.quantidade * pedido_itens.preco_unitario) as total_faturado')
                )
                ->groupBy('produtos.id', 'produtos.nome')
                ->orderByDesc('total_vendido')
                ->limit(10)
                ->get();

            return $this->success([
                'estatisticas' => $stats,
                'pedidos_recentes' => $pedidosRecentes,
                'produtos_mais_vendidos' => $produtosMaisVendidos,
                'atualizado_em' => now()->format('d/m/Y H:i:s')
            ]);

        } catch (\Exception $e) {
            \Log::error('Erro Admin/Dashboard: ' . $e->getMessage());
            return $this->error('Erro ao carregar dashboard', 500);
        }
    }
}