<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Produto extends Model
{
    use HasFactory;

    protected $fillable = [
        'nome',
        'descricao',
        'preco',
        'disponivel',
        'imagem',
        'categoria_id'
    ];

    protected $casts = [
        'preco' => 'decimal:2',
        'disponivel' => 'boolean'
    ];

    protected $attributes = [
        'disponivel' => true,
        'preco' => 0.00
    ];

    // ✅ BOOT METHOD PARA VALIDAÇÕES
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($produto) {
            // Garantir valores padrão
            $produto->disponivel = $produto->disponivel ?? true;
            $produto->preco = $produto->preco ?? 0.00;
            
            // Validar preço mínimo
            if ($produto->preco < 0) {
                throw new \InvalidArgumentException("Preço não pode ser negativo");
            }
        });

        static::updating(function ($produto) {
            // Validar preço mínimo na atualização
            if ($produto->isDirty('preco') && $produto->preco < 0) {
                throw new \InvalidArgumentException("Preço não pode ser negativo");
            }
        });
    }

    // 🔥 RELACIONAMENTOS
    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class);
    }

    public function pedidoItens(): HasMany
    {
        return $this->hasMany(PedidoItem::class);
    }

    // 🔥 SCOPES
    public function scopeDisponiveis(Builder $query): Builder
    {
        return $query->where('disponivel', true);
    }

    public function scopeIndisponiveis(Builder $query): Builder
    {
        return $query->where('disponivel', false);
    }

    public function scopePorCategoria(Builder $query, $categoriaId): Builder
    {
        return $query->where('categoria_id', $categoriaId);
    }

    public function scopeComCategoria(Builder $query): Builder
    {
        return $query->with('categoria');
    }

    public function scopeBuscar(Builder $query, string $termo): Builder
    {
        return $query->where('nome', 'LIKE', "%{$termo}%")
                    ->orWhere('descricao', 'LIKE', "%{$termo}%");
    }

    public function scopeOrdenarPorPreco(Builder $query, string $direcao = 'asc'): Builder
    {
        return $query->orderBy('preco', $direcao);
    }

    public function scopeOrdenarPorNome(Builder $query, string $direcao = 'asc'): Builder
    {
        return $query->orderBy('nome', $direcao);
    }

    // 🔥 MÉTODOS ÚTEIS
    public function getPrecoFormatadoAttribute(): string
    {
        return 'R$ ' . number_format($this->preco, 2, ',', '.');
    }

    public function getPrecoNumericoAttribute(): float
    {
        return (float) $this->preco;
    }

    public function estaDisponivel(): bool
    {
        return $this->disponivel;
    }

    public function tornarDisponivel(): bool
    {
        return $this->update(['disponivel' => true]);
    }

    public function tornarIndisponivel(): bool
    {
        return $this->update(['disponivel' => false]);
    }

    public function atualizarPreco(float $novoPreco): bool
    {
        if ($novoPreco < 0) {
            throw new \InvalidArgumentException("Preço não pode ser negativo");
        }

        return $this->update(['preco' => $novoPreco]);
    }

    public function getQuantidadeVendidaAttribute(): int
    {
        return $this->pedidoItens()->sum('quantidade');
    }

    public function getTotalVendidoAttribute(): float
    {
        return (float) $this->pedidoItens()
            ->get()
            ->sum(function ($item) {
                return $item->quantidade * $item->preco_unitario;
            });
    }

    public function getImagemUrlAttribute(): ?string
    {
        if (!$this->imagem) {
            return null;
        }

        // Se for URL completa, retorna diretamente
        if (filter_var($this->imagem, FILTER_VALIDATE_URL)) {
            return $this->imagem;
        }

        // Se for caminho relativo, adiciona URL base
        return asset('storage/' . $this->imagem);
    }

    public function getStatusFormatadoAttribute(): string
    {
        return $this->disponivel ? '🟢 Disponível' : '🔴 Indisponível';
    }

    public function getCorStatusAttribute(): string
    {
        return $this->disponivel ? '#4caf50' : '#f44336';
    }

    // 🔥 MÉTODOS PARA API
    public function toArrayResumido(): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'preco' => $this->preco,
            'preco_formatado' => $this->preco_formatado,
            'disponivel' => $this->disponivel,
            'status_formatado' => $this->status_formatado,
            'cor_status' => $this->cor_status,
            'categoria_nome' => $this->categoria?->nome,
            'imagem_url' => $this->imagem_url
        ];
    }

    public function toArrayCompleto(): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'descricao' => $this->descricao,
            'preco' => $this->preco,
            'preco_formatado' => $this->preco_formatado,
            'disponivel' => $this->disponivel,
            'status_formatado' => $this->status_formatado,
            'cor_status' => $this->cor_status,
            'imagem' => $this->imagem,
            'imagem_url' => $this->imagem_url,
            'categoria_id' => $this->categoria_id,
            'categoria' => $this->categoria?->toArray(),
            'quantidade_vendida' => $this->quantidade_vendida,
            'total_vendido' => $this->total_vendido,
            'created_at' => $this->created_at?->format('d/m/Y H:i'),
            'updated_at' => $this->updated_at?->format('d/m/Y H:i')
        ];
    }

    // 🔥 VALIDAÇÕES
    public function podeSerExcluido(): bool
    {
        // Verificar se existem pedidos vinculados a este produto
        return $this->pedidoItens()->doesntExist();
    }

    public function getMensagemImpedimentoExclusao(): string
    {
        if ($this->pedidoItens()->exists()) {
            return 'Não é possível excluir produto com pedidos vinculados';
        }

        return 'Produto pode ser excluído';
    }
}