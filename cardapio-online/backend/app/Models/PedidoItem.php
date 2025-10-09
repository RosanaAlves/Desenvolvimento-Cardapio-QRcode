<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PedidoItem extends Model
{
    use HasFactory;

    protected $table = 'pedido_itens';

    // 🔥 CORREÇÃO: Use o nome correto da chave estrangeira
    protected $fillable = [
        'pedidos_id',  // ← Provavelmente é este o nome
        'produto_id', 
        'quantidade',
        'preco_unitario',
        'observacoes'
    ];

    // 🔥 CORREÇÃO: Especifique a chave estrangeira
    public function pedido()
    {
        return $this->belongsTo(Pedido::class, 'pedidos_id'); // ← Adicione o segundo parâmetro
    }

    public function produto()
    {
        return $this->belongsTo(Produto::class);
    }
}