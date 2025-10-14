<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mesa extends Model
{
    use HasFactory;

<<<<<<< Updated upstream
    protected $fillable = ['numero', 'status'];
=======
    protected $fillable = [
        'numero',
        'capacidade',
        'status',
        'disponivel',
        'garcom_nome',
        'status_pagamento'
    ];

    protected $casts = [
        'disponivel' => 'boolean'
    ];
>>>>>>> Stashed changes

    // ✅ ADICIONAR: Relacionamento com pedidos
    public function pedidos()
    {
        return $this->hasMany(Pedido::class);
    }

<<<<<<< Updated upstream
    public function pedidoAtivo()
    {
        return $this->hasOne(Pedido::class)->whereIn('status', ['pendente', 'preparando']);
=======
    // Métodos úteis
    public function estaLivre()
    {
        return $this->status === 'livre';
    }

    public function estaOcupada()
    {
        return $this->status === 'ocupada';
>>>>>>> Stashed changes
    }
}