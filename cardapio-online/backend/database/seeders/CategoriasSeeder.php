<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Categoria;

class CategoriasSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            [
                'nome' => 'Pão de Saladinha', 
                'descricao' => 'Lanches no pão de saladinha',
                'disponivel' => true
            ],
            [
                'nome' => 'Pão de Hambúrguer', 
                'descricao' => 'Lanches no pão de hambúrguer',
                'disponivel' => true
            ],
            [
                'nome' => 'X-Picanha / Filé', 
                'descricao' => 'Lanches com carnes especiais',
                'disponivel' => true
            ],
            [
                'nome' => 'X-Frango', 
                'descricao' => 'Lanches com frango',
                'disponivel' => true
            ],
            [
                'nome' => 'X-Calabresa / Bacon', 
                'descricao' => 'Lanches com calabresa e bacon',
                'disponivel' => true
            ],
            [
                'nome' => 'Lanches no Prato', 
                'descricao' => 'Lanches servidos no prato',
                'disponivel' => true
            ],
            [
                'nome' => 'Porções', 
                'descricao' => 'Porções para compartilhar',
                'disponivel' => true
            ],
            [
                'nome' => 'Bebidas', 
                'descricao' => 'Refrigerantes, sucos e cervejas',
                'disponivel' => true
            ],
            [
                'nome' => 'Acréscimos', 
                'descricao' => 'Adicionais para seu lanche',
                'disponivel' => true
            ],
        ];

        foreach ($categorias as $categoria) {
            Categoria::create($categoria);
        }
    }
}