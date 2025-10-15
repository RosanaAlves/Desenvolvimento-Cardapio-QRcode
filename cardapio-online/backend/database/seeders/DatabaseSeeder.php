<?php
// database/seeders/DatabaseSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // ✅ ORDEM CORRETA:
        $this->call([
            UserSeeder::class,           // 1º - Não depende de ninguém
            CategoriasSeeder::class,     // 2º - Não depende de ninguém  
            ProdutoSeeder::class,        // 3º - Depende de Categorias
            ConfiguracaoSeeder::class,   // 4º - Não depende de ninguém
            MesasSeeder::class,          // 5º - Pode usar Configuracoes se precisar
        ]);
    }
}