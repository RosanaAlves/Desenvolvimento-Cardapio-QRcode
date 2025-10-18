<?php
// app/Models/Mesa.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Mesa extends Model
{
    use HasFactory;

    // 🔥 STATUS DISPONÍVEIS - CORRIGIDO
    public const STATUS_DISPONIVEIS = [
        'livre' => 'Livre',
        'em_uso' => 'Em Uso',  // ✅ NOVO STATUS - mesa sendo preparada pelo garçom
        'ocupada' => 'Ocupada'  // mesa com pedidos ativos
    ];

    // 🔥 STATUS PAGAMENTO DISPONÍVEIS - CORRIGIDO
    public const STATUS_PAGAMENTO_DISPONIVEIS = [
        'aberta' => 'Aberta',
        'fechada' => 'Fechada',
        'paga' => 'Paga'
    ];

    protected $fillable = [
        'numero',
        'capacidade', 
        'status',
        'status_pagamento',
        'garcom_nome',
        'disponivel'
    ];

    protected $casts = [
        'disponivel' => 'boolean',
        'capacidade' => 'integer'
    ];

    protected $attributes = [
        'status' => 'livre',
        'status_pagamento' => 'aberta',
        'disponivel' => true,
        'capacidade' => 4
    ];

    // 🔥 VALIDAÇÃO DE STATUS - CORRIGIDA
    public function setStatusAttribute($value)
    {
        if (!array_key_exists($value, self::STATUS_DISPONIVEIS)) {
            throw new \InvalidArgumentException("Status inválido: {$value}. Status disponíveis: " . implode(', ', array_keys(self::STATUS_DISPONIVEIS)));
        }
        $this->attributes['status'] = $value;
    }

    public function setStatusPagamentoAttribute($value)
    {
        if (!array_key_exists($value, self::STATUS_PAGAMENTO_DISPONIVEIS)) {
            throw new \InvalidArgumentException("Status pagamento inválido: {$value}. Status disponíveis: " . implode(', ', array_keys(self::STATUS_PAGAMENTO_DISPONIVEIS)));
        }
        $this->attributes['status_pagamento'] = $value;
    }

    // 🔥 BOOT METHOD PARA VALIDAÇÕES
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($mesa) {
            // Garantir valores padrão
            $mesa->status = $mesa->status ?? 'livre';
            $mesa->status_pagamento = $mesa->status_pagamento ?? 'aberta';
            $mesa->disponivel = $mesa->disponivel ?? true;
            $mesa->capacidade = $mesa->capacidade ?? 4;
        });

        static::updating(function ($mesa) {
            // ✅ CORREÇÃO: Quando a conta é paga, a mesa deve ser liberada
            if ($mesa->isDirty('status_pagamento') && $mesa->status_pagamento === 'paga') {
                $mesa->status = 'livre';
                $mesa->garcom_nome = null;
            }

            // ✅ CORREÇÃO: Quando a conta é fechada, a mesa permanece ocupada
            if ($mesa->isDirty('status_pagamento') && $mesa->status_pagamento === 'fechada') {
                $mesa->status = 'ocupada';
            }

            // ✅ CORREÇÃO: Quando a mesa é liberada, resetar status de pagamento
            if ($mesa->isDirty('status') && $mesa->status === 'livre' && $mesa->status_pagamento !== 'paga') {
                $mesa->status_pagamento = 'aberta';
                $mesa->garcom_nome = null;
            }
        });
    }

    // 🔥 RELACIONAMENTOS
    public function pedidos(): HasMany
    {
        return $this->hasMany(Pedido::class);
    }

    public function pedidosAtivos(): HasMany
    {
        return $this->hasMany(Pedido::class)
                    ->whereIn('status', ['pendente', 'preparando', 'pronto']);
    }

    public function pedidosEmAberto(): HasMany
    {
        return $this->hasMany(Pedido::class)
                    ->whereNotIn('status', ['cancelado', 'entregue']);
    }

    public function pedidosDoDia(): HasMany
    {
        return $this->hasMany(Pedido::class)
                    ->whereDate('created_at', today());
    }

    // 🔥 MÉTODOS DE STATUS
    public function estaLivre(): bool
    {
        return $this->status === 'livre';
    }

    public function estaEmUso(): bool
    {
        return $this->status === 'em_uso';
    }

    public function estaOcupada(): bool
    {
        return $this->status === 'ocupada';
    }

    public function contaAberta(): bool
    {
        return $this->status_pagamento === 'aberta';
    }

    public function contaFechada(): bool
    {
        return $this->status_pagamento === 'fechada';
    }

    public function contaPaga(): bool
    {
        return $this->status_pagamento === 'paga';
    }

    public function estaDisponivel(): bool
    {
        return $this->disponivel && $this->estaLivre();
    }

    // 🔥 MÉTODOS DE AÇÃO - CORRIGIDOS
    public function prepararParaUso(?string $garcomNome = null): bool
    {
        if (!$this->estaLivre()) {
            throw new \Exception("Mesa não está livre para uso");
        }

        return $this->update([
            'status' => 'em_uso',
            'garcom_nome' => $garcomNome,
            'status_pagamento' => 'aberta'
        ]);
    }

    public function ocupar(): bool
    {
        if (!$this->estaEmUso()) {
            throw new \Exception("Mesa precisa estar em uso antes de ser ocupada");
        }

        return $this->update([
            'status' => 'ocupada'
        ]);
    }

    public function liberar(): bool
    {
        // ✅ CORREÇÃO: Verificar se pode ser liberada
        if ($this->contaFechada() && $this->getTotalContaAttribute() > 0) {
            throw new \Exception("Não é possível liberar mesa com conta fechada e valor pendente");
        }

        return $this->update([
            'status' => 'livre',
            'garcom_nome' => null,
            'status_pagamento' => 'aberta'
        ]);
    }

    public function fecharConta(): bool
    {
        if (!$this->contaAberta()) {
            throw new \Exception("Conta já está fechada");
        }

        if ($this->getTotalContaAttribute() <= 0) {
            throw new \Exception("Não é possível fechar conta sem pedidos");
        }

        return $this->update([
            'status_pagamento' => 'fechada',
            'status' => 'ocupada' // ✅ CORREÇÃO: Mesa permanece ocupada quando conta é fechada
        ]);
    }

    public function reabrirConta(): bool
    {
        if (!$this->contaFechada()) {
            throw new \Exception("Conta não está fechada");
        }

        return $this->update([
            'status_pagamento' => 'aberta'
        ]);
    }

    public function pagarConta(): bool
    {
        if (!$this->contaFechada()) {
            throw new \Exception("Conta precisa estar fechada para ser paga");
        }

        // ✅ CORREÇÃO: Marcar pedidos como entregues ao pagar conta
        $this->pedidosEmAberto()->update(['status' => 'entregue']);

        return $this->update([
            'status_pagamento' => 'paga',
            'status' => 'livre',
            'garcom_nome' => null
        ]);
    }

    // 🔥 SCOPES
    public function scopeLivres($query)
    {
        return $query->where('status', 'livre')->where('disponivel', true);
    }

    public function scopeEmUso($query)
    {
        return $query->where('status', 'em_uso');
    }

    public function scopeOcupadas($query)
    {
        return $query->where('status', 'ocupada');
    }

    public function scopeDisponiveis($query)
    {
        return $query->where('disponivel', true);
    }

    public function scopeComContaAberta($query)
    {
        return $query->where('status_pagamento', 'aberta');
    }

    public function scopeComContaFechada($query)
    {
        return $query->where('status_pagamento', 'fechada');
    }

    public function scopeComContaPaga($query)
    {
        return $query->where('status_pagamento', 'paga');
    }

    public function scopeComPedidosAtivos($query)
    {
        return $query->whereHas('pedidosAtivos');
    }

    // 🔥 ATRIBUTOS CALCULADOS - CORRIGIDOS
    public function getStatusFormatadoAttribute(): string
    {
        return self::STATUS_DISPONIVEIS[$this->status] ?? $this->status;
    }

    public function getStatusPagamentoFormatadoAttribute(): string
    {
        return self::STATUS_PAGAMENTO_DISPONIVEIS[$this->status_pagamento] ?? $this->status_pagamento;
    }

    public function getTemPedidosAtivosAttribute(): bool
    {
        return $this->pedidosAtivos()->exists();
    }

    public function getTotalContaAttribute(): float
    {
        return (float) $this->pedidosEmAberto()->sum('total');
    }

    public function getQuantidadePedidosAtivosAttribute(): int
    {
        return $this->pedidosAtivos()->count();
    }

    public function getCorStatusAttribute(): string
    {
        return match($this->status) {
            'livre' => '#4caf50', // Verde
            'em_uso' => '#ff9800', // Laranja
            'ocupada' => '#f44336', // Vermelho
            default => '#9e9e9e' // Cinza
        };
    }

    public function getCorStatusPagamentoAttribute(): string
    {
        return match($this->status_pagamento) {
            'aberta' => '#2196f3', // Azul
            'fechada' => '#ff9800', // Laranja
            'paga' => '#4caf50', // Verde
            default => '#9e9e9e' // Cinza
        };
    }

    // 🔥 MÉTODO PARA RESPOSTA DA API - CORRIGIDO
    public function toArrayResumido(): array
    {
        return [
            'id' => $this->id,
            'numero' => $this->numero,
            'status' => $this->status,
            'status_formatado' => $this->status_formatado,
            'status_pagamento' => $this->status_pagamento,
            'status_pagamento_formatado' => $this->status_pagamento_formatado,
            'garcom_nome' => $this->garcom_nome,
            'tem_pedidos_ativos' => $this->tem_pedidos_ativos,
            'quantidade_pedidos_ativos' => $this->quantidade_pedidos_ativos,
            'total_conta' => $this->total_conta,
            'capacidade' => $this->capacidade,
            'disponivel' => $this->disponivel,
            'cor_status' => $this->cor_status,
            'cor_status_pagamento' => $this->cor_status_pagamento,
            'created_at' => $this->created_at?->format('d/m/Y H:i'),
            'updated_at' => $this->updated_at?->format('d/m/Y H:i')
        ];
    }

    // 🔥 MÉTODO PARA DASHBOARD/ADMIN
    public function toArrayAdmin(): array
    {
        return array_merge($this->toArrayResumido(), [
            'pedidos_ativos' => $this->pedidosAtivos->map(function ($pedido) {
                return [
                    'id' => $pedido->id,
                    'status' => $pedido->status,
                    'total' => $pedido->total,
                    'created_at' => $pedido->created_at?->format('d/m/Y H:i')
                ];
            }),
            'pode_liberar' => $this->estaLivre() || ($this->contaFechada() && $this->total_conta == 0),
            'pode_fechar_conta' => $this->contaAberta() && $this->total_conta > 0,
            'pode_pagar_conta' => $this->contaFechada() && $this->total_conta > 0
        ]);
    }

    // 🔥 MÉTODO STATIC PARA CRIAR MESAS
    public static function criarMesas(int $quantidade): void
    {
        $mesaMaxima = self::max('numero') ?? 0;
        
        for ($i = 1; $i <= $quantidade; $i++) {
            $numeroMesa = $mesaMaxima + $i;
            
            self::firstOrCreate(
                ['numero' => $numeroMesa],
                [
                    'capacidade' => 4,
                    'status' => 'livre',
                    'status_pagamento' => 'aberta',
                    'disponivel' => true
                ]
            );
        }
    }
}