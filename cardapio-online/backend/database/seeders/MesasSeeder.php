<?php
// database/seeders/MesasSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Mesa;

class MesasSeeder extends Seeder
{
    public function run(): void
    {
        $mesas = [
            // Mesas pequenas (2-4 pessoas)
            ['numero' => 1, 'capacidade' => 2, 'status' => 'livre', 'status_pagamento' => 'aberta'],
            ['numero' => 2, 'capacidade' => 4, 'status' => 'livre', 'status_pagamento' => 'aberta'],
            ['numero' => 3, 'capacidade' => 4, 'status' => 'livre', 'status_pagamento' => 'aberta'],
            ['numero' => 4, 'capacidade' => 2, 'status' => 'livre', 'status_pagamento' => 'aberta'],
            
            // Mesas médias (4-6 pessoas)  
            ['numero' => 5, 'capacidade' => 6, 'status' => 'livre', 'status_pagamento' => 'aberta'],
            ['numero' => 6, 'capacidade' => 4, 'status' => 'livre', 'status_pagamento' => 'aberta'],
            ['numero' => 7, 'capacidade' => 6, 'status' => 'livre', 'status_pagamento' => 'aberta'],
            
            // Mesas grandes (6-8 pessoas)
            ['numero' => 8, 'capacidade' => 8, 'status' => 'livre', 'status_pagamento' => 'aberta'],
            ['numero' => 9, 'capacidade' => 6, 'status' => 'livre', 'status_pagamento' => 'aberta'],
            ['numero' => 10, 'capacidade' => 8, 'status' => 'livre', 'status_pagamento' => 'aberta'],
            
            // Mesas extras (se precisar)
            ['numero' => 11, 'capacidade' => 4, 'status' => 'livre', 'status_pagamento' => 'aberta', 'disponivel' => false], // Mesa não disponível
            ['numero' => 12, 'capacidade' => 4, 'status' => 'livre', 'status_pagamento' => 'aberta'],
        ];

        foreach ($mesas as $mesa) {
            Mesa::create($mesa);
        }

        $this->command->info('🎯 ' . count($mesas) . ' mesas criadas com sucesso!');
    }
}