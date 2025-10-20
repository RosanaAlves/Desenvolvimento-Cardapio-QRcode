<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User; // Importe o seu Model User
// Não é necessário importar o Hash::, pois o Model já está tratando isso
// devido a 'password' => 'hashed' no seu User.php

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // 1. Criar um usuário Administrador principal
        User::create([
            'name' => 'Administrador',
            'email' => 'admin@sistema.com',
            // O password será HASHADO automaticamente pelo Model
            'password' => 'sua_senha_secreta', 
            'tipo' => 'administrador', // O valor esperado pela coluna 'tipo'
            'ativo' => true,           // O valor esperado pela coluna 'ativo' (true/1)
        ]);

        // 2. Opcional: Criar um usuário Garçom de exemplo
        User::create([
            'name' => 'Garçom 01',
            'email' => 'garcom@sistema.com',
            'password' => 'garcom123', 
            'tipo' => 'garcom',
            'ativo' => true,
        ]);
    }
}