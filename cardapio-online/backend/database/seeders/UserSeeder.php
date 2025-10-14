<?php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'name' => 'Administrador',
            'email' => 'admin@jetros.com',
            'password' => Hash::make('admin123'),
            'tipo' => 'admin'
        ]);

        User::create([
            'name' => 'Caixa',
            'email' => 'caixa@jetros.com',
            'password' => Hash::make('caixa123'),
            'tipo' => 'caixa'
        ]);
    }
}