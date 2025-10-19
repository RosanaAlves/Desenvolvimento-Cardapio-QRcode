<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PedidoItem extends Model
{
    use HasFactory;

    protected $table = 'pedido_itens';

    protected $fillable = [
        'pedido_id',
        'produto_id',
        'quantidade',
        'preco_unitario',
        'observacoes',
        'subtotal'
    ];

    protected $casts = [
        'preco_unitario' => 'decimal:2',
        'quantidade' => 'integer'
    ];

    // RELACIONAMENTOS
    public function pedido()
    {
        return $this->belongsTo(Pedido::class);
    }

    public function produto()
    {
        return $this->belongsTo(Produto::class);
    }

    // 🔥 ATRIBUTOS CALCULADOS
    public function getTotalAttribute()
    {
        return $this->quantidade * $this->preco_unitario;
    }

    public function getTotalFormatadoAttribute()
    {
        return 'R$ ' . number_format($this->total, 2, ',', '.');
    }

    public function getPrecoUnitarioFormatadoAttribute()
    {
        return 'R$ ' . number_format($this->preco_unitario, 2, ',', '.');
    }

    // 🔥 MÉTODO PARA RESPOSTA DA API
    public function toArrayDetalhado()
    {
        return [
            'id' => $this->id,
            'produto_id' => $this->produto_id,
            'produto_nome' => $this->produto->nome ?? 'Produto não encontrado',
            'quantidade' => $this->quantidade,
            'preco_unitario' => $this->preco_unitario,
            'preco_unitario_formatado' => $this->preco_unitario_formatado,
            'total' => $this->total,
            'total_formatado' => $this->total_formatado,
            'observacoes' => $this->observacoes
        ];
    }
}