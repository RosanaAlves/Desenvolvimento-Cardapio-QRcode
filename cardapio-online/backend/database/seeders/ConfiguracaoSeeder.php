<?php
namespace Database\Seeders;

use App\Models\Configuracao;
use Illuminate\Database\Seeder;

class ConfiguracaoSeeder extends Seeder
{
    public function run()
    {
        Configuracao::create([
            'total_mesas' => 10,
            'expediente_aberto' => true,
            'data_expediente' => now(),
            'faturamento_dia' => 0
        ]);
    }
}