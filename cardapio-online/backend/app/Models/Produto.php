<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Produto extends Model
{
    use HasFactory;

    protected $table = 'produtos';

    protected $fillable = [
        'nome',
        'descricao',
        'preco',
        'disponivel',
        'categoria_id'
    ];

    protected $casts = [
        'preco' => 'decimal:2',
        'disponivel' => 'boolean'
    ];

    // Relação com categoria
    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }
}