<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    use HasFactory;

<<<<<<< Updated upstream
    protected $fillable = ['mesa_id', 'status', 'total', 'observacoes'];

=======
    protected $fillable = [
        'mesa_id',
        'cliente_nome',
        'garcom_nome',
        'status',
        'total',
        'observacoes',
        'cancelado_por',
        'motivo_cancelamento',
        'cancelado_em'
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'cancelado_em' => 'datetime'
    ];

    protected $attributes = [
        'status' => 'pendente',
        'total' => 0.00,
    ];

    // 🔥 STATUS DISPONÍVEIS
    public const STATUS_DISPONIVEIS = [
        'pendente',
        'preparando', 
        'pronto',
        'entregue',
        'cancelado'
    ];

    public const STATUS_CANCELAVEIS = [
        'pendente',
        'preparando'
    ];

    // RELACIONAMENTOS
>>>>>>> Stashed changes
    public function mesa()
    {
        return $this->belongsTo(Mesa::class);
    }

    public function itens()
    {
        return $this->hasMany(PedidoItem::class);
<<<<<<< Updated upstream
    }

=======
    }

    // 🔥 ESCOPOS
    public function scopeAtivos($query)
    {
        return $query->whereNotIn('status', ['entregue', 'cancelado']);
    }

    public function scopePendentes($query)
    {
        return $query->where('status', 'pendente');
    }

    public function scopePreparando($query)
    {
        return $query->where('status', 'preparando');
    }

    public function scopeProntos($query)
    {
        return $query->where('status', 'pronto');
    }

    public function scopeDeHoje($query)
    {
        return $query->whereDate('created_at', today());
    }

    public function scopeCancelaveis($query)
    {
        return $query->whereIn('status', self::STATUS_CANCELAVEIS);
    }

    // 🔥 MÉTODOS DE STATUS
    public function isPendente()
    {
        return $this->status === 'pendente';
    }

    public function isPreparando()
    {
        return $this->status === 'preparando';
    }

    public function isPronto()
    {
        return $this->status === 'pronto';
    }

    public function isEntregue()
    {
        return $this->status === 'entregue';
    }

    public function isCancelado()
    {
        return $this->status === 'cancelado';
    }

    public function podeSerCancelado()
    {
        return in_array($this->status, self::STATUS_CANCELAVEIS);
    }

    // 🔥 MÉTODOS DE AÇÃO
    public function marcarComoPreparando()
    {
        return $this->update(['status' => 'preparando']);
    }

    public function marcarComoPronto()
    {
        return $this->update(['status' => 'pronto']);
    }

    public function marcarComoEntregue()
    {
        return $this->update(['status' => 'entregue']);
    }

    public function marcarComoCancelado($motivo = null, $canceladoPor = null)
    {
        return $this->update([
            'status' => 'cancelado',
            'motivo_cancelamento' => $motivo,
            'cancelado_por' => $canceladoPor,
            'cancelado_em' => now()
        ]);
    }

    // 🔥 MÉTODOS DE CÁLCULO
>>>>>>> Stashed changes
    public function calcularTotal()
    {
        return $this->itens->sum(function($item) {
            return $item->quantidade * $item->preco_unitario;
        });
    }
<<<<<<< Updated upstream
=======

    public function atualizarTotal()
    {
        $this->update(['total' => $this->calcularTotal()]);
    }

    // 🔥 ATRIBUTOS CALCULADOS
    public function getTotalFormatadoAttribute()
    {
        return 'R$ ' . number_format($this->total, 2, ',', '.');
    }

    public function getStatusFormatadoAttribute()
    {
        $statusFormatados = [
            'pendente' => '🟡 Pendente',
            'preparando' => '🔵 Preparando',
            'pronto' => '🟢 Pronto',
            'entregue' => '✅ Entregue',
            'cancelado' => '❌ Cancelado'
        ];

        return $statusFormatados[$this->status] ?? $this->status;
    }

    public function getTempoEsperaAttribute()
    {
        return $this->created_at->diffForHumans();
    }

    public function toArrayResumido()
    {
        return [
            'id' => $this->id,
            'mesa_numero' => $this->mesa->numero ?? 'N/A',
            'cliente_nome' => $this->cliente_nome,
            'garcom_nome' => $this->garcom_nome,
            'status' => $this->status,
            'status_formatado' => $this->status_formatado,
            'total' => $this->total,
            'total_formatado' => $this->total_formatado,
            'quantidade_itens' => $this->itens->sum('quantidade'),
            'tempo_espera' => $this->tempo_espera,
            'created_at' => $this->created_at->format('d/m/Y H:i'),
            'pode_cancelar' => $this->podeSerCancelado()
        ];
    }
>>>>>>> Stashed changes
}