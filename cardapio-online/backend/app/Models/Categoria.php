<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    use HasFactory;

    protected $table = 'categorias';

    protected $fillable = [
        'nome',
        'descricao',
        'disponivel'
    ];

    protected $casts = [
        'disponivel' => 'boolean'
    ];

    // Relação com produtos (se precisar)
    public function produtos()
    {
        return $this->hasMany(Produto::class);
    }
}