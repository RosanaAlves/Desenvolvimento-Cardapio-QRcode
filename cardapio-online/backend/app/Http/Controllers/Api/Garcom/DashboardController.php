<?php

namespace App\Http\Controllers\Api\Garcom;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Models\Produto;
use App\Models\Mesa;
use App\Models\Pedido;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            $mesasOcupadas = Mesa::whereHas('pedidos', function($query) {
                $query->whereIn('status', ['pendente', 'preparando', 'pronto']);
            })->count();
            
            $stats = [
                'total_mesas' => Mesa::count(),
                'mesas_ocupadas' => $mesasOcupadas,
                'mesas_livres' => Mesa::count() - $mesasOcupadas,
                'total_pedidos' => Pedido::count(),
                'pedidos_pendentes' => Pedido::where('status', 'pendente')->count(),
                'pedidos_preparando' => Pedido::where('status', 'preparando')->count(),
                'pedidos_prontos' => Pedido::where('status', 'pronto')->count(),
                'pedidos_entregues' => Pedido::where('status', 'entregue')->count(),
                'pedidos_hoje' => Pedido::whereDate('created_at', today())->count(),
                'total_produtos' => Produto::count(),
                'total_categorias' => Categoria::count(),
            ];
            
            return $this->success($stats);
        } catch (\Exception $e) {
            Log::error('Erro em DashboardController: ' . $e->getMessage());
            return $this->error('Erro ao carregar dashboard', 500);
        }
    }
}