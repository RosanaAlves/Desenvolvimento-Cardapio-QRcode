<?php
// app/Models/Mesa.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Log;

class Mesa extends Model
{
    use HasFactory;

    // 🔥 STATUS DISPONÍVEIS - SIMPLIFICADO
    public const STATUS_DISPONIVEIS = [
        'livre' => 'Livre',
        'ocupada' => 'Ocupada'
    ];

    // 🔥 STATUS PAGAMENTO DISPONÍVEIS - SIMPLIFICADO
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

    // 🔥 VALIDAÇÃO DE STATUS - SIMPLIFICADA
    public function setStatusAttribute($value)
    {
        if (!array_key_exists($value, self::STATUS_DISPONIVEIS)) {
            // Usar valor padrão em vez de lançar exceção
            $value = 'livre';
        }
        $this->attributes['status'] = $value;
    }

    public function setStatusPagamentoAttribute($value)
    {
        if (!array_key_exists($value, self::STATUS_PAGAMENTO_DISPONIVEIS)) {
            // Usar valor padrão em vez de lançar exceção
            $value = 'aberta';
        }
        $this->attributes['status_pagamento'] = $value;
    }

    // 🔥 BOOT METHOD SIMPLIFICADO
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
            try {
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
            } catch (\Exception $e) {
                Log::error("Erro no boot method da Mesa {$mesa->id}: " . $e->getMessage());
                // Não lançar exceção para não bloquear atualizações
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

    // 🔥 MÉTODOS DE STATUS - SIMPLIFICADOS
    public function estaLivre(): bool
    {
        return $this->status === 'livre';
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

    // 🔥 MÉTODOS DE AÇÃO - SIMPLIFICADOS
    public function ocupar(?string $garcomNome = null): bool
    {
        return $this->update([
            'status' => 'ocupada',
            'garcom_nome' => $garcomNome,
            'status_pagamento' => 'aberta'
        ]);
    }

    public function liberar(): bool
    {
        return $this->update([
            'status' => 'livre',
            'garcom_nome' => null,
            'status_pagamento' => 'aberta'
        ]);
    }

    public function fecharConta(): bool
    {
        return $this->update([
            'status_pagamento' => 'fechada'
        ]);
    }

    public function pagarConta(): bool
    {
        // Marcar pedidos como entregues ao pagar conta
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
        $total = $this->pedidosEmAberto()->sum('total');
        return (float) ($total ?: 0);
    }

    public function getQuantidadePedidosAtivosAttribute(): int
    {
        return $this->pedidosAtivos()->count();
    }

    public function getCorStatusAttribute(): string
    {
        return match($this->status) {
            'livre' => '#4caf50', // Verde
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

    // 🔥 MÉTODO PARA RESPOSTA DA API - SIMPLIFICADO
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

    // 🔥 MÉTODO STATIC PARA CRIAR MESAS - CORRIGIDO
    public static function criarMesas(int $quantidade): array
    {
        $mesaMaxima = self::max('numero') ?? 0;
        $mesasCriadas = [];
        
        for ($i = 1; $i <= $quantidade; $i++) {
            $numeroMesa = $mesaMaxima + $i;
            
            $mesa = self::firstOrCreate(
                ['numero' => $numeroMesa],
                [
                    'capacidade' => 4,
                    'status' => 'livre',
                    'status_pagamento' => 'aberta',
                    'disponivel' => true
                ]
            );
            
            $mesasCriadas[] = $mesa;
        }

        return $mesasCriadas;
    }

    // 🔥 MÉTODO PARA ATUALIZAR NÚMERO DE MESAS - NOVO
    public static function atualizarQuantidadeMesas(int $novaQuantidade): array
    {
        $quantidadeAtual = self::count();
        $resultado = [
            'antes' => $quantidadeAtual,
            'depois' => $novaQuantidade,
            'mesas_adicionadas' => 0,
            'mesas_removidas' => 0
        ];

        if ($novaQuantidade > $quantidadeAtual) {
            // Adicionar mesas
            $mesasAdicionadas = self::criarMesas($novaQuantidade - $quantidadeAtual);
            $resultado['mesas_adicionadas'] = count($mesasAdicionadas);
        } elseif ($novaQuantidade < $quantidadeAtual) {
            // Remover mesas (apenas se estiverem livres)
            $mesasParaRemover = self::where('numero', '>', $novaQuantidade)
                ->where('status', 'livre')
                ->where('status_pagamento', 'aberta')
                ->get();

            foreach ($mesasParaRemover as $mesa) {
                $mesa->delete();
                $resultado['mesas_removidas']++;
            }
        }

        return $resultado;
    }
}