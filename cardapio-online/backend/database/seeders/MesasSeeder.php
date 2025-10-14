<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Mesa;

class MesasSeeder extends Seeder
{
    public function run(): void
    {
        // Verificar se já existem mesas
        if (Mesa::count() > 0) {
            $this->command->info('Mesas já existem no banco de dados. Pulando criação.');
            return;
        }

        // Criar 20 mesas
        $mesas = [];
        for ($i = 1; $i <= 20; $i++) {
            $mesas[] = [
                'numero' => $i,
                'capacidade' => 4,
                'status' => 'livre',
                'disponivel' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Inserir todas as mesas de uma vez
        Mesa::insert($mesas);
        
        $this->command->info('20 mesas criadas com sucesso!');
    }
}