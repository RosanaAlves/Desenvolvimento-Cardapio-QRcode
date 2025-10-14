// app/Http/Controllers/Admin/RelatorioController.php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pedido;

class RelatorioController extends Controller
{
    public function vendasDiarias()
    {
        // Lógica complexa de relatórios para admin
        $vendas = Pedido::whereDate('created_at', today())
                       ->withSum('itens as total_vendido', 'preco_total')
                       ->get();
                       
        return $this->success($vendas);
    }
}