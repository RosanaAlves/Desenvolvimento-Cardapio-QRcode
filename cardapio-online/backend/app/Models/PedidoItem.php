<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PedidoItem extends Model
{
    use HasFactory;

    protected $table = 'pedido_itens';

    /**
     * Os atributos que são mass assignable.
     */
    protected $fillable = [
        'pedido_id',  // ✅ CORRETO - bate com a coluna na tabela
        'produto_id', 
        'quantidade',
        'preco_unitario',
        'observacoes'
    ];

    /**
     * Os atributos que devem ser convertidos.
     */
    protected $casts = [
        'preco_unitario' => 'decimal:2',
        'quantidade' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Relacionamento com o pedido.
     */
    public function pedido()
    {
        return $this->belongsTo(Pedido::class, 'pedido_id'); // ✅ CORRETO
    }

    /**
     * Relacionamento com o produto.
     */
    public function produto()
    {
        return $this->belongsTo(Produto::class, 'produto_id');
    }

    /**
     * Calcula o subtotal do item.
     */
    public function getSubtotalAttribute()
    {
        return $this->quantidade * $this->preco_unitario;
    }

    /**
     * Retorna o subtotal formatado em Reais.
     */
    public function getSubtotalFormatadoAttribute()
    {
        return 'R$ ' . number_format($this->subtotal, 2, ',', '.');
    }

    /**
     * Retorna o preço unitário formatado em Reais.
     */
    public function getPrecoUnitarioFormatadoAttribute()
    {
        return 'R$ ' . number_format($this->preco_unitario, 2, ',', '.');
    }
}