<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User; // Certifique-se que o caminho está correto

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Usa firstOrCreate para não duplicar o admin se o seeder rodar de novo
        User::firstOrCreate(
            ['email' => 'admin@seulanche.com'], // Chave única para encontrar
            [
                'name' => 'Administrador Principal',
                'password' => Hash::make('senhaSuperForte123'), // <-- Troque pela sua senha!
                'role' => 'admin',
            ]
        );
    }
}