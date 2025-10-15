<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Configuracao extends Model
{
    use HasFactory;

    protected $table = 'configuracoes';

    protected $fillable = [
        'nome_estabelecimento',
        'telefone', 
        'numero_mesas',
        'expediente_aberto',
        'taxa_servico'
    ];

    protected $casts = [
        'expediente_aberto' => 'boolean',
        'taxa_servico' => 'decimal:2'
    ];

    public static function getConfig()
    {
        return self::first() ?? self::create(['numero_mesas' => 10]);
    }

    // 🔥 MÉTODOS ÚTEIS
    public function expedienteAberto()
    {
        return $this->expediente_aberto;
    }

    // Método para compatibilidade (se precisar)
    public function getTotalMesasAttribute()
    {
        return $this->numero_mesas;
    }
}