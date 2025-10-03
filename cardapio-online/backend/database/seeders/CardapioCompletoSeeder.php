<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CardapioCompletoSeeder extends Seeder
{
    public function run()
    {
        // Limpar tabelas antes de inserir
        DB::table('produtos')->delete();
        DB::table('categorias')->delete();

        // Inserir categorias
        $categorias = [
            ['id' => 1, 'nome' => 'Pão de Saladinha', 'descricao' => 'Lanches no pão de saladinha', 'disponivel' => true],
            ['id' => 2, 'nome' => 'Pão de Hambúrguer', 'descricao' => 'Lanches no pão de hambúrguer', 'disponivel' => true],
            ['id' => 3, 'nome' => 'X-Picanha / Filé', 'descricao' => 'Lanches com carnes especiais', 'disponivel' => true],
            ['id' => 4, 'nome' => 'X-Frango', 'descricao' => 'Lanches com frango', 'disponivel' => true],
            ['id' => 5, 'nome' => 'X-Calabresa / Bacon', 'descricao' => 'Lanches com calabresa e bacon', 'disponivel' => true],
            ['id' => 6, 'nome' => 'Lanches no Prato', 'descricao' => 'Lanches servidos no prato', 'disponivel' => true],
            ['id' => 7, 'nome' => 'Porções', 'descricao' => 'Porções para compartilhar', 'disponivel' => true],
            ['id' => 8, 'nome' => 'Bebidas', 'descricao' => 'Refrigerantes, sucos e cervejas', 'disponivel' => true],
            ['id' => 9, 'nome' => 'Sucos', 'descricao' => 'Sucos naturais', 'disponivel' => true],
            ['id' => 10, 'nome' => 'Acréscimos', 'descricao' => 'Adicionais para seu lanche', 'disponivel' => true],
        ];

        DB::table('categorias')->insert($categorias);

        // Inserir produtos
        $produtos = [
            // PÃO DE SALADINHA (Categoria 1)
            ['nome' => 'Saladinha', 'descricao' => 'Alface, tomate, hambúrguer, presunto e queijo', 'preco' => 19.00, 'disponivel' => true, 'categoria_id' => 1],
            ['nome' => 'Saladinha Frango', 'descricao' => 'Alface, tomate, hambúrguer, frango, presunto e queijo', 'preco' => 25.00, 'disponivel' => true, 'categoria_id' => 1],
            ['nome' => 'Saladinha Bacon', 'descricao' => 'Alface, tomate, hambúrguer, bacon, presunto e queijo', 'preco' => 25.00, 'disponivel' => true, 'categoria_id' => 1],
            ['nome' => 'Saladinha Calabresa', 'descricao' => 'Alface, tomate, hambúrguer, calabresa, presunto e queijo', 'preco' => 25.00, 'disponivel' => true, 'categoria_id' => 1],
            ['nome' => 'Saladinha Duplo', 'descricao' => 'Alface, tomate, 2 hambúrgueres, presunto e queijo', 'preco' => 25.00, 'disponivel' => true, 'categoria_id' => 1],
            ['nome' => 'X-Tetinha', 'descricao' => 'Alface, tomate, cebola, filé, salsicha, ovo, batata palha, presunto e queijo', 'preco' => 27.00, 'disponivel' => true, 'categoria_id' => 1],

            // PÃO DE HAMBÚRGUER (Categoria 2)
            ['nome' => 'Hot Dog', 'descricao' => 'Alface, tomate, batata palha, 2 salsichas, presunto e queijo', 'preco' => 21.00, 'disponivel' => true, 'categoria_id' => 2],
            ['nome' => 'Hot Dog Especial', 'descricao' => 'Alface, tomate, milho, ervilha, batata palha, 2 salsichas, hambúrguer, ovo, presunto e queijo', 'preco' => 29.00, 'disponivel' => true, 'categoria_id' => 2],
            ['nome' => 'Bauru', 'descricao' => 'Tomate, presunto e queijo', 'preco' => 23.00, 'disponivel' => true, 'categoria_id' => 2],
            ['nome' => 'Prensado', 'descricao' => 'Tomate, milho, ervilha, batata palha, presunto e queijo', 'preco' => 26.00, 'disponivel' => true, 'categoria_id' => 2],
            ['nome' => 'X-Salada', 'descricao' => 'Alface, tomate, hambúrguer, presunto e queijo', 'preco' => 24.00, 'disponivel' => true, 'categoria_id' => 2],
            ['nome' => 'Misto Quente', 'descricao' => null, 'preco' => 23.00, 'disponivel' => true, 'categoria_id' => 2],
            ['nome' => 'X-Burguer', 'descricao' => 'Tomate, hambúrguer, 2 presuntos e 2 queijos', 'preco' => 26.00, 'disponivel' => true, 'categoria_id' => 2],
            ['nome' => 'X-Burguer Egg', 'descricao' => 'Tomate, hambúrguer, ovo, presunto e queijo', 'preco' => 26.00, 'disponivel' => true, 'categoria_id' => 2],
            ['nome' => 'X-Mais', 'descricao' => 'Tomate, milho, ervilha, bacon, calabresa, ovo, salsicha, hambúrguer, frango, filé, presunto e queijo', 'preco' => 40.00, 'disponivel' => true, 'categoria_id' => 2],
            ['nome' => 'X-Atum', 'descricao' => 'Alface, tomate, milho, ervilha, cebola, atum, ovo e 2 fatias de queijo', 'preco' => 29.00, 'disponivel' => true, 'categoria_id' => 2],
            ['nome' => 'X-Palmito', 'descricao' => 'Alface, tomate, milho, ervilha, cebola, palmito, azeitona e 2 fatias de queijo', 'preco' => 29.00, 'disponivel' => true, 'categoria_id' => 2],
            ['nome' => 'Vegetariano', 'descricao' => 'Alface, tomate, milho, ervilha, cebola, 2 ovos e 3 fatias de queijo', 'preco' => 27.00, 'disponivel' => true, 'categoria_id' => 2],

            // X-PICANHA / FILÉ (Categoria 3)
            ['nome' => 'X-Picanha', 'descricao' => 'Alface, tomate, cebola, picanha e queijo', 'preco' => 40.00, 'disponivel' => true, 'categoria_id' => 3],
            ['nome' => 'X-Picanha Cheddar', 'descricao' => 'Alface, tomate, cebola, picanha, cheddar e queijo', 'preco' => 42.00, 'disponivel' => true, 'categoria_id' => 3],
            ['nome' => 'X-Filé', 'descricao' => 'Tomate, filé e queijo', 'preco' => 39.00, 'disponivel' => true, 'categoria_id' => 3],
            ['nome' => 'X-Filé Bacon', 'descricao' => 'Tomate, filé, bacon e queijo', 'preco' => 45.00, 'disponivel' => true, 'categoria_id' => 3],
            ['nome' => 'X-Filé Misto', 'descricao' => 'Tomate, filé e 5 fatias de queijo', 'preco' => 45.00, 'disponivel' => true, 'categoria_id' => 3],
            ['nome' => 'X-Filé e Frango', 'descricao' => 'Tomate, filé, frango e queijo', 'preco' => 39.00, 'disponivel' => true, 'categoria_id' => 3],

            // X-FRANGO (Categoria 4)
            ['nome' => 'X-Frango', 'descricao' => 'Tomate, frango e queijo', 'preco' => 33.00, 'disponivel' => true, 'categoria_id' => 4],
            ['nome' => 'X-Frango Bacon', 'descricao' => 'Tomate, frango, bacon e queijo', 'preco' => 39.00, 'disponivel' => true, 'categoria_id' => 4],
            ['nome' => 'X-Frango Misto', 'descricao' => 'Tomate, frango e 5 fatias de queijo', 'preco' => 39.00, 'disponivel' => true, 'categoria_id' => 4],
            ['nome' => 'X-Frango Palmito', 'descricao' => 'Tomate, frango, palmito e queijo', 'preco' => 39.00, 'disponivel' => true, 'categoria_id' => 4],
            ['nome' => 'X-Americano', 'descricao' => 'Alface, tomate, milho, ervilha, hambúrguer, ovo, presunto e queijo', 'preco' => 27.00, 'disponivel' => true, 'categoria_id' => 4],

            // X-CALABRESA / BACON (Categoria 5)
            ['nome' => 'X-Calabresa', 'descricao' => 'Tomate, hambúrguer, calabresa, presunto e queijo', 'preco' => 30.00, 'disponivel' => true, 'categoria_id' => 5],
            ['nome' => 'X-Bacon', 'descricao' => 'Tomate, hambúrguer, bacon, presunto e queijo', 'preco' => 33.00, 'disponivel' => true, 'categoria_id' => 5],
            ['nome' => 'X-Xuxa', 'descricao' => 'Tomate, milho, bacon, calabresa, presunto e queijo', 'preco' => 33.00, 'disponivel' => true, 'categoria_id' => 5],
            ['nome' => 'X-Burgão', 'descricao' => 'Tomate, 3 hambúrgueres e 3 fatias de queijo', 'preco' => 35.00, 'disponivel' => true, 'categoria_id' => 5],
            ['nome' => 'X-Tudo', 'descricao' => 'Tomate, milho, ervilha, hambúrguer, bacon, calabresa, ovo, salsicha, presunto e queijo', 'preco' => 35.00, 'disponivel' => true, 'categoria_id' => 5],
            ['nome' => 'X-Labor', 'descricao' => 'Tomate, ervilha, hambúrguer, calabresa, ovo, salsicha, presunto e queijo', 'preco' => 33.00, 'disponivel' => true, 'categoria_id' => 5],

            // LANCHES NO PRATO (Categoria 6)
            ['nome' => 'X-Americano no prato', 'descricao' => null, 'preco' => 45.00, 'disponivel' => true, 'categoria_id' => 6],
            ['nome' => 'X-Mais no prato', 'descricao' => 'Alface, tomate, milho, ervilha, palmito, azeitona, bacon, calabresa, ovo, hambúrguer, frango, filé, presunto, queijo e torradas', 'preco' => 55.00, 'disponivel' => true, 'categoria_id' => 6],

            // PORÇÕES (Categoria 7)
            ['nome' => 'Salsicha Média', 'descricao' => 'Salsicha, cebola, tomate e torradas', 'preco' => 20.00, 'disponivel' => true, 'categoria_id' => 7],
            ['nome' => 'Salsicha Grande', 'descricao' => 'Salsicha, cebola, tomate e torradas', 'preco' => 30.00, 'disponivel' => true, 'categoria_id' => 7],
            ['nome' => 'Calabresa Média', 'descricao' => 'Calabresa, cebola, tomate e torradas', 'preco' => 40.00, 'disponivel' => true, 'categoria_id' => 7],
            ['nome' => 'Calabresa Grande', 'descricao' => 'Calabresa, cebola, tomate e torradas', 'preco' => 50.00, 'disponivel' => true, 'categoria_id' => 7],
            ['nome' => 'Frango Média', 'descricao' => 'Frango, cebola, tomate e torradas', 'preco' => 40.00, 'disponivel' => true, 'categoria_id' => 7],
            ['nome' => 'Frango Grande', 'descricao' => 'Frango, cebola, tomate e torradas', 'preco' => 50.00, 'disponivel' => true, 'categoria_id' => 7],
            ['nome' => 'Filé Média', 'descricao' => 'Filé, cebola, tomate e torradas', 'preco' => 55.00, 'disponivel' => true, 'categoria_id' => 7],
            ['nome' => 'Filé Grande', 'descricao' => 'Filé, cebola, tomate e torradas', 'preco' => 70.00, 'disponivel' => true, 'categoria_id' => 7],
            ['nome' => 'Filé e Frango Média', 'descricao' => 'Filé, frango, cebola, tomate e torradas', 'preco' => 50.00, 'disponivel' => true, 'categoria_id' => 7],
            ['nome' => 'Filé e Frango Grande', 'descricao' => 'Filé, frango, cebola, tomate e torradas', 'preco' => 65.00, 'disponivel' => true, 'categoria_id' => 7],
            ['nome' => 'Filé com Queijo Média', 'descricao' => 'Filé, queijo, cebola, tomate e torradas', 'preco' => 65.00, 'disponivel' => true, 'categoria_id' => 7],
            ['nome' => 'Filé com Queijo Grande', 'descricao' => 'Filé, queijo, cebola, tomate e torradas', 'preco' => 80.00, 'disponivel' => true, 'categoria_id' => 7],
            ['nome' => 'Picanha', 'descricao' => 'Picanha, cebola, tomate e torradas', 'preco' => 75.00, 'disponivel' => true, 'categoria_id' => 7],

            // BEBIDAS (Categoria 8)
            ['nome' => 'Coca-Cola 290ml', 'descricao' => null, 'preco' => 0.00, 'disponivel' => true, 'categoria_id' => 8],
            ['nome' => 'Coca-Cola Lata', 'descricao' => null, 'preco' => 6.00, 'disponivel' => true, 'categoria_id' => 8],
            ['nome' => 'Coca-Cola 600ml', 'descricao' => null, 'preco' => 0.00, 'disponivel' => true, 'categoria_id' => 8],
            ['nome' => 'Coca-Cola 1L', 'descricao' => null, 'preco' => 0.00, 'disponivel' => true, 'categoria_id' => 8],
            ['nome' => 'Coca-Cola 2L', 'descricao' => null, 'preco' => 0.00, 'disponivel' => true, 'categoria_id' => 8],
            ['nome' => 'Funada', 'descricao' => null, 'preco' => 10.00, 'disponivel' => true, 'categoria_id' => 8],
            ['nome' => 'H2O', 'descricao' => null, 'preco' => 15.00, 'disponivel' => true, 'categoria_id' => 8],
            ['nome' => 'Fanta', 'descricao' => null, 'preco' => 6.00, 'disponivel' => true, 'categoria_id' => 8],
            ['nome' => 'Sprite', 'descricao' => null, 'preco' => 13.00, 'disponivel' => true, 'categoria_id' => 8],
            ['nome' => 'Schweppes', 'descricao' => null, 'preco' => 10.00, 'disponivel' => true, 'categoria_id' => 8],
            ['nome' => 'Água 500ml', 'descricao' => null, 'preco' => 6.00, 'disponivel' => true, 'categoria_id' => 8],
            ['nome' => 'Água 1L', 'descricao' => null, 'preco' => 13.00, 'disponivel' => true, 'categoria_id' => 8],
            ['nome' => 'Água c/ gás 500ml', 'descricao' => null, 'preco' => 9.00, 'disponivel' => true, 'categoria_id' => 8],
            ['nome' => 'Água c/ gás 1L', 'descricao' => null, 'preco' => 8.00, 'disponivel' => true, 'categoria_id' => 8],
            ['nome' => 'Cerveja Brahma (lata)', 'descricao' => null, 'preco' => 4.00, 'disponivel' => true, 'categoria_id' => 8],
            ['nome' => 'Skol (lata)', 'descricao' => null, 'preco' => 3.00, 'disponivel' => true, 'categoria_id' => 8],

            // SUCOS (Categoria 9)
            ['nome' => 'Suco de Laranja', 'descricao' => null, 'preco' => 13.00, 'disponivel' => true, 'categoria_id' => 9],
            ['nome' => 'Suco de Maracujá', 'descricao' => null, 'preco' => 9.00, 'disponivel' => true, 'categoria_id' => 9],
            ['nome' => 'Suco de Morango', 'descricao' => null, 'preco' => 6.00, 'disponivel' => true, 'categoria_id' => 9],
            ['nome' => 'Suco de Limão', 'descricao' => null, 'preco' => 6.00, 'disponivel' => true, 'categoria_id' => 9],
            ['nome' => 'Suco de Abacaxi', 'descricao' => null, 'preco' => 9.00, 'disponivel' => true, 'categoria_id' => 9],
            ['nome' => 'Guaraná Natural 300ml', 'descricao' => null, 'preco' => 9.00, 'disponivel' => true, 'categoria_id' => 9],
            ['nome' => 'Guaraná Natural 500ml', 'descricao' => null, 'preco' => 10.00, 'disponivel' => true, 'categoria_id' => 9],

            // ACRÉSCIMOS (Categoria 10)
            ['nome' => 'Filé', 'descricao' => 'Acréscimo de filé', 'preco' => 10.00, 'disponivel' => true, 'categoria_id' => 10],
            ['nome' => 'Bacon', 'descricao' => 'Acréscimo de bacon', 'preco' => 6.00, 'disponivel' => true, 'categoria_id' => 10],
            ['nome' => 'Frango', 'descricao' => 'Acréscimo de frango', 'preco' => 6.00, 'disponivel' => true, 'categoria_id' => 10],
            ['nome' => 'Calabresa', 'descricao' => 'Acréscimo de calabresa', 'preco' => 6.00, 'disponivel' => true, 'categoria_id' => 10],
            ['nome' => 'Hambúrguer', 'descricao' => 'Acréscimo de hambúrguer', 'preco' => 8.00, 'disponivel' => true, 'categoria_id' => 10],
            ['nome' => 'Palmito', 'descricao' => 'Acréscimo de palmito', 'preco' => 6.00, 'disponivel' => true, 'categoria_id' => 10],
            ['nome' => 'Catupiry', 'descricao' => 'Acréscimo de catupiry', 'preco' => 3.00, 'disponivel' => true, 'categoria_id' => 10],
            ['nome' => 'Cheddar', 'descricao' => 'Acréscimo de cheddar', 'preco' => 3.00, 'disponivel' => true, 'categoria_id' => 10],
            ['nome' => 'Queijo', 'descricao' => 'Acréscimo de queijo', 'preco' => 3.00, 'disponivel' => true, 'categoria_id' => 10],
            ['nome' => 'Batata Palha', 'descricao' => 'Acréscimo de batata palha', 'preco' => 2.00, 'disponivel' => true, 'categoria_id' => 10],
            ['nome' => 'Ovo', 'descricao' => 'Acréscimo de ovo', 'preco' => 2.00, 'disponivel' => true, 'categoria_id' => 10],
            ['nome' => 'Salsicha', 'descricao' => 'Acréscimo de salsicha', 'preco' => 2.00, 'disponivel' => true, 'categoria_id' => 10],
            ['nome' => 'Cebola', 'descricao' => 'Acréscimo de cebola', 'preco' => 2.00, 'disponivel' => true, 'categoria_id' => 10],
            ['nome' => 'Milho', 'descricao' => 'Acréscimo de milho', 'preco' => 2.00, 'disponivel' => true, 'categoria_id' => 10],
            ['nome' => 'Ervilha', 'descricao' => 'Acréscimo de ervilha', 'preco' => 2.00, 'disponivel' => true, 'categoria_id' => 10],
        ];

        DB::table('produtos')->insert($produtos);

        $this->command->info('✅ Cardápio completo inserido com sucesso!');
        $this->command->info('📊 Total de categorias: ' . count($categorias));
        $this->command->info('🍔 Total de produtos: ' . count($produtos));
    }
}