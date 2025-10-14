// app/Http/Controllers/Api/Mobile/MesaController.php
<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\Mesa;

class MesaController extends Controller
{
    public function index()
    {
        // Dados otimizados para mobile
        $mesas = Mesa::select('id', 'numero', 'status')
                    ->withCount(['pedidos as pedidos_ativos' => function($query) {
                        $query->whereIn('status', ['pendente', 'preparando']);
                    }])
                    ->get();
                    
        return $this->success($mesas);
    }
}