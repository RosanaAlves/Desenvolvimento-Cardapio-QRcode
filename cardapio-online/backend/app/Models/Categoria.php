<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    use HasFactory;

    protected $fillable = [
        'nome',
        'descricao',
        'disponivel'
    ];

    protected $casts = [
        'disponivel' => 'boolean'
    ];

    public function produtos()
    {
        return $this->hasMany(Produto::class);
    }

    public function produtosDisponiveis()
    {
        return $this->hasMany(Produto::class)->where('disponivel', true);
    }
}