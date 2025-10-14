<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Produto;
use App\Models\Categoria;

class ProdutoSeeder extends Seeder
{
    public function run(): void
    {
        // Primeiro, criar categorias se não existirem
        if (Categoria::count() == 0) {
            $this->call(CategoriasSeeder::class);
        }

        $produtos = [
            // Pão de Saladinha (categoria_id: 1)
            [
                'nome' => 'Saladinha', 
                'descricao' => 'Alface, tomate, hambúrguer, presunto e queijo',
                'preco' => 19.00,
                'categoria_id' => 1,
                'disponivel' => true,
                'imagem' => null
            ],
            [
                'nome' => 'Saladinha Frango', 
                'descricao' => 'Alface, tomate, hambúrguer, frango, presunto e queijo',
                'preco' => 25.00,
                'categoria_id' => 1,
                'disponivel' => true,
                'imagem' => null
            ],
            [
                'nome' => 'Saladinha Bacon', 
                'descricao' => 'Alface, tomate, hambúrguer, bacon, presunto e queijo',
                'preco' => 25.00,
                'categoria_id' => 1,
                'disponivel' => true,
                'imagem' => null
            ],
            
            // Pão de Hambúrguer (categoria_id: 2)
            [
                'nome' => 'X-Salada', 
                'descricao' => 'Alface, tomate, hambúrguer, presunto e queijo',
                'preco' => 24.00,
                'categoria_id' => 2,
                'disponivel' => true,
                'imagem' => null
            ],
            [
                'nome' => 'X-Burguer', 
                'descricao' => 'Tomate, hambúrguer, 2 presuntos e 2 queijos',
                'preco' => 26.00,
                'categoria_id' => 2,
                'disponivel' => true,
                'imagem' => null
            ],
            [
                'nome' => 'X-Tudo', 
                'descricao' => 'Tomate, milho, ervilha, hambúrguer, bacon, calabresa, ovo, salsicha, presunto e queijo',
                'preco' => 35.00,
                'categoria_id' => 2,
                'disponivel' => true,
                'imagem' => null
            ],
            
            // Bebidas (categoria_id: 8)
            [
                'nome' => 'Coca-Cola Lata', 
                'descricao' => 'Lata 350ml',
                'preco' => 6.00,
                'categoria_id' => 8,
                'disponivel' => true,
                'imagem' => null
            ],
            [
                'nome' => 'Água Mineral', 
                'descricao' => 'Garrafa 500ml',
                'preco' => 4.00,
                'categoria_id' => 8,
                'disponivel' => true,
                'imagem' => null
            ],
        ];

        foreach ($produtos as $produto) {
            Produto::create($produto);
        }
    }
}