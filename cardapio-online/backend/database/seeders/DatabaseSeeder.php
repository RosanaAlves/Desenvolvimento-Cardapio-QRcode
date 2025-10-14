<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            ConfiguracaoSeeder::class,
            MesasSeeder::class,
            CategoriasSeeder::class,
            ProdutoSeeder::class,
            UserSeeder::class,
        ]);
    }
}