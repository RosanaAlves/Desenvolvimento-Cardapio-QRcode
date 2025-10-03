<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProdutoSeeder extends Seeder
{
    public function run(): void
    {
        // Primeiro, criar categorias se não existirem
        if (DB::table('categorias')->count() == 0) {
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

        // Agora criar produtos
        DB::table('produtos')->insert([
            // Pão de Saladinha (categoria_id: 1)
            [
                'nome' => 'Saladinha', 
                'descricao' => 'Alface, tomate, hambúrguer, presunto e queijo',
                'preco' => 19.00,
                'categoria_id' => 1,
                'disponivel' => true
            ],
            [
                'nome' => 'Saladinha Frango', 
                'descricao' => 'Alface, tomate, hambúrguer, frango, presunto e queijo',
                'preco' => 25.00,
                'categoria_id' => 1,
                'disponivel' => true
            ],
            [
                'nome' => 'Saladinha Bacon', 
                'descricao' => 'Alface, tomate, hambúrguer, bacon, presunto e queijo',
                'preco' => 25.00,
                'categoria_id' => 1,
                'disponivel' => true
            ],
            
            // Pão de Hambúrguer (categoria_id: 2)
            [
                'nome' => 'X-Salada', 
                'descricao' => 'Alface, tomate, hambúrguer, presunto e queijo',
                'preco' => 24.00,
                'categoria_id' => 2,
                'disponivel' => true
            ],
            [
                'nome' => 'X-Burguer', 
                'descricao' => 'Tomate, hambúrguer, 2 presuntos e 2 queijos',
                'preco' => 26.00,
                'categoria_id' => 2,
                'disponivel' => true
            ],
            [
                'nome' => 'X-Tudo', 
                'descricao' => 'Tomate, milho, ervilha, hambúrguer, bacon, calabresa, ovo, salsicha, presunto e queijo',
                'preco' => 35.00,
                'categoria_id' => 2,
                'disponivel' => true
            ],
            
            // Bebidas (categoria_id: 8)
            [
                'nome' => 'Coca-Cola Lata', 
                'descricao' => 'Lata 350ml',
                'preco' => 6.00,
                'categoria_id' => 8,
                'disponivel' => true
            ],
            [
                'nome' => 'Água Mineral', 
                'descricao' => 'Garrafa 500ml',
                'preco' => 4.00,
                'categoria_id' => 8,
                'disponivel' => true
            ],
        ]);
    }
}