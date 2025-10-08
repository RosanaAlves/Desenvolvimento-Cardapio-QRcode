<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    use HasFactory;

    // 🔥 ADICIONAR cliente_nome no fillable
    protected $fillable = [
        'mesa_id', 
        'cliente_nome',  // NOVO CAMPO
        'status', 
        'total', 
        'observacoes'
    ];

    // 🔥 ADICIONAR CASTS
    protected $casts = [
        'total' => 'decimal:2',
    ];

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

    // 🔥 MÉTODO PARA MARCAR COMO CONCLUÍDO
    public function marcarComoConcluido()
    {
        return $this->update(['status' => 'concluido']);
    }
}