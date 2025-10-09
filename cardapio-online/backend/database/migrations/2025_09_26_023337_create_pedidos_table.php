<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create("pedidos", function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("mesa_id"); // ← Use unsignedBigInteger em vez de foreignId
            $table->string("cliente_nome");
            $table->enum("status", ["pendente", "preparando", "pronto", "entregue", "cancelado"])->default("pendente");
            $table->decimal("total", 8, 2)->default(0);
            $table->text("observacoes")->nullable();
            $table->timestamps();
            
            // Vamos adicionar a foreign key depois em uma migração separada
            // $table->foreignId("mesa_id")->constrained()->onDelete("cascade");
        });
    }

    public function down()
    {
        Schema::dropIfExists("pedidos");
    }
};