<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Mesa;
use Illuminate\Support\Facades\Log;

class MesaController extends Controller
{
    // ✅ LISTAR MESAS
    public function index()
    {
        try {
            $mesas = Mesa::with(['pedidos' => function($query) {
                $query->whereIn('status', ['pendente', 'preparando', 'pronto']);
            }])->get();

            return response()->json([
                'success' => true,
                'data' => $mesas
            ]);
        } catch (\Exception $e) {
            Log::error('Erro em Admin MesaController::index: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar mesas'
            ], 500);
        }
    }
}