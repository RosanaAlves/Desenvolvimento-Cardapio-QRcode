<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Configuracao extends Model
{
    use HasFactory;

    protected $table = 'configuracoes';

    protected $fillable = [
        'total_mesas',
        'expediente_aberto',
        'data_expediente',
        'faturamento_dia'
    ];

    protected $casts = [
        'expediente_aberto' => 'boolean',
        'data_expediente' => 'date',
        'faturamento_dia' => 'decimal:2'
    ];

    public static function getConfig()
    {
        return self::first() ?? self::create(['total_mesas' => 10]);
    }

    // 🔥 MÉTODOS ÚTEIS
    public function expedienteAberto()
    {
        return $this->expediente_aberto;
    }

    public function getFaturamentoDiaFormatadoAttribute()
    {
        return 'R$ ' . number_format($this->faturamento_dia, 2, ',', '.');
    }
}