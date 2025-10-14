<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PedidoItem extends Model
{
    use HasFactory;

    protected $fillable = ['pedido_id', 'produto_id', 'quantidade', 'preco_unitario', 'observacoes'];

<<<<<<< Updated upstream
=======
    protected $fillable = [
        'pedido_id',
        'produto_id',
        'quantidade',
        'preco_unitario',
        'observacoes'
    ];

    protected $casts = [
        'preco_unitario' => 'decimal:2',
        'quantidade' => 'integer'
    ];

>>>>>>> Stashed changes
    public function pedido()
    {
        return $this->belongsTo(Pedido::class);
    }

    public function produto()
    {
        return $this->belongsTo(Produto::class);
<<<<<<< Updated upstream
=======
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
>>>>>>> Stashed changes
    }
}