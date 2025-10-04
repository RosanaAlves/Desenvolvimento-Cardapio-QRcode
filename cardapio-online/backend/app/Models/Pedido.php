<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    use HasFactory;

    protected $fillable = ['mesa_id', 'status', 'total', 'observacoes'];

    public function mesa()
    {
        return $this->belongsTo(Mesa::class);
    }

    public function itens()
    {
        return $this->hasMany(PedidoItem::class);
    }

    public function calcularTotal()
    {
        return $this->itens->sum(function($item) {
            return $item->quantidade * $item->preco_unitario;
        });
    }
}