<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('pedido_itens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_id')->constrained('pedidos')->onDelete('cascade');
            $table->foreignId('produto_id')->constrained('produtos')->onDelete('cascade');
            $table->integer('quantidade');
            $table->decimal('preco_unitario', 8, 2);
            $table->text('observacoes')->nullable();
            $table->timestamps();
            
            // Índices para melhor performance
            $table->index('pedido_id');
            $table->index('produto_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('pedido_itens');
    }
};