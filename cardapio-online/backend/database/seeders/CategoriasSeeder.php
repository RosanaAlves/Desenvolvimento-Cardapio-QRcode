<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoriasSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('categorias')->insert([
            ['nome' => 'Pão de Saladinha', 'descricao' => 'Lanches no pão de saladinha'],
            ['nome' => 'Pão de Hambúrguer', 'descricao' => 'Lanches no pão de hambúrguer'],
            ['nome' => 'X-Picanha / Filé', 'descricao' => 'Lanches com carnes especiais'],
            ['nome' => 'X-Frango', 'descricao' => 'Lanches com frango'],
            ['nome' => 'X-Calabresa / Bacon', 'descricao' => 'Lanches com calabresa e bacon'],
            ['nome' => 'Lanches no Prato', 'descricao' => 'Lanches servidos no prato'],
            ['nome' => 'Porções', 'descricao' => 'Porções para compartilhar'],
            ['nome' => 'Bebidas', 'descricao' => 'Refrigerantes, sucos e cervejas'],
            ['nome' => 'Acréscimos', 'descricao' => 'Adicionais para seu lanche'],
        ]);
    }
}
