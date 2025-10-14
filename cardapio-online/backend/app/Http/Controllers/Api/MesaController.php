<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mesa;
use App\Models\Pedido;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MesaController extends Controller
{
    // Listar todas as mesas
    public function index()
    {
        try {
            $mesas = Mesa::all();
            return $this->success($mesas);
        } catch (\Exception $e) {
            Log::error('Erro em MesaController::index: ' . $e->getMessage());
            return $this->error('Erro ao carregar mesas', 500);
        }
    }

    // Status das mesas
    public function status()
    {
        try {
            $mesas = Mesa::with(['pedidos' => function($query) {
                $query->whereIn('status', ['pendente', 'preparando', 'pronto']);
            }])->get();

            $mesasComStatus = $mesas->map(function($mesa) {
                $pedidoAtivo = $mesa->pedidos->first();
                
                return [
                    'id' => $mesa->id,
                    'numero' => $mesa->numero,
                    'status' => $pedidoAtivo ? 'ocupada' : 'disponivel',
                    'cliente_nome' => $pedidoAtivo ? $pedidoAtivo->cliente_nome : null,
                    'pedido_id' => $pedidoAtivo ? $pedidoAtivo->id : null,
                    'total_pedido' => $pedidoAtivo ? $pedidoAtivo->total : null,
                    'created_at' => $mesa->created_at,
                    'updated_at' => $mesa->updated_at
                ];
            });

            return $this->success($mesasComStatus);

        } catch (\Exception $e) {
            Log::error('Erro em MesaController::status: ' . $e->getMessage());
            return $this->error('Erro ao buscar status das mesas', 500);
        }
    }

    // Pedidos da mesa
    public function pedidosDaMesa($id)
    {
        try {
            $pedidos = Pedido::where('mesa_id', $id)
                            ->where('status', '!=', 'cancelado')
                            ->with(['itens.produto', 'mesa'])
                            ->get();

            return $this->success($pedidos);
        } catch (\Exception $e) {
            Log::error('Erro em MesaController::pedidosDaMesa: ' . $e->getMessage());
            return $this->error('Erro ao carregar pedidos', 500);
        }
    }

    // Fechar conta
    public function fecharConta($id)
    {
        try {
            DB::beginTransaction();

            $mesa = Mesa::find($id);
            if (!$mesa) {
                return $this->error('Mesa não encontrada', 404);
            }

            $pedidos = Pedido::where('mesa_id', $id)
                            ->where('status', '!=', 'cancelado')
                            ->with('itens.produto')
                            ->get();

            $totalConta = $pedidos->sum('total');

            $mesa->update([
                'status_pagamento' => 'fechada'
            ]);

            DB::commit();

            return $this->success([
                'total_conta' => $totalConta,
                'pedidos' => $pedidos,
                'mesa' => $mesa
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro em MesaController::fecharConta: ' . $e->getMessage());
            return $this->error('Erro ao fechar conta: ' . $e->getMessage(), 500);
        }
    }

    // Pagar conta
    public function pagarConta($id)
    {
        try {
            $mesa = Mesa::find($id);
            
            if (!$mesa) {
                return $this->error('Mesa não encontrada', 404);
            }

            $mesa->update([
                'status' => 'livre',
                'status_pagamento' => 'paga',
                'cliente_nome' => null
            ]);

            return $this->success(null, 'Conta paga com sucesso');

        } catch (\Exception $e) {
            Log::error('Erro em MesaController::pagarConta: ' . $e->getMessage());
            return $this->error('Erro ao processar pagamento: ' . $e->getMessage(), 500);
        }
    }

    // Ocupar mesa
    public function ocupar(Request $request, $id)
    {
        try {
            $request->validate([
                'cliente_nome' => 'required|string|max:255'
            ]);

            $mesa = Mesa::find($id);
            
            if (!$mesa) {
                return $this->error('Mesa não encontrada', 404);
            }

            if (!$mesa->estaLivre()) {
                return $this->error('Mesa já está ocupada ou reservada', 400);
            }

            $mesa->ocupar($request->cliente_nome);

            return $this->success($mesa, 'Mesa ocupada com sucesso!');

        } catch (\Exception $e) {
            Log::error('Erro em MesaController::ocupar: ' . $e->getMessage());
            return $this->error('Erro ao ocupar mesa: ' . $e->getMessage(), 500);
        }
    }

    // Liberar mesa
    public function liberar($id)
    {
        try {
            $mesa = Mesa::find($id);
            
            if (!$mesa) {
                return $this->error('Mesa não encontrada', 404);
            }

            $mesa->liberar();

            return $this->success($mesa, 'Mesa liberada com sucesso!');

        } catch (\Exception $e) {
            Log::error('Erro em MesaController::liberar: ' . $e->getMessage());
            return $this->error('Erro ao liberar mesa: ' . $e->getMessage(), 500);
        }
    }
}