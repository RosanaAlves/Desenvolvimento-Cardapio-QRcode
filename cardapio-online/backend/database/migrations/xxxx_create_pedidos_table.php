<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pedidos', function (Blueprint $table) {
            $table->id();
            $table->string('cliente_nome', 100);
            $table->string('cliente_telefone', 20);
            $table->decimal('total', 8, 2)->default(0);
            $table->enum('status', ['recebido', 'preparando', 'pronto', 'entregue'])->default('recebido');
            $table->text('observacoes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pedidos');
    }
};