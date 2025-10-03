<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            ProdutoSeeder::class,
            // PedidoItemSeeder::class, // Comente se não for necessário agora
        ]);
    }
}
