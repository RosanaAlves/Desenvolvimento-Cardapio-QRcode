<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mesa extends Model
{
    use HasFactory;

    protected $fillable = ['numero', 'status'];

    public function pedidos()
    {
        return $this->hasMany(Pedido::class);
    }

    public function pedidoAtivo()
    {
        return $this->hasOne(Pedido::class)->whereIn('status', ['pendente', 'preparando']);
    }
}