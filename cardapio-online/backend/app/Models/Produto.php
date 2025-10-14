<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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

    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }

    public function pedidoItens()
    {
        return $this->hasMany(PedidoItem::class);
    }

    // 🔥 MÉTODOS ÚTEIS
    public function getPrecoFormatadoAttribute()
    {
        return 'R$ ' . number_format($this->preco, 2, ',', '.');
    }

    public function estaDisponivel()
    {
        return $this->disponivel;
    }
}