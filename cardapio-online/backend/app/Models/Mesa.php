<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mesa extends Model
{
    use HasFactory;

    // 🔥 ADICIONAR OS NOVOS CAMPOS
    protected $fillable = [
        'numero', 
        'status', 
        'cliente_nome',  // NOVO
        'status_pagamento' // NOVO
    ];

    // 🔥 ADICIONAR CASTS PARA TIPOS CORRETOS
    protected $casts = [
        'status_pagamento' => 'string'
    ];

    public function pedidos()
    {
        return $this->hasMany(Pedido::class);
    }

    public function pedidoAtivo()
    {
        return $this->hasOne(Pedido::class)->whereIn('status', ['pendente', 'preparando']);
    }

    // 🔥 MÉTODO PARA VERIFICAR SE MESA ESTÁ LIVRE
    public function estaLivre()
    {
        return $this->status === 'livre';
    }

    // 🔥 MÉTODO PARA OCUPAR MESA
    public function ocupar($clienteNome)
    {
        return $this->update([
            'status' => 'ocupada',
            'cliente_nome' => $clienteNome,
            'status_pagamento' => 'aberta'
        ]);
    }

    // 🔥 MÉTODO PARA LIBERAR MESA
    public function liberar()
    {
        return $this->update([
            'status' => 'livre',
            'cliente_nome' => null,
            'status_pagamento' => 'paga'
        ]);
    }
}