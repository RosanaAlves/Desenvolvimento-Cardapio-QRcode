<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    use HasFactory;

    protected $table = 'pedidos';

    /**
     * Os atributos que são mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'mesa_id', 
        'cliente_nome',
        'status', 
        'total', 
        'observacoes'
    ];

    /**
     * Os atributos que devem ser convertidos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'total' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Valores padrão para os atributos.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => 'pendente',
        'total' => 0.00,
    ];

    /**
     * Opções disponíveis para o status do pedido.
     *
     * @var array<string>
     */
    public const STATUS_DISPONIVEIS = [
        'pendente',
        'preparando', 
        'pronto',
        'entregue',
        'cancelado'
    ];

    /**
     * Relacionamento com a mesa.
     */
    public function mesa()
    {
        return $this->belongsTo(Mesa::class, 'mesa_id');
    }

    /**
     * Relacionamento com os itens do pedido.
     */
    public function itens()
    {
        return $this->hasMany(PedidoItem::class, 'pedido_id');
    }

    /**
     * Escopo para pedidos pendentes.
     */
    public function scopePendentes($query)
    {
        return $query->where('status', 'pendente');
    }

    /**
     * Escopo para pedidos em preparação.
     */
    public function scopePreparando($query)
    {
        return $query->where('status', 'preparando');
    }

    /**
     * Escopo para pedidos prontos.
     */
    public function scopeProntos($query)
    {
        return $query->where('status', 'pronto');
    }

    /**
     * Verifica se o pedido está pendente.
     */
    public function isPendente()
    {
        return $this->status === 'pendente';
    }

    /**
     * Verifica se o pedido está em preparação.
     */
    public function isPreparando()
    {
        return $this->status === 'preparando';
    }

    /**
     * Verifica se o pedido está pronto.
     */
    public function isPronto()
    {
        return $this->status === 'pronto';
    }

    /**
     * Verifica se o pedido foi entregue.
     */
    public function isEntregue()
    {
        return $this->status === 'entregue';
    }

    /**
     * Verifica se o pedido foi cancelado.
     */
    public function isCancelado()
    {
        return $this->status === 'cancelado';
    }

    /**
     * Marca o pedido como pendente.
     */
    public function marcarComoPendente()
    {
        $this->update(['status' => 'pendente']);
    }

    /**
     * Marca o pedido como em preparação.
     */
    public function marcarComoPreparando()
    {
        $this->update(['status' => 'preparando']);
    }

    /**
     * Marca o pedido como pronto.
     */
    public function marcarComoPronto()
    {
        $this->update(['status' => 'pronto']);
    }

    /**
     * Marca o pedido como entregue.
     */
    public function marcarComoEntregue()
    {
        $this->update(['status' => 'entregue']);
    }

    /**
     * Marca o pedido como cancelado.
     */
    public function marcarComoCancelado()
    {
        $this->update(['status' => 'cancelado']);
    }

    /**
     * Calcula o total do pedido baseado nos itens.
     */
    public function calcularTotal()
    {
        return $this->itens->sum(function($item) {
            return $item->quantidade * $item->preco_unitario;
        });
    }

    /**
     * Atualiza o total do pedido automaticamente.
     */
    public function atualizarTotal()
    {
        $this->update(['total' => $this->calcularTotal()]);
    }

    /**
     * Retorna o total formatado em Reais.
     */
    public function getTotalFormatadoAttribute()
    {
        return 'R$ ' . number_format($this->total, 2, ',', '.');
    }

    /**
     * Boot do modelo.
     */
    protected static function boot()
    {
        parent::boot();

        // Atualiza o total automaticamente quando um item é adicionado/removido
        static::saved(function ($pedido) {
            if ($pedido->isDirty('total')) {
                // Total já foi atualizado manualmente
                return;
            }
            
            // Se quiser atualização automática, descomente:
            // $pedido->atualizarTotal();
        });
    }
}