<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LogCardapio extends Model
{
    use HasFactory;

    protected $table = 'logs_cardapio';

    protected $fillable = [
        'acao',
        'tipo',
        'item_id',
        'dados_anteriores',
        'dados_novos',
        'usuario'
    ];

    protected $casts = [
        'dados_anteriores' => 'array',
        'dados_novos' => 'array'
    ];
}