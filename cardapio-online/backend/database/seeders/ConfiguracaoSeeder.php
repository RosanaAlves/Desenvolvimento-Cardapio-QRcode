<?php
namespace Database\Seeders;

use App\Models\Configuracao;
use Illuminate\Database\Seeder;

class ConfiguracaoSeeder extends Seeder
{
    public function run()
    {
        Configuracao::create([
            'nome_estabelecimento' => "Jetro's Lanches",
            'telefone' => '99611-2820',
            'numero_mesas' => 10, // ✅ usa numero_mesas da migration
            'expediente_aberto' => true,
            'taxa_servico' => 0
        ]);
    }
}