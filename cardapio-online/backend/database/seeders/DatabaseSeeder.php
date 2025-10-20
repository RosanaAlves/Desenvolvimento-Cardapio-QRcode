<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. CHAME O SEEDER DE CATEGORIAS PRIMEIRO
        // Isso garante que todas as categorias (IDs 1-10) existam antes de serem referenciadas.

        $this->call(CategoriasSeeder::class);
        
        // 2. CHAME O SEEDER DE PRODUTOS DEPOIS
        // Agora, os produtos podem ser inseridos com segurança.
        $this->call(ProdutoSeeder::class);
        $this->call(MesasSeeder::class);
        $this->call(UserSeeder::class);

        // Se você tiver outros seeders (como Users, Pedidos, etc.), chame-os aqui.
        // $this->call(UserSeeder::class); 
    }
}
