<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    use HasFactory;

    protected $fillable = [
        'mesa_id',
        'garcom_nome',
        'status',
        'total',
        'observacoes'
    ];

    protected $casts = [
        'total' => 'decimal:2'
    ];

    protected $attributes = [
        'status' => 'pendente',
        'total' => 0.00,
    ];

    // 🔥 STATUS DISPONÍVEIS (baseado no ENUM da migration)
    public const STATUS_DISPONIVEIS = [
        'pendente',
        'preparando', 
        'pronto',
        'entregue',
        'cancelado'
    ];

    // 🔥 STATUS QUE PODEM SER CANCELADOS
    public const STATUS_CANCELAVEIS = [
        'pendente',
        'preparando'
    ];

    // RELACIONAMENTOS
    public function mesa()
    {
        return $this->belongsTo(Mesa::class);
    }

    public function itens()
    {
        return $this->hasMany(PedidoItem::class);
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
            'status' => 'cancelado'
        ]);
    }

    // 🔥 MÉTODOS DE CÁLCULO
    public function calcularTotal()
    {
        return $this->itens->sum(function($item) {
            return $item->quantidade * $item->preco_unitario;
        });
    }

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

    public function getQuantidadeItensAttribute()
    {
        return $this->itens->sum('quantidade');
    }

    // 🔥 MÉTODO PARA RESPOSTA DA API
    public function toArrayResumido()
    {
        return [
            'id' => $this->id,
            'mesa_id' => $this->mesa_id,
            'mesa_numero' => $this->mesa->numero ?? 'N/A',
            'garcom_nome' => $this->garcom_nome,
            'status' => $this->status,
            'status_formatado' => $this->status_formatado,
            'total' => $this->total,
            'total_formatado' => $this->total_formatado,
            'quantidade_itens' => $this->quantidade_itens,
            'tempo_espera' => $this->tempo_espera,
            'observacoes' => $this->observacoes,
            'created_at' => $this->created_at->format('d/m/Y H:i'),
            'pode_cancelar' => $this->podeSerCancelado()
        ];
    }
}