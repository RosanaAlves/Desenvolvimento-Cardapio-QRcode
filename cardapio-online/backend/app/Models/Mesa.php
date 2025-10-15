<?php
// app/Models/Mesa.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mesa extends Model
{
    use HasFactory;

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

    // 🔥 RELACIONAMENTOS
    public function pedidos()
    {
        return $this->hasMany(Pedido::class);
    }

    public function pedidosAtivos()
    {
        return $this->hasMany(Pedido::class)
                    ->whereIn('status', ['pendente', 'preparando', 'pronto']);
    }

    // 🔥 MÉTODOS ÚTEIS
    public function estaLivre()
    {
        return $this->status === 'livre';
    }

    public function estaOcupada()
    {
        return $this->status === 'ocupada';
    }

    public function contaAberta()
    {
        return $this->status_pagamento === 'aberta';
    }

    public function contaFechada()
    {
        return $this->status_pagamento === 'fechada';
    }

    public function contaPaga()
    {
        return $this->status_pagamento === 'paga';
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

    // 🔥 ATRIBUTOS CALCULADOS
    public function getStatusFormatadoAttribute()
    {
        return match($this->status) {
            'livre' => '🟢 Livre',
            'ocupada' => '🔴 Ocupada',
            default => $this->status
        };
    }

    public function getStatusPagamentoFormatadoAttribute()
    {
        return match($this->status_pagamento) {
            'aberta' => '💰 Aberta',
            'fechada' => '🧾 Fechada', 
            'paga' => '✅ Paga',
            default => $this->status_pagamento
        };
    }
}