<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('historico_cardapio', function (Blueprint $table) {
            $table->id();
            $table->string('tipo'); // 'produto' ou 'categoria'
            $table->string('acao'); // 'criado', 'atualizado', 'excluído'
            $table->text('dados_anteriores')->nullable();
            $table->text('dados_novos')->nullable();
            $table->string('responsavel');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('historico_cardapio');
    }
};