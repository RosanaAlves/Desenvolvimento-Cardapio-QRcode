<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    use HasFactory;

    // 🔥 ADICIONE ESTA LINHA para especificar o nome da tabela
    protected $table = 'pedidos';

    protected $fillable = [
        'mesa_id', 
        'cliente_nome',
        'status', 
        'total', 
        'observacoes'
    ];

    protected $casts = [
        'total' => 'decimal:2',
    ];

    public function mesa()
    {
        return $this->belongsTo(Mesa::class, 'mesa_id');
    }

    public function itens()
    {
        return $this->hasMany(PedidoItem::class, 'pedido_id');
    }

    // ... resto do código
}