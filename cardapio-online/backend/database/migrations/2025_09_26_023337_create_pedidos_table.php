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
            $table->string('garcom_nome')->nullable()->after('cliente_nome');
            $table->string('cancelado_por')->nullable()->after('observacoes');
            $table->text('motivo_cancelamento')->nullable()->after('cancelado_por');
            $table->timestamp('cancelado_em')->nullable()->after('motivo_cancelamento');
            
            // Vamos adicionar a foreign key depois em uma migração separada
            // $table->foreignId("mesa_id")->constrained()->onDelete("cascade");
            $table->foreign('mesa_id')->references('id')->on('mesas')->onDelete('cascade');
        });
    }

    public function down()
    { 
        Schema::table('pedidos', function (Blueprint $table) {
            // Remove os novos campos
            $table->dropColumn(['garcom_nome', 'cancelado_por', 'motivo_cancelamento', 'cancelado_em']);
            
            // Remove a foreign key
            $table->dropForeign(['mesa_id']);
        });
    }


};